"use client";

import { useState } from "react";
import Image from "next/image";
import { Ban, CheckCircle2, Clock3, IdCard, Shield, Trash2, UsersRound, XCircle, Truck, Plus } from "lucide-react";
import { demoUser } from "@/lib/data";
import { deleteProduct, updateProductStatus } from "@/lib/firestore";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { AdminDeliveryRequests } from "./admin-delivery-requests";
import { AdminOrders } from "./admin-orders";
import { ListingForm } from "@/components/product/listing-form";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"marketplace" | "users" | "delivery" | "orders" | "upload">("marketplace");
  const { products, approveProduct, rejectProduct, markProductSold, deleteProductLocal } = useMarketplaceStore();
  const { users, approveUser, rejectUser, refreshUserFromFirebase } = useAuthStore();
  const reviewProducts = products.filter((product) => Boolean(product.status));
  const sold = reviewProducts.filter((product) => product.status === "sold");
  const studentUsers = users.filter((user) => user.role === "student");
  const pendingUsers = studentUsers.filter((user) => user.verificationStatus === "pending");
  const stats = [
    { label: "Total Users", value: String(studentUsers.length), icon: UsersRound, color: "bg-ocean/10 text-ocean" },
    { label: "User Listings", value: String(reviewProducts.length), icon: Shield, color: "bg-mint/12 text-emerald-600" },
    { label: "Pending Accounts", value: String(pendingUsers.length), icon: Clock3, color: "bg-sun/20 text-amber-700" },
    { label: "Out of Stock", value: String(sold.length), icon: Ban, color: "bg-coral/10 text-coral" }
  ];

  async function approveListing(productId: string) {
    console.log(`🔵 APPROVE CLICKED: ${productId}`);
    
    // Only update Firebase if the product ID is actually saved in Firebase (not a local-* ID)
    if (!productId.startsWith("local-")) {
      try {
        console.log(`⏳ Updating Firebase: ${productId} → "approved"`);
        await updateProductStatus(productId, "approved");
        console.log(`✅ Firebase updated! Clearing cache...`);
        // Clear localStorage to force fresh sync from Firebase
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("collegecart-products");
          console.log(`✅ Cache cleared! Listener will re-sync from Firebase...`);
        }
        // Update local store after Firebase is updated successfully
        approveProduct(productId);
        console.log(`✅ Local store updated! Status: APPROVED`);
      } catch (error) {
        console.error("❌ Failed to update product status in Firebase:", error);
        alert("Error approving product: " + (error instanceof Error ? error.message : String(error)));
      }
    } else {
      approveProduct(productId);
      console.log(`✅ Local product approved: ${productId}`);
    }
  }

  async function rejectListing(productId: string) {
    console.log(`🔴 REJECT CLICKED: ${productId}`);
    
    // Only update Firebase if the product ID is actually saved in Firebase (not a local-* ID)
    if (!productId.startsWith("local-")) {
      try {
        console.log(`⏳ Updating Firebase: ${productId} → "rejected"`);
        await updateProductStatus(productId, "rejected");
        console.log(`✅ Firebase updated! Clearing cache...`);
        // Clear localStorage to force fresh sync from Firebase
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("collegecart-products");
          console.log(`✅ Cache cleared! Listener will re-sync from Firebase...`);
        }
        // Update local store after Firebase is updated successfully
        rejectProduct(productId);
        console.log(`✅ Local store updated! Status: REJECTED`);
      } catch (error) {
        console.error("❌ Failed to update product status in Firebase:", error);
        alert("Error rejecting product: " + (error instanceof Error ? error.message : String(error)));
      }
    } else {
      rejectProduct(productId);
      console.log(`✅ Local product rejected: ${productId}`);
    }
  }

  async function markListingOutOfStock(productId: string) {
    console.log(`Marking product out of stock: ${productId}`);

    if (!productId.startsWith("local-")) {
      try {
        await updateProductStatus(productId, "sold");
        if (typeof window !== "undefined") window.localStorage.removeItem("collegecart-products");
        markProductSold(productId);
      } catch (error) {
        console.error("Failed to mark product out of stock:", error);
        alert("Error marking product out of stock: " + (error instanceof Error ? error.message : String(error)));
      }
    } else {
      markProductSold(productId);
    }
  }

  async function approveUserWithRefresh(uid: string) {
    console.log(`✅ Approving user: ${uid}`);
    approveUser(uid);
    // Refresh user immediately after approval
    setTimeout(() => {
      refreshUserFromFirebase(uid);
      console.log(`🔄 Refreshed user from Firebase`);
    }, 500);
  }

  async function rejectUserWithRefresh(uid: string) {
    console.log(`❌ Rejecting user: ${uid}`);
    rejectUser(uid);
    // Refresh user immediately after rejection
    setTimeout(() => {
      refreshUserFromFirebase(uid);
      console.log(`🔄 Refreshed user from Firebase`);
    }, 500);
  }

  async function removeListing(productId: string) {
    if (!confirm("Delete this product permanently?")) return;

    try {
      deleteProductLocal(productId);
      if (!productId.startsWith("local-")) await deleteProduct(productId);
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Error deleting product: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Admin panel</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-ink dark:text-white">Dashboard</h1>
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`px-4 py-3 text-sm font-black transition ${
            activeTab === "marketplace"
              ? "border-b-2 border-ocean text-ocean"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          Marketplace
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-black transition ${
            activeTab === "upload"
              ? "border-b-2 border-ocean text-ocean"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <Plus className="size-4" />
          Upload Product
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-3 text-sm font-black transition ${
            activeTab === "users"
              ? "border-b-2 border-ocean text-ocean"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-black transition ${
            activeTab === "delivery"
              ? "border-b-2 border-ocean text-ocean"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <Truck className="size-4" />
          Delivery Partners
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-black transition ${
            activeTab === "orders"
              ? "border-b-2 border-ocean text-ocean"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          📦 Orders
        </button>
      </div>

      {/* Marketplace Tab */}
      {activeTab === "marketplace" && (
        <>
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
          <h2 className="text-xl font-black text-ink dark:text-white">Live listing moderation</h2>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {reviewProducts.length ? (
            reviewProducts.map((product) => (
              <div key={product.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-center gap-3">
                  <Image src={product.images[0]} alt="" width={64} height={64} unoptimized={product.images[0].startsWith("data:")} className="size-16 rounded-2xl object-cover" />
                  <div>
                    <p className="font-black text-ink dark:text-white">{product.name}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{product.sellerName} - {formatPrice(product.price)}</p>
                    <p className={`mt-1 w-fit rounded-full px-2.5 py-1 text-xs font-black uppercase ${
                      product.status === "sold"
                        ? "bg-coral/10 text-coral"
                        : product.status === "rejected"
                          ? "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                          : "bg-mint/12 text-emerald-700 dark:text-mint"
                    }`}>
                      {product.status === "sold" ? "out of stock" : product.status ?? "approved"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.status === "sold" || product.status === "rejected" ? (
                    <button onClick={() => void approveListing(product.id)} className="inline-flex items-center gap-2 rounded-full bg-mint/12 px-4 py-2 text-sm font-black text-emerald-700 dark:text-mint">
                      <CheckCircle2 className="size-4" />
                      Mark available
                    </button>
                  ) : (
                    <button onClick={() => void markListingOutOfStock(product.id)} className="inline-flex items-center gap-2 rounded-full bg-sun/20 px-4 py-2 text-sm font-black text-amber-800 dark:text-sun">
                      <Ban className="size-4" />
                      Out of stock
                    </button>
                  )}
                  {product.status !== "rejected" ? (
                    <button onClick={() => void rejectListing(product.id)} className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-black text-coral">
                      <XCircle className="size-4" />
                      Reject
                    </button>
                  ) : null}
                  <button onClick={() => void removeListing(product.id)} className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-black text-coral">
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-300">No product listings yet.</p>
          )}
        </div>
      </section>
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
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
                        <button onClick={() => void approveUserWithRefresh(student.uid)} className="inline-flex items-center gap-2 rounded-full bg-mint/12 px-4 py-2 text-sm font-black text-emerald-700 dark:text-mint">
                          <CheckCircle2 className="size-4" />
                          Approve
                        </button>
                        <button onClick={() => void rejectUserWithRefresh(student.uid)} className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-black text-coral">
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
      )}

      {/* Upload Product Tab */}
      {activeTab === "upload" && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Admin only</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-ink dark:text-white">Upload Product Manually</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use this form to manually create product listings for the marketplace.</p>
          </div>
          <ListingForm />
        </section>
      )}

      {/* Delivery Partners Tab */}
      {activeTab === "delivery" && (
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-premium ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
          <AdminDeliveryRequests />
        </section>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <AdminOrders />
      )}
    </div>
  );
}
