export type UploadProgressCallback = (progress: number) => void;

export async function uploadToCloudinary(
  file: File,
  folder = "collegecart/listings",
  onProgress?: UploadProgressCallback
): Promise<string> {
  console.log("☁️ Cloudinary upload check...");

  try {
    console.log("📤 Starting Cloudinary upload");
    console.log("File:", file.name, "Size:", file.size, "Type:", file.type);
    onProgress?.(10);

    // Validate file size (Cloudinary limit: 500MB)
    if (file.size > 500 * 1024 * 1024) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 500MB)`);
    }

    // Get upload signature from server
    console.log("🔐 Getting Cloudinary signature...");
    const signatureResponse = await fetch("/api/cloudinary-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!signatureResponse.ok) {
      const error = await signatureResponse.json();
      throw new Error(`Signature generation failed: ${error.message}`);
    }

    const { signature, timestamp } = await signatureResponse.json();
    console.log("✅ Signature received");
    onProgress?.(20);

    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);
    formData.append("folder", folder);

    console.log("📝 Upload folder:", folder);
    onProgress?.(30);

    // Upload to Cloudinary
    console.log("⏳ Uploading to Cloudinary...");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    onProgress?.(70);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error:", errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ File uploaded successfully to Cloudinary");
    console.log("File URL:", data.secure_url);
    onProgress?.(100);

    return data.secure_url as string;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);

    let errorMessage = "Failed to upload to Cloudinary";

    if (error instanceof Error) {
      if (error.message.includes("too large")) {
        errorMessage = error.message;
      } else if (error.message.includes("Signature")) {
        errorMessage = "Failed to generate upload signature - check server configuration";
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
