"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import type { Product, UserProfile } from "@/lib/types";

function withoutUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function toIsoDate(value: unknown) {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function toProduct(id: string, data: Record<string, unknown>): Product {
  return {
    ...data,
    id,
    createdAt: toIsoDate(data.createdAt),
    images: Array.isArray(data.images) ? data.images : [],
    savedCount: typeof data.savedCount === "number" ? data.savedCount : 0,
    views: typeof data.views === "number" ? data.views : 0,
    status: (data.status as Product["status"]) ?? "pending"
  } as Product;
}

export function listenToProducts(onChange: (products: Product[]) => void) {
  if (!db) {
    console.error("❌ Firebase Firestore not initialized");
    return () => undefined;
  }

  try {
    const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(80));
    
    return onSnapshot(
      productsQuery,
      (snapshot) => {
        console.log(`📦 Firebase snapshot: ${snapshot.size} products`);
        const products = snapshot.docs.map((item) => {
          const product = toProduct(item.id, item.data());
          console.log(`  ✓ ${product.name} (${product.id}): status="${product.status}"`);
          return product;
        });
        
        // Sort by status: approved first, then pending, then others
        const sorted = products.sort((a, b) => {
          const statusOrder = { approved: 0, pending: 1, rejected: 2, sold: 3 };
          const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 4;
          const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 4;
          return aOrder - bOrder;
        });
        
        console.log(`✅ Snapshot ready: ${products.filter(p => p.status === 'approved').length} approved products`);
        onChange(sorted);
      },
      (error) => {
        console.error(`❌ Product sync failed:`, error.code, error.message);
        if (error.code === "permission-denied") {
          console.error("❌ PERMISSION DENIED! Firebase Firestore rules might be blocking updates.");
          console.error("Check your Firestore Security Rules!");
        }
      }
    );
  } catch (error) {
    console.error("❌ Error setting up products listener:", error);
    return () => undefined;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), uid } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile) {
  if (!db) return;
  const cleanedProfile = withoutUndefined(profile as unknown as Record<string, unknown>);
  await setDoc(doc(db, "users", profile.uid), {
    ...cleanedProfile,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function uploadIdCardImage(userId: string, file: File): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage not initialized");
  }

  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `idcards/${userId}_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    console.log(`✅ ID card uploaded to Storage: ${fileName}`);
    return downloadUrl;
  } catch (error) {
    console.error("❌ Error uploading ID card:", error);
    throw error;
  }
}

export async function signOutUser() {
  if (!auth) return;
  await auth.signOut();
}

export async function createProduct(product: Product) {
  if (!db) {
    console.error("Firebase not initialized");
    throw new Error("Firebase database not configured");
  }
  
  try {
    // Validate product name - this is CRITICAL
    const productName = String(product.name || "").trim();
    if (!productName) {
      console.error("❌ ERROR: Product name is empty!", product);
      throw new Error("Product name cannot be empty. Please provide a product name.");
    }
    
    const ref = product.id ? doc(db, "products", product.id) : doc(collection(db, "products"));
    
    const productData = withoutUndefined({
      ...product,
      id: ref.id,
      name: productName,
      createdAt: product.createdAt ?? new Date().toISOString(),
      updatedAt: product.updatedAt ?? new Date().toISOString(),
      savedCount: 0,
      views: 0,
      status: product.status ?? "pending"
    } as unknown as Record<string, unknown>);

    console.log("✅ SAVING PRODUCT TO FIREBASE:", {
      id: ref.id,
      name: productData.name,
      sellerId: productData.sellerId,
      sellerName: productData.sellerName,
      status: productData.status
    });
    
    await setDoc(ref, productData, { merge: true });
    
    console.log("✅ Product saved successfully:", ref.id, "Name:", productData.name);
    return ref.id;
  } catch (error) {
    console.error("❌ Product save error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("permission-denied")) {
      throw new Error("Permission denied. Check Firebase Firestore rules and authentication.");
    }
    if (errorMessage.includes("unauthenticated")) {
      throw new Error("Not authenticated. Please log in first.");
    }
    if (errorMessage.includes("PERMISSION_DENIED")) {
      throw new Error("Firebase Firestore rules blocking write access.");
    }
    
    throw error;
  }
}

export async function deleteProduct(productId: string) {
  if (!db) return;
  await deleteDoc(doc(db, "products", productId));
}

export async function updateProductStatus(productId: string, status: NonNullable<Product["status"]>) {
  if (!db) {
    console.error("❌ Firebase DB not initialized");
    throw new Error("Firebase not initialized");
  }
  
  if (!auth || !auth.currentUser) {
    console.error("❌ No user logged in");
    throw new Error("Not authenticated");
  }
  
  try {
    console.log(`🔧 updateProductStatus called: ${productId} → ${status}`);
    console.log(`   Current user: ${auth.currentUser.uid}`);
    
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`❌ Product not found: ${productId}`);
      throw new Error("Product not found");
    }
    
    const productData = docSnap.data();
    console.log(`   Product data: ${JSON.stringify(productData)}`);
    console.log(`   Current status: ${productData.status}`);
    console.log(`   New status: ${status}`);
    
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Firebase updateDoc successful: ${productId} is now "${status}"`);
  } catch (error) {
    console.error(`❌ Firebase updateDoc failed for ${productId}:`, error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes("permission-denied")) {
      console.error("❌ PERMISSION DENIED - Check Firestore Security Rules!");
      console.error("❌ Make sure admin has 'admin' role in users collection");
    }
    throw error;
  }
}

