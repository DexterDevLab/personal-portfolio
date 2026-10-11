/**
 * The trunk cable in the left margin (full mode only): sized to the page
 * body, one tap per section at its heading, and the orange signal following
 * the viewport's signal line as the visitor scrolls.
 */
import { MOTION } from "../motion";
import type { SectionContext } from "../signal";

export function setupTrunk(ctx: SectionContext) {
  const trunk = document.querySelector<HTMLElement>("[data-trunk]");
  const svg = trunk?.querySelector<SVGSVGElement>("[data-trunk-svg]");
  const signal = svg?.querySelector<SVGCircleElement>("[data-trunk-signal]");
  if (!trunk || !svg || !signal || ctx.mode !== "full") return;

  const lines = [...svg.querySelectorAll<SVGPathElement>("[data-trunk-line]")];
  const taps = [...svg.querySelectorAll<SVGGElement>("[data-trunk-tap]")];
  let height = 1;
  let lastTap = 1;

  /** Lay the cable out against the current page geometry (called on every refresh). */
  const layout = () => {
    const bodyTop = ctx.body.getBoundingClientRect().top + window.scrollY;
    height = Math.max(1, ctx.body.offsetHeight);
    svg.setAttribute("viewBox", `0 0 40 ${height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    let maxY = 0;
    for (const tap of taps) {
      const id = tap.dataset.trunkTap ?? "";
      const section = document.getElementById(id);
      const heading = section?.querySelector<HTMLElement>("h2");
      const anchor = heading ?? section;
      if (!anchor) {
        tap.style.display = "none";
        continue;
      }
      const r = anchor.getBoundingClientRect();
      const y = Math.round(r.top + window.scrollY - bodyTop + r.height / 2);
      tap.style.display = "";
      tap.querySelectorAll<SVGPathElement>("[data-tap-line]").forEach((p) => p.setAttribute("d", `M20 ${y}h12`));
      tap.querySelector<SVGCircleElement>("[data-tap-led]")?.setAttribute("cy", String(y));
      maxY = Math.max(maxY, y);
    }
    lastTap = Math.max(1, maxY);
    lines.forEach((l) => l.setAttribute("d", `M20 0v${lastTap}`));
  };

  const state = { y: 0 };
  const place = () => signal.setAttribute("cy", Math.min(state.y, lastTap).toFixed(1));

  layout();
  ctx.gsap.to(state, {
    y: () => height,
    ease: "none",
    onUpdate: place,
    scrollTrigger: {
      trigger: ctx.body,
      start: `top ${MOTION.signalLine * 100}%`,
      end: `bottom ${MOTION.signalLine * 100}%`,
      scrub: MOTION.scrub,
      invalidateOnRefresh: true,
      onRefreshInit: layout,
      onRefresh: place,
    },
  });
}
