"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { BadgeCheck, Camera, Clock3, GraduationCap, IdCard, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { bangaloreColleges, years } from "@/lib/bangalore-colleges";
import { demoUser } from "@/lib/data";
import { useAuthStore } from "@/stores/auth-store";
import { uploadIdCardImage } from "@/lib/firestore";
import { uploadToImageKit } from "@/lib/imagekit";

export function StudentVerification() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const submitIdCard = useAuthStore((state) => state.submitIdCard);
  const setUser = useAuthStore((state) => state.setUser);
  const [collegeName, setCollegeName] = useState(user?.collegeName ?? "");
  const [year, setYear] = useState(user?.year ?? years[0]);
  const [usn, setUsn] = useState(user?.usn ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [idCard, setIdCard] = useState<File | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Check every 3 seconds if user is approved
  useEffect(() => {
    if (!user?.uid || user?.verificationStatus === "approved") return;
    
    console.log(`🔄 Setting up approval checker for user: ${user.uid}`);
    const interval = setInterval(async () => {
      try {
        const { getUserProfile } = await import("@/lib/firestore");
        const latestProfile = await getUserProfile(user.uid);
        if (latestProfile && latestProfile.verificationStatus === "approved") {
          console.log(`✅ User approved detected! Redirecting to dashboard...`);
          setUser(latestProfile);
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Error checking approval status:", error);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [user?.uid, user?.verificationStatus, router, setUser]);

  useEffect(() => {
    if (user?.verificationStatus === "approved") router.replace("/dashboard");
  }, [router, user?.verificationStatus]);

  if (!user) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const currentUser = user;
    if (!idCard) {
      setMessage("Please upload your college ID card.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      let idCardUrl: string;
      try {
        // Upload ID card image to Firebase Storage
        console.log("📤 Attempting Firebase Storage upload...");
        idCardUrl = await uploadIdCardImage(user.uid, idCard);
        console.log("✅ Firebase Storage upload successful");
      } catch (firebaseError) {
        console.warn("⚠️ Firebase Storage upload failed, trying ImageKit:", firebaseError);
        // Fallback to ImageKit
        try {
          console.log("🔄 Falling back to ImageKit...");
          idCardUrl = await uploadToImageKit(idCard, "/collegecart/idcards");
          console.log("✅ ImageKit upload successful");
        } catch (imageKitError) {
          console.error("❌ Both Firebase and ImageKit uploads failed:", imageKitError);
          throw new Error("Failed to upload ID card. Please check your connection and try again.");
        }
      }

      const avatarUrl = avatar
        ? await uploadToImageKit(avatar, "/collegecart/avatars")
        : currentUser.avatarUrl || demoUser.avatarUrl;
      
      await submitIdCard(idCardUrl, {
        avatarUrl,
        collegeName,
        year,
        usn,
        department,
        phoneNumber
      });
      setMessage("ID card uploaded successfully! Your account is pending admin approval.");
    } catch (error) {
      console.error("❌ Error submitting ID card:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "Failed to upload ID card"}`);
    } finally {
      setLoading(false);
    }
  }

  const pending = user.verificationStatus === "pending";
  const rejected = user.verificationStatus === "rejected";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-premium sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-4 py-2 text-sm font-black text-mint">
              {pending ? <Clock3 className="size-4" /> : <ShieldCheck className="size-4" />}
              Student verification
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {pending ? "Your account is pending approval" : "Upload your College ID Card"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              {pending
                ? "Admin can now review your details and approve or reject the account. Dashboard access opens after approval."
                : "Complete your student details and upload a clear ID card photo so CollegeCart can keep the marketplace trusted."}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/[0.12] bg-white/10 p-5">
            <p className="text-sm font-black text-white/55">Current status</p>
            <p className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-black ${
              pending
                ? "bg-sun/20 text-sun"
                : rejected
                  ? "bg-coral/20 text-coral"
                  : "bg-white text-ink"
            }`}>
              {user.verificationStatus === "needs_id" ? "ID required" : user.verificationStatus}
            </p>
          </div>
        </div>
      </section>

      {pending ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
          <div className="flex items-center gap-4">
            <Image src={user.avatarUrl || demoUser.avatarUrl} alt="" width={80} height={80} className="size-20 rounded-2xl object-cover" />
            <div>
              <h2 className="text-xl font-black text-ink dark:text-white">{user.fullName}</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{user.collegeName} - {user.usn || "USN not added"}</p>
            </div>
          </div>
          {user.idCardUrl ? <Image src={user.idCardUrl} alt="Uploaded college ID card" width={400} height={300} className="mt-5 max-h-80 rounded-2xl object-contain ring-1 ring-slate-200 dark:ring-white/10" unoptimized={user.idCardUrl.startsWith("data:")} /> : null}
        </section>
      ) : (
        <form onSubmit={submit} className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.08] sm:p-8 lg:grid-cols-2">
          {rejected ? (
            <p className="rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral lg:col-span-2">
              Your previous ID was rejected. Please upload a clearer card and confirm your details.
            </p>
          ) : null}
          <Field label="College name" icon={<GraduationCap className="size-5" />}>
            <select required value={collegeName} onChange={(event) => setCollegeName(event.target.value)} className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink focus:ring-0 dark:text-white">
              <option value="">Select college</option>
              {bangaloreColleges.map((college) => <option key={college.name} value={college.name}>{college.name}</option>)}
            </select>
          </Field>
          <Field label="Year" icon={<BadgeCheck className="size-5" />}>
            <select required value={year} onChange={(event) => setYear(event.target.value)} className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink focus:ring-0 dark:text-white">
              {years.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Input label="USN" value={usn} onChange={setUsn} placeholder="1MS23CS044" />
          <Input label="Department" value={department} onChange={setDepartment} placeholder="Computer Science" />
          <Input label="Phone number" value={phoneNumber} onChange={setPhoneNumber} placeholder="+91 98765 43210" />
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-cloud px-4 py-3.5 text-sm font-bold text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
            <Camera className="size-5 text-ocean" />
            <span className="truncate">{avatar ? avatar.name : "Update profile photo"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setAvatar(event.target.files?.[0] ?? null)} />
          </label>
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-ocean/30 bg-ocean/5 p-6 text-center lg:col-span-2">
            <UploadCloud className="size-9 text-ocean" />
            <span className="mt-3 text-sm font-black text-ink dark:text-white">{idCard ? idCard.name : "Upload College ID Card"}</span>
            <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">Clear JPG, PNG, or WebP photo</span>
            <input type="file" required accept="image/*" className="hidden" onChange={(event) => setIdCard(event.target.files?.[0] ?? null)} />
          </label>
          {message ? <p className="rounded-2xl bg-mint/12 p-4 text-sm font-bold text-emerald-700 dark:text-mint lg:col-span-2">{message}</p> : null}
          <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean py-4 text-sm font-black text-white shadow-glow disabled:opacity-60 lg:col-span-2">
            {loading ? <Loader2 className="size-5 animate-spin" /> : <IdCard className="size-5" />}
            Submit for approval
          </button>
          {user.verificationStatus === "pending" && (
            <button type="button" onClick={async () => {
              try {
                const { getUserProfile } = await import("@/lib/firestore");
                const latest = await getUserProfile(user.uid);
                if (latest) {
                  setUser(latest);
                  if (latest.verificationStatus === "approved") {
                    setMessage("✅ Approval detected! Redirecting...");
                    setTimeout(() => router.replace("/dashboard"), 500);
                  } else {
                    setMessage("⏳ Still pending. Check again later.");
                  }
                }
              } catch (error) {
                setMessage("❌ Error checking status");
              }
            }} className="col-span-full rounded-2xl border-2 border-ocean bg-transparent py-3 text-sm font-black text-ocean hover:bg-ocean/5">
              🔄 Check Status
            </button>
          )}
        </form>
      )}
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-cloud px-4 py-3.5 text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
        <span className="text-ocean">{icon}</span>
        {children}
      </span>
    </label>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <Field label={label} icon={<IdCard className="size-5" />}>
      <input
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink placeholder:text-slate-400 focus:ring-0 dark:text-white"
      />
    </Field>
  );
}
