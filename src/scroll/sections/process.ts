/**
 * How I work: the orange signal travels along the cable as the section
 * scrolls; the step it has reached is "current", earlier ones "done".
 * Text never fades. Uses whichever cable is visible (wide or narrow).
 */
import { MOTION } from "../motion";
import { followPath, trackSectionPort, type SectionContext } from "../signal";

export function setupProcess(ctx: SectionContext) {
  const section = document.getElementById("process");
  const wrap = section?.querySelector<HTMLElement>("[data-process]");
  if (!section || !wrap) return;
  trackSectionPort(ctx, section, "process");

  const steps = [...wrap.querySelectorAll<HTMLElement>("[data-step]")];
  const cables = [...wrap.querySelectorAll<SVGSVGElement>("[data-process-cable]")];
  const visibleCable = () => cables.find((c) => c.getClientRects().length > 0) ?? null;

  const state = { p: 0 };
  const apply = () => {
    const cable = visibleCable();
    if (cable) {
      const path = cable.querySelector<SVGPathElement>("[data-cable-path]");
      const dot = cable.querySelector<SVGCircleElement>("[data-cable-signal]");
      if (path && dot) followPath(path, dot)(state.p);
    }
    const reached = Math.min(steps.length - 1, Math.floor(state.p * steps.length));
    steps.forEach((step, i) => {
      step.dataset.step = i < reached ? "done" : i === reached ? "current" : "pending";
    });
  };

  ctx.gsap.to(state, {
    p: 1,
    ease: "none",
    onUpdate: apply,
    scrollTrigger: {
      trigger: wrap,
      start: "top 72%",
      end: "bottom 45%",
      scrub: MOTION.scrub,
      onRefresh: apply,
    },
  });
  apply();
}