export function listenToUsers(onChange: (users: UserProfile[]) => void) {
  if (!db) {
    console.error("❌ Firebase Firestore not initialized for users");
    return () => undefined;
  }

  try {
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
    
    return onSnapshot(
      usersQuery,
      (snapshot) => {
        console.log(`👥 Firebase users snapshot: ${snapshot.size} users`);
        const users = snapshot.docs.map((item) => {
          const data = item.data();
          return {
            ...data,
            uid: item.id,
            createdAt: data.createdAt || new Date().toISOString()
          } as UserProfile;
        });
        
        // Sort by: pending first, then approved, then rejected
        const sorted = users.sort((a, b) => {
          const statusOrder = { pending: 0, approved: 1, rejected: 2, needs_id: 3 };
          const aOrder = statusOrder[a.verificationStatus as keyof typeof statusOrder] ?? 4;
          const bOrder = statusOrder[b.verificationStatus as keyof typeof statusOrder] ?? 4;
          return aOrder - bOrder;
        });
        
        console.log(`✅ Users snapshot: ${users.filter(u => u.verificationStatus === 'pending').length} pending for approval`);
        onChange(sorted);
      },
      (error) => {
        console.error(`❌ User sync failed:`, error.code, error.message);
      }
    );
  } catch (error) {
    console.error("❌ Error setting up users listener:", error);
    return () => undefined;
  }
}

export async function saveWishlist(userId: string, productId: string) {
  if (!db) return;
  await setDoc(doc(db, "wishlists", `${userId}_${productId}`), {
    userId,
    productId,
    createdAt: serverTimestamp()
  });
}

export async function removeWishlist(userId: string, productId: string) {
  if (!db) return;
  await deleteDoc(doc(db, "wishlists", `${userId}_${productId}`));
}

export async function banUser(userId: string) {
  if (!db) return;
  await updateDoc(doc(db, "users", userId), {
    banned: true,
    updatedAt: serverTimestamp()
  });
}

export function listenToUserProducts(userId: string, onChange: (products: Product[]) => void) {
  if (!db) return () => undefined;
  const userProductsQuery = query(collection(db, "products"), where("sellerId", "==", userId));
  return onSnapshot(userProductsQuery, (snapshot) => {
    onChange(snapshot.docs.map((item) => toProduct(item.id, item.data())));
  });
}
