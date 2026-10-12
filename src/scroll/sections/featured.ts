/**
 * Panda Central: signals travel from each managed site into the dashboard
 * (NetworkArt.astro), once, when the diagram comes into view.
 */
import { MOTION } from "../motion";
import { entryOnce, followPath, type SectionContext } from "../signal";

export function setupFeatured(ctx: SectionContext) {
  const section = document.getElementById("panda-central");
  if (!section) return;

  const art = section.querySelector<SVGSVGElement>("[data-network]");
  if (!art) return;
  const dots = [...art.querySelectorAll<SVGCircleElement>("[data-net-dot]")];
  const cables = [...art.querySelectorAll<SVGPathElement>("[data-net-cable]")];
  const hub = art.querySelector<SVGCircleElement>("[data-net-hub]");
  if (dots.length !== cables.length || !hub) return;

  const movers = dots.map((dot, i) => followPath(cables[i], dot));

  entryOnce(ctx, art, {
    init: () => {
      movers.forEach((move) => move(0));
      hub.setAttribute("fill", MOTION.colors.off);
    },
    play: () => {
      const tl = ctx.gsap.timeline();
      dots.forEach((_, i) => {
        const s = { p: 0 };
        tl.to(s, { p: 1, duration: MOTION.entry.duration, ease: "power1.inOut", onUpdate: () => movers[i](s.p) }, i * 0.12);
      });
      tl.to(hub, { attr: { fill: MOTION.colors.orange }, duration: 0.3 }, ">-0.2");
    },
  });
}
