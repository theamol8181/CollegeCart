"use client";

import { create } from "zustand";
import type { Product, ProductCategory, ProductCondition } from "@/lib/types";

export const PRODUCTS_STORAGE_KEY = "collegecart-products";
export const DELETED_PRODUCTS_STORAGE_KEY = "collegecart-deleted-products";
export const PRODUCT_STATUS_OVERRIDES_STORAGE_KEY = "collegecart-product-status-overrides";
export const SAVED_PRODUCTS_STORAGE_KEY = "collegecart-saved-products";
const MAX_STORAGE_ITEMS = 50;
const MAX_DELETED_ITEMS = 200;
type ProductStatus = NonNullable<Product["status"]>;

function normalizeStatus(status: Product["status"]): ProductStatus {
  return status === "rejected" || status === "sold" ? status : "approved";
}

function getDeletedProductIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const stored = window.localStorage.getItem(DELETED_PRODUCTS_STORAGE_KEY);
    if (!stored) return new Set<string>();
    const ids = JSON.parse(stored);
    if (!Array.isArray(ids)) return new Set<string>();
    return new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0));
  } catch {
    window.localStorage.removeItem(DELETED_PRODUCTS_STORAGE_KEY);
    return new Set<string>();
  }
}

function rememberDeletedProduct(productId: string) {
  if (typeof window === "undefined") return;
  const ids = Array.from(getDeletedProductIds());
  const next = [...ids.filter((id) => id !== productId), productId].slice(-MAX_DELETED_ITEMS);
  safeSetItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(next));
}

function getStatusOverrides() {
  if (typeof window === "undefined") return {} as Record<string, ProductStatus>;

  try {
    const stored = window.localStorage.getItem(PRODUCT_STATUS_OVERRIDES_STORAGE_KEY);
    if (!stored) return {} as Record<string, ProductStatus>;
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, ProductStatus] =>
        typeof entry[0] === "string" &&
        (entry[1] === "approved" || entry[1] === "rejected" || entry[1] === "sold")
      )
    );
  } catch {
    window.localStorage.removeItem(PRODUCT_STATUS_OVERRIDES_STORAGE_KEY);
    return {} as Record<string, ProductStatus>;
  }
}

function saveStatusOverrides(overrides: Record<string, ProductStatus>) {
  safeSetItem(PRODUCT_STATUS_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
}

function rememberStatusOverride(productId: string, status: ProductStatus) {
  const overrides = getStatusOverrides();
  saveStatusOverrides({ ...overrides, [productId]: status });
}

function clearStatusOverride(productId: string) {
  const overrides = getStatusOverrides();
  if (!(productId in overrides)) return;
  delete overrides[productId];
  saveStatusOverrides(overrides);
}

function getSavedProductIds() {
  if (typeof window === "undefined") return [] as string[];

  try {
    const stored = window.localStorage.getItem(SAVED_PRODUCTS_STORAGE_KEY);
    if (!stored) return [] as string[];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [] as string[];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    window.localStorage.removeItem(SAVED_PRODUCTS_STORAGE_KEY);
    return [] as string[];
  }
}

function saveSavedProductIds(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds));
  safeSetItem(SAVED_PRODUCTS_STORAGE_KEY, JSON.stringify(uniqueIds));
}

function keepRealListings(
  products: Product[],
  deletedIds = getDeletedProductIds(),
  statusOverrides = getStatusOverrides()
) {
  // Keep all products - don't filter by status here, let listeners and UI handle filtering
  return products
    .filter((product) => product.id && !product.id.startsWith("temp-") && !deletedIds.has(product.id))
    .map((product) => ({
      ...product,
      status: statusOverrides[product.id] ?? normalizeStatus(product.status)
    }));
}

function safeSetItem(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch (error) {
    if (error instanceof Error && error.message.includes("quota")) {
      if (key !== PRODUCTS_STORAGE_KEY) {
        window.localStorage.removeItem(key);
        return;
      }

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
  resetProducts: () => void;
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
  setSavedIds: (productIds: string[]) => void;
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
      const deletedIds = getDeletedProductIds();
      const statusOverrides = getStatusOverrides();
      const realListings = keepRealListings(products, deletedIds, statusOverrides);
      const remoteIds = new Set(realListings.map((product) => product.id));
      const localListings = state.products.filter(
        (product) => product.id.startsWith("local-") && !remoteIds.has(product.id) && !deletedIds.has(product.id)
      );
      const mergedListings = [...realListings, ...localListings];
      return { products: mergedListings };
    }),
  resetProducts: () => set({ products: [] }),
  hydrateProducts: () => {
    if (typeof window === "undefined") return;
    const savedIds = getSavedProductIds();
    window.localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    set({ savedIds });
  },
  addProduct: (product) =>
    set((state) => {
      const deletedIds = getDeletedProductIds();
      deletedIds.delete(product.id);
      safeSetItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(Array.from(deletedIds)));
      clearStatusOverride(product.id);
      const updated = keepRealListings([{ ...product, status: product.status ?? "approved" }, ...state.products]);
      return { products: updated };
    }),
  approveProduct: (productId) =>
    set((state) => {
      clearStatusOverride(productId);
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "approved" as const } : product
      );
      return { products: updated };
    }),
  rejectProduct: (productId) =>
    set((state) => {
      rememberStatusOverride(productId, "rejected");
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "rejected" as const } : product
      );
      return { products: updated };
    }),
  markProductSold: (productId) =>
    set((state) => {
      rememberStatusOverride(productId, "sold");
      const updated = state.products.map((product) =>
        product.id === productId ? { ...product, status: "sold" as const } : product
      );
      return { products: updated };
    }),
  deleteProductLocal: (productId) =>
    set((state) => {
      rememberDeletedProduct(productId);
      const updated = state.products.filter((product) => product.id !== productId);
      return { products: updated };
    }),
  removeProduct: (productId) =>
    set((state) => {
      rememberDeletedProduct(productId);
      const updated = state.products.filter((product) => product.id !== productId);
      return { products: updated };
    }),
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  setCondition: (condition) => set({ condition }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  toggleSaved: (productId) =>
    set((state) => {
      const savedIds = state.savedIds.includes(productId)
        ? state.savedIds.filter((id) => id !== productId)
        : [...state.savedIds, productId];
      saveSavedProductIds(savedIds);
      return { savedIds };
    }),
  setSavedIds: (productIds) => {
    saveSavedProductIds(productIds);
    set({ savedIds: Array.from(new Set(productIds)) });
  }
}));
