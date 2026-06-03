"use client";

import Link from "next/link";
import { Lock, LogIn } from "lucide-react";
import { ProductDetail } from "@/components/product/product-detail";
import { EmptyState } from "@/components/shared/empty-state";
import { productMatchesUserCollege } from "@/lib/college-filter";
import type { Product } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export function ProductPageClient({ id, fallbackProduct }: { id: string; fallbackProduct?: Product }) {
  const user = useAuthStore((state) => state.user);
  const product =
    useMarketplaceStore((state) =>
      state.products.find((item) => item.id === id && item.status === "approved" && productMatchesUserCollege(item, user))
    ) ??
    (fallbackProduct?.status === "approved" && productMatchesUserCollege(fallbackProduct, user) ? fallbackProduct : undefined);

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

  if (!product) {
    return (
      <EmptyState
        icon="SearchX"
        title="Listing nahi mili"
        body="Ye product remove ho chuka hai ya out of stock hai."
        action={<Link href="/" className="rounded-full bg-ocean px-5 py-3 text-sm font-black text-white">Back to marketplace</Link>}
      />
    );
  }

  return <ProductDetail product={product} />;
}
