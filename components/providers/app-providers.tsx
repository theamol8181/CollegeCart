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
  SAVED_PRODUCTS_STORAGE_KEY,
  useMarketplaceStore
} from "@/stores/marketplace-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrateAuth, setUser, setHydrated, setUsers, user: currentUser } = useAuthStore();
  const { theme } = useThemeStore();
  const hydrateProducts = useMarketplaceStore((state) => state.hydrateProducts);
  const resetProducts = useMarketplaceStore((state) => state.resetProducts);
  const setProducts = useMarketplaceStore((state) => state.setProducts);
  const setSavedIds = useMarketplaceStore((state) => state.setSavedIds);
  const currentUserRole = currentUser?.role;
  const currentUserUid = currentUser?.uid;
  const hasCurrentUser = Boolean(currentUser);
  const productCollegeName = currentUserRole === "student" ? currentUser?.collegeName ?? "" : "";
  const syncAllProductColleges = !hasCurrentUser || currentUserRole === "admin" || !productCollegeName;
  const allowsAnonymousProductSync = false;

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", theme === "dark" || (theme === "system" && systemDark));
    window.localStorage.setItem("collegecart-theme", theme);
  }, [theme]);

  // Listen to products from Firebase
  useEffect(() => {
    hydrateProducts();
    resetProducts();
    if (!hasCurrentUser && !allowsAnonymousProductSync) return;
    if (currentUserRole === "student" && !productCollegeName) return;
    return listenToProducts(setProducts, {
      collegeName: productCollegeName,
      allColleges: syncAllProductColleges
    });
  }, [
    allowsAnonymousProductSync,
    currentUserRole,
    currentUserUid,
    hasCurrentUser,
    hydrateProducts,
    productCollegeName,
    resetProducts,
    setProducts,
    syncAllProductColleges
  ]);

  useEffect(() => {
    function refreshMarketplaceFromStorage(event: StorageEvent) {
      if (
        event.key === PRODUCTS_STORAGE_KEY ||
        event.key === DELETED_PRODUCTS_STORAGE_KEY ||
        event.key === PRODUCT_STATUS_OVERRIDES_STORAGE_KEY ||
        event.key === SAVED_PRODUCTS_STORAGE_KEY
      ) {
        hydrateProducts();
      }
    }

    window.addEventListener("storage", refreshMarketplaceFromStorage);
    return () => window.removeEventListener("storage", refreshMarketplaceFromStorage);
  }, [hydrateProducts]);

  // Admin-only user sync. Keeping this off normal pages makes dashboard open faster.
  useEffect(() => {
    if (currentUser?.role !== "admin" && pathname !== "/admin") return;
    return listenToUsers(setUsers);
  }, [currentUser?.role, pathname, setUsers]);

  // Listen to current user profile changes in real-time (for admin approvals)
  useEffect(() => {
    if (!currentUser?.uid) return;
    return listenToCurrentUserProfile(currentUser.uid, (updatedUser) => {
      if (updatedUser && updatedUser.verificationStatus !== currentUser.verificationStatus) {
        setUser(updatedUser);
      }
    });
  }, [currentUser?.uid, currentUser?.verificationStatus, setUser]);

  useEffect(() => {
    if (currentUser?.savedProductIds?.length) {
      setSavedIds(currentUser.savedProductIds);
    }
  }, [currentUser?.savedProductIds, setSavedIds]);

  useEffect(() => {
    hydrateAuth();
    if (!auth) return;

    return onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setHydrated(true);
        return;
      }

      const email = firebaseUser.email ?? "";
      const localProfile = useAuthStore
        .getState()
        .users.find((item) => item.uid === firebaseUser.uid || item.email.toLowerCase() === email.toLowerCase());
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
      const instantProfile = {
        uid: firebaseUser.uid,
        fullName: localProfile?.fullName ?? firebaseUser.displayName ?? "CollegeCart Student",
        collegeName: localProfile?.collegeName ?? "",
        email,
        phoneNumber: localProfile?.phoneNumber,
        year: localProfile?.year,
        usn: localProfile?.usn,
        department: localProfile?.department,
        idCardUrl: localProfile?.idCardUrl,
        avatarUrl: localProfile?.avatarUrl || firebaseUser.photoURL || "",
        role: isAdmin ? ("admin" as const) : ("student" as const),
        verificationStatus: ("approved" as const),
        online: true,
        savedProductIds: localProfile?.savedProductIds ?? [],
        createdAt: localProfile?.createdAt
      };

      setUser(instantProfile);
      setHydrated(true);

      void (async () => {
        const savedProfile = await getUserProfile(firebaseUser.uid);
        const existing = savedProfile ?? localProfile;
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
        const shouldSaveProfile =
          !savedProfile ||
          savedProfile.role !== profile.role ||
          savedProfile.verificationStatus !== profile.verificationStatus ||
          savedProfile.avatarUrl !== profile.avatarUrl;

        setUser(profile);
        if (shouldSaveProfile) await saveUserProfile(profile);
      })().catch((error) => {
        console.error("Profile background sync failed:", error);
      });
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
