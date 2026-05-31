"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flag, Heart, MapPin, MessageCircle, Phone, Share2, ShieldCheck, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, timeAgo } from "@/lib/utils";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { ProductGrid } from "@/components/product/product-grid";
import { CheckoutModal } from "@/components/checkout/checkout-modal";

export function ProductDetail({ product }: { product: Product }) {
  const { savedIds, toggleSaved } = useMarketplaceStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const saved = savedIds.includes(product.id);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-100">
            <Image src={product.images[0]} alt={product.name} fill priority unoptimized={product.images[0].startsWith("data:")} sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.images.map((image) => (
              <div key={image} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-ocean/30">
                <Image src={image} alt="" fill unoptimized={image.startsWith("data:")} sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        </motion.div>

        <aside className="glass rounded-[2rem] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-ocean">{product.category}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white">{product.name}</h1>
            </div>
            <button onClick={() => toggleSaved(product.id)} className="grid size-12 place-items-center rounded-full bg-white text-coral ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10">
              <Heart className={`size-6 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>

          <p className="mt-6 text-4xl font-black tracking-tight text-ink dark:text-white">{formatPrice(product.price)}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-300">
            <span className="rounded-full bg-mint/12 px-3 py-1 text-emerald-700 dark:text-mint">{product.condition}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10">
              <MapPin className="size-3.5" />
              {product.location}
            </span>
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10">{timeAgo(product.createdAt)}</span>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-white p-4 ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
            <div className="flex items-center gap-3">
              <Image src={product.sellerAvatar} alt="" width={52} height={52} unoptimized={product.sellerAvatar.startsWith("data:")} className="size-13 rounded-full object-cover" />
              <div>
                <p className="font-black text-ink dark:text-white">{product.sellerName}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{product.collegeName}</p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-600">
              <ShieldCheck className="size-4" />
              Verified campus seller
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setShowCheckout(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-sm font-black text-white shadow-glow hover:bg-blue-700 transition"
            >
              <ShoppingCart className="size-5" />
              Buy Now
            </button>
            <Link href="/messages" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean px-4 py-4 text-sm font-black text-white shadow-glow">
              <MessageCircle className="size-5" />
              Chat Seller
            </Link>
            <a href={`https://wa.me/${product.whatsappNumber.replace(/\D/g, "")}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-4 text-sm font-black text-ink">
              <Phone className="size-5" />
              WhatsApp
            </a>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-black text-coral ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10">
              <Flag className="size-5" />
              Report
            </button>
          </div>

          <CheckoutModal
            product={product}
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
          />
        </aside>
      </section>

      <section className="glass rounded-[2rem] p-6">
        <h2 className="text-2xl font-black text-ink dark:text-white">Product description</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black text-ink dark:text-white">Related products</h2>
        <ProductGrid limit={4} />
      </section>
    </div>
  );
}
