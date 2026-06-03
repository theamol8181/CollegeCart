"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Lock, LogIn } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { productMatchesUserCollege } from "@/lib/college-filter";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export function ProductGrid({ limit }: { limit?: number }) {
  const { products, query, category, condition, maxPrice } = useMarketplaceStore();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ocean/10 text-ocean">
          <Lock className="size-7" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-ink dark:text-white">Products are locked</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500 dark:text-slate-300">
          Log in to unlock product cards, seller details and Buy Now.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-ocean px-5 py-3 text-sm font-black text-white"
        >
          <LogIn className="size-4" />
          Login to unlock
        </Link>
      </div>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = products
    .filter((product) => product.status === "approved")
    .filter((product) => productMatchesUserCollege(product, user))
    .filter((product) => product.price <= maxPrice)
    .filter((product) => category === "All" || product.category === category)
    .filter((product) => condition === "All" || product.condition === condition)
    .filter((product) =>
      normalizedQuery
        ? [product.name, product.category, product.sellerName, product.collegeName].join(" ").toLowerCase().includes(normalizedQuery)
        : true
    )
    .slice(0, limit);

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon="SearchX"
        title="No campus deals found"
        body="Try a different category, price range, or seller name."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence>
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatePresence>
    </div>
  );
}
