"use client";

import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { productMatchesUserCollege } from "@/lib/college-filter";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export default function WishlistPage() {
  const user = useAuthStore((state) => state.user);
  const { products, savedIds } = useMarketplaceStore();
  const savedProducts = products.filter(
    (product) => product.status === "approved" && savedIds.includes(product.id) && productMatchesUserCollege(product, user)
  );

  if (!savedProducts.length) {
    return (
      <EmptyState
        icon="Heart"
        title="Your wishlist is waiting"
        body="Save products you like and compare them before meeting the seller."
      />
    );
  }

  return (
    <section>
      <h1 className="mb-5 text-3xl font-black text-ink dark:text-white">Saved products</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {savedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
