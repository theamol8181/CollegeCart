"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { COLLEGECART_WHATSAPP_NUMBER } from "@/lib/contact";
import { createOrder } from "@/lib/orders";
import type { Product, UserProfile } from "@/lib/types";

interface BuyButtonProps {
  product: Product;
  currentUser: UserProfile | null;
  seller: UserProfile | null;
}

export function BuyButton({ product, currentUser, seller }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBuy() {
    if (!currentUser) {
      setError("Please log in first");
      return;
    }

    if (!seller) {
      setError("Seller information not found");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderId = await createOrder({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || "",
        productPrice: product.price,
        buyerId: currentUser.uid,
        buyerName: currentUser.fullName,
        buyerPhone: currentUser.phoneNumber || "",
        buyerEmail: currentUser.email,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        sellerPhone: product.contactNumber || "",
        sellerWhatsApp: COLLEGECART_WHATSAPP_NUMBER,
        status: "processing",
        buyerNotes: "",
      });

      const message = `Hi CollegeCart, I want to buy "${product.name}" for Rs ${product.price}. Product ID: ${product.id}. Order ID: ${orderId}.`;
      const whatsappLink = `https://wa.me/${COLLEGECART_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(whatsappLink, "_blank");

      window.setTimeout(() => {
        window.location.href = "/orders";
      }, 1000);
    } catch (err) {
      console.error("Error creating order:", err);
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-3 text-sm font-black text-white shadow-lg transition hover:bg-green-600 disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-5 animate-spin" /> : <ShoppingBag className="size-5" />}
        {loading ? "Creating order..." : "Buy Now"}
      </button>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
