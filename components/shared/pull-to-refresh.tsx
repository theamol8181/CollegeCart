"use client";

import { RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const startY = useRef(0);
  const [pulling, setPulling] = useState(false);

  useEffect(() => {
    function onTouchStart(event: TouchEvent) {
      if (window.scrollY === 0) startY.current = event.touches[0].clientY;
    }

    function onTouchMove(event: TouchEvent) {
      const distance = event.touches[0].clientY - startY.current;
      setPulling(window.scrollY === 0 && distance > 70);
    }

    function onTouchEnd() {
      if (pulling) window.location.reload();
      setPulling(false);
      startY.current = 0;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pulling]);

  return (
    <>
      <div className={`fixed left-1/2 top-24 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-black text-white shadow-premium transition md:hidden ${pulling ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"}`}>
        <RefreshCcw className="size-4" />
        Release to refresh
      </div>
      {children}
    </>
  );
}
