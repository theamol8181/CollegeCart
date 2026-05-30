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
    return fileToDataUrl(file);
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

  if (!response.ok) return fileToDataUrl(file);

  const data = (await response.json()) as { url: string };
  return data.url;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}
