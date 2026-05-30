import type { Metadata } from "next";
import { ProductFilters } from "@/components/product/filters";
import { ProductGrid } from "@/components/product/product-grid";

export const metadata: Metadata = {
  title: "Search"
};

export default function SearchPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <ProductFilters />
      <section>
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Search and filters</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white">Find exactly what you need</h1>
        </div>
        <ProductGrid />
      </section>
    </div>
  );
}
