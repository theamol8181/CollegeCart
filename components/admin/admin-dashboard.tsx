"use client";

import Image from "next/image";
import { Ban, CheckCircle2, Clock3, Flag, IdCard, Shield, Trash2, UsersRound, XCircle } from "lucide-react";
import { demoUser } from "@/lib/data";
import { deleteProduct, updateProductStatus } from "@/lib/firestore";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export function AdminDashboard() {
  const { products, approveProduct, rejectProduct, deleteProductLocal } = useMarketplaceStore();
  const { users, approveUser, rejectUser } = useAuthStore();
  const reviewProducts = products.filter((product) => Boolean(product.status));
  const pending = reviewProducts.filter((product) => product.status === "pending");
  const rejected = reviewProducts.filter((product) => product.status === "rejected");
  const studentUsers = users.filter((user) => user.role === "student");
  const pendingUsers = studentUsers.filter((user) => user.verificationStatus === "pending");
  const stats = [
    { label: "Total Users", value: String(studentUsers.length), icon: UsersRound, color: "bg-ocean/10 text-ocean" },
    { label: "User Listings", value: String(reviewProducts.length), icon: Shield, color: "bg-mint/12 text-emerald-600" },
    { label: "Pending Review", value: String(pending.length + pendingUsers.length), icon: Clock3, color: "bg-sun/20 text-amber-700" },
    { label: "Reported Listings", value: String(rejected.length), icon: Flag, color: "bg-coral/10 text-coral" }
  ];

  async function approveListing(productId: string) {
    approveProduct(productId);
    // Only update Firebase if the product ID is actually saved in Firebase (not a local-* ID)
    if (!productId.startsWith("local-")) {
      try {
        await updateProductStatus(productId, "approved");
      } catch (error) {
        console.error("Failed to update product status in Firebase:", error);
      }
    }
  }

  async function rejectListing(productId: string) {
    rejectProduct(productId);
    // Only update Firebase if the product ID is actually saved in Firebase (not a local-* ID)
    if (!productId.startsWith("local-")) {
      try {
        await updateProductStatus(productId, "rejected");
      } catch (error) {
        console.error("Failed to update product status in Firebase:", error);
      }
    }
  }

  async function removeListing(productId: string) {
    deleteProductLocal(productId);
    await deleteProduct(productId);
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Admin panel</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-ink dark:text-white">Marketplace moderation</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass rounded-[1.5rem] p-5">
              <span className={`grid size-12 place-items-center rounded-2xl ${stat.color}`}>
                <Icon className="size-6" />
              </span>
              <p className="mt-4 text-3xl font-black text-ink dark:text-white">{stat.value}</p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{stat.label}</p>
            </div>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-premium ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <h2 className="text-xl font-black text-ink dark:text-white">Student ID approval</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">
            Users can enter the dashboard only after approval.
          </p>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {(pendingUsers.length ? pendingUsers : studentUsers).length ? (
            (pendingUsers.length ? pendingUsers : studentUsers).map((student) => (
              <div key={student.uid} className="grid gap-5 p-5 lg:grid-cols-[1fr_280px_auto] lg:items-center">
                <div className="flex items-center gap-4">
                  <Image src={student.avatarUrl || demoUser.avatarUrl} alt="" width={64} height={64} unoptimized={(student.avatarUrl || "").startsWith("data:")} className="size-16 rounded-2xl object-cover" />
                  <div className="min-w-0">
                    <p className="font-black text-ink dark:text-white">{student.fullName}</p>
                    <p className="truncate text-sm font-semibold text-slate-500 dark:text-slate-300">{student.email}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {student.collegeName || "College missing"} - {student.usn || "USN missing"} - {student.year || "Year missing"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {student.department || "Department missing"} - {student.phoneNumber || "Phone missing"}
                    </p>
                    <p className="text-xs font-black uppercase text-amber-700 dark:text-sun">{student.verificationStatus ?? "needs_id"}</p>
                  </div>
                </div>
                <div>
                  {student.idCardUrl ? (
                    <img src={student.idCardUrl} alt={`${student.fullName} ID card`} className="max-h-44 w-full rounded-2xl object-contain ring-1 ring-slate-200 dark:ring-white/10" />
                  ) : (
                    <div className="grid h-36 place-items-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                      No ID uploaded
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.verificationStatus === "pending" ? (
                    <>
                      <button onClick={() => approveUser(student.uid)} className="inline-flex items-center gap-2 rounded-full bg-mint/12 px-4 py-2 text-sm font-black text-emerald-700 dark:text-mint">
                        <CheckCircle2 className="size-4" />
                        Approve
                      </button>
                      <button onClick={() => rejectUser(student.uid)} className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-black text-coral">
                        <XCircle className="size-4" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      <IdCard className="size-4" />
                      Reviewed
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-300">No student users yet.</p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-premium ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <h2 className="text-xl font-black text-ink dark:text-white">Products waiting for review</h2>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {pending.length ? (
            pending.map((product) => (
              <div key={product.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-center gap-3">
                  <Image src={product.images[0]} alt="" width={64} height={64} unoptimized={product.images[0].startsWith("data:")} className="size-16 rounded-2xl object-cover" />
                  <div>
                    <p className="font-black text-ink dark:text-white">{product.name}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{product.sellerName} - {formatPrice(product.price)}</p>
                    <p className="mt-1 text-xs font-black uppercase text-amber-700 dark:text-sun">{product.status}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <>
                    <button onClick={() => void approveListing(product.id)} className="inline-flex items-center gap-2 rounded-full bg-mint/12 px-4 py-2 text-sm font-black text-emerald-700 dark:text-mint">
                      <CheckCircle2 className="size-4" />
                      Approve
                    </button>
                    <button onClick={() => void rejectListing(product.id)} className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-black text-coral">
                      <XCircle className="size-4" />
                      Reject
                    </button>
                  </>
                  <button onClick={() => void removeListing(product.id)} className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-black text-coral">
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-ink">
                    <Ban className="size-4" />
                    Ban user
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-300">No pending product reviews.</p>
          )}
        </div>
      </section>
    </div>
  );
}
