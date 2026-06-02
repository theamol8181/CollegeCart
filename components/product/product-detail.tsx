"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Lock, LogIn, MapPin, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { createBuyNowOrder, openBuyNowChat } from "@/lib/buy-now";
import type { Product } from "@/lib/types";
import { formatPrice, timeAgo } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function ProductDetail({ product }: { product: Product }) {
  const user = useAuthStore((state) => state.user);
  const images = useMemo(() => product.images.filter(Boolean), [product.images]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [buying, setBuying] = useState(false);
  const activeImage = images[activeImageIndex] ?? images[0] ?? "";
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  if (!user) {
    return (
      <section className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-premium dark:border-white/10 dark:bg-white/[0.08]">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-ocean/10 text-ocean">
            <Lock className="size-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-ink dark:text-white">Product details locked</h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-500 dark:text-slate-300">
            Log in to unlock product photos, price, seller details and Buy Now.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-ocean px-6 py-3 text-sm font-black text-white shadow-glow"
          >
            <LogIn className="size-4" />
            Login to unlock
          </Link>
        </div>
      </section>
    );
  }

  function showNextImage() {
    if (!hasMultipleImages) return;
    setActiveImageIndex((current) => (current + 1) % images.length);
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
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                unoptimized={activeImage.startsWith("data:")}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
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
              <Image
                src={product.sellerAvatar}
                alt=""
                width={52}
                height={52}
                unoptimized={product.sellerAvatar.startsWith("data:")}
                className="size-13 rounded-full object-cover"
              />
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
              type="button"
              onClick={handleBuyNow}
              disabled={buying}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-4 text-sm font-black text-ink shadow-glow transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {buying ? <Loader2 className="size-5 animate-spin" /> : <Phone className="size-5" />}
              {buying ? "Creating order..." : "Buy Now"}
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
        <h3 className="text-lg font-black text-amber-900 dark:text-amber-100">How ordering works</h3>
        <p className="mt-3 text-sm leading-7 text-amber-800 dark:text-amber-200">
          Tap Buy Now to create your order instantly. CollegeCart will confirm availability and share the next steps for meet and pay or campus delivery.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black text-ink dark:text-white">Related products</h2>
        <ProductGrid limit={4} />
      </section>
    </div>
  );
}
