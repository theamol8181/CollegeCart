import type { Metadata } from "next";
import { ProductPageClient } from "@/components/product/product-page-client";
import { products } from "@/lib/data";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  return {
    title: product ? product.name : "Product"
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  return <ProductPageClient id={id} fallbackProduct={product} />;
}
