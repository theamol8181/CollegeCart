"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Clock3, CheckCircle2, DollarSign, Star, MapPin } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import type { Order } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function DeliveryDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"available" | "active" | "completed">("available");
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [rating, setRating] = useState(4.8);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    // Check if user is an approved delivery partner
    // This would be checked from their delivery partner application status

    if (!db) {
      setLoading(false);
      return;
    }

    // Load orders for this delivery partner's college
    const q = query(collection(db, "orders"), where("collegeName", "==", user.collegeName));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => doc.data() as Order);
      setOrders(ordersData);
      
      // Calculate stats
      const completed = ordersData.filter((o) => o.status === "completed");
      setCompletedCount(completed.length);
      setTotalEarnings(completed.reduce((sum, o) => sum + o.deliveryCharge, 0));
      
      setLoading(false);
      console.log(`📦 Loaded ${ordersData.length} orders for ${user.collegeName}`);
    }, (error) => {
      console.error("❌ Error loading orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, router]);

  if (!user) return null;
  if (loading) {
    return <div className="rounded-[2rem] bg-white p-8 text-center dark:bg-white/[0.08]">Loading...</div>;
  }

  const availableOrders = orders.filter((o) => o.status === "available");
  const activeOrders = orders.filter((o) => ["accepted", "picked_up", "on_way"].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "completed");

  const stats = [
    { label: "Available Deliveries", value: availableOrders.length, icon: Package, color: "text-ocean" },
    { label: "Active Deliveries", value: activeOrders.length, icon: Clock3, color: "text-sun" },
    { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Total Earnings", value: `₹${totalEarnings}`, icon: DollarSign, color: "text-mint" }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Delivery Partner</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-ink dark:text-white">Your Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Delivering within {user.collegeName} • Rating: {rating} ⭐
        </p>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[1.5rem] bg-white p-5 shadow-sm dark:bg-white/[0.08]">
              <div className={`mb-3 text-${stat.color}`}>
                <Icon className="size-6" />
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
        {(["available", "active", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-black transition ${
              activeTab === tab
                ? "border-b-2 border-ocean text-ocean"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({
              tab === "available" ? availableOrders.length
              : tab === "active" ? activeOrders.length
              : completedOrders.length
            })
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {activeTab === "available" && (
          <>
            {availableOrders.length ? (
              availableOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="rounded-[2rem] bg-white p-8 text-center dark:bg-white/[0.08]">
                <Package className="mx-auto mb-4 size-12 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No available deliveries</p>
              </div>
            )}
          </>
        )}

        {activeTab === "active" && (
          <>
            {activeOrders.length ? (
              activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="rounded-[2rem] bg-white p-8 text-center dark:bg-white/[0.08]">
                <Clock3 className="mx-auto mb-4 size-12 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No active deliveries</p>
              </div>
            )}
          </>
        )}

        {activeTab === "completed" && (
          <>
            {completedOrders.length ? (
              completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} completed />
              ))
            ) : (
              <div className="rounded-[2rem] bg-white p-8 text-center dark:bg-white/[0.08]">
                <CheckCircle2 className="mx-auto mb-4 size-12 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No completed deliveries yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, completed }: { order: Order; completed?: boolean }) {
  const statusColors: Record<string, string> = {
    available: "bg-ocean/10 text-ocean",
    accepted: "bg-sun/20 text-sun",
    picked_up: "bg-blue-100 text-blue-700",
    on_way: "bg-purple-100 text-purple-700",
    delivered: "bg-emerald-100 text-emerald-700",
    completed: "bg-mint/12 text-mint"
  };

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
      <div className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto]">
        {/* Product Image */}
        <img src={order.productImage} alt={order.productName} className="size-20 rounded-xl object-cover" />

        {/* Order Info */}
        <div>
          <p className="font-black text-ink dark:text-white">{order.productName}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{order.sellerName}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <MapPin className="size-4" />
              {order.pickupLocation} → {order.dropLocation}
            </div>
            <div className="font-black text-ink dark:text-white">₹{order.deliveryCharge}</div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex flex-col items-end justify-between">
          <span className={`rounded-full px-3 py-1 text-xs font-black ${statusColors[order.status] || statusColors.available}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ")}
          </span>
          {!completed && (
            <button className="mt-3 rounded-full bg-ocean px-4 py-2 text-xs font-black text-white">
              {order.status === "available" ? "Accept" : "View Details"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
