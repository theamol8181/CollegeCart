export type UploadProgressCallback = (progress: number) => void;

const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_Urhn2Yob/+pVBCEQ4Ik+kXefqCI=";
const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/ned6kfdmg";

export async function uploadToImageKit(
  file: File,
  folder = "collegecart/listings",
  onProgress?: UploadProgressCallback
): Promise<string> {
  console.log("🖼️ ImageKit upload check...");

  try {
    console.log("📤 Starting ImageKit upload");
    console.log("File:", file.name, "Size:", file.size, "Type:", file.type);
    onProgress?.(10);

    // Validate file size (ImageKit free tier limit is 25GB, but keep reasonable limit)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 100MB)`);
    }

    // Create form data for ImageKit
    const formData = new FormData();
    formData.append("file", file);
    formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
    
    // Create unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${randomId}-${sanitizedName}`;
    
    formData.append("fileName", fileName);
    formData.append("folder", `/${folder}`);
    formData.append("useUniqueFileName", "false");
    
    console.log("📝 Upload path:", `${folder}/${fileName}`);
    onProgress?.(30);

    // Upload to ImageKit
    console.log("⏳ Uploading to ImageKit...");
    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData,
    });

    onProgress?.(70);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ImageKit upload error:", errorData);
      throw new Error(`ImageKit upload failed: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ File uploaded successfully to ImageKit");
    console.log("File URL:", data.url);
    onProgress?.(100);

    return data.url as string;
  } catch (error) {
    console.error("❌ ImageKit upload failed:", error);

    let errorMessage = "Failed to upload to ImageKit";

    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        errorMessage = "Permission denied - check ImageKit credentials";
      } else if (error.message.includes("too large")) {
        errorMessage = error.message;
      } else if (error.message.includes("CORS") || error.message.includes("blocked")) {
        errorMessage = "Network blocked - check your firewall or try a different network";
      } else {
        errorMessage = error.message;
      }
    }

    console.error("Error details:", {
      message: errorMessage,
      originalError: error
    });

    throw new Error(errorMessage);
  }
}
