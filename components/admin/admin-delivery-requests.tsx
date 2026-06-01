"use client";

import Image from "next/image";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import type { DeliveryPartnerApplication } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

export function AdminDeliveryRequests() {
  const [applications, setApplications] = useState<DeliveryPartnerApplication[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedApp, setSelectedApp] = useState<DeliveryPartnerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "delivery-applications"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map((doc) => doc.data() as DeliveryPartnerApplication);
      setApplications(apps);
      setLoading(false);
      console.log(`📋 Loaded ${apps.length} delivery applications`);
    }, (error) => {
      console.error("❌ Error loading delivery applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredApps = filter === "all" 
    ? applications 
    : applications.filter((app) => app.status === filter);

  const stats = [
    { label: "Pending", value: applications.filter((a) => a.status === "pending").length, color: "text-sun" },
    { label: "Approved", value: applications.filter((a) => a.status === "approved").length, color: "text-mint" },
    { label: "Rejected", value: applications.filter((a) => a.status === "rejected").length, color: "text-coral" }
  ];

  async function approveApplication(appId: string) {
    const firestore = db;
    if (!firestore) {
      alert("Firebase is not configured");
      return;
    }

    try {
      await updateDoc(doc(firestore, "delivery-applications", appId), {
        status: "approved",
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Application approved: ${appId}`);
    } catch (error) {
      console.error("❌ Error approving application:", error);
      alert("Error approving application");
    }
  }

  async function rejectApplication(appId: string) {
    const firestore = db;
    if (!firestore) {
      alert("Firebase is not configured");
      return;
    }

    try {
      await updateDoc(doc(firestore, "delivery-applications", appId), {
        status: "rejected",
        updatedAt: new Date().toISOString()
      });
      console.log(`❌ Application rejected: ${appId}`);
    } catch (error) {
      console.error("❌ Error rejecting application:", error);
      alert("Error rejecting application");
    }
  }

  if (loading) {
    return <div className="rounded-[2rem] bg-white p-8 text-center dark:bg-white/[0.08]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-ocean">Delivery partners</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white">Delivery Partner Requests</h2>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.5rem] bg-white p-5 shadow-sm dark:bg-white/[0.08]">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={`mt-2 text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${
              filter === f
                ? "bg-ocean text-white"
                : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-premium ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {filteredApps.length ? (
            filteredApps.map((app) => (
              <div key={app.id} className="grid gap-4 p-5 lg:grid-cols-[auto_1fr_280px_auto] lg:items-center">
                {/* Profile Photo */}
                <img
                  src={app.profilePhoto}
                  alt={app.fullName}
                  className="size-16 rounded-2xl object-cover"
                />

                {/* Info */}
                <div className="min-w-0">
                  <p className="font-black text-ink dark:text-white">{app.fullName}</p>
                  <p className="truncate text-sm font-semibold text-slate-500 dark:text-slate-300">{app.email}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {app.collegeName} • {app.usn}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {app.phoneNumber} • {app.whatsappNumber}
                  </p>
                </div>

                {/* ID Card Preview */}
                <div className="flex gap-2">
                  <img src={app.idCardFront} alt="ID Front" className="h-24 rounded-lg object-cover" />
                  <img src={app.idCardBack} alt="ID Back" className="h-24 rounded-lg object-cover" />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {app.status === "pending" ? (
                    <>
                      <button
                        onClick={() => approveApplication(app.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-mint/12 px-4 py-2 text-sm font-black text-emerald-700 dark:text-mint"
                      >
                        <CheckCircle2 className="size-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectApplication(app.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-4 py-2 text-sm font-black text-coral"
                      >
                        <XCircle className="size-4" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${
                      app.status === "approved"
                        ? "bg-mint/12 text-emerald-700 dark:text-mint"
                        : "bg-coral/10 text-coral"
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 dark:bg-white/10 dark:text-slate-300"
                  >
                    <Eye className="size-4" />
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-300">No applications found.</p>
          )}
        </div>
      </div>

      {/* Detailed View Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-8 dark:bg-white/[0.08]">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-ink dark:text-white">{selectedApp.fullName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedApp.email}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-2xl font-bold text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Details */}
              <div>
                <h4 className="font-black text-ink dark:text-white mb-3">Personal Details</h4>
                <div className="grid gap-3 text-sm">
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">Phone:</span> {selectedApp.phoneNumber}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">WhatsApp:</span> {selectedApp.whatsappNumber}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">College:</span> {selectedApp.collegeName}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">Year:</span> {selectedApp.year}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">USN:</span> {selectedApp.usn}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">Department:</span> {selectedApp.department}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">Address:</span> {selectedApp.address}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">Emergency Contact:</span> {selectedApp.emergencyContact}</div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="font-black text-ink dark:text-white mb-3">Bank Details</h4>
                <div className="grid gap-3 text-sm">
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">Account Holder:</span> {selectedApp.accountHolderName}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">Bank:</span> {selectedApp.bankName}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">Account Number:</span> {selectedApp.accountNumber}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">IFSC Code:</span> {selectedApp.ifscCode}</div>
                  <div><span className="font-semibold text-slate-600 dark:text-slate-300">UPI ID:</span> {selectedApp.upiId}</div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-black text-ink dark:text-white mb-3">Documents</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">ID Front</p>
                    <img src={selectedApp.idCardFront} alt="ID Front" className="rounded-lg object-cover w-full h-40" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">ID Back</p>
                    <img src={selectedApp.idCardBack} alt="ID Back" className="rounded-lg object-cover w-full h-40" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Profile Photo</p>
                    <img src={selectedApp.profilePhoto} alt="Profile" className="rounded-lg object-cover w-full h-40" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedApp.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      approveApplication(selectedApp.id);
                      setSelectedApp(null);
                    }}
                    className="flex-1 rounded-full bg-mint/12 py-3 text-sm font-black text-emerald-700 dark:text-mint"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      rejectApplication(selectedApp.id);
                      setSelectedApp(null);
                    }}
                    className="flex-1 rounded-full bg-coral/10 py-3 text-sm font-black text-coral"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
