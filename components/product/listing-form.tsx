"use client";

import { CheckCircle2, ImagePlus, Loader2, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { categories } from "@/lib/data";
import { createProduct } from "@/lib/firestore";
import { uploadToImageKit } from "@/lib/imagekit";
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
    const selected = Array.from(fileList ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, maxImages);

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
      const formData = new FormData(event.currentTarget);
      if (!files.length) {
        setImageStatus("error");
        setFormMessage("Please upload at least one real product image.", "error");
        return;
      }

      setImageStatus("uploading");
      const imageUrls = await Promise.all(files.map((file) => uploadToImageKit(file)));
      setImageStatus("uploaded");

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

      try {
        const savedId = await createProduct(product);
        addProduct(savedId ? { ...product, id: savedId } : product);
        if (savedId) {
          setFormMessage("Listing submitted successfully. It will appear after admin approval.", "success");
          setTimeout(() => router.push("/profile"), 900);
        } else {
          setFormMessage(
            "Listing saved on this device, but Firebase is not connected. Please check Firebase settings.",
            "error"
          );
        }
      } catch (error) {
        console.error("Listing cloud save failed", error);
        addProduct(product);
        setFormMessage(
          "Listing saved on this device, but cloud sync failed. Please check Firebase permissions and try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Listing save failed", error);
      setImageStatus("error");
      setFormMessage("Listing could not be saved. Please try again.", "error");
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
              {previews.length}/{maxImages} selected
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className={`h-full rounded-full transition-all ${imageStatus === "error" ? "bg-coral" : "bg-mint"}`} style={{ width: `${imageStatusProgress(imageStatus)}%` }} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {previews.map((preview, index) => (
              <div key={preview.url} className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/10">
                <div className="relative aspect-[4/3]">
                  <img src={preview.url} alt={preview.name} className="size-full object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove ${preview.name}`}
                    onClick={() => removeFile(index)}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/80 text-white opacity-100 transition hover:bg-coral sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-black text-ink dark:text-white">{preview.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">{formatFileSize(preview.size)}</p>
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

function Field({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <input suppressHydrationWarning name={name} required type={type} placeholder={placeholder} className="mt-2 w-full rounded-2xl border-slate-200 bg-white text-ink placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white" />
    </label>
  );
}
