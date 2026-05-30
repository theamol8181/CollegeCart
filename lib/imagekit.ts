export type ImageKitAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

export async function getImageKitAuth(): Promise<ImageKitAuth> {
  const response = await fetch("/api/imagekit-auth");
  if (!response.ok) {
    throw new Error("Image upload authorization failed.");
  }
  return response.json();
}

export async function uploadToImageKit(file: File, folder = "/collegecart/listings") {
  let auth: ImageKitAuth;
  try {
    auth = await getImageKitAuth();
  } catch {
    return fileToCompressedDataUrl(file);
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", `${Date.now()}-${file.name}`);
  formData.append("folder", folder);
  formData.append("publicKey", auth.publicKey);
  formData.append("signature", auth.signature);
  formData.append("expire", String(auth.expire));
  formData.append("token", auth.token);

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) return fileToCompressedDataUrl(file);

  const data = (await response.json()) as { url: string };
  return data.url;
}

async function fileToCompressedDataUrl(file: File) {
  if (typeof document === "undefined" || !file.type.startsWith("image/") || file.type.includes("svg")) {
    return fileToDataUrl(file);
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 900;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) return fileToDataUrl(file);

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let quality = 0.78;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > 180_000 && quality > 0.42) {
      quality -= 0.08;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    return dataUrl;
  } catch {
    return fileToDataUrl(file);
  }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}
