"use client";

import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { Chrome, Eye, Lock, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { getGoogleAuthMessage, shouldRetryGoogleWithRedirect } from "@/lib/auth-errors";
import { auth, firebaseReady, googleProvider } from "@/lib/firebase";
import { demoUser } from "@/lib/data";
import { ADMIN_EMAIL, useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const users = useAuthStore((state) => state.users);

  function buildSessionUser(inputEmail: string, defaults: { uid?: string; fullName: string; email: string; avatarUrl?: string }) {
    const normalizedEmail = (inputEmail || defaults.email).trim().toLowerCase();
    const existing = users.find((item) => item.email.toLowerCase() === normalizedEmail);
    const isAdmin = normalizedEmail === ADMIN_EMAIL;

    return {
      ...demoUser,
      ...existing,
      uid: existing?.uid ?? defaults.uid ?? (isAdmin ? "admin-theamol" : `student-${normalizedEmail || "local"}`),
      fullName: existing?.fullName ?? (isAdmin ? "The Amol" : defaults.fullName),
      collegeName: existing?.collegeName ?? (isAdmin ? "CollegeCart HQ" : ""),
      email: existing?.email ?? (inputEmail.trim() || defaults.email),
      avatarUrl: existing?.avatarUrl || defaults.avatarUrl || demoUser.avatarUrl,
      role: isAdmin ? ("admin" as const) : ("student" as const),
      verificationStatus: isAdmin ? ("approved" as const) : existing?.verificationStatus ?? ("needs_id" as const),
      online: true,
      savedProductIds: existing?.savedProductIds ?? []
    };
  }

  function routeFor(user: ReturnType<typeof buildSessionUser>) {
    if (user.role === "admin") return "/admin";
    return user.verificationStatus === "approved" ? "/dashboard" : "/verify-student";
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      let sessionUser: ReturnType<typeof buildSessionUser>;
      if (auth && firebaseReady) {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        sessionUser = buildSessionUser(credential.user.email ?? email, {
          uid: credential.user.uid,
          fullName: credential.user.displayName ?? "CollegeCart Student",
          email: credential.user.email ?? email,
          avatarUrl: credential.user.photoURL ?? undefined
        });
      } else {
        sessionUser = buildSessionUser(email, {
          fullName: "CollegeCart Student",
          email: email || demoUser.email
        });
      }
      setUser(sessionUser);
      router.push(routeFor(sessionUser));
    } catch (error) {
      setIsLoading(false);
      setMessage("Login failed. Please check your email and password.");
    }
  }

  async function googleLogin() {
    setIsLoading(true);
    try {
      let sessionUser: ReturnType<typeof buildSessionUser>;
      if (auth && firebaseReady) {
        const credential = await signInWithPopup(auth, googleProvider);
        
        // Check if user already exists in database
        const existingUser = users.find((item) => item.email.toLowerCase() === (credential.user.email || "").toLowerCase());
        
        if (!existingUser) {
          // New user - redirect to registration with Google context
          sessionStorage.setItem("google_user_registration", JSON.stringify({
            uid: credential.user.uid,
            displayName: credential.user.displayName || "Google Student",
            email: credential.user.email || "student@gmail.com",
            photoURL: credential.user.photoURL || undefined
          }));
          setIsLoading(false);
          router.push("/register");
          return;
        }
        
        sessionUser = buildSessionUser(credential.user.email ?? "student@gmail.com", {
          uid: credential.user.uid,
          fullName: credential.user.displayName ?? "Google Student",
          email: credential.user.email ?? "student@gmail.com",
          avatarUrl: credential.user.photoURL ?? undefined
        });
      } else {
        setIsLoading(false);
        setMessage("Google login not configured. Please use email login.");
        return;
      }
      setUser(sessionUser);
      router.push(routeFor(sessionUser));
    } catch (error) {
      if (auth && shouldRetryGoogleWithRedirect(error)) {
        try {
          setMessage("Popup block ho raha hai. Google redirect login open kar rahe hain...");
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          setMessage(getGoogleAuthMessage(redirectError));
        }
      } else {
        setMessage(getGoogleAuthMessage(error));
      }
      setIsLoading(false);
    }
  }

  async function forgotPassword() {
    if (!email) {
      setMessage("Enter your email first.");
      return;
    }
    if (auth && firebaseReady) {
      await sendPasswordResetEmail(auth, email);
    }
    setMessage("Password reset link sent if the account exists.");
  }

  return (
    <form onSubmit={login} className="space-y-4">
      <Field icon={<Mail className="size-5" />} label="Email" type="email" value={email} onChange={setEmail} />
      <Field icon={<Lock className="size-5" />} label="Password" type="password" value={password} onChange={setPassword} right={<Eye className="size-5" />} />
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 text-white/70">
          <input type="checkbox" className="rounded border-white/20 bg-white/10 text-ocean focus:ring-ocean" />
          Remember me
        </label>
        <button type="button" onClick={forgotPassword} className="font-bold text-mint">
          Forgot password?
        </button>
      </div>
      {message ? <p className="rounded-2xl bg-white/10 p-3 text-sm text-white/75">{message}</p> : null}
      <button disabled={isLoading} className="w-full rounded-2xl bg-white py-3.5 text-sm font-black text-ink shadow-premium disabled:opacity-50">
        {isLoading ? "Logging in..." : "Login"}
      </button>
      <button type="button" disabled={isLoading} onClick={googleLogin} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.15] bg-white/10 py-3.5 text-sm font-black text-white disabled:opacity-50">
        <Chrome className="size-5" />
        {isLoading ? "Connecting..." : "Continue with Google"}
      </button>
    </form>
  );
}

function Field({
  icon,
  right,
  label,
  type,
  value,
  onChange
}: {
  icon: React.ReactNode;
  right?: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.45]">{label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/10 px-4 py-3.5 text-white">
        <span className="text-white/[0.42]">{icon}</span>
        <input
          required
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          suppressHydrationWarning
          className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-white placeholder:text-white/[0.35] focus:ring-0"
          placeholder={label}
        />
        {right ? <span className="text-white/[0.35]">{right}</span> : null}
      </span>
    </label>
  );
}
