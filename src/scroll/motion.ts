/**
 * Shared motion settings for the section scenes. Adjust here first.
 *
 * Modes (decided in choreography.ts):
 *  - "full":   ≥ wideMinWidth, motion allowed — full travel distances.
 *  - "simple": narrower, motion allowed — shorter distances.
 *  - "static": prefers-reduced-motion — GSAP is never loaded; the completed
 *              states in the markup are shown as they are.
 */
export const MOTION = {
  /** Below this width scenes use the shorter "simple" distances and the page robot stays home (it needs the ≥1280px margin; see PageRobot.astro). */
  wideMinWidth: 1280,
  /** Where a scene starts: the element's top crosses this viewport line. */
  enterLine: "top 78%",
  /** Entry animation lengths, seconds. */
  entry: { duration: 0.9, stagger: 0.08 },
  /** Travel distances for assembling parts (SVG user units / px). */
  distance: { wide: 14, narrow: 8 },
  /** The one colour that is animated (fills can't tween a CSS variable). */
  colors: { charcoal: "#25252b", teal: "#258f83", orange: "#f58a35", red: "#db5149", off: "#5a5a64" },
} as const;

export type ChoreoMode = "full" | "simple" | "static";
