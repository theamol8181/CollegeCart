"use client";

import { create } from "zustand";
import type { Product, ProductCategory, ProductCondition } from "@/lib/types";

const PRODUCTS_STORAGE_KEY = "collegecart-products";
const REVIEW_STATUSES = new Set(["pending", "approved", "rejected", "sold"]);

function keepRealListings(products: Product[]) {
  return products.filter((product) => product.status && REVIEW_STATUSES.has(product.status));
}

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
  removeProduct: (productId: string) => void;
  setQuery: (query: string) => void;
  setCategory: (category: ProductCategory | "All") => void;
  setCondition: (condition: ProductCondition | "All") => void;
  setMaxPrice: (maxPrice: number) => void;
  toggleSaved: (productId: string) => void;
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  products: [],
  query: "",
  category: "All",
  condition: "All",
  maxPrice: 60000,
  savedIds: [],
  setProducts: (products) =>
    set((state) => {
      const realListings = keepRealListings(products);
      const remoteIds = new Set(realListings.map((product) => product.id));
      const localListings = state.products.filter(
        (product) => product.id.startsWith("local-") && !remoteIds.has(product.id)
      );
      const mergedListings = [...localListings, ...realListings];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(mergedListings));
      }
      return { products: mergedListings };
    }),
  hydrateProducts: () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!stored) return;
    try {
      const realListings = keepRealListings(JSON.parse(stored) as Product[]);
      window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(realListings));
      set({ products: realListings });
    } catch {
      window.localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    }
  },
  addProduct: (product) =>
    set((state) => {
      const updated = keepRealListings([{ ...product, status: product.status ?? "pending" }, ...state.products]);
      if (typeof window !== "undefined") window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return { products: updated };
    }),
  approveProduct: (productId) =>
    set((state) => {
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "approved" as const } : product
      );
      if (typeof window !== "undefined") window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return { products: updated };
    }),
  rejectProduct: (productId) =>
    set((state) => {
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "rejected" as const } : product
      );
      if (typeof window !== "undefined") window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return { products: updated };
    }),
  deleteProductLocal: (productId) =>
    set((state) => {
      const updated = state.products.filter((product) => product.id !== productId);
      if (typeof window !== "undefined") window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return { products: updated };
    }),
  removeProduct: (productId) =>
    set((state) => {
      const updated = state.products.filter((product) => product.id !== productId);
      if (typeof window !== "undefined") window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
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
