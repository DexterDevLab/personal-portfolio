"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-following spotlight (§9) — place as the first child of any
 * `relative group` card. Tracks the cursor on the parent element and
 * paints a soft accent glow at its position. Pointer-events pass through;
 * hidden on touch devices (no hover) since it only shows on group-hover.
 */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      parent.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      parent.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    };
    parent.addEventListener("mousemove", onMove);
    return () => parent.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        background:
          "radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--accent-weak), transparent 65%)",
      }}
    />
  );
}
