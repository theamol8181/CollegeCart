"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Package, Truck, XCircle, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  seller: {
    name: string;
    id: string;
  };
  product: {
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress?: string;
  trackingNumber?: string;
}

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    buyer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 98765 43210",
    },
    seller: {
      name: "Alice Smith",
      id: "seller-1",
    },
    product: {
      name: "Used Laptop",
      price: 25000,
      image: "/api/placeholder/100/100",
    },
    quantity: 1,
    status: "confirmed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    deliveryAddress: "Bangalore, Karnataka",
    trackingNumber: "TRK-123456",
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    buyer: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+91 87654 32109",
    },
    seller: {
      name: "Bob Johnson",
      id: "seller-2",
    },
    product: {
      name: "Study Notes",
      price: 500,
      image: "/api/placeholder/100/100",
    },
    quantity: 1,
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    buyer: {
      name: "Mike Wilson",
      email: "mike@example.com",
      phone: "+91 76543 21098",
    },
    seller: {
      name: "Carol White",
      id: "seller-3",
    },
    product: {
      name: "Books Bundle",
      price: 1500,
      image: "/api/placeholder/100/100",
    },
    quantity: 2,
    status: "shipped",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    deliveryAddress: "Mumbai, Maharashtra",
    trackingNumber: "TRK-654321",
  },
];

const statusConfig = {
  pending: {
    icon: Clock3,
    label: "Pending",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  confirmed: {
    icon: CheckCircle2,
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    dotColor: "bg-purple-500",
  },
  delivered: {
    icon: Package,
    label: "Delivered",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      )
    );
  };

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
      label: "Shipped",
      value: String(orders.filter((o) => o.status === "shipped").length),
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      label: "Delivered",
      value: String(orders.filter((o) => o.status === "delivered").length),
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
  ];

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
          placeholder="Search by order number, buyer, or seller..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold placeholder-slate-500 dark:border-white/10 dark:bg-white/5 dark:placeholder-slate-400"
        />
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map(
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
                          {order.orderNumber}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {order.product.name} × {order.quantity}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                          By: {order.seller.name} → {order.buyer.name}
                        </p>
                        {order.trackingNumber && (
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            📦 Tracking: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-black text-ink dark:text-white">
                        {formatPrice(order.product.price * order.quantity)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {order.createdAt.toLocaleDateString()}
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
                        updateOrderStatus(order.id, e.target.value as Order["status"])
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {order.status === "pending" && (
                      <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-ocean px-3 py-2 text-sm font-black text-white transition hover:bg-ocean/90">
                        <CheckCircle2 className="size-4" />
                        Confirm
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
