"use client";

import { MessageCircle } from "lucide-react";

export function MessagingShell() {
  return (
    <section className="grid min-h-[520px] place-items-center rounded-[2rem] bg-white p-8 text-center shadow-premium ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
      <div className="max-w-md">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-ocean/10 text-ocean">
          <MessageCircle className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-black text-ink dark:text-white">No real chats yet</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Buyer and seller conversations will appear here after approved users start messaging on real listings.
        </p>
      </div>
    </section>
  );
}
