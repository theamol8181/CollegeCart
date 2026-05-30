"use client";

import { onAuthStateChanged } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { saveUserProfile } from "@/lib/firestore";
import { ADMIN_EMAIL, useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrateAuth, setUser, setHydrated } = useAuthStore();
  const { theme } = useThemeStore();
  const hydrateProducts = useMarketplaceStore((state) => state.hydrateProducts);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", theme === "dark" || (theme === "system" && systemDark));
    window.localStorage.setItem("collegecart-theme", theme);
  }, [theme]);

  useEffect(() => {
    hydrateProducts();
  }, [hydrateProducts]);

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
      const existing = useAuthStore
        .getState()
        .users.find((item) => item.uid === firebaseUser.uid || item.email.toLowerCase() === email.toLowerCase());
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
        verificationStatus: isAdmin ? ("approved" as const) : existing?.verificationStatus ?? ("needs_id" as const),
        online: true,
        savedProductIds: existing?.savedProductIds ?? []
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
