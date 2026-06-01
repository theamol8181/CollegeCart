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
  submitIdCard: (idCardUrl: string, details: Partial<UserProfile>) => Promise<void>;
  approveUser: (uid: string) => void;
  rejectUser: (uid: string) => void;
  refreshUserFromFirebase: (uid: string) => Promise<void>;
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

export const useAuthStore = create<AuthState>((set, get) => ({
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
  submitIdCard: async (idCardUrl, details) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const user = normalizeUser({
      ...currentUser,
      ...details,
      idCardUrl,
      verificationStatus: "pending"
    });

    const { saveUserProfile } = await import("@/lib/firestore");
    await saveUserProfile(user);

    const users = upsertUser(get().users, user);
    if (typeof window !== "undefined") window.localStorage.setItem("collegecart-user", JSON.stringify(user));
    set({ user, users });
    console.log(`User ID card submitted to Firebase: ${user.uid}`);
  },
  approveUser: (uid) => {
    set((state) => {
      const updatedUsers = state.users.map((item) =>
        item.uid === uid ? { ...item, verificationStatus: "approved" as const, updatedAt: new Date().toISOString() } : item
      );
      const updatedUser = state.user?.uid === uid ? { ...state.user, verificationStatus: "approved" as const, updatedAt: new Date().toISOString() } : state.user;
      
      // Store immediately
      storeUsers(updatedUsers);
      if (typeof window !== "undefined" && updatedUser) {
        window.localStorage.setItem("collegecart-user", JSON.stringify(updatedUser));
      }
      
      console.log(`💾 Local state updated: ${uid} → approved`);
      
      // Save to Firebase
      const approvedUser = updatedUsers.find(u => u.uid === uid);
      if (approvedUser) {
        import("@/lib/firestore").then(async ({ saveUserProfile }) => {
          try {
            console.log(`🔄 Saving approval to Firebase for: ${uid}`);
            await saveUserProfile(approvedUser);
            console.log(`✅ User approved PERMANENTLY in Firebase: ${uid}`);
          } catch (error) {
            console.error(`❌ Failed to save approval to Firebase:`, error);
          }
        });
      }
      
      return { users: updatedUsers, user: updatedUser };
    });
  },
  rejectUser: (uid) => {
    set((state) => {
      const updatedUsers = state.users.map((item) =>
        item.uid === uid ? { ...item, verificationStatus: "rejected" as const, updatedAt: new Date().toISOString() } : item
      );
      const updatedUser = state.user?.uid === uid ? { ...state.user, verificationStatus: "rejected" as const, updatedAt: new Date().toISOString() } : state.user;
      
      // Store immediately
      storeUsers(updatedUsers);
      if (typeof window !== "undefined" && updatedUser) {
        window.localStorage.setItem("collegecart-user", JSON.stringify(updatedUser));
      }
      
      console.log(`💾 Local state updated: ${uid} → rejected`);
      
      // Save to Firebase
      const rejectedUser = updatedUsers.find(u => u.uid === uid);
      if (rejectedUser) {
        import("@/lib/firestore").then(async ({ saveUserProfile }) => {
          try {
            console.log(`🔄 Saving rejection to Firebase for: ${uid}`);
            await saveUserProfile(rejectedUser);
            console.log(`✅ User rejected PERMANENTLY in Firebase: ${uid}`);
          } catch (error) {
            console.error(`❌ Failed to save rejection to Firebase:`, error);
          }
        });
      }
      
      return { users: updatedUsers, user: updatedUser };
    });
  },
  refreshUserFromFirebase: async (uid) => {
    try {
      const { getUserProfile } = await import("@/lib/firestore");
      const updatedProfile = await getUserProfile(uid);
      if (updatedProfile) {
        set((state) => {
          const updatedUsers = state.users.map((item) =>
            item.uid === uid ? { ...updatedProfile } : item
          );
          console.log(`🔄 Refreshed user ${uid} from Firebase:`, { verificationStatus: updatedProfile.verificationStatus });
          return { users: updatedUsers };
        });
      }
    } catch (error) {
      console.error(`❌ Error refreshing user from Firebase:`, error);
    }
  },
  setHydrated: (hydrated) => set({ hydrated }),
  logout: () => {
    if (typeof window !== "undefined") window.localStorage.removeItem("collegecart-user");
    set({ user: null, hydrated: true });
  }
}));
