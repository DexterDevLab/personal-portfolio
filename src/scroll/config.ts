/**
 * Scroll choreography settings. Each prop travels down a page margin from
 * the top of `from` and settles beside `to`. Tweak sizes, rotation and the
 * overall intensity here; set `enabled: false` to turn the flying props off.
 */
export type PropId = "wrench" | "screwdriver" | "gear" | "board" | "sheet" | "plug" | "bot";

export interface PropRoute {
  id: PropId;
  /** Selector of the element whose top is where the prop appears. */
  from: string;
  /** Selector of the element the prop settles beside (vertically centred). */
  to: string;
  side: "left" | "right";
  size: number;
  /** Rotation at the start and at rest, degrees. */
  rotate: [number, number];
  /** Horizontal drift while travelling, px (positive = away from the content). */
  drift?: number;
}

export const CHOREOGRAPHY = {
  enabled: true,
  /** Flying props need real margins; below this width they are shown statically. */
  minWidth: 1280,
  /** Scrub smoothing in seconds (0 = locked to the scrollbar). */
  scrub: 0.7,
};

export const PROPS: PropRoute[] = [
  // The screwdriver leaves the lab and heads for the repair station
  { id: "screwdriver", from: "#panda-central", to: "#troubleshooting", side: "right", size: 112, rotate: [-30, 14], drift: 10 },
  // A gear rolls down the left margin and parks by the experiment rack
  { id: "gear", from: "#panda-central", to: "#work", side: "left", size: 88, rotate: [0, 180] },
  // A circuit board turns slowly toward the web-apps station
  { id: "board", from: "#work", to: "#services", side: "left", size: 100, rotate: [10, -6] },
  // A connector follows the cable toward hosting / the process line
  { id: "plug", from: "#services", to: "#process", side: "right", size: 92, rotate: [-8, 4], drift: 8 },
  // A notebook sheet drifts down and settles beside the notebook
  { id: "sheet", from: "#process", to: "#about", side: "right", size: 92, rotate: [8, -3] },
  // The assistant's head waits by the communication station
  { id: "bot", from: "#about", to: "#contact", side: "left", size: 96, rotate: [-6, 3] },
];
