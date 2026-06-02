"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { COLLEGECART_WHATSAPP_NUMBER } from "@/lib/contact";
import type { Product } from "@/lib/types";
import { formatPrice, timeAgo } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  function openWhatsApp() {
    const message = `Hello CollegeCart,

I am interested in this product.

Product Name: ${product.name}
Price: ₹${product.price}

Please share availability, payment details and delivery information.

Thank you.`;
    
    const whatsappUrl = `https://wa.me/${COLLEGECART_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <motion.article
      layout
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-ocean/35 hover:shadow-md dark:border-white/10 dark:bg-white/[0.08]"
    >
      <Link href={`/product/${product.id}`} className="block" aria-label={`Open details for ${product.name}`}>
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
        <div className="space-y-3 p-4">
          <div>
            <p className="line-clamp-2 text-base font-black text-ink transition group-hover:text-ocean dark:text-white">
              {product.name}
            </p>
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
        </div>
      </Link>

      <div className="p-4 pt-0">
        <button
          onClick={openWhatsApp}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-center text-sm font-bold text-ink transition hover:bg-emerald-300"
        >
          <Phone className="size-4" />
          Buy Now
        </button>
      </div>
    </motion.article>
  );
}
