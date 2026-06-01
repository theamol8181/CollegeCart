"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { UserProfile } from "@/lib/types";

export function useAuth() {
  const { user, hydrated, setUser } = useAuthStore();
  return { user: user as UserProfile | null, hydrated, setUser };
}
