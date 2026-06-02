import { uploadToFirebaseStorage } from "@/lib/firebase-upload";
import { fileToCompressedDataUrl } from "@/lib/image-fallback";

export type UploadProgressCallback = (progress: number) => void;

type CloudinaryAuthResponse = {
  apiKey?: string;
  cloudName?: string;
  signature?: string;
  timestamp?: number;
  message?: string;
};

type UploadErrorResponse = {
  error?: { message?: string } | string;
  message?: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
};

export async function uploadListingImage(
  file: File,
  folder = "collegecart/listings",
  onProgress?: UploadProgressCallback
): Promise<string> {
  try {
    return await uploadToCloudinary(file, folder, (progress) => onProgress?.(Math.min(progress, 82)));
  } catch (cloudinaryError) {
    console.warn("Cloudinary upload unavailable, trying Firebase Storage fallback.", cloudinaryError);
  }

  try {
    return await uploadToFirebaseStorage(file, folder, (progress) => {
      onProgress?.(82 + Math.round(progress * 0.18));
    });
  } catch (firebaseError) {
    console.warn("Firebase Storage fallback unavailable, using compressed inline image.", firebaseError);
  }

  try {
    onProgress?.(95);
    const dataUrl = await fileToCompressedDataUrl(file);
    onProgress?.(100);
    return dataUrl;
  } catch (fallbackError) {
    const message = fallbackError instanceof Error ? fallbackError.message : "Image upload failed.";
    throw new Error(message);
  }
}

export async function uploadToCloudinary(
  file: File,
  folder = "collegecart/listings",
  onProgress?: UploadProgressCallback
): Promise<string> {
  try {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please choose a valid image file.");
    }

    if (file.size > 500 * 1024 * 1024) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 500MB)`);
    }

    const uploadFolder = normalizeCloudinaryFolder(folder);
    const configuredCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const configuredApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!configuredCloudName || !configuredApiKey) {
      throw new Error("Cloudinary is not configured.");
    }

    onProgress?.(10);

    const signatureResponse = await fetch("/api/cloudinary-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: uploadFolder }),
    });

    const auth = (await signatureResponse.json().catch(() => ({}))) as CloudinaryAuthResponse;
    if (!signatureResponse.ok) {
      throw new Error(`Signature generation failed: ${auth.message || signatureResponse.statusText}`);
    }

    const cloudName = auth.cloudName || configuredCloudName;
    const apiKey = auth.apiKey || configuredApiKey;

    if (!auth.signature || !auth.timestamp || !cloudName || !apiKey) {
      throw new Error("Cloudinary upload signature is incomplete.");
    }

    onProgress?.(25);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("signature", auth.signature);
    formData.append("timestamp", String(auth.timestamp));
    if (uploadFolder) formData.append("folder", uploadFolder);

    onProgress?.(35);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    onProgress?.(70);

    if (!response.ok) {
      throw new Error(`Upload failed: ${await getUploadErrorMessage(response)}`);
    }

    const data = (await response.json()) as CloudinaryUploadResponse;
    if (!data.secure_url) {
      throw new Error("Cloudinary did not return an uploaded image URL.");
    }

    onProgress?.(100);
    return data.secure_url;
  } catch (error) {
    const message = normalizeUploadError(error);
    console.error("Cloudinary upload failed:", { message, error });
    throw new Error(message);
  }
}

function normalizeCloudinaryFolder(folder: string) {
  return folder.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

async function getUploadErrorMessage(response: Response) {
  const text = await response.text();
  if (!text) return response.statusText;

  try {
    const data = JSON.parse(text) as UploadErrorResponse;
    if (typeof data.error === "string") return data.error;
    return data.error?.message || data.message || text;
  } catch {
    return text;
  }
}

function normalizeUploadError(error: unknown) {
  if (!(error instanceof Error)) return "Image upload failed.";

  const message = error.message;
  const normalized = message.toLowerCase();

  if (normalized.includes("disabled")) {
    return "Cloudinary rejected the upload because the account is disabled.";
  }

  if (normalized.includes("invalid signature")) {
    return "Cloudinary upload signature mismatch.";
  }

  if (normalized.includes("signature generation failed")) {
    return "Failed to generate the image upload signature.";
  }

  return message;
}
