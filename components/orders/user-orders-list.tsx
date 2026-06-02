"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Truck, MessageCircle } from "lucide-react";
import { listenToBuyerOrders } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/orders";
import { useAuthStore } from "@/stores/auth-store";
import { formatPrice } from "@/lib/utils";

const statusConfig: Record<OrderStatus, { icon: any; color: string; text: string }> = {
  processing: { icon: Clock, color: "text-amber-600", text: "Processing" },
  on_way: { icon: Truck, color: "text-blue-600", text: "On the way" },
  delivered: { icon: CheckCircle2, color: "text-green-600", text: "Delivered" },
};

export function UserOrdersList() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log("📦 Setting up buyer orders listener for:", user.uid);
    const unsubscribe = listenToBuyerOrders(user.uid, (newOrders) => {
      setOrders(newOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-slate-500">Loading orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
        <MessageCircle className="mx-auto mb-3 size-8 text-slate-400" />
        <p className="font-bold text-slate-600 dark:text-slate-300">No orders yet</p>
        <p className="mt-1 text-sm text-slate-500">Start shopping and create your first order!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const config = statusConfig[order.status];
        const Icon = config.icon;

        return (
          <div
            key={order.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                {order.productImage ? (
                  <Image
                    src={order.productImage}
                    alt=""
                    width={64}
                    height={64}
                    unoptimized={order.productImage.startsWith("data:")}
                    className="size-16 rounded-xl object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900 dark:text-white">{order.productName}</h3>
                  <p className="text-sm text-slate-500">Order ID: {order.id.slice(0, 8)}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${config.color}`}>
                <Icon className="size-4" />
                {config.text}
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-slate-500">Price</p>
                <p className="font-bold text-slate-900 dark:text-white">{formatPrice(order.productPrice)}</p>
              </div>
              <div>
                <p className="text-slate-500">Seller</p>
                <p className="font-bold text-slate-900 dark:text-white">{order.sellerName}</p>
              </div>
              <div>
                <p className="text-slate-500">Current update</p>
                <p className={`font-bold ${config.color}`}>{config.text}</p>
              </div>
              <div>
                <p className="text-slate-500">Order Date</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {order.adminNotes && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-500/10">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Admin Notes</p>
                <p className="text-blue-700 dark:text-blue-300">{order.adminNotes}</p>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
