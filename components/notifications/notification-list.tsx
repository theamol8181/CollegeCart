import { Bell, CheckCircle2 } from "lucide-react";
import { notifications } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export function NotificationList() {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="mb-5 text-3xl font-black text-ink dark:text-white">Notifications</h1>
      <div className="space-y-3">
        {notifications.map((notification) => (
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
        ))}
      </div>
    </section>
  );
}
