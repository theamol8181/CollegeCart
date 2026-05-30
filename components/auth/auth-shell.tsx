"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export function AuthShell({
  title,
  subtitle,
  switchHref,
  switchLabel,
  children
}: {
  title: string;
  subtitle: string;
  switchHref: string;
  switchLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="-mx-4 -mt-24 grid min-h-screen place-items-center overflow-hidden bg-night px-4 py-10 text-white sm:-mx-6 lg:-mx-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(38,215,164,0.20),transparent_28rem),radial-gradient(circle_at_85%_12%,rgba(255,107,94,0.18),transparent_24rem),linear-gradient(135deg,#060814,#101820_48%,#07101f)]" />
      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
          <Logo />
          <div className="mt-16 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black backdrop-blur">
              <Sparkles className="size-4 text-mint" />
              Student verified campus commerce
            </div>
            <h1 className="text-6xl font-black tracking-tight">Buy, sell, and chat inside your campus.</h1>
            <p className="mt-6 text-lg leading-8 text-white/70">
              CollegeCart brings premium marketplace discovery, trusted student profiles, and real-time messages into one mobile-first experience.
            </p>
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 backdrop-blur">
              <div className="grid h-72 place-items-center rounded-[1.5rem] bg-gradient-to-br from-ocean via-mint to-sun p-8 text-ink">
                <GraduationCap className="size-28" />
                <p className="mt-6 text-center text-2xl font-black">Campus deals without the messy group chats.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/[0.14] bg-white/10 p-6 shadow-premium backdrop-blur-2xl sm:p-8">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-3xl font-black tracking-tight">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/[0.64]">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-7 text-center text-sm text-white/60">
            {switchLabel.split("?")[0]}?{" "}
            <Link href={switchHref} className="font-black text-mint">
              {switchLabel.split("?")[1] ?? switchLabel}
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
