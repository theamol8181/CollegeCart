import { storage, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type UploadProgressCallback = (progress: number) => void;

export async function uploadToFirebaseStorage(
  file: File,
  folder = "collegecart/listings",
  onProgress?: UploadProgressCallback
): Promise<string> {
  console.log("🔐 Firebase upload check...");
  
  if (!storage) {
    console.error("❌ Firebase Storage not initialized");
    throw new Error("Firebase Storage is not initialized");
  }

  // Check if user is authenticated (important for Firebase rules)
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    console.warn("⚠️ User not authenticated - upload may fail due to security rules");
  }

  try {
    console.log("📤 Starting Firebase Storage upload");
    console.log("File:", file.name, "Size:", file.size, "Type:", file.type);
    onProgress?.(10);

    // Validate file size (Firebase free tier limit)
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 100MB)`);
    }

    // Create a unique filename with better formatting
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${randomId}-${sanitizedName}`;
    
    console.log("📝 Storage path:", `${folder}/${fileName}`);
    onProgress?.(20);

    // Create storage reference
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    console.log("⏳ Uploading bytes to Firebase Storage...");
    onProgress?.(40);

    // Upload file - no timeout, Firebase handles it
    console.log("⏳ Uploading bytes to Firebase Storage...");
    const snapshot = await uploadBytes(storageRef, file);
    
    console.log("✅ File bytes uploaded successfully");
    onProgress?.(70);

    // Get download URL with extended timeout
    console.log("📥 Retrieving download URL...");
    const downloadUrl = (await getDownloadURL(snapshot.ref)) as string;
    
    console.log("✅ Download URL retrieved:", downloadUrl.substring(0, 50) + "...");
    onProgress?.(100);

    return downloadUrl;
  } catch (error) {
    console.error("❌ Firebase Storage upload failed:", error);
    
    // Better error messages
    let errorMessage = "Failed to upload to Firebase Storage";
    
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        errorMessage = "Permission denied - check Firebase security rules";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Upload timeout - file may be too large or network too slow. Please check browser console and try again.";
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
      code: (error as any).code,
      originalError: error
    });
    
    throw new Error(errorMessage);
  }
}

