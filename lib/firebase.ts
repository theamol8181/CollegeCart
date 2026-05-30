"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyBWxiEizcdTBcjaq1t5ocOkSAiE9TJbAAo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "student-market-b3ee9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "student-market-b3ee9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "student-market-b3ee9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "306243541580",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:306243541580:web:ee9e75ecbd0c2e8c9e32e9",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-BDZBLKXZGD"
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const firebaseApp: FirebaseApp | null =
  hasFirebaseConfig ? getApps()[0] ?? initializeApp(firebaseConfig) : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

auth?.useDeviceLanguage();

const analyticsApp = firebaseApp;
export const analytics: Promise<Analytics | null> =
  analyticsApp && typeof window !== "undefined"
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(analyticsApp) : null))
        .catch(() => null)
    : Promise.resolve(null);

// Initialize Google Auth Provider with account picker enabled
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});
googleProvider.addScope("profile");
googleProvider.addScope("email");

export const firebaseReady = hasFirebaseConfig;
