"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock3, Package, Truck, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { listenToAllOrders, updateOrderStatus } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/orders";

const statusConfig: Record<OrderStatus, {
  icon: any;
  label: string;
  color: string;
  dotColor: string;
}> = {
  pending: {
    icon: Clock3,
    label: "Pending",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  accepted: {
    icon: CheckCircle2,
    label: "Accepted",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dotColor: "bg-red-500",
  },
  delivered: {
    icon: Truck,
    label: "Delivered",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
    dotColor: "bg-slate-500",
  },
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.log("📦 Setting up all orders listener for admin");
    const unsubscribe = listenToAllOrders((newOrders) => {
      setOrders(newOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  const stats = [
    {
      label: "Total Orders",
      value: String(orders.length),
      color: "bg-ocean/10 text-ocean",
    },
    {
      label: "Pending",
      value: String(orders.filter((o) => o.status === "pending").length),
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      label: "Accepted",
      value: String(orders.filter((o) => o.status === "accepted").length),
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Delivered",
      value: String(orders.filter((o) => o.status === "delivered").length),
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-slate-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`glass rounded-[1.5rem] p-5 ${stat.color}`}
          >
            <p className="text-3xl font-black">{stat.value}</p>
            <p className="text-sm font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-5 shadow-premium ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search by order ID, buyer, seller, or product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold placeholder-slate-500 dark:border-white/10 dark:bg-white/5 dark:placeholder-slate-400"
        />
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "accepted", "rejected", "delivered", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  filterStatus === status
                    ? "bg-ocean text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-premium ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <h3 className="text-lg font-black text-ink dark:text-white">
            Orders ({filteredOrders.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const Icon = config.icon;

              return (
                <div
                  key={order.id}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_auto_auto] md:items-center"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-black text-ink dark:text-white">
                          {order.productName}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          By: {order.sellerName} → {order.buyerName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Order ID: {order.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-black text-ink dark:text-white">
                        {formatPrice(order.productPrice)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-black ${config.color}`}>
                      <div className={`size-2 rounded-full ${config.dotColor}`} />
                      {config.label}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      disabled={updating[order.id]}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "accepted")}
                        disabled={updating[order.id]}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-ocean px-3 py-2 text-sm font-black text-white transition hover:bg-ocean/90 disabled:opacity-50"
                      >
                        {updating[order.id] ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-4" />
                        )}
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center gap-3 p-8 text-slate-500 dark:text-slate-400">
              <AlertCircle className="size-5" />
              <p className="font-semibold">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
