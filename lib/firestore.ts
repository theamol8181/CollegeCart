"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Product, UserProfile } from "@/lib/types";

export function listenToProducts(onChange: (products: Product[]) => void) {
  if (!db) return () => undefined;

  const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(40));
  return onSnapshot(productsQuery, (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product));
  });
}

export async function saveUserProfile(profile: UserProfile) {
  if (!db) return;
  const cleanedProfile = Object.fromEntries(
    Object.entries(profile).filter(([_, value]) => value !== undefined)
  );
  await setDoc(doc(db, "users", profile.uid), {
    ...cleanedProfile,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function signOutUser() {
  if (!auth) return;
  await auth.signOut();
}

export async function createProduct(product: Omit<Product, "id">) {
  if (!db) return null;
  const ref = await addDoc(collection(db, "products"), {
    ...product,
    createdAt: serverTimestamp(),
    savedCount: 0,
    views: 0,
    status: product.status ?? "pending"
  });
  return ref.id;
}

export async function deleteProduct(productId: string) {
  if (!db) return;
  await deleteDoc(doc(db, "products", productId));
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
    onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product));
  });
}
