"use client";

import { create } from "zustand";
import { products } from "@/lib/data";
import type { Product, ProductCategory, ProductCondition } from "@/lib/types";

type MarketplaceState = {
  products: Product[];
  query: string;
  category: ProductCategory | "All";
  condition: ProductCondition | "All";
  maxPrice: number;
  savedIds: string[];
  setProducts: (products: Product[]) => void;
  hydrateProducts: () => void;
  addProduct: (product: Product) => void;
  approveProduct: (productId: string) => void;
  rejectProduct: (productId: string) => void;
  deleteProductLocal: (productId: string) => void;
  setQuery: (query: string) => void;
  setCategory: (category: ProductCategory | "All") => void;
  setCondition: (condition: ProductCondition | "All") => void;
  setMaxPrice: (maxPrice: number) => void;
  toggleSaved: (productId: string) => void;
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  products,
  query: "",
  category: "All",
  condition: "All",
  maxPrice: 60000,
  savedIds: [],
  setProducts: (products) => {
    if (typeof window !== "undefined") window.localStorage.setItem("collegecart-products", JSON.stringify(products));
    set({ products });
  },
  hydrateProducts: () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("collegecart-products");
    if (stored) set({ products: JSON.parse(stored) as Product[] });
  },
  addProduct: (product) =>
    set((state) => {
      const updated = [product, ...state.products];
      if (typeof window !== "undefined") window.localStorage.setItem("collegecart-products", JSON.stringify(updated));
      return { products: updated };
    }),
  approveProduct: (productId) =>
    set((state) => {
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "approved" as const } : product
      );
      if (typeof window !== "undefined") window.localStorage.setItem("collegecart-products", JSON.stringify(updated));
      return { products: updated };
    }),
  rejectProduct: (productId) =>
    set((state) => {
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "rejected" as const } : product
      );
      if (typeof window !== "undefined") window.localStorage.setItem("collegecart-products", JSON.stringify(updated));
      return { products: updated };
    }),
  deleteProductLocal: (productId) =>
    set((state) => {
      const updated = state.products.filter((product) => product.id !== productId);
      if (typeof window !== "undefined") window.localStorage.setItem("collegecart-products", JSON.stringify(updated));
      return { products: updated };
    }),
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  setCondition: (condition) => set({ condition }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  toggleSaved: (productId) =>
    set((state) => ({
      savedIds: state.savedIds.includes(productId)
        ? state.savedIds.filter((id) => id !== productId)
        : [...state.savedIds, productId]
    }))
}));
