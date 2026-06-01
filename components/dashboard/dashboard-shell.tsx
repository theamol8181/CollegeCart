"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Heart, Package, ShieldCheck, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { demoUser } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export function DashboardShell() {
  const user = useAuthStore((state) => state.user) ?? demoUser;
  const { products, savedIds } = useMarketplaceStore();
  const approved = products.filter((product) => product.status === "approved");
  const recentListings = approved.slice(0, 4);
  const myProducts = products.filter((product) => product.sellerId === user.uid || product.sellerName === user.fullName);
  const savedItems = approved.filter((product) => savedIds.includes(product.id));
  const completion = Math.round(
    ([
      user.fullName,
      user.collegeName,
      user.email,
      user.avatarUrl,
      user.phoneNumber,
      user.usn,
      user.year,
      user.verificationStatus === "approved" ? "verified" : ""
    ].filter(Boolean).length /
      8) *
      100
  );
  const studentDetails = [
    { label: "College", value: user.collegeName || "Not added" },
    { label: "USN", value: user.usn || "Not added" },
    { label: "Year", value: user.year || "Not added" },
    { label: "Department", value: user.department || "Not added" },
    { label: "Phone", value: user.phoneNumber || "Not added" },
    { label: "Verification", value: user.verificationStatus || "needs_id" }
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border-2 border-ocean/30 bg-ocean/5 p-6">
        <h2 className="text-2xl font-black text-ink dark:text-white">📢 MVP Update</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          In our MVP, all product listings are managed manually by the CollegeCart team. To sell your product, please fill out our <a href="https://docs.google.com/forms/d/e/1FAIpQLSe5G3l8WdYPI9DLH7fWN2SLWseY2ZtFxSiL8JN_QU3voCAXIA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer" className="font-bold text-ocean hover:underline">seller form</a>. Our team will review and publish your listing.
        </p>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-ink p-6 shadow-premium sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(38,215,164,0.22),transparent_24rem),radial-gradient(circle_at_88%_10%,rgba(249,200,70,0.18),transparent_22rem)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-4 py-2 text-sm font-black text-mint">
              <BadgeCheck className="size-4" />
              Bangalore student marketplace
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Welcome, {user.fullName.split(" ")[0]}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/[0.72]">
              Your verified student dashboard shows only live listings from approved CollegeCart users.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-ink">
                <ShieldCheck className="size-4 text-emerald-600" />
                {user.collegeName}
              </span>
              <span className="rounded-full bg-mint px-4 py-2 text-sm font-black text-ink">Profile {completion}% complete</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSe5G3l8WdYPI9DLH7fWN2SLWseY2ZtFxSiL8JN_QU3voCAXIA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-3 text-sm font-black text-white shadow-glow">
                Sell product
                <ArrowRight className="size-4" />
              </a>
              <Link href="/search" className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur">
                Browse listings
              </Link>
            </div>
          </div>

          <div className="relative hidden h-72 lg:block">
            {recentListings.length ? recentListings.slice(0, 3).map((product, index) => (
              <motion.div
                key={product.id}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3 + index, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-64 rounded-2xl border border-white/[0.16] bg-white/[0.12] p-3 shadow-premium backdrop-blur"
                style={{ left: index * 42, top: index * 52, zIndex: 3 - index }}
              >
                <Image src={product.images[0]} alt="" width={80} height={80} className="size-20 rounded-xl object-cover" />
                <p className="mt-3 truncate text-sm font-black text-white">{product.name}</p>
                <p className="text-sm font-black text-mint">{formatPrice(product.price)}</p>
              </motion.div>
            )) : (
              <div className="grid h-64 place-items-center rounded-[2rem] border border-white/[0.14] bg-white/10 p-6 text-center text-sm font-bold text-white/70">
                Approved user listings will appear here.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={<UserRound className="size-5" />} label="Profile Completion" value={`${completion}%`} />
        <Metric icon={<Package className="size-5" />} label="My Products" value={String(myProducts.length)} />
        <Metric icon={<Heart className="size-5" />} label="Saved Items" value={String(savedItems.length)} />
        <Metric icon={<ShoppingBag className="size-5" />} label="Recent Listings" value={String(recentListings.length)} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="size-5 text-ocean" />
          <h2 className="text-xl font-black text-ink dark:text-white">Student Details</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studentDetails.map((detail) => (
            <div key={detail.label} className="rounded-xl bg-slate-50 p-4 dark:bg-white/10">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{detail.label}</p>
              <p className="mt-1 break-words text-sm font-black text-ink dark:text-white">{detail.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink dark:text-white">Recent Listings</h2>
          <Link href="/search" className="text-sm font-black text-ocean">View all</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recentListings.length ? recentListings.map((product) => <ProductCard key={product.id} product={product} />) : (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-300 sm:col-span-2 lg:col-span-4">
              No approved user listings available yet. Check back soon!
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DashboardList title="Saved Items" products={savedItems} empty="You haven't saved any items yet." />
        <DashboardList title="My Listings" products={myProducts} empty="Add a product from the Sell page. It will go live after admin approval." />
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/[0.08]">
      <span className="grid size-11 place-items-center rounded-xl bg-ocean/10 text-ocean">{icon}</span>
      <p className="mt-4 text-2xl font-black text-ink dark:text-white">{value}</p>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{label}</p>
    </div>
  );
}

function DashboardList({ title, products, empty }: { title: string; products: ReturnType<typeof useMarketplaceStore.getState>["products"]; empty: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-ocean" />
        <h2 className="text-xl font-black text-ink dark:text-white">{title}</h2>
      </div>
      {products.length ? (
        <div className="space-y-3">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="flex items-center gap-3">
              <Image src={product.images[0]} alt="" width={54} height={54} unoptimized={product.images[0].startsWith("data:")} className="size-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-ink dark:text-white">{product.name}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{formatPrice(product.price)} - {product.status ?? "approved"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">{empty}</p>
      )}
    </div>
  );
}
