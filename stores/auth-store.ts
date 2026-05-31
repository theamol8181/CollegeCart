"use client";

import { create } from "zustand";
import type { UserProfile } from "@/lib/types";

export const ADMIN_EMAIL = "theamol33@gmail.com";

type AuthState = {
  user: UserProfile | null;
  users: UserProfile[];
  hydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  hydrateAuth: () => void;
  setUsers: (users: UserProfile[]) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  submitIdCard: (idCardUrl: string, details: Partial<UserProfile>) => void;
  approveUser: (uid: string) => void;
  rejectUser: (uid: string) => void;
  setHydrated: (value: boolean) => void;
  logout: () => void;
};

function normalizeUser(user: UserProfile): UserProfile {
  const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL;
  return {
    ...user,
    role: isAdmin ? "admin" : user.role,
    verificationStatus: isAdmin ? "approved" : user.verificationStatus ?? "needs_id"
  };
}

function storeUsers(users: UserProfile[]) {
  if (typeof window !== "undefined") window.localStorage.setItem("collegecart-users", JSON.stringify(users));
}

function upsertUser(users: UserProfile[], user: UserProfile) {
  const normalized = normalizeUser(user);
  const exists = users.some((item) => item.uid === normalized.uid || item.email === normalized.email);
  const updated = exists
    ? users.map((item) => (item.uid === normalized.uid || item.email === normalized.email ? normalized : item))
    : [normalized, ...users];
  storeUsers(updated);
  return updated;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  users: [],
  hydrated: false,
  setUser: (user) => {
    const normalized = user ? normalizeUser(user) : null;
    if (typeof window !== "undefined") {
      if (normalized) window.localStorage.setItem("collegecart-user", JSON.stringify(normalized));
      else window.localStorage.removeItem("collegecart-user");
    }
    set((state) => ({
      user: normalized,
      users: normalized ? upsertUser(state.users, normalized) : state.users
    }));
  },
  setUsers: (users) => {
    console.log(`👥 setUsers called with ${users.length} users`);
    const normalized = users.map(normalizeUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("collegecart-users", JSON.stringify(normalized));
    }
    set({ users: normalized });
  },
  hydrateAuth: () => {
    if (typeof window === "undefined") return;
    const storedUsers = window.localStorage.getItem("collegecart-users");
    const storedUser = window.localStorage.getItem("collegecart-user");
    const users = storedUsers ? (JSON.parse(storedUsers) as UserProfile[]).map(normalizeUser) : [];
    const user = storedUser ? normalizeUser(JSON.parse(storedUser) as UserProfile) : null;
    set({ users: user ? upsertUser(users, user) : users, user, hydrated: true });
  },
  updateUser: (updates) =>
    set((state) => {
      if (!state.user) return state;
      const user = normalizeUser({ ...state.user, ...updates });
      const users = upsertUser(state.users, user);
      if (typeof window !== "undefined") window.localStorage.setItem("collegecart-user", JSON.stringify(user));
      return { user, users };
    }),
  submitIdCard: (idCardUrl, details) =>
    set((state) => {
      if (!state.user) return state;
      const user = normalizeUser({
        ...state.user,
        ...details,
        idCardUrl,
        verificationStatus: "pending"
      });
      const users = upsertUser(state.users, user);
      if (typeof window !== "undefined") window.localStorage.setItem("collegecart-user", JSON.stringify(user));
      return { user, users };
    }),
  approveUser: (uid) =>
    set((state) => {
      const users = state.users.map((item) =>
        item.uid === uid ? { ...item, verificationStatus: "approved" as const } : item
      );
      const user = state.user?.uid === uid ? { ...state.user, verificationStatus: "approved" as const } : state.user;
      storeUsers(users);
      if (typeof window !== "undefined" && user) window.localStorage.setItem("collegecart-user", JSON.stringify(user));
      
      // Also save to Firebase
      const approvedUser = users.find(u => u.uid === uid);
      if (approvedUser) {
        import("@/lib/firestore").then(({ saveUserProfile }) => {
          saveUserProfile(approvedUser);
          console.log(`✅ User approved in Firebase: ${uid}`);
        });
      }
      
      return { users, user };
    }),
  rejectUser: (uid) =>
    set((state) => {
      const users = state.users.map((item) =>
        item.uid === uid ? { ...item, verificationStatus: "rejected" as const } : item
      );
      const user = state.user?.uid === uid ? { ...state.user, verificationStatus: "rejected" as const } : state.user;
      storeUsers(users);
      if (typeof window !== "undefined" && user) window.localStorage.setItem("collegecart-user", JSON.stringify(user));
      
      // Also save to Firebase
      const rejectedUser = users.find(u => u.uid === uid);
      if (rejectedUser) {
        import("@/lib/firestore").then(({ saveUserProfile }) => {
          saveUserProfile(rejectedUser);
          console.log(`❌ User rejected in Firebase: ${uid}`);
        });
      }
      
      return { users, user };
    }),
  setHydrated: (hydrated) => set({ hydrated }),
  logout: () => {
    if (typeof window !== "undefined") window.localStorage.removeItem("collegecart-user");
    set({ user: null, hydrated: true });
  }
}));
