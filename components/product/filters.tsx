"use client";

import { SlidersHorizontal } from "lucide-react";
import { categories } from "@/lib/data";
import type { ProductCondition } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useMarketplaceStore } from "@/stores/marketplace-store";

const conditions: Array<ProductCondition | "All"> = ["All", "New", "Like New", "Good", "Fair", "Used"];

export function ProductFilters() {
  const { category, condition, maxPrice, setCategory, setCondition, setMaxPrice } = useMarketplaceStore();

  return (
    <aside className="glass h-fit rounded-[1.75rem] p-5">
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal className="size-5 text-ocean" />
        <h2 className="text-lg font-black text-ink dark:text-white">Filters</h2>
      </div>

      <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Category</label>
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value as never)}
        className="mt-2 w-full rounded-2xl border-slate-200 bg-white text-sm font-semibold dark:border-white/10 dark:bg-white/10 dark:text-white"
      >
        <option value="All">All categories</option>
        {categories.map((item) => (
          <option key={item.name}>{item.name}</option>
        ))}
      </select>

      <label className="mt-5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Condition</label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {conditions.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setCondition(item)}
            className={`rounded-2xl px-3 py-2 text-xs font-black transition ${
              condition === item
                ? "bg-ocean text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">
        Max price: {formatPrice(maxPrice)}
      </label>
      <input
        type="range"
        min={500}
        max={60000}
        step={500}
        value={maxPrice}
        onChange={(event) => setMaxPrice(Number(event.target.value))}
        className="mt-3 w-full accent-ocean"
      />
      <button className="mt-5 w-full rounded-2xl bg-ink py-3 text-sm font-black text-white dark:bg-white dark:text-ink">
        Recently added
      </button>
    </aside>
  );
}
