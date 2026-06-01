"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, MessageCircle, PlusCircle, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "https://docs.google.com/forms/d/e/1FAIpQLSe5G3l8WdYPI9DLH7fWN2SLWseY2ZtFxSiL8JN_QU3voCAXIA/viewform?usp=publish-editor", label: "Sell", icon: PlusCircle, external: true },
  { href: "/wishlist", label: "Saved", icon: Heart },
  { href: "/messages", label: "Chats", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/90 px-2 py-2 backdrop-blur-2xl dark:border-white/10 dark:bg-night/[0.86] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {items.map((item: any) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          
          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold text-slate-500"
                )}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </a>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold text-slate-500",
                active && "bg-ocean text-white shadow-glow"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
