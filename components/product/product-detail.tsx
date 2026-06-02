"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { COLLEGECART_WHATSAPP_NUMBER } from "@/lib/contact";
import type { Product } from "@/lib/types";
import { formatPrice, timeAgo } from "@/lib/utils";
import { ProductGrid } from "@/components/product/product-grid";

export function ProductDetail({ product }: { product: Product }) {
  const images = useMemo(() => product.images.filter(Boolean), [product.images]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = images[activeImageIndex] ?? images[0] ?? "";
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  function showNextImage() {
    if (!hasMultipleImages) return;
    setActiveImageIndex((current) => (current + 1) % images.length);
  }

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
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-3">
          <button
            type="button"
            onClick={showNextImage}
            disabled={!hasMultipleImages}
            className="relative block aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-slate-100 disabled:cursor-default"
          >
            {activeImage ? (
              <Image src={activeImage} alt={product.name} fill priority unoptimized={activeImage.startsWith("data:")} sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
            ) : null}
            {hasMultipleImages ? (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 backdrop-blur">
                {images.map((image, index) => (
                  <span
                    key={`${image}-main-dot-${index}`}
                    className={`size-2 rounded-full transition ${index === activeImageIndex ? "bg-white" : "bg-white/45"}`}
                  />
                ))}
              </div>
            ) : null}
          </button>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-2xl bg-slate-100 ring-2 transition ${index === activeImageIndex ? "ring-ocean" : "ring-slate-200 hover:ring-ocean/50 dark:ring-white/10"}`}
                aria-label={`View product image ${index + 1}`}
              >
                <Image src={image} alt="" fill unoptimized={image.startsWith("data:")} sizes="120px" className="object-cover" />
              </button>
            ))}
          </div>
        </motion.div>

        <aside className="glass rounded-[2rem] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-ocean">{product.category}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white">{product.name}</h1>
            </div>
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

          <div className="mt-6">
            <button
              onClick={openWhatsApp}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-4 text-sm font-black text-ink shadow-glow transition hover:bg-emerald-300"
            >
              <Phone className="size-5" />
              Buy Now
            </button>
            <p className="mt-3 rounded-2xl bg-white/75 px-4 py-3 text-center text-xs font-bold leading-5 text-slate-600 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10">
              Meet and pay is free. Campus delivery is available for an additional Rs 60.
            </p>
          </div>
        </aside>
      </section>

      <section className="glass rounded-[2rem] p-6">
        <h2 className="text-2xl font-black text-ink dark:text-white">Product description</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
      </section>

      <section className="rounded-[2rem] border-2 border-amber-300/30 bg-amber-50 p-6 dark:border-amber-900/30 dark:bg-amber-950/10">
        <h3 className="text-lg font-black text-amber-900 dark:text-amber-100">📋 How ordering works</h3>
        <p className="mt-3 text-sm leading-7 text-amber-800 dark:text-amber-200">
          Orders are processed manually by the CollegeCart team. After contacting us on WhatsApp, we will confirm availability and arrange delivery. Payment and delivery details will be shared by our team.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black text-ink dark:text-white">Related products</h2>
        <ProductGrid limit={4} />
      </section>
    </div>
  );
}
