/**
 * How I work: when the section comes into view the signal runs once
 * along the short cable inside the section, and each step lights in order
 * (badge emphasised while current, teal once done). Text never fades. Uses
 * whichever cable is visible (horizontal from lg, a vertical rail below).
 */
import { MOTION } from "../motion";
import { entryOnce, followPath, type SectionContext } from "../signal";

export function setupProcess(ctx: SectionContext) {
  const section = document.getElementById("process");
  const wrap = section?.querySelector<HTMLElement>("[data-process]");
  if (!section || !wrap) return;

  const steps = [...wrap.querySelectorAll<HTMLElement>("[data-step]")];
  const cables = [...wrap.querySelectorAll<SVGSVGElement>("[data-process-cable]")];
  const visibleCable = () => cables.find((c) => c.getClientRects().length > 0) ?? null;
  const dotsAndPaths = cables.map((cable) => ({
    path: cable.querySelector<SVGPathElement>("[data-cable-path]"),
    dot: cable.querySelector<SVGCircleElement>("[data-cable-signal]"),
  }));

  const state = { p: 1 };
  const apply = () => {
    const cable = visibleCable();
    const i = cables.indexOf(cable!);
    const { path, dot } = dotsAndPaths[i] ?? {};
    if (path && dot) followPath(path, dot)(state.p);
    const reached = Math.min(steps.length - 1, Math.floor(state.p * steps.length));
    steps.forEach((step, k) => {
      step.dataset.step = state.p >= 1 || k < reached ? "done" : k === reached ? "current" : "pending";
    });
  };

  entryOnce(ctx, wrap, {
    start: "top 70%",
    init: () => {
      state.p = 0;
      apply();
    },
    play: () => {
      ctx.gsap.to(state, { p: 1, duration: MOTION.entry.duration * 2.4, ease: "power1.inOut", onUpdate: apply });
    },
  });
}
