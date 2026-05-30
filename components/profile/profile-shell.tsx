"use client";

import Image from "next/image";
import { BadgeCheck, Camera, GraduationCap, Heart, IdCard, ListChecks, LogOut, PackageCheck, Phone, Save, Settings, UserRound, X } from "lucide-react";
import { useState } from "react";
import { bangaloreColleges, years } from "@/lib/bangalore-colleges";
import { demoUser } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { deleteProduct, signOutUser } from "@/lib/firestore";

const tabs = [
  { label: "My Listings", icon: ListChecks },
  { label: "Saved Products", icon: Heart },
  { label: "Purchase History", icon: PackageCheck },
  { label: "Account Settings", icon: Settings }
];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ProfileShell() {
  const { user, logout } = useAuthStore();
  const { products, savedIds } = useMarketplaceStore();
  const [activeTab, setActiveTab] = useState("My Listings");
  const [editing, setEditing] = useState(false);
  const profile = user ?? demoUser;
  const approvedProducts = products.filter((product) => product.status === "approved");
  const myListings = products.filter((product) => product.sellerId === profile.uid || product.sellerName === profile.fullName);
  const savedProducts = approvedProducts.filter((product) => savedIds.includes(product.id));

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-ink p-6 shadow-premium sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(38,215,164,0.22),transparent_24rem),radial-gradient(circle_at_88%_10%,rgba(249,200,70,0.18),transparent_22rem)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-5">
            <span className="relative">
              <Image src={profile.avatarUrl || demoUser.avatarUrl} alt="" width={112} height={112} unoptimized={(profile.avatarUrl || "").startsWith("data:")} className="size-28 rounded-[2rem] object-cover ring-4 ring-white/20" />
              <button type="button" onClick={() => setEditing(true)} className="absolute -bottom-2 -right-2 grid size-11 place-items-center rounded-full bg-mint text-ink shadow-premium">
                <Camera className="size-5" />
              </button>
            </span>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">{profile.fullName}</h1>
              <p className="mt-1 text-sm font-semibold text-white/[0.66]">{profile.collegeName}</p>
              <p className="mt-3 inline-flex rounded-full bg-white/[0.12] px-3 py-1 text-xs font-black text-mint">
                {profile.verificationStatus === "approved" ? "Verified student" : profile.verificationStatus ?? "Needs ID"}
              </p>
            </div>
          </div>
          <button onClick={() => setEditing(true)} className="rounded-full bg-white px-5 py-3 text-sm font-black text-ink">Edit Profile</button>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-3 rounded-[1.5rem] p-4 text-left font-black shadow-sm ring-1 transition hover:-translate-y-1 ${
                activeTab === tab.label
                  ? "bg-ocean text-white ring-ocean"
                  : "bg-white text-ink ring-slate-200 dark:bg-white/[0.08] dark:text-white dark:ring-white/10"
              }`}
            >
              <Icon className={`size-5 ${activeTab === tab.label ? "text-white" : "text-ocean"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink dark:text-white">{activeTab}</h2>
          {activeTab === "Account Settings" ? (
            <button onClick={async () => {
              await signOutUser();
              logout();
              if (typeof window !== "undefined") window.location.href = '/login';
            }} className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-black text-coral">
              <LogOut className="size-4" />
              Logout
            </button>
          ) : null}
        </div>
        {activeTab === "My Listings" ? <ListingTable products={myListings} /> : null}
        {activeTab === "Saved Products" ? <ListingTable products={savedProducts} /> : null}
        {activeTab === "Purchase History" ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-200">
            {"You haven&apos;t purchased anything yet."}
          </div>
        ) : null}
        {activeTab === "Account Settings" ? (
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.08] md:grid-cols-2">
            <Setting label="Email" value={profile.email} />
            <Setting label="Phone Number" value={profile.phoneNumber || "Not added"} />
            <Setting label="College Name" value={profile.collegeName || "Not added"} />
            <Setting label="USN" value={profile.usn || "Not added"} />
            <Setting label="Year" value={profile.year || "Not added"} />
            <Setting label="Department" value={profile.department || "Not added"} />
            <Setting label="Verification" value={profile.verificationStatus || "needs_id"} />
            <Setting label="Role" value={profile.role} />
          </div>
        ) : null}
      </section>

      {editing ? (
        <EditProfileModal
          name={profile.fullName}
          college={profile.collegeName}
          onClose={() => setEditing(false)}
          onSave={() => {
            setEditing(false);
          }}
        />
      ) : null}
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-ink dark:text-white">{value}</p>
    </div>
  );
}

