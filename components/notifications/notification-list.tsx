"use client";

import { Bell, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { listenToNotifications } from "@/lib/notifications";
import { timeAgo } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { NotificationItem } from "@/lib/types";

export function NotificationList() {
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = listenToNotifications(user.uid, (items) => {
      setNotifications(items);
    });

    return () => unsubscribe?.();
  }, [user?.uid]);

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="mb-5 text-3xl font-black text-ink dark:text-white">Notifications</h1>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.08]">
            <Bell className="mx-auto mb-3 size-12 text-slate-300 dark:text-white/30" />
            <p className="text-slate-600 dark:text-slate-300">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <article key={notification.id} className="glass flex items-start gap-4 rounded-[1.5rem] p-4">
              <span className={`grid size-12 place-items-center rounded-2xl ${notification.unread ? "bg-coral/10 text-coral" : "bg-mint/12 text-emerald-600"}`}>
                {notification.unread ? <Bell className="size-5" /> : <CheckCircle2 className="size-5" />}
              </span>
              <div>
                <h2 className="font-black text-ink dark:text-white">{notification.title}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.body}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">{timeAgo(notification.createdAt)}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
