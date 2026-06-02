"use client";

import { CheckCircle2, ImagePlus, Loader2, Send, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { categories } from "@/lib/data";
import { createProduct } from "@/lib/firestore";
import { uploadListingImage } from "@/lib/cloudinary-upload";
import type { ProductCategory, ProductCondition } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";

const conditions: ProductCondition[] = ["New", "Like New", "Good", "Fair", "Used"];
const maxImages = 4;

type MessageType = "info" | "success" | "error";
type ImageStatus = "idle" | "ready" | "uploading" | "uploaded" | "error";

export function ListingForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const addProduct = useMarketplaceStore((state) => state.addProduct);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Array<{ name: string; size: number; url: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("info");
  const [imageStatus, setImageStatus] = useState<ImageStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  function setFormMessage(nextMessage: string, type: MessageType = "info") {
    setMessage(nextMessage);
    setMessageType(type);
  }

  function updateFiles(fileList: FileList | null) {
    const newFiles = Array.from(fileList ?? [])
      .filter((file) => file.type.startsWith("image/"));
    
    // Append new files to existing files (don't replace)
    const combined = [...files, ...newFiles];
    const selected = combined.slice(0, maxImages);
    
    setFiles(selected);
    setImageStatus(selected.length ? "ready" : "idle");
    setFormMessage(
      selected.length
        ? `${selected.length} image${selected.length > 1 ? "s are" : " is"} ready to upload.`
        : "",
      "info"
    );
  }

  function removeFile(index: number) {
    const nextFiles = files.filter((_, itemIndex) => itemIndex !== index);
    setFiles(nextFiles);
    setImageStatus(nextFiles.length ? "ready" : "idle");
    setFormMessage(
      nextFiles.length
        ? `${nextFiles.length} image${nextFiles.length > 1 ? "s are" : " is"} ready to upload.`
        : "",
      "info"
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setFormMessage("");
      setUploadProgress({});
      setOverallProgress(0);
      const formData = new FormData(event.currentTarget);
      
      // VALIDATE PRODUCT NAME FIRST
      const rawName = String(formData.get("name") || "").trim();
      if (!rawName) {
        setFormMessage("❌ Product name cannot be empty! Please enter a product name.", "error");
        setLoading(false);
        return;
      }
      
      if (!files.length) {
        setImageStatus("error");
        setFormMessage("Please upload at least one real product image.", "error");
        setLoading(false);
        return;
      }

      setImageStatus("uploading");
      setFormMessage(`Uploading ${files.length} image${files.length > 1 ? "s" : ""}...`, "info");

      const imageUrls = await Promise.all(
        files.map(async (file, index) => {
          try {
            return await uploadListingImage(file, "collegecart/listings", (progress) => {
              setUploadProgress((prev) => {
                const next = { ...prev, [index]: progress };
                const total = files.reduce((sum, _file, fileIndex) => sum + (next[fileIndex] ?? 0), 0);
                setOverallProgress(Math.round(total / files.length));
                return next;
              });
            });
          } catch (error) {
            console.error(`Failed to upload image ${index + 1}:`, error);
            throw error;
          }
        })
      );

      setImageStatus("uploaded");
      setOverallProgress(100);
      setFormMessage("All images uploaded successfully!", "info");

      const now = new Date().toISOString();
      const product = {
        id: `local-${crypto.randomUUID()}`,
        name: rawName,
        description: String(formData.get("description")).trim(),
        category: String(formData.get("category")) as ProductCategory,
        price: Number(formData.get("price")),
        condition: String(formData.get("condition")) as ProductCondition,
        location: String(formData.get("location")).trim(),
        contactNumber: String(formData.get("contactNumber")).trim(),
        whatsappNumber: String(formData.get("whatsappNumber")).trim(),
        images: imageUrls,
        sellerId: user?.uid ?? "demo-student",
        sellerName: user?.fullName ?? "CollegeCart Student",
        sellerAvatar: user?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
        collegeName: user?.collegeName ?? "Campus",
        createdAt: now,
        updatedAt: now,
        savedCount: 0,
        views: 0,
        status: "pending" as const
      };

      try {
        setFormMessage("Saving to cloud...", "info");
        const savedId = await withTimeout(createProduct(product), 12_000, "Cloud save timed out");
        
        const finalProduct = savedId ? { ...product, id: savedId } : product;
        addProduct(finalProduct);
        
        if (savedId) {
          setFormMessage("✅ Listing published! It will appear after admin approval.", "success");
          setTimeout(() => router.push("/profile"), 1500);
        } else {
          setFormMessage(
            "✅ Listing saved locally. It will sync to cloud when online.",
            "success"
          );
          setTimeout(() => router.push("/profile"), 1500);
        }
      } catch (error) {
        console.error("Cloud save error details:", error);
        
        // Save locally even if cloud fails
        const localProduct = { ...product, id: product.id };
        addProduct(localProduct);
        
        const errorMsg = error instanceof Error ? error.message : "Cloud save failed";
        
        if (errorMsg.includes("not authenticated")) {
          setFormMessage(
            "✅ Listing saved locally! Please log in to sync to cloud later.",
            "success"
          );
        } else if (errorMsg.includes("Permission")) {
          setFormMessage(
            "✅ Listing saved locally. Admin will review it when you sync.",
            "success"
          );
        } else {
          setFormMessage(
            "✅ Listing saved locally! Syncing to cloud in background...",
            "success"
          );
        }
        
        setTimeout(() => router.push("/profile"), 1500);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setImageStatus("error");
      const errorMsg = error instanceof Error ? error.message : "Image upload failed";
      setFormMessage(`${errorMsg}. Please try a smaller photo or try again.`, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass rounded-[2rem] p-5 sm:p-8">
      <div className="mb-6 rounded-2xl border border-ocean/30 bg-ocean/5 p-4">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">📝 First, name your product clearly so buyers find it</p>
      </div>
      
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">🛍️ Product Name <span className="text-coral">*</span></span>
          <input suppressHydrationWarning name="name" required type="text" placeholder="e.g., MacBook charger, Semester books, Physics notes, Study lamp..." className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-ink placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white" />
        </label>
        
        <Field name="price" type="number" label="Price" placeholder="2500" />
        <label className="block">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Category</span>
          <select suppressHydrationWarning name="category" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
            {categories.map((category) => <option key={category.name}>{category.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Condition</span>
          <select suppressHydrationWarning name="condition" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
            {conditions.map((condition) => <option key={condition}>{condition}</option>)}
          </select>
        </label>
        <Field name="location" label="Location" placeholder="Hostel B, Library Block" />
        <Field name="contactNumber" label="Contact Number" placeholder="+91 98765 43210" />
        <Field name="whatsappNumber" label="WhatsApp Number" placeholder="+919876543210" />
        <label className="block md:col-span-2">
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Description</span>
          <textarea suppressHydrationWarning name="description" required rows={5} placeholder="Mention condition, accessories, pickup timing, and reason for selling." className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-ink placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white" />
        </label>
      </div>

      <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-ocean/30 bg-ocean/5 p-6 text-center">
        <ImagePlus className="size-8 text-ocean" />
        <span className="mt-3 text-sm font-black text-ink dark:text-white">Upload multiple product images</span>
        <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
          {files.length ? `${files.length} image${files.length > 1 ? "s" : ""} selected` : `PNG, JPG, WebP supported. Up to ${maxImages} images.`}
        </span>
        <input type="file" multiple accept="image/*" className="hidden" onChange={(event) => updateFiles(event.target.files)} />
      </label>

      {previews.length ? (
        <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.08]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${imageStatusClass(imageStatus)}`}>
              {imageStatus === "uploading" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              {imageStatusLabel(imageStatus)}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
              {imageStatus === "uploading" ? `${overallProgress}%` : `${previews.length}/${maxImages} selected`}
            </span>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div 
              className={`h-full rounded-full transition-all ${imageStatus === "error" ? "bg-coral" : imageStatus === "uploaded" ? "bg-mint" : "bg-ocean"}`} 
              style={{ width: `${imageStatus === "uploading" ? overallProgress : imageStatusProgress(imageStatus)}%` }} 
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {previews.map((preview, index) => (
              <div key={preview.url} className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/10">
                <div className="relative aspect-[4/3]">
                  <Image src={preview.url} alt={preview.name} fill className="size-full object-cover" unoptimized={preview.url.startsWith("data:")} />
                  {imageStatus === "uploading" && uploadProgress[index] !== undefined && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-sm font-black text-white">{uploadProgress[index]}%</span>
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={imageStatus === "uploading"}
                    aria-label={`Remove ${preview.name}`}
                    onClick={() => removeFile(index)}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/80 text-white opacity-100 transition hover:bg-coral disabled:opacity-50 disabled:cursor-not-allowed sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-black text-ink dark:text-white">{preview.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">{formatFileSize(preview.size)}</p>
                  {imageStatus === "uploading" && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div 
                        className="h-full rounded-full bg-ocean transition-all"
                        style={{ width: `${uploadProgress[index] ?? 0}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {message ? <p className={`mt-4 rounded-2xl p-3 text-sm font-bold ${messageClass(messageType)}`}>{message}</p> : null}

      <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ocean py-4 text-sm font-black text-white shadow-glow disabled:opacity-60">
        {loading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
        Publish listing
      </button>
    </form>
  );
}

function imageStatusLabel(status: ImageStatus) {
  if (status === "uploading") return "Uploading images";
  if (status === "uploaded") return "Images uploaded";
  if (status === "error") return "Image upload needed";
  if (status === "ready") return "Images ready";
  return "No images selected";
}

function imageStatusProgress(status: ImageStatus) {
  if (status === "uploading") return 70;
  if (status === "uploaded") return 100;
  if (status === "ready") return 35;
  if (status === "error") return 100;
  return 0;
}

function imageStatusClass(status: ImageStatus) {
  if (status === "error") return "bg-coral/10 text-coral";
  if (status === "uploaded") return "bg-mint/12 text-emerald-700 dark:text-mint";
  if (status === "uploading") return "bg-ocean/10 text-ocean";
  return "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";
}

function messageClass(type: MessageType) {
  if (type === "error") return "bg-coral/10 text-coral";
  if (type === "success") return "bg-mint/12 text-emerald-700 dark:text-mint";
  return "bg-ocean/10 text-ocean dark:text-sky-300";
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

function Field({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <input suppressHydrationWarning name={name} required type={type} placeholder={placeholder} className="mt-2 w-full rounded-2xl border-slate-200 bg-white text-ink placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white" />
    </label>
  );
}
