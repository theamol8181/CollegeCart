"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Sparkles } from "lucide-react";
import { heroSlides } from "@/lib/data";

export function HeroSlider() {
  const primary = heroSlides[0];
  const Icon = primary.icon === "Bell" ? Bell : Sparkles;

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-ink shadow-premium dark:bg-black">
      <Image src={primary.image} alt="" fill priority sizes="100vw" className="object-cover opacity-58" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/76 to-transparent" />
      <div className="relative grid min-h-[420px] items-end p-6 sm:p-8 lg:min-h-[500px] lg:p-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/[0.14] px-4 py-2 text-sm font-black text-white backdrop-blur">
            <Icon className="size-4 text-mint" />
            {primary.eyebrow}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
            {primary.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/[0.82] sm:text-lg">{primary.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-ink shadow-premium">
              Explore deals
              <ArrowRight className="size-4" />
            </Link>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSe5G3l8WdYPI9DLH7fWN2SLWseY2ZtFxSiL8JN_QU3voCAXIA/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/[0.35] bg-white/[0.12] px-5 py-3 text-sm font-black text-white backdrop-blur">
              Sell product
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
