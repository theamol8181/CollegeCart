import type { Metadata } from "next";
import { ProductPageClient } from "@/components/product/product-page-client";

export const dynamicParams = true;

export const metadata: Metadata = {
  title: "Product"
};

export function generateStaticParams() {
  return [];
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ProductPageClient id={id} />;
}
