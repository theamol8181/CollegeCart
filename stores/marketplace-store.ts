"use client";

import { create } from "zustand";
import type { Product, ProductCategory, ProductCondition } from "@/lib/types";

const PRODUCTS_STORAGE_KEY = "collegecart-products";
const REVIEW_STATUSES = new Set(["pending", "approved", "rejected", "sold"]);
const MAX_STORAGE_ITEMS = 50;

function keepRealListings(products: Product[]) {
  // Keep all products - don't filter by status here, let listeners and UI handle filtering
  return products
    .filter((product) => product.id && !product.id.startsWith("temp-"))
    .map((product) => ({
      ...product,
      status: product.status === "rejected" || product.status === "sold" ? product.status : "approved" as const
    }));
}

function safeSetItem(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch (error) {
    if (error instanceof Error && error.message.includes("quota")) {
      // Clear old products to make space
      console.warn("Storage quota exceeded, clearing old products...");
      try {
        const stored = window.localStorage.getItem(key);
        if (stored) {
          const products = JSON.parse(stored) as Product[];
          const approved = products.filter((p) => p.status === "approved").slice(0, MAX_STORAGE_ITEMS);
          window.localStorage.setItem(key, JSON.stringify(approved));
        }
      } catch {
        window.localStorage.removeItem(key);
      }
    } else {
      console.error("Storage error:", error);
    }
  }
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
  markProductSold: (productId: string) => void;
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
      // Only keep local-* products that aren't in Firebase
      const localListings = state.products.filter(
        (product) => product.id.startsWith("local-") && !remoteIds.has(product.id)
      );
      
      // Merge: Firebase products (source of truth) + local products
      const mergedListings = [...realListings, ...localListings];
      
      // Save to localStorage - Firebase data takes priority
      safeSetItem(PRODUCTS_STORAGE_KEY, JSON.stringify(mergedListings));
      
      console.log(`📦 setProducts: ${realListings.length} from Firebase + ${localListings.length} local = ${mergedListings.length} total`);
      
      return { products: mergedListings };
    }),
  hydrateProducts: () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!stored) return;
    try {
      const realListings = keepRealListings(JSON.parse(stored) as Product[]);
      safeSetItem(PRODUCTS_STORAGE_KEY, JSON.stringify(realListings));
      set({ products: realListings });
    } catch {
      window.localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    }
  },
  addProduct: (product) =>
    set((state) => {
      const updated = keepRealListings([{ ...product, status: product.status ?? "approved" }, ...state.products]);
      safeSetItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return { products: updated };
    }),
  approveProduct: (productId) =>
    set((state) => {
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "approved" as const } : product
      );
      safeSetItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return { products: updated };
    }),
  rejectProduct: (productId) =>
    set((state) => {
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "rejected" as const } : product
      );
      safeSetItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return { products: updated };
    }),
  markProductSold: (productId) =>
    set((state) => {
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "sold" as const } : product
      );
      safeSetItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return { products: updated };
    }),
  deleteProductLocal: (productId) =>
    set((state) => {
      const updated = state.products.filter((product) => product.id !== productId);
      safeSetItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return { products: updated };
    }),
  removeProduct: (productId) =>
    set((state) => {
      const updated = state.products.filter((product) => product.id !== productId);
      safeSetItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
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
