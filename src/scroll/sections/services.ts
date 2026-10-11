/**
 * Services: each illustration performs its service once as its card comes
 * into view (ServiceArt.astro holds the finished state; the timelines start
 * from a "before" state they set themselves).
 */
import { MOTION } from "../motion";
import { entryOnce, trackSectionPort, type SectionContext } from "../signal";

export function setupServices(ctx: SectionContext) {
  const section = document.getElementById("services");
  if (!section) return;
  trackSectionPort(ctx, section, "services");

  const { gsap, distance } = ctx;
  const { duration, stagger } = MOTION.entry;
  const c = MOTION.colors;
  const parts = (root: Element, name: string) => [...root.querySelectorAll<SVGElement>(`[data-part="${name}"]`)];

  section.querySelectorAll<HTMLElement>("[data-service-art]").forEach((card) => {
    const kind = card.dataset.serviceArt;
    const svg = card.querySelector("svg");
    if (!svg) return;

    if (kind === "layout") {
      // Components assemble into the page on the monitor.
      const pieces = ["hdr", "btn", "line1", "line2", "img"].map((n) => parts(svg, n)[0]).filter(Boolean);
      const crates = parts(svg, "crate");
      entryOnce(ctx, card, {
        init: () => {
          gsap.set(pieces, { opacity: 0, x: (i) => (i % 2 ? distance : -distance), y: -distance / 2 });
          gsap.set(crates, { y: distance / 2, opacity: 0 });
        },
        play: () => {
          const tl = gsap.timeline();
          tl.to(crates, { y: 0, opacity: 1, duration: 0.35, ease: "back.out(1.6)", stagger: 0.08 });
          tl.to(pieces, { opacity: 1, x: 0, y: 0, duration: duration * 0.5, ease: "back.out(1.4)", stagger }, 0.1);
        },
      });
    } else if (kind === "wrench") {
      // A fault becomes an operational state: bent antenna straightens, the
      // fault badge is replaced by a check, the status light turns teal.
      const antenna = parts(svg, "antenna")[0];
      const fault = parts(svg, "fault")[0];
      const ok = parts(svg, "ok")[0];
      const lamp = parts(svg, "lamp")[0];
      const wrench = parts(svg, "wrench")[0];
      if (!antenna || !fault || !ok || !lamp || !wrench) return;
      entryOnce(ctx, card, {
        init: () => {
          gsap.set(antenna, { rotation: -32, svgOrigin: "60 52" });
          gsap.set(fault, { opacity: 1 });
          gsap.set(ok, { opacity: 0, scale: 0.4, svgOrigin: "112 40" });
          gsap.set(lamp, { attr: { fill: c.red } });
          gsap.set(wrench, { rotation: 14, svgOrigin: "104 86" });
        },
        play: () => {
          const tl = gsap.timeline();
          tl.to(wrench, { rotation: -6, duration: 0.25, ease: "power2.in" })
            .to(wrench, { rotation: 0, duration: 0.35, ease: "back.out(2)" })
            .to(antenna, { rotation: 0, duration: 0.5, ease: "back.out(1.8)" }, 0.25)
            .to(lamp, { attr: { fill: c.teal }, duration: 0.25 }, 0.55)
            .to(fault, { opacity: 0, duration: 0.2 }, 0.6)
            .to(ok, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.65);
        },
      });
    } else if (kind === "app") {
      // Modules connect into a small working system.
      const left = parts(svg, "module-left")[0];
      const right = parts(svg, "module-right")[0];
      const bottom = parts(svg, "module-bottom")[0];
      const links = [...svg.querySelectorAll<SVGPathElement>("[data-link-core]")];
      const hub = parts(svg, "hub")[0];
      if (!left || !right || !bottom || !hub) return;
      const lengths = links.map((l) => l.getTotalLength());
      entryOnce(ctx, card, {
        init: () => {
          gsap.set(left, { x: -distance, opacity: 0 });
          gsap.set(right, { x: distance, opacity: 0 });
          gsap.set(bottom, { y: distance, opacity: 0 });
          links.forEach((l, i) => gsap.set(l, { strokeDasharray: lengths[i], strokeDashoffset: lengths[i] }));
          gsap.set(hub, { attr: { fill: c.off } });
        },
        play: () => {
          const tl = gsap.timeline();
          tl.to([left, right, bottom], { x: 0, y: 0, opacity: 1, duration: duration * 0.5, ease: "back.out(1.4)", stagger })
            .to(links, { strokeDashoffset: 0, duration: 0.35, ease: "power1.inOut", stagger: 0.1 }, 0.3)
            .to(hub, { attr: { fill: c.orange }, duration: 0.25 }, ">-0.05");
        },
      });
    } else if (kind === "server") {
      // The connection activates, then the slot lights come on in order.
      const cable = svg.querySelector<SVGPathElement>("[data-cable-core]");
      const leds = parts(svg, "led");
      if (!cable || !leds.length) return;
      const finals = leds.map((l) => l.getAttribute("fill") ?? c.teal);
      const length = cable.getTotalLength();
      entryOnce(ctx, card, {
        init: () => {
          gsap.set(cable, { strokeDasharray: length, strokeDashoffset: length });
          gsap.set(leds, { attr: { fill: c.off } });
        },
        play: () => {
          const tl = gsap.timeline();
          tl.to(cable, { strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut" });
          leds.forEach((led, i) => tl.to(led, { attr: { fill: finals[i] }, duration: 0.2 }, 0.4 + i * 0.12));
        },
      });
    }
  });
}
