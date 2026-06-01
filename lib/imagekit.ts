export type ImageKitAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

export type UploadProgressCallback = (progress: number) => void;

export async function getImageKitAuth(): Promise<ImageKitAuth> {
  try {
    console.log("🔐 Requesting ImageKit auth from /api/imagekit-auth...");
    const response = await fetch("/api/imagekit-auth");
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ImageKit auth API returned error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✅ ImageKit auth received successfully");
    return data;
  } catch (error) {
    console.error("❌ ImageKit auth request failed:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error("Image upload authorization failed: " + (error instanceof Error ? error.message : String(error)));
  }
}

export async function uploadToImageKit(
  file: File,
  folder = "/collegecart/listings",
  onProgress?: UploadProgressCallback
): Promise<string> {
  let auth: ImageKitAuth;
  
  try {
    console.log("🔐 Getting ImageKit auth...");
    auth = await getImageKitAuth();
    console.log("✅ Auth received, uploading file:", file.name);
  } catch (error) {
    console.error("❌ ImageKit auth failed:", error);
    throw new Error(`ImageKit authentication failed. Please ensure ImageKit credentials are properly configured.`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", `${Date.now()}-${file.name}`);
  formData.append("folder", folder);
  formData.append("publicKey", auth.publicKey);
  formData.append("signature", auth.signature);
  formData.append("expire", String(auth.expire));
  formData.append("token", auth.token);

  try {
    console.log("📤 Uploading to ImageKit:", folder);
    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData
    });

    onProgress?.(80);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ ImageKit upload error:", response.status, errorData);
      throw new Error(`ImageKit upload failed with status ${response.status}: ${errorData}`);
    }

    const data = (await response.json()) as { url: string };
    console.log("✅ Upload successful:", data.url);
    onProgress?.(100);
    return data.url;
  } catch (error) {
    console.error("❌ ImageKit upload failed:", error);
    throw new Error(`Failed to upload to ImageKit: ${error instanceof Error ? error.message : String(error)}`);
  }
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
