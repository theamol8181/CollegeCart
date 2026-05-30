import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="CollegeCart home">
      <span className="grid size-10 place-items-center rounded-2xl bg-ocean text-white shadow-glow">
        <ShoppingBag className="size-5" />
      </span>
      <span className="hidden text-xl font-black tracking-tight text-ink dark:text-white sm:inline">
        College<span className="text-ocean">Cart</span>
      </span>
    </Link>
  );
}
