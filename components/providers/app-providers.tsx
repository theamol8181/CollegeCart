"use client";

import { onAuthStateChanged } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getUserProfile, listenToProducts, listenToUsers, saveUserProfile, listenToCurrentUserProfile } from "@/lib/firestore";
import { ADMIN_EMAIL, useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import {
  DELETED_PRODUCTS_STORAGE_KEY,
  PRODUCTS_STORAGE_KEY,
  PRODUCT_STATUS_OVERRIDES_STORAGE_KEY,
  useMarketplaceStore
} from "@/stores/marketplace-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrateAuth, setUser, setHydrated, setUsers, user: currentUser } = useAuthStore();
  const { theme } = useThemeStore();
  const hydrateProducts = useMarketplaceStore((state) => state.hydrateProducts);
  const setProducts = useMarketplaceStore((state) => state.setProducts);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", theme === "dark" || (theme === "system" && systemDark));
    window.localStorage.setItem("collegecart-theme", theme);
  }, [theme]);

  // Listen to products from Firebase
  useEffect(() => {
    hydrateProducts();
    return listenToProducts(setProducts);
  }, [hydrateProducts, setProducts]);

  useEffect(() => {
    function refreshMarketplaceFromStorage(event: StorageEvent) {
      if (
        event.key === PRODUCTS_STORAGE_KEY ||
        event.key === DELETED_PRODUCTS_STORAGE_KEY ||
        event.key === PRODUCT_STATUS_OVERRIDES_STORAGE_KEY
      ) {
        hydrateProducts();
      }
    }

    window.addEventListener("storage", refreshMarketplaceFromStorage);
    return () => window.removeEventListener("storage", refreshMarketplaceFromStorage);
  }, [hydrateProducts]);

  // Listen to users from Firebase (for admin to see pending approvals)
  useEffect(() => {
    return listenToUsers(setUsers);
  }, [setUsers]);

  // Listen to current user profile changes in real-time (for admin approvals)
  useEffect(() => {
    if (!currentUser?.uid) return;
    console.log(`🔊 Setting up real-time listener for user: ${currentUser.uid}`);
    return listenToCurrentUserProfile(currentUser.uid, (updatedUser) => {
      if (updatedUser && updatedUser.verificationStatus !== currentUser.verificationStatus) {
        console.log(`🔄 User verification status changed: ${currentUser.verificationStatus} → ${updatedUser.verificationStatus}`);
        setUser(updatedUser);
      }
    });
  }, [currentUser?.uid, currentUser?.verificationStatus, setUser]);

  useEffect(() => {
    hydrateAuth();
    if (!auth) return;

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setHydrated(true);
        return;
      }

      const email = firebaseUser.email ?? "";
      const savedProfile = await getUserProfile(firebaseUser.uid);
      const localProfile = useAuthStore
        .getState()
        .users.find((item) => item.uid === firebaseUser.uid || item.email.toLowerCase() === email.toLowerCase());
      const existing = savedProfile ?? localProfile;
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
      const profile = {
        uid: firebaseUser.uid,
        fullName: existing?.fullName ?? firebaseUser.displayName ?? "CollegeCart Student",
        collegeName: existing?.collegeName ?? "",
        email,
        phoneNumber: existing?.phoneNumber,
        year: existing?.year,
        usn: existing?.usn,
        department: existing?.department,
        idCardUrl: existing?.idCardUrl,
        avatarUrl: existing?.avatarUrl || firebaseUser.photoURL || "",
        role: isAdmin ? ("admin" as const) : ("student" as const),
        verificationStatus: ("approved" as const),
        online: true,
        savedProductIds: existing?.savedProductIds ?? [],
        createdAt: existing?.createdAt
      };
      setUser(profile);
      await saveUserProfile(profile);
      setHydrated(true);
    });
  }, [hydrateAuth, setHydrated, setUser]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
