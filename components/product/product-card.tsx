"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, MessageCircle, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { cn, formatPrice, timeAgo } from "@/lib/utils";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { CheckoutModal } from "@/components/checkout/checkout-modal";

export function ProductCard({ product }: { product: Product }) {
  const { savedIds, toggleSaved } = useMarketplaceStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const saved = savedIds.includes(product.id);

  return (
    <motion.article
      layout
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-ocean/35 hover:shadow-md dark:border-white/10 dark:bg-white/[0.08]"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            unoptimized={product.images[0].startsWith("data:")}
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-110"
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
      </Link>

      <div className="space-y-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link href={`/product/${product.id}`} className="line-clamp-2 text-base font-black text-ink transition hover:text-ocean dark:text-white">
              {product.name}
            </Link>
            <button
              type="button"
              aria-label={saved ? "Remove from wishlist" : "Save product"}
              onClick={() => toggleSaved(product.id)}
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full ring-1 transition",
                saved
                  ? "bg-coral text-white ring-coral"
                  : "bg-cloud text-slate-600 ring-slate-200 hover:text-coral dark:bg-white/10 dark:text-white dark:ring-white/10"
              )}
            >
              <Heart className={cn("size-5", saved && "fill-current")} />
            </button>
          </div>
          <p className="mt-2 text-xl font-black tracking-tight text-ink dark:text-white">{formatPrice(product.price)}</p>
        </div>

        <div className="flex items-center gap-3">
          <Image src={product.sellerAvatar} alt="" width={36} height={36} unoptimized={product.sellerAvatar.startsWith("data:")} className="size-9 rounded-full object-cover" />
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

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            onClick={() => setShowCheckout(true)}
            className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="size-4" />
            Buy Now
          </button>
          <Link href="/messages" aria-label="Chat seller" className="grid size-12 place-items-center rounded-xl bg-mint/12 text-emerald-600 ring-1 ring-mint/30">
            <MessageCircle className="size-5" />
          </Link>
        </div>

        <CheckoutModal
          product={product}
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
        />
      </div>
    </motion.article>
  );
}
