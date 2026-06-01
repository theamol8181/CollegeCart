import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type UploadProgressCallback = (progress: number) => void;

export async function uploadToFirebaseStorage(
  file: File,
  folder = "collegecart/listings",
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized");
  }

  try {
    console.log("📤 Uploading to Firebase Storage:", folder);
    onProgress?.(10);

    // Create a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomId}-${file.name}`;
    
    // Create storage reference
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    console.log("📝 Storage reference created:", `${folder}/${fileName}`);
    onProgress?.(30);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    console.log("✅ File uploaded to Firebase Storage");
    onProgress?.(70);

    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log("✅ Download URL obtained:", downloadUrl);
    onProgress?.(100);

    return downloadUrl;
  } catch (error) {
    console.error("❌ Firebase Storage upload failed:", error);
    throw new Error(
      `Failed to upload to Firebase Storage: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
