"use client";

import { ImagePlus, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { categories } from "@/lib/data";
import { createProduct } from "@/lib/firestore";
import { uploadToImageKit } from "@/lib/imagekit";
import type { ProductCategory, ProductCondition } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";

const conditions: ProductCondition[] = ["New", "Like New", "Good", "Fair", "Used"];

export function ListingForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const addProduct = useMarketplaceStore((state) => state.addProduct);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      const formData = new FormData(event.currentTarget);
      const imageUrls = files.length
        ? await Promise.all(files.map((file) => uploadToImageKit(file)))
        : ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=80"];

      const product = {
        id: `local-${crypto.randomUUID()}`,
        name: String(formData.get("name")),
        description: String(formData.get("description")),
        category: String(formData.get("category")) as ProductCategory,
        price: Number(formData.get("price")),
        condition: String(formData.get("condition")) as ProductCondition,
        location: String(formData.get("location")),
        contactNumber: String(formData.get("contactNumber")),
        whatsappNumber: String(formData.get("whatsappNumber")),
        images: imageUrls,
        sellerId: user?.uid ?? "demo-student",
        sellerName: user?.fullName ?? "CollegeCart Student",
        sellerAvatar: user?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
        collegeName: user?.collegeName ?? "Campus",
        createdAt: new Date().toISOString(),
        savedCount: 0,
        views: 0,
        status: "pending" as const
      };

      addProduct(product);
      await createProduct(product);
      setMessage("Listing submit ho gayi. Admin approval ke baad marketplace me dikhegi.");
      setTimeout(() => router.push("/profile"), 900);
    } catch {
      setMessage("Listing save nahi hui. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass rounded-[2rem] p-5 sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="name" label="Product Name" placeholder="MacBook charger, semester books..." />
        <Field name="price" type="number" label="Price" placeholder="2500" />
        <label className="block">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Category</span>
          <select suppressHydrationWarning name="category" className="mt-2 w-full rounded-2xl border-slate-200 bg-white text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
            {categories.map((category) => <option key={category.name}>{category.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Condition</span>
          <select suppressHydrationWarning name="condition" className="mt-2 w-full rounded-2xl border-slate-200 bg-white text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
            {conditions.map((condition) => <option key={condition}>{condition}</option>)}
          </select>
        </label>
        <Field name="location" label="Location" placeholder="Hostel B, Library Block" />
        <Field name="contactNumber" label="Contact Number" placeholder="+91 98765 43210" />
        <Field name="whatsappNumber" label="WhatsApp Number" placeholder="+919876543210" />
        <label className="block md:col-span-2">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Description</span>
          <textarea suppressHydrationWarning name="description" required rows={5} placeholder="Mention condition, accessories, pickup timing, and reason for selling." className="mt-2 w-full rounded-2xl border-slate-200 bg-white text-ink placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white" />
        </label>
      </div>

      <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-ocean/30 bg-ocean/5 p-6 text-center">
        <ImagePlus className="size-8 text-ocean" />
        <span className="mt-3 text-sm font-black text-ink dark:text-white">Upload multiple product images</span>
        <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
          {files.length ? `${files.length} image selected` : "PNG, JPG, WebP supported"}
        </span>
        <input type="file" multiple accept="image/*" className="hidden" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
      </label>

      {message ? <p className="mt-4 rounded-2xl bg-mint/12 p-3 text-sm font-bold text-emerald-700 dark:text-mint">{message}</p> : null}

      <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ocean py-4 text-sm font-black text-white shadow-glow disabled:opacity-60">
        {loading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
        Publish listing
      </button>
    </form>
  );
}

function Field({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <input suppressHydrationWarning name={name} required type={type} placeholder={placeholder} className="mt-2 w-full rounded-2xl border-slate-200 bg-white text-ink placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white" />
    </label>
  );
}
