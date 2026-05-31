"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">(
    "all"
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("buyerId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });

        // Sort by creation date, newest first
        fetchedOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      case "on_way":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending")
      return !["delivered", "completed"].includes(order.status);
    if (activeTab === "completed")
      return ["delivered", "completed"].includes(order.status);
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Please log in to view your orders
          </h1>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {(["all", "pending", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 font-semibold transition-colors ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} (
              {orders.filter((o) => {
                if (tab === "all") return true;
                if (tab === "pending")
                  return !["delivered", "completed"].includes(o.status);
                if (tab === "completed")
                  return ["delivered", "completed"].includes(o.status);
                return true;
              }).length}
              )
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === "all"
                ? "Start shopping to create your first order"
                : "You have no orders in this category"}
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    {/* Product Info */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      {order.productImage && (
                        <img
                          src={order.productImage}
                          alt={order.productName}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-lg truncate">
                          {order.productName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          Seller: {order.sellerName}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-gray-500">
                            Order ID: {order.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex flex-col gap-2 text-right">
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/track-order/${order.id}`}
                      className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                    >
                      Track Order
                    </Link>
                  </div>

                  {/* Delivery Method Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      {order.deliveryMethod === "meet"
                        ? "📍 Meet & Exchange at " + order.pickupLocation
                        : "🚚 Campus Delivery from " +
                          order.pickupLocation +
                          " to " +
                          order.dropLocation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
