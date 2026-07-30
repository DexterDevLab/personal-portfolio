"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating "back to top" control. Hidden until the hero (#top) scrolls out
 * of view — tracked with an IntersectionObserver so nothing runs on the
 * scroll thread. Mirrors the footer icon-button styling; sits below the
 * header and mobile menu (z-40 < the header's z-50).
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const top = document.getElementById("top");
    if (!top) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting),
    );
    observer.observe(top);
    return () => observer.disconnect();
  }, []);

  function scrollToTop() {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-6 right-6 z-40 inline-flex size-11 items-center justify-center rounded-button border border-border bg-surface text-muted shadow-lg shadow-black/25 transition-[opacity,transform,color,border-color] duration-200 hover:border-muted hover:text-foreground",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}
