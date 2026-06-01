"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order } from "@/lib/types";

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params.id as string;

  useEffect(() => {
    if (!orderId) return;

    const firestore = db;
    if (!firestore) {
      setLoading(false);
      return;
    }

    // Real-time listener for order updates
    const unsubscribe = onSnapshot(
      doc(firestore, "orders", orderId),
      (doc) => {
        if (doc.exists()) {
          setOrder({ id: doc.id, ...doc.data() } as Order);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching order:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

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
            onClick={() => router.push("/orders")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = [
    { status: "available", label: "Order Placed", completed: true },
    {
      status: "accepted",
      label: "Accepted",
      completed: ["accepted", "picked_up", "on_way", "delivered", "completed"].includes(
        order.status
      ),
    },
    {
      status: "picked_up",
      label: "Picked Up",
      completed: ["picked_up", "on_way", "delivered", "completed"].includes(order.status),
    },
    {
      status: "on_way",
      label: "On The Way",
      completed: ["on_way", "delivered", "completed"].includes(order.status),
    },
    {
      status: "delivered",
      label: "Delivered",
      completed: ["delivered", "completed"].includes(order.status),
    },
    {
      status: "completed",
      label: "Completed",
      completed: order.status === "completed",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Track Order</h1>
              <p className="text-sm text-gray-600 mt-1">Order ID: {order.id}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold capitalize">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          {/* Product Info */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex gap-4">
              {order.productImage && (
                <img
                  src={order.productImage}
                  alt={order.productName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-gray-800">
                  {order.productName}
                </h3>
                <p className="text-sm text-gray-600">
                  Seller: {order.sellerName}
                </p>
                <p className="text-sm font-semibold text-gray-800 mt-2">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-8">Order Status</h2>

          <div className="space-y-6">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="flex items-start gap-6">
                {/* Circle and Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                      step.completed
                        ? "bg-green-500 scale-110"
                        : order.status === step.status
                        ? "bg-blue-500 animate-pulse"
                        : "bg-gray-300"
                    }`}
                  >
                    {step.completed ? "✓" : index + 1}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-1 h-16 mt-2 ${
                        step.completed ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                  )}
                </div>

                {/* Step Info */}
                <div className="pt-1">
                  <h3
                    className={`font-semibold text-lg ${
                      step.completed ? "text-green-600" : "text-gray-800"
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.completed
                      ? "Completed"
                      : order.status === step.status
                      ? "In Progress"
                      : "Pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Partner Info */}
        {order.deliveryPartnerId && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Delivery Partner
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-lg font-semibold text-gray-800">
                  {order.deliveryPartnerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">College</p>
                <p className="text-lg font-semibold text-gray-800">
                  {order.collegeName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Order Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product Price</span>
              <span className="font-semibold">₹{order.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Charge</span>
              <span className="font-semibold">
                ₹{order.deliveryCharge.toFixed(2)}
              </span>
            </div>
            {order.codHandlingCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">COD Handling Charge</span>
                <span className="font-semibold">
                  ₹{order.codHandlingCharge.toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-bold text-base">
              <span>Total Amount</span>
              <span className="text-blue-600">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Locations */}
        {order.deliveryMethod === "delivery" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Delivery Locations
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                <p className="text-gray-800 font-semibold">
                  {order.pickupLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Drop Location</p>
                <p className="text-gray-800 font-semibold">
                  {order.dropLocation}
                </p>
              </div>
            </div>
          </div>
        )}

        {order.deliveryMethod === "meet" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-2">
              Meet & Exchange
            </h2>
            <p className="text-amber-800">
              Please meet the seller at: <strong>{order.pickupLocation}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
