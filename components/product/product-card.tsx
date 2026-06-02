"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Loader2, Lock, LogIn, MapPin, Phone } from "lucide-react";
import { type MouseEvent, useState } from "react";
import { ProductImageSlider } from "@/components/product/product-image-slider";
import { createBuyNowOrder, openBuyNowChat } from "@/lib/buy-now";
import { saveUserProfile } from "@/lib/firestore";
import type { Product } from "@/lib/types";
import { formatPrice, timeAgo } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export function ProductCard({ product }: { product: Product }) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { savedIds, toggleSaved } = useMarketplaceStore();
  const [buying, setBuying] = useState(false);
  const isSaved = savedIds.includes(product.id);

  if (!user) {
    return (
      <motion.article
        layout
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.08]"
      >
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-slate-100 dark:bg-white/10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(21,94,239,0.14),rgba(38,215,164,0.16))]" />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="relative grid size-16 place-items-center rounded-2xl bg-white text-ocean shadow-sm ring-1 ring-slate-200 dark:bg-night dark:ring-white/10">
            <Lock className="size-7" />
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <p className="text-base font-black text-ink dark:text-white">Product locked</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">
              Log in to unlock product photos, price, seller details and Buy Now.
            </p>
          </div>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ocean px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-ocean/90"
          >
            <LogIn className="size-4" />
            Login to unlock
          </Link>
        </div>
      </motion.article>
    );
  }

  function handleSave(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const nextSavedIds = isSaved
      ? savedIds.filter((id) => id !== product.id)
      : [...savedIds, product.id];

    toggleSaved(product.id);

    if (user) {
      const updatedAt = new Date().toISOString();
      updateUser({ savedProductIds: nextSavedIds, updatedAt });
      void saveUserProfile({ ...user, savedProductIds: nextSavedIds, updatedAt }).catch((error) => {
        console.error("Could not sync saved product:", error);
      });
    }
  }

  async function handleBuyNow() {
    if (!user) {
      alert("Please log in before buying.");
      window.location.href = "/login";
      return;
    }

    setBuying(true);
    try {
      const orderId = await createBuyNowOrder(product, user);
      openBuyNowChat(product, orderId);
    } catch (error) {
      console.error("Could not create order:", error);
      alert(error instanceof Error ? error.message : "Could not create order. Please try again.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <motion.article
      layout
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-ocean/35 hover:shadow-md dark:border-white/10 dark:bg-white/[0.08]"
    >
      <button
        type="button"
        onClick={handleSave}
        aria-label={isSaved ? `Remove ${product.name} from saved products` : `Save ${product.name}`}
        className={`absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full shadow-sm ring-1 ring-slate-200 backdrop-blur transition ${
          isSaved
            ? "bg-coral text-white ring-coral"
            : "bg-white/90 text-slate-700 hover:bg-white hover:text-coral dark:bg-night/85 dark:text-white dark:ring-white/10"
        }`}
      >
        <Heart className={`size-5 ${isSaved ? "fill-current" : ""}`} />
      </button>

      <Link href={`/product/${product.id}`} className="block" aria-label={`Open details for ${product.name}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <ProductImageSlider
            images={product.images}
            alt={product.name}
            sizes="(max-width: 768px) 100vw, 25vw"
            imageClassName="group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-ink backdrop-blur dark:bg-night/90 dark:text-white">
            {product.condition}
          </div>
          {product.isTrending ? (
            <div className="absolute bottom-3 left-3 rounded-full bg-coral px-3 py-1 text-xs font-black text-white">
              Trending
            </div>
          ) : null}
        </div>
        <div className="space-y-3 p-4">
          <div>
            <p className="line-clamp-2 text-base font-black text-ink transition group-hover:text-ocean dark:text-white">
              {product.name}
            </p>
            <p className="mt-2 text-xl font-black tracking-tight text-ink dark:text-white">{formatPrice(product.price)}</p>
          </div>

          <div className="flex items-center gap-3">
            <Image
              src={product.sellerAvatar}
              alt=""
              width={36}
              height={36}
              unoptimized={product.sellerAvatar.startsWith("data:")}
              className="size-9 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{product.sellerName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{product.collegeName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-white/10">
              <MapPin className="size-3.5" />
              {product.location}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-white/10">{timeAgo(product.createdAt)}</span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={buying}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-center text-sm font-bold text-ink transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {buying ? <Loader2 className="size-4 animate-spin" /> : <Phone className="size-4" />}
          {buying ? "Creating order..." : "Buy Now"}
        </button>
      </div>
    </motion.article>
  );
}
