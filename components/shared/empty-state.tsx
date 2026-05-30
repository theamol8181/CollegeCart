"use client";

import { Heart, RotateCcw, SearchX } from "lucide-react";

const icons = {
  Heart,
  RotateCcw,
  SearchX
};

export function EmptyState({
  icon,
  title,
  body,
  action,
  actionLabel,
  onAction
}: {
  icon: keyof typeof icons;
  title: string;
  body: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const Icon = icons[icon];

  return (
    <section className="glass mx-auto mt-10 flex min-h-[420px] max-w-2xl flex-col items-center justify-center rounded-[2rem] p-8 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-ocean/10 text-ocean">
        <Icon className="size-8" />
      </span>
      <h1 className="mt-6 text-3xl font-black tracking-tight text-ink dark:text-white">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
      <div className="mt-7">
        {action ??
          (actionLabel && onAction ? (
            <button onClick={onAction} className="rounded-full bg-ocean px-5 py-3 text-sm font-bold text-white shadow-glow">
              {actionLabel}
            </button>
          ) : null)}
      </div>
    </section>
  );
}
