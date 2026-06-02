"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { createOrder } from "@/lib/orders";
import type { Product } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

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
      console.log("🛍️ Creating order...");

      // Create order in Firestore
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
        sellerWhatsApp: product.whatsappNumber || "",
        status: "pending",
        buyerNotes: "",
      });

      console.log("✅ Order created:", orderId);

      // Generate WhatsApp message
      const whatsappNumber = seller.phoneNumber || product.whatsappNumber || "";
      const message = `Hi ${seller.fullName}, I'm interested in buying your "${product.name}" for ₹${product.price}. Can we discuss?`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`;

      console.log("📱 Opening WhatsApp...");
      window.open(whatsappLink, "_blank");

      // Redirect to orders page after a delay
      setTimeout(() => {
        window.location.href = "/orders";
      }, 1000);
    } catch (err) {
      console.error("❌ Error creating order:", err);
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
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-3 text-sm font-black text-white shadow-lg hover:bg-green-600 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <MessageCircle className="size-5" />
        )}
        {loading ? "Creating Order..." : "Buy on WhatsApp"}
      </button>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
