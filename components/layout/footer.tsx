import Link from "next/link";
import { Instagram } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const links = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
  { label: "Support", href: "/support" }
];

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-6 md:pb-10 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white/[0.82] p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.08]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 text-sm font-black text-slate-600 dark:text-slate-300">Buy • Sell • Save</p>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-ocean">
                {link.label}
              </Link>
            ))}
            <a
              href="https://www.instagram.com/collegecart.online?igsh=MWJ5bTBnZ3VvY3FjNA=="
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-ocean"
            >
              <Instagram className="size-4" />
              Instagram
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
