import type { Metadata } from "next";
import { ProductFilters } from "@/components/product/filters";
import { ProductGrid } from "@/components/product/product-grid";

export const metadata: Metadata = {
  title: "Search"
};

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Search and filters</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white">Find exactly what you need</h1>
      </section>
      <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <ProductFilters />
        <div className="min-w-0">
          <ProductGrid />
        </div>
      </section>
    </div>
  );
}
