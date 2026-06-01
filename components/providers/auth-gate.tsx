"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

const publicRoutes = new Set(["/", "/login", "/register", "/search", "/privacy", "/terms", "/contact", "/support", "/verify-student"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated } = useAuthStore();
  const isPublic = publicRoutes.has(pathname) || pathname.startsWith("/product/");

  useEffect(() => {
    if (!hydrated) return;
    if (!user && !isPublic) router.replace("/login");
    if (!user) return;
    if (user.role === "admin" && (pathname === "/login" || pathname === "/register" || pathname === "/dashboard")) {
      router.replace("/admin");
      return;
    }
    if (user.role !== "admin" && pathname === "/admin") {
      router.replace("/dashboard");
      return;
    }
    if (pathname === "/login" || pathname === "/register") {
      router.replace("/dashboard");
      return;
    }
  }, [hydrated, isPublic, pathname, router, user]);

  if (!hydrated) {
    return <div className="min-h-screen bg-cloud dark:bg-night" />;
  }

  if (!user && !isPublic) {
    return <div className="min-h-screen bg-cloud dark:bg-night" />;
  }

  return children;
}
