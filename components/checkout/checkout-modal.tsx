"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

interface CheckoutModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ product, isOpen, onClose }: CheckoutModalProps) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState<"meet" | "delivery">(
    "delivery"
  );
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [dropLocation, setDropLocation] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const deliveryCharge = 50;
  const codHandlingCharge = paymentMethod === "cod" ? 10 : 0;
  const total = product.price + (deliveryMethod === "delivery" ? deliveryCharge : 0) + codHandlingCharge;

  const handleProceedToPayment = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (deliveryMethod === "delivery" && !dropLocation) {
      alert("Please enter drop location");
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          sellerId: product.sellerId,
          sellerName: product.sellerName,
          buyerId: user.uid,
          buyerName: user.fullName || "Customer",
          price: product.price,
          deliveryCharge: deliveryMethod === "delivery" ? deliveryCharge : 0,
          collegeName: product.collegeName,
          pickupLocation: product.location,
          dropLocation: deliveryMethod === "delivery" ? dropLocation : product.location,
          paymentMethod,
          deliveryMethod,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const { orderId, order } = await orderResponse.json();

      if (paymentMethod === "online") {
        // Create Razorpay order
        const razorpayResponse = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(total * 100), // Convert to paise
            currency: "INR",
            orderId,
          }),
        });

        if (!razorpayResponse.ok) {
          throw new Error("Failed to create Razorpay order");
        }

        const razorpayOrder = await razorpayResponse.json();

        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: "INR",
            name: "CollegeCart",
            description: `Payment for ${product.name}`,
            order_id: razorpayOrder.id,
            handler: async (response: any) => {
              // Verify payment
              const verifyResponse = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId,
                }),
              });

              if (verifyResponse.ok) {
                onClose();
                router.push(`/order-success?orderId=${orderId}`);
              } else {
                alert("Payment verification failed");
              }
            },
            prefill: {
              name: user.fullName || "",
              email: user.email || "",
            },
          };

          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        };
      } else {
        // COD - Direct success
        onClose();
        router.push(`/order-success?orderId=${orderId}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Checkout</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-80 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-4">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg"
                  unoptimized={product.images[0].startsWith("data:")}
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">
                  By {product.sellerName}
                </p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  ₹{product.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Delivery Method
            </h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition"
                style={{
                  borderColor: deliveryMethod === "meet" ? "#3b82f6" : undefined,
                  backgroundColor:
                    deliveryMethod === "meet" ? "#eff6ff" : undefined,
                }}>
                <input
                  type="radio"
                  value="meet"
                  checked={deliveryMethod === "meet"}
                  onChange={(e) =>
                    setDeliveryMethod(e.target.value as "meet")
                  }
                  className="w-5 h-5 cursor-pointer"
                />
                <div className="ml-4">
                  <p className="font-semibold text-gray-800">
                    Meet & Exchange
                  </p>
                  <p className="text-sm text-gray-600">
                    Collect product directly from seller
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Location: {product.location}
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition"
                style={{
                  borderColor:
                    deliveryMethod === "delivery" ? "#3b82f6" : undefined,
                  backgroundColor:
                    deliveryMethod === "delivery" ? "#eff6ff" : undefined,
                }}>
                <input
                  type="radio"
                  value="delivery"
                  checked={deliveryMethod === "delivery"}
                  onChange={(e) =>
                    setDeliveryMethod(e.target.value as "delivery")
                  }
                  className="w-5 h-5 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-800">Campus Delivery</p>
                  <p className="text-sm text-gray-600">
                    We&apos;ll deliver to your location
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Delivery Charge: ₹{deliveryCharge}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Drop Location */}
          {deliveryMethod === "delivery" && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Drop Location
              </label>
              <input
                type="text"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                placeholder="Enter your hostel/building name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Payment Method
            </h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition"
                style={{
                  borderColor:
                    paymentMethod === "online" ? "#3b82f6" : undefined,
                  backgroundColor:
                    paymentMethod === "online" ? "#eff6ff" : undefined,
                }}>
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "online")
                  }
                  className="w-5 h-5 cursor-pointer"
                />
                <div className="ml-4">
                  <p className="font-semibold text-gray-800">Online Payment</p>
                  <p className="text-sm text-gray-600">
                    Pay via Razorpay (UPI, Cards, etc.)
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition"
                style={{
                  borderColor: paymentMethod === "cod" ? "#3b82f6" : undefined,
                  backgroundColor:
                    paymentMethod === "cod" ? "#eff6ff" : undefined,
                }}>
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value as "cod")}
                  className="w-5 h-5 cursor-pointer"
                />
                <div className="ml-4">
                  <p className="font-semibold text-gray-800">
                    Cash on Delivery
                  </p>
                  <p className="text-sm text-gray-600">
                    Pay when you receive the product
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    COD Handling Charge: ₹{codHandlingCharge}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Product Price</span>
              <span className="font-semibold">₹{product.price.toFixed(2)}</span>
            </div>
            {deliveryMethod === "delivery" && (
              <div className="flex justify-between text-gray-700">
                <span>Delivery Charge</span>
                <span className="font-semibold">₹{deliveryCharge}</span>
              </div>
            )}
            {paymentMethod === "cod" && codHandlingCharge > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>COD Handling Charge</span>
                <span className="font-semibold">₹{codHandlingCharge}</span>
              </div>
            )}
            <div className="border-t border-blue-200 pt-2 flex justify-between text-lg font-bold text-blue-600">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
