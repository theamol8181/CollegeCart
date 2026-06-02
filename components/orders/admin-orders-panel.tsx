"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, X, Truck, Loader2 } from "lucide-react";
import { listenToAllOrders, updateOrderStatus } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

const statusConfig: Record<OrderStatus, { icon: any; color: string; text: string }> = {
  pending: { icon: Clock, color: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", text: "Pending" },
  accepted: { icon: CheckCircle2, color: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", text: "Accepted" },
  rejected: { icon: X, color: "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400", text: "Rejected" },
  delivered: { icon: Truck, color: "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400", text: "Delivered" },
  cancelled: { icon: X, color: "bg-slate-50 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400", text: "Cancelled" },
};

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.log("📦 Setting up all orders listener for admin");
    const unsubscribe = listenToAllOrders((newOrders) => {
      setOrders(newOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatus(orderId, newStatus);
      console.log("✅ Order status updated");
    } catch (error) {
      console.error("❌ Error updating order:", error);
      alert("Failed to update order");
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-slate-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Orders ({orders.length})</h2>

      {!orders.length ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
          <p className="font-bold text-slate-600 dark:text-slate-300">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = statusConfig[order.status];
            const Icon = config.icon;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{order.productName}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${config.color}`}>
                        <Icon className="size-3" />
                        {config.text}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Order ID: {order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(order.productPrice)}</p>
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3 lg:grid-cols-4">
                  <div>
                    <p className="text-slate-500">Buyer</p>
                    <p className="font-bold text-slate-900 dark:text-white">{order.buyerName}</p>
                    <p className="text-xs text-slate-500">{order.buyerPhone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Seller</p>
                    <p className="font-bold text-slate-900 dark:text-white">{order.sellerName}</p>
                    <p className="text-xs text-slate-500">{order.sellerPhone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="font-bold text-slate-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <p className="font-bold text-slate-900 dark:text-white">{config.text}</p>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {["pending", "accepted", "delivered"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(order.id, status as OrderStatus)}
                      disabled={updating[order.id]}
                      className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                        order.status === status
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
                      } disabled:opacity-50`}
                    >
                      {updating[order.id] && status === order.status ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : null}
                      {status === "pending" ? "Pending" : status === "accepted" ? "Accept" : "Deliver"}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Add admin notes..."
                  value={order.adminNotes || ""}
                  onChange={(e) => {
                    // Update logic would go here
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white"
                  rows={2}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
