"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, CheckCircle2, XCircle, Truck } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import type { DeliveryPartnerApplication } from "@/lib/types";

export function DeliveryPartnerStatus() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [application, setApplication] = useState<DeliveryPartnerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    // Load application from localStorage
    if (typeof window !== "undefined") {
      const applications = JSON.parse(localStorage.getItem("delivery-applications") || "[]");
      const userApp = applications.find((app: DeliveryPartnerApplication) => app.uid === user.uid);
      setApplication(userApp || null);
    }
    setLoading(false);
  }, [user, router]);

  if (loading) {
    return <div className="min-h-screen bg-cloud dark:bg-night" />;
  }

  if (!user) return null;

  const statusConfig: Record<string, {
    icon: any;
    title: string;
    description: string;
    color: string;
    actionText?: string;
    actionHref?: string;
  }> = {
    pending: {
      icon: Clock3,
      title: "Application Under Review",
      description: "Your application is being reviewed by our team. You'll be notified once a decision is made.",
      color: "bg-sun/20 text-sun"
    },
    approved: {
      icon: CheckCircle2,
      title: "Congratulations!",
      description: "You are now a verified CollegeCart Delivery Partner. Start accepting deliveries to earn!",
      color: "bg-mint/20 text-mint",
      actionText: "Go to Dashboard",
      actionHref: "/delivery-dashboard"
    },
    rejected: {
      icon: XCircle,
      title: "Application Rejected",
      description: "Unfortunately, your application was not approved. Contact support for more information.",
      color: "bg-coral/20 text-coral",
      actionText: "Contact Support",
      actionHref: "/support"
    }
  };

  const status = application?.status || "pending";
  const config = statusConfig[status as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Status Card */}
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-premium dark:border-white/10 dark:bg-white/[0.08]">
        <div className="px-8 py-12 text-center">
          <div className={`mx-auto mb-6 inline-flex size-24 items-center justify-center rounded-full ${config.color}`}>
            <Icon className="size-12" />
          </div>
          <h1 className="text-3xl font-black text-ink dark:text-white">{config.title}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {config.description}
          </p>
          {config.actionHref && (
            <a
              href={config.actionHref}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-3 text-sm font-black text-white shadow-glow"
            >
              {config.actionText}
            </a>
          )}
        </div>
      </div>

      {/* Application Details */}
      {application && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
          <h2 className="text-xl font-black text-ink dark:text-white mb-6">Your Application Details</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Application ID</p>
              <p className="mt-2 font-semibold text-ink dark:text-white">{application.id}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Full Name</p>
              <p className="mt-2 font-semibold text-ink dark:text-white">{application.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-2 font-semibold text-ink dark:text-white">{application.email}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">College</p>
              <p className="mt-2 font-semibold text-ink dark:text-white">{application.collegeName}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Year</p>
              <p className="mt-2 font-semibold text-ink dark:text-white">{application.year}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">USN</p>
              <p className="mt-2 font-semibold text-ink dark:text-white">{application.usn}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Submitted on</p>
              <p className="mt-2 font-semibold text-ink dark:text-white">
                {new Date(application.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Application Button */}
      {!application && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
          <Truck className="mx-auto size-12 text-ocean mb-4" />
          <h2 className="text-xl font-black text-ink dark:text-white mb-3">Start Your Journey</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Apply now to become a CollegeCart Delivery Partner and start earning!
          </p>
          <a
            href="/delivery-partner"
            className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-3 text-sm font-black text-white shadow-glow"
          >
            Apply Now
          </a>
        </div>
      )}
    </div>
  );
}
