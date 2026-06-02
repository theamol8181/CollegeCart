"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { ProductDetail } from "@/components/product/product-detail";
import { EmptyState } from "@/components/shared/empty-state";
import type { Product } from "@/lib/types";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export function ProductPageClient({ id, fallbackProduct }: { id: string; fallbackProduct?: Product }) {
  const product =
    useMarketplaceStore((state) => state.products.find((item) => item.id === id && item.status === "approved")) ??
    (fallbackProduct?.status === "approved" ? fallbackProduct : undefined);

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
