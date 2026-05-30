"use client";

import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, updateProfile } from "firebase/auth";
import { Camera, Chrome, GraduationCap, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { getGoogleAuthMessage, shouldRetryGoogleWithRedirect } from "@/lib/auth-errors";
import { auth, firebaseReady, googleProvider } from "@/lib/firebase";
import { demoUser } from "@/lib/data";
import { bangaloreColleges, years } from "@/lib/bangalore-colleges";
import { saveUserProfile } from "@/lib/firestore";
import { uploadToImageKit } from "@/lib/imagekit";
import { useAuthStore } from "@/stores/auth-store";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [year, setYear] = useState(years[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isGoogleFlow, setIsGoogleFlow] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const setUser = useAuthStore((state) => state.setUser);

  // Check for Google user from login redirect
  React.useEffect(() => {
    const storedGoogleUser = sessionStorage.getItem("google_user_registration");
    if (storedGoogleUser) {
      const parsed = JSON.parse(storedGoogleUser);
      setGoogleUser(parsed);
      setFullName(parsed.displayName || "");
      setEmail(parsed.email || "");
      setIsGoogleFlow(true);
      sessionStorage.removeItem("google_user_registration");
    }
  }, []);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let avatarUrl = "";
    if (avatar) avatarUrl = await uploadToImageKit(avatar, "/collegecart/avatars");
    
    if (isGoogleFlow && googleUser) {
      const profile = {
        uid: googleUser.uid,
        fullName: googleUser.displayName || fullName,
        collegeName,
        email: googleUser.email,
        phoneNumber,
        year,
        avatarUrl: googleUser.photoURL || avatarUrl || demoUser.avatarUrl,
        role: "student" as const,
        verificationStatus: "needs_id" as const,
        online: true,
        savedProductIds: []
      };
      setUser(profile);
      await saveUserProfile(profile);
    } else if (auth && firebaseReady) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: fullName, photoURL: avatarUrl });
      const profile = {
        uid: credential.user.uid,
        fullName,
        collegeName,
        email,
        phoneNumber,
        year,
        avatarUrl,
        role: "student" as const,
        verificationStatus: "needs_id" as const,
        online: true,
        savedProductIds: []
      };
      setUser(profile);
      await saveUserProfile(profile);
    } else {
      setUser({
        ...demoUser,
        uid: crypto.randomUUID(),
        fullName,
        collegeName,
        email,
        phoneNumber,
        year,
        avatarUrl: avatarUrl || demoUser.avatarUrl,
        role: "student",
        verificationStatus: "needs_id",
        savedProductIds: []
      });
    }
    router.push("/verify-student");
  }

  async function googleRegister() {
    try {
      if (auth && firebaseReady) {
        const credential = await signInWithPopup(auth, googleProvider);
        setGoogleUser(credential.user);
        setFullName(credential.user.displayName || "");
        setEmail(credential.user.email || "");
        setIsGoogleFlow(true);
      } else {
        setError("Google signup not configured. Please use email registration.");
      }
    } catch (err) {
      if (auth && shouldRetryGoogleWithRedirect(err)) {
        try {
          setError("Popup block ho raha hai. Google redirect signup open kar rahe hain...");
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          setError(getGoogleAuthMessage(redirectError));
        }
      } else {
        setError(getGoogleAuthMessage(err));
      }
    }
  }

  if (isGoogleFlow && googleUser) {
    return (
      <form onSubmit={register} className="space-y-4">
        <div className="rounded-2xl border border-white/[0.12] bg-white/10 px-4 py-3.5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.45]">Google Account</p>
          <p className="mt-2 text-sm font-semibold">{googleUser.displayName}</p>
          <p className="text-xs text-white/60">{googleUser.email}</p>
        </div>
        
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.45]">College</span>
          <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/10 px-4 py-3.5 text-white">
            <GraduationCap className="size-5 text-white/[0.42]" />
            <select
              required
              value={collegeName}
              onChange={(event) => setCollegeName(event.target.value)}
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-white focus:ring-0"
            >
              <option value="">Select college</option>
              {bangaloreColleges.map((college) => (
                <option key={college.name} value={college.name}>{college.name}</option>
              ))}
            </select>
          </span>
        </label>
        
        <Field icon={<Phone className="size-5" />} label="Phone number" type="tel" value={phoneNumber} onChange={setPhoneNumber} />
        
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.45]">Year</span>
          <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/10 px-4 py-3.5 text-white">
            <GraduationCap className="size-5 text-white/[0.42]" />
            <select
              required
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-white focus:ring-0"
            >
              {years.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </span>
        </label>
        
        {error ? <p className="rounded-2xl bg-coral/20 p-3 text-sm text-white">{error}</p> : null}
        <button className="w-full rounded-2xl bg-white py-3.5 text-sm font-black text-ink shadow-premium">Complete Registration</button>
        <button type="button" onClick={() => { setIsGoogleFlow(false); setGoogleUser(null); }} className="w-full rounded-2xl border border-white/[0.15] bg-white/10 py-3.5 text-sm font-black text-white">Back</button>
      </form>
    );
  }

  return (
    <form onSubmit={register} className="space-y-4">
      <Field icon={<UserRound className="size-5" />} label="Full name" value={fullName} onChange={setFullName} />
      <Field icon={<Mail className="size-5" />} label="Email" type="email" value={email} onChange={setEmail} />
      <Field icon={<Phone className="size-5" />} label="Phone number" type="tel" value={phoneNumber} onChange={setPhoneNumber} />
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.45]">College</span>
        <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/10 px-4 py-3.5 text-white">
          <GraduationCap className="size-5 text-white/[0.42]" />
          <select
            required
            value={collegeName}
            onChange={(event) => setCollegeName(event.target.value)}
            className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-white focus:ring-0"
          >
            <option value="">Select college</option>
            {bangaloreColleges.map((college) => (
              <option key={college.name} value={college.name}>{college.name}</option>
            ))}
          </select>
        </span>
      </label>
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-white/[0.45]">Year</span>
        <span className="mt-2 flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/10 px-4 py-3.5 text-white">
          <GraduationCap className="size-5 text-white/[0.42]" />
          <select
            required
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-white focus:ring-0"
          >
            {years.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </span>
      </label>
      <Field icon={<Lock className="size-5" />} label="Password" type="password" value={password} onChange={setPassword} />
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/10 px-4 py-3.5 text-sm font-bold text-white/75">
        <Camera className="size-5 text-mint" />
        <span className="truncate">{avatar ? avatar.name : "Upload profile photo"}</span>
        <input type="file" accept="image/*" className="hidden" onChange={(event) => setAvatar(event.currentTarget.files?.[0] ?? null)} />
      </label>
      {error ? <p className="rounded-2xl bg-coral/20 p-3 text-sm text-white">{error}</p> : null}
      <button className="w-full rounded-2xl bg-white py-3.5 text-sm font-black text-ink shadow-premium">Create account</button>
      <button type="button" onClick={googleRegister} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.15] bg-white/10 py-3.5 text-sm font-black text-white">
        <Chrome className="size-5" />
        Sign up with Google
      </button>
    </form>
  );
}

function Field({
  icon,
  label,
  type = "text",
  value,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  type?: string;
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
      </span>
    </label>
  );
}
