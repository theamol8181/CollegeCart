import Link from "next/link";
import { MessageCircle, ShoppingBag } from "lucide-react";

export function MessagingShell() {
  return (
    <section className="grid min-h-[520px] place-items-center rounded-[2rem] bg-white p-6 text-center shadow-premium ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10 sm:p-10">
      <div className="max-w-lg">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-ocean/10 text-ocean">
          <MessageCircle className="size-8" />
        </span>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-ocean">Coming soon</p>
        <h1 className="mt-3 text-3xl font-black text-ink dark:text-white sm:text-4xl">Chats are coming soon</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Direct seller chat is currently paused. Product pages now keep the buying flow simple with only the Buy Now option.
        </p>
        <Link
          href="/search"
          className="mx-auto mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean px-5 py-3 text-sm font-black text-white shadow-soft transition hover:bg-ocean/90"
        >
          <ShoppingBag className="size-4" />
          Browse products
        </Link>
      </div>
    </section>
  );
}
