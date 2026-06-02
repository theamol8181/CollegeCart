"use client";

import Link from "next/link";
import { UserOrdersList } from "@/components/orders/user-orders-list";
import { useAuthStore } from "@/stores/auth-store";

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
          <h1 className="text-2xl font-black text-ink dark:text-white">Please log in to view your orders</h1>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-full bg-ocean px-5 py-3 text-sm font-black text-white"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-3xl font-black text-ink dark:text-white">Purchase history</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
          Track your CollegeCart orders from processing to delivery.
        </p>
      </div>
      <UserOrdersList />
    </section>
  );
}
