/**
 * Shared motion settings for the page choreography. Adjust here first.
 *
 * Modes (decided in choreography.ts):
 *  - "full":   ≥ trunkMinWidth, motion allowed — trunk cable in the margin,
 *              scrubbed signals, entry animations.
 *  - "simple": narrower, motion allowed — no trunk (section stubs instead),
 *              shorter entry animations, scrubbed process signal.
 *  - "static": prefers-reduced-motion — GSAP is never loaded; the completed
 *              states are shown and every port reads "done".
 */
export const MOTION = {
  /** The trunk cable needs a real left margin; below this it is not shown. */
  trunkMinWidth: 1280,
  /** Scrub smoothing for the travelling signals, seconds (0 = locked to the scrollbar). */
  scrub: 0.6,
  /** Viewport line (0–1 from the top) the trunk signal follows. */
  signalLine: 0.45,
  /** Where a section counts as "current" for its port: top of the section crosses this viewport line. */
  portLine: "60%",
  /** Where a section-local action starts: the element's top crosses this viewport line. */
  enterLine: "top 78%",
  /** Entry animation lengths, seconds. */
  entry: { duration: 0.9, stagger: 0.08 },
  /** Travel distances for assembling parts, px (CSS px on the SVG's user units). */
  distance: { wide: 14, narrow: 8 },
  /** The one colour that is animated (fills can't tween a CSS variable). */
  colors: { charcoal: "#25252b", teal: "#258f83", orange: "#f58a35", red: "#db5149", off: "#5a5a64" },
} as const;

export type ChoreoMode = "full" | "simple" | "static";
