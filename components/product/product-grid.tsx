"use client";

import { AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export function ProductGrid({ limit }: { limit?: number }) {
  const { products, query, category, condition, maxPrice } = useMarketplaceStore();
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = products
    .filter((product) => product.status === "approved")
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
