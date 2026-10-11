/**
 * Small helpers shared by the section timelines.
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

export type PortState = "pending" | "active" | "done";

/** Every port for a section (trunk socket and heading stub) shows the same state. */
export function setPortState(id: string, state: PortState) {
  document.querySelectorAll<Element>(`[data-signal-port="${id}"]`).forEach((el) => {
    el.setAttribute("data-signal", state);
  });
}

/**
 * Port states follow the visitor: a section is "active" while its top is
 * above the port line and its bottom below it, "done" once passed, and
 * "pending" again when scrolled back above. Reversible on purpose.
 */
export function trackSectionPort(ctx: SectionContext, section: Element, id: string) {
  ctx.ScrollTrigger.create({
    trigger: section,
    start: `top ${MOTION.portLine}`,
    end: `bottom ${MOTION.portLine}`,
    onEnter: () => setPortState(id, "active"),
    onLeave: () => setPortState(id, "done"),
    onEnterBack: () => setPortState(id, "active"),
    onLeaveBack: () => setPortState(id, "pending"),
  });
}

/**
 * A short action that plays once when `trigger` scrolls into view. `init`
 * puts the elements into their starting state (only when the action will
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
  // above the current scroll position; then the action is simply complete.
  if (!fired) {
    actions.init?.();
    initialised = true;
  }
}

/** Move `dot` along `path` as `state.p` goes 0→1 (SVG user units). */
export function followPath(path: SVGPathElement, dot: SVGCircleElement) {
  const length = path.getTotalLength();
  return (p: number) => {
    const pt = path.getPointAtLength(Math.max(0, Math.min(1, p)) * length);
    dot.setAttribute("cx", pt.x.toFixed(1));
    dot.setAttribute("cy", pt.y.toFixed(1));
  };
}

/** Put the dot at the end of its path (the finished state). */
export function parkAtEnd(path: SVGPathElement, dot: SVGCircleElement) {
  followPath(path, dot)(1);
}
