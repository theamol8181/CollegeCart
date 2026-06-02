import type { Product, UserProfile } from "@/lib/types";

function normalizeCollegeName(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

export function productMatchesUserCollege(product: Product, user?: UserProfile | null) {
  if (!user?.collegeName || user.role === "admin") return true;
  return normalizeCollegeName(product.collegeName) === normalizeCollegeName(user.collegeName);
}

export function filterProductsForUserCollege(products: Product[], user?: UserProfile | null) {
  return products.filter((product) => productMatchesUserCollege(product, user));
}
