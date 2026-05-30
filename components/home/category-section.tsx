"use client";

import {
  Bike,
  BookOpen,
  Calculator,
  FlaskConical,
  Gamepad2,
  Headphones,
  NotebookTabs,
  Package,
  Shirt,
  Smartphone,
  Sofa,
  Utensils
} from "lucide-react";
import { categories } from "@/lib/data";
import { useMarketplaceStore } from "@/stores/marketplace-store";

const icons = {
  Bike,
  BookOpen,
  Calculator,
  FlaskConical,
  Gamepad2,
  Headphones,
  NotebookTabs,
  Package,
  Shirt,
  Smartphone,
  Sofa,
  Utensils
};

export function CategorySection() {
  const { setCategory } = useMarketplaceStore();

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Campus aisles</p>
          <h2 className="text-2xl font-black tracking-tight text-ink dark:text-white">Shop by category</h2>
        </div>
      </div>
      <div className="premium-scrollbar flex gap-3 overflow-x-auto pb-3">
        {categories.map((category) => {
          const Icon = icons[category.icon as keyof typeof icons] ?? Package;
          return (
            <button
              type="button"
              key={category.name}
              onClick={() => setCategory(category.name)}
              className="min-w-[128px] rounded-[1.5rem] bg-white p-4 text-center shadow-[0_12px_35px_rgba(16,24,40,0.08)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-premium dark:bg-white/[0.08] dark:ring-white/10"
            >
              <span className={`mx-auto mb-3 grid size-12 place-items-center rounded-2xl ${category.accent}`}>
                <Icon className="size-6" />
              </span>
              <span className="block text-sm font-black text-ink dark:text-white">{category.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
