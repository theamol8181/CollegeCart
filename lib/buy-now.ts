"use client";

import { COLLEGECART_WHATSAPP_NUMBER } from "@/lib/contact";
import { createOrder } from "@/lib/orders";
import type { Product, UserProfile } from "@/lib/types";

export async function createBuyNowOrder(product: Product, buyer?: UserProfile | null) {
  if (!buyer) {
    throw new Error("Please log in before buying.");
  }

  return createOrder({
    productId: product.id,
    productName: product.name,
    productImage: product.images[0] || "",
    productPrice: product.price,
    buyerId: buyer.uid,
    buyerName: buyer.fullName || "CollegeCart Buyer",
    buyerPhone: buyer.phoneNumber || "",
    buyerEmail: buyer.email,
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    sellerPhone: product.contactNumber || "",
    sellerWhatsApp: COLLEGECART_WHATSAPP_NUMBER,
    status: "processing",
    buyerNotes: "",
  });
}

export function openBuyNowChat(product: Product, orderId: string) {
  const message = `Hello CollegeCart,

I want to buy this product.

Order ID: ${orderId}
Product Name: ${product.name}
Price: Rs ${product.price}

Please confirm availability and next steps.

Thank you.`;

  window.open(`https://wa.me/${COLLEGECART_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}
