import { Zap, ShieldCheck, UsersRound } from "lucide-react";

const items = [
  { label: "100+", title: "Active campus buyers", icon: UsersRound, color: "text-ocean bg-ocean/10" },
  { label: "18 min", title: "Average first reply", icon: Zap, color: "text-coral bg-coral/10" },
  { label: "Verified", title: "Student-first trust layer", icon: ShieldCheck, color: "text-emerald-600 bg-mint/12" }
];

export function MarketStrip() {
  return (
    <section className="mt-5 grid gap-3 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="glass flex items-center gap-4 rounded-[1.5rem] p-4">
            <span className={`grid size-12 place-items-center rounded-2xl ${item.color}`}>
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-xl font-black text-ink dark:text-white">{item.label}</p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{item.title}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