function ListingTable({ products }: { products: ReturnType<typeof useMarketplaceStore.getState>["products"] }) {
  const { removeProduct } = useMarketplaceStore();
  
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-200">
        No listings found.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.08]">
      {products.map((product) => (
        <div key={product.id} className="grid gap-4 p-4 sm:grid-cols-[80px_1fr_auto_auto] sm:items-center">
          <Image src={product.images[0]} alt="" width={80} height={80} unoptimized={product.images[0].startsWith("data:")} className="size-20 rounded-xl object-cover" />
          <div>
            <p className="font-black text-ink dark:text-white">{product.name}</p>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{formatPrice(product.price)} - {product.location}</p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
            product.status === "pending"
              ? "bg-sun/20 text-amber-700"
              : product.status === "rejected"
                ? "bg-coral/10 text-coral"
                : "bg-mint/12 text-emerald-700 dark:text-mint"
          }`}>
            {product.status ?? "approved"}
          </span>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this product?")) {
                removeProduct(product.id);
                void deleteProduct(product.id);
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1 text-xs font-black text-coral transition hover:bg-coral/20"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

function EditProfileModal({
  name,
  college,
  onClose,
  onSave
}: {
  name: string;
  college: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const user = useAuthStore((state) => state.user) ?? demoUser;
  const updateUser = useAuthStore((state) => state.updateUser);
  const [fullName, setFullName] = useState(name);
  const [collegeName, setCollegeName] = useState(college);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? "");
  const [usn, setUsn] = useState(user.usn ?? "");
  const [year, setYear] = useState(user.year ?? years[0]);
  const [department, setDepartment] = useState(user.department ?? "");
  const [avatar, setAvatar] = useState<File | null>(null);

  async function save() {
    const avatarUrl = avatar ? await readFileAsDataUrl(avatar) : user.avatarUrl;
    updateUser({ fullName, collegeName, phoneNumber, usn, year, department, avatarUrl });
    onSave();
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-premium dark:bg-ink">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-black text-ink dark:text-white">Edit Profile</h3>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-slate-100 dark:bg-white/10">
            <X className="size-5" />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <EditInput icon={<UserRound className="size-5" />} label="Full name" value={fullName} onChange={setFullName} />
          <EditInput icon={<Phone className="size-5" />} label="Phone number" value={phoneNumber} onChange={setPhoneNumber} />
          <label className="block text-sm font-black text-slate-700 dark:text-slate-200 md:col-span-2">
            College name
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-white/10">
              <GraduationCap className="size-5 text-ocean" />
              <select value={collegeName} onChange={(event) => setCollegeName(event.target.value)} className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink focus:ring-0 dark:text-white">
                {bangaloreColleges.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
            </span>
          </label>
          <EditInput icon={<IdCard className="size-5" />} label="USN" value={usn} onChange={setUsn} />
          <label className="block text-sm font-black text-slate-700 dark:text-slate-200">
            Year
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-white/10">
              <BadgeCheck className="size-5 text-ocean" />
              <select value={year} onChange={(event) => setYear(event.target.value)} className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink focus:ring-0 dark:text-white">
                {years.map((item) => <option key={item}>{item}</option>)}
              </select>
            </span>
          </label>
          <EditInput icon={<GraduationCap className="size-5" />} label="Department" value={department} onChange={setDepartment} />
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-black text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
            <Camera className="size-5 text-ocean" />
            <span className="truncate">{avatar ? avatar.name : "Update profile photo"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setAvatar(event.target.files?.[0] ?? null)} />
          </label>
        </div>
        <button onClick={save} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ocean py-3 text-sm font-black text-white">
          <Save className="size-4" />
          Save changes
        </button>
      </div>
    </div>
  );
}

function EditInput({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-black text-slate-700 dark:text-slate-200">
      {label}
      <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-white/10">
        <span className="text-ocean">{icon}</span>
        <input suppressHydrationWarning value={value} onChange={(event) => onChange(event.target.value)} className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink focus:ring-0 dark:text-white" />
      </span>
    </label>
  );
}
