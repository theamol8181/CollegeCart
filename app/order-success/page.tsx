"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order } from "@/lib/types";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() } as Order);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Banner */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Order Successfully Placed!
            </h1>
            <p className="text-gray-600">
              Thank you for your order. We'll notify you about delivery updates.
            </p>
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="text-lg font-semibold text-gray-800 break-all">
                  {order.id}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Product Name</p>
                <p className="text-lg font-semibold text-gray-800">
                  {order.productName}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="text-lg font-semibold text-gray-800">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Delivery Method</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {order.deliveryMethod === "meet" ? "Meet & Exchange" : "Campus Delivery"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Order Status</p>
                <p className="text-lg font-semibold text-blue-600 capitalize">
                  {order.status}
                </p>
              </div>
            </div>

            {/* Delivery Details */}
            {order.deliveryMethod === "delivery" && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Delivery Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-blue-700">Pickup Location</p>
                    <p className="text-gray-700">{order.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Drop Location</p>
                    <p className="text-gray-700">{order.dropLocation}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Delivery Charge</p>
                    <p className="text-gray-700">₹{order.deliveryCharge.toFixed(2)}</p>
                  </div>
                  {order.codHandlingCharge > 0 && (
                    <div>
                      <p className="text-blue-700">COD Handling Charge</p>
                      <p className="text-gray-700">₹{order.codHandlingCharge.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meet & Exchange Details */}
            {order.deliveryMethod === "meet" && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Meet & Exchange Details
                </h3>
                <p className="text-sm text-gray-700">
                  Please meet the seller at: <strong>{order.pickupLocation}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push(`/track-order/${order.id}`)}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Track Order
          </button>

          <button
            onClick={() => router.push("/orders")}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            View All Orders
          </button>

          <button
            onClick={() => router.push("/")}
            className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
