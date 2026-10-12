/**
 * Small helpers shared by the section scenes.
 */
import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";
import { MOTION, type ChoreoMode } from "./motion";

export type GsapLib = typeof Gsap;
export type ScrollTriggerLib = typeof ST;

export interface SectionContext {
  gsap: GsapLib;
  ScrollTrigger: ScrollTriggerLib;
  mode: Exclude<ChoreoMode, "static">;
  body: HTMLElement;
  /** Travel distance for assembling parts in this mode. */
  distance: number;
}

/**
 * A short scene that plays once when `trigger` scrolls into view. `init`
 * puts the elements into their starting state (only when the scene will
 * actually play later); `play` runs the animation; `complete` is used when
 * the trigger is already past at setup time (deep link, header jump), so the
 * finished state shows without animating. Scrolling back up never undoes it.
 */
export function entryOnce(
  ctx: SectionContext,
  trigger: Element,
  actions: { init?: () => void; play: () => void; complete?: () => void; start?: string },
) {
  let initialised = false;
  let fired = false;
  ctx.ScrollTrigger.create({
    trigger,
    start: actions.start ?? MOTION.enterLine,
    once: true,
    onEnter: () => {
      fired = true;
      if (initialised) actions.play();
      else actions.complete?.();
    },
  });
  // onEnter fires synchronously inside create() when the start line is already
  // above the current scroll position; then the scene is simply complete.
  if (!fired) {
    actions.init?.();
    initialised = true;
  }
}

/** Move `dot` along `path` as `p` goes 0→1 (SVG user units). */
export function followPath(path: SVGPathElement, dot: SVGCircleElement) {
  const length = path.getTotalLength();
  return (p: number) => {
    const pt = path.getPointAtLength(Math.max(0, Math.min(1, p)) * length);
    dot.setAttribute("cx", pt.x.toFixed(1));
    dot.setAttribute("cy", pt.y.toFixed(1));
  };
}
