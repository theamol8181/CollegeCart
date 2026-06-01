"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, LayoutDashboard, LogIn, Menu, MessageCircle, Moon, PlusCircle, Search, Sun, UserRound, UserPlus, X } from "lucide-react";
import { demoUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { useThemeStore } from "@/stores/theme-store";
import { useAuthStore } from "@/stores/auth-store";
import { Logo } from "@/components/layout/logo";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery } = useMarketplaceStore();
  const { theme, setTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/50 bg-white/[0.82] backdrop-blur-2xl dark:border-white/10 dark:bg-night/[0.78]">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Logo />

          <form
            className="relative mx-auto hidden max-w-2xl flex-1 md:block"
            onSubmit={(event) => {
              event.preventDefault();
              router.push("/search");
            }}
          >
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search books, cycles, notes, gadgets..."
              suppressHydrationWarning
              className="h-12 w-full rounded-2xl border-0 bg-cloud pl-12 pr-4 text-sm font-medium text-ink shadow-inner outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-ocean dark:bg-white/10 dark:text-white dark:ring-white/10"
            />
          </form>

          <nav className="hidden items-center gap-2 md:flex">
            {!user ? (
              <>
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-cloud px-4 py-3 text-sm font-bold text-ink ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10">
                  <LogIn className="size-4" />
                  Login
                </Link>
                <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-cloud px-4 py-3 text-sm font-bold text-ink ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10">
                  <UserPlus className="size-4" />
                  Sign Up
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-cloud px-4 py-3 text-sm font-bold text-ink ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            )}
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSe5G3l8WdYPI9DLH7fWN2SLWseY2ZtFxSiL8JN_QU3voCAXIA/viewform?usp=publish-editor"
              target="_blank" 
              rel="noopener noreferrer"
              className="rounded-full bg-ocean px-5 py-3 text-sm font-bold text-white shadow-glow"
            >
              Sell Product
            </a>
            {user ? (
              <>
                <IconLink href="/notifications" label="Notifications" icon={<Bell className="size-5" />} />
                <IconLink href="/messages" label="Messages" icon={<MessageCircle className="size-5" />} />
              </>
            ) : null}
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="grid size-12 place-items-center rounded-full bg-cloud text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 dark:bg-white/10 dark:text-white dark:ring-white/10"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            {user ? (
              <Link href="/profile" className="flex items-center gap-2 rounded-full bg-cloud p-1 pr-3 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10">
                <Image src={user.avatarUrl || demoUser.avatarUrl} alt="" width={40} height={40} unoptimized={(user.avatarUrl || "").startsWith("data:")} className="size-10 rounded-full object-cover" />
                <UserRound className="size-4 text-slate-500 dark:text-slate-300" />
              </Link>
            ) : null}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="ml-auto grid size-11 place-items-center rounded-full bg-cloud text-ink md:hidden dark:bg-white/10 dark:text-white"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-x-0 top-20 z-40 border-b border-slate-200 bg-white/[0.96] p-4 shadow-premium backdrop-blur-2xl dark:border-white/10 dark:bg-night/[0.96] md:hidden">
          <form
            className="relative"
            onSubmit={(event) => {
              event.preventDefault();
              setMobileOpen(false);
              router.push("/search");
            }}
          >
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search campus deals..."
              suppressHydrationWarning
              className="h-12 w-full rounded-2xl border-0 bg-cloud pl-12 pr-4 text-sm font-semibold text-ink ring-1 ring-slate-200 focus:ring-2 focus:ring-ocean dark:bg-white/10 dark:text-white dark:ring-white/10"
            />
          </form>
          <div className="mt-4 grid gap-2">
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <MobileLink href="/login" label="Login" icon={<LogIn className="size-4" />} onClick={() => setMobileOpen(false)} />
                <MobileLink href="/register" label="Sign Up" icon={<UserPlus className="size-4" />} onClick={() => setMobileOpen(false)} />
              </div>
            ) : (
              <MobileLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard className="size-4" />} onClick={() => setMobileOpen(false)} />
            )}
            <Link onClick={() => setMobileOpen(false)} href="/sell" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean px-4 py-3 text-sm font-black text-white shadow-glow">
              <PlusCircle className="size-4" />
              Sell Product
            </Link>
            {user ? (
              <div className="grid grid-cols-3 gap-2">
                <MobileLink href="/notifications" label="Alerts" icon={<Bell className="size-4" />} onClick={() => setMobileOpen(false)} />
                <MobileLink href="/messages" label="Chats" icon={<MessageCircle className="size-4" />} onClick={() => setMobileOpen(false)} />
                <MobileLink href="/profile" label="Profile" icon={<UserRound className="size-4" />} onClick={() => setMobileOpen(false)} />
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cloud px-4 py-3 text-sm font-black text-ink ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              Theme
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function IconLink({ href, label, icon, badge }: { href: string; label: string; icon: React.ReactNode; badge?: boolean }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("relative grid size-12 place-items-center rounded-full bg-cloud text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 dark:bg-white/10 dark:text-white dark:ring-white/10")}
    >
      {icon}
      {badge ? <span className="absolute right-2 top-2 size-2.5 rounded-full bg-coral ring-2 ring-white dark:ring-night" /> : null}
    </Link>
  );
}

function MobileLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cloud px-4 py-3 text-sm font-black text-ink ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10"
    >
      {icon}
      {label}
    </Link>
  );
}
