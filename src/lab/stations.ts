/**
 * Station catalogue shared by the Astro markup (station list, panels) and
 * the Three.js runtime. No Three imports here so the UI layer stays light.
 */
export type StationId = "console" | "experiments" | "repair" | "servers" | "notebook" | "comms";

export interface StationMeta {
  id: StationId;
  index: number;
  /** Short name on the station button. */
  label: string;
  /** What it opens. */
  subtitle: string;
  /** Panel eyebrow. */
  eyebrow: string;
  /** Panel title. */
  title: string;
  /** URL hash that deep-links to this station (distinct from the page section anchors). */
  hash: `#${string}`;
  /** Section id to scroll to in page view. */
  pageAnchor: string;
}

export const STATIONS: StationMeta[] = [
  {
    id: "console",
    index: 1,
    label: "Control console",
    subtitle: "Panda Central, the featured project",
    eyebrow: "Main control console",
    title: "Panda Central",
    hash: "#lab/console",
    pageAnchor: "panda-central",
  },
  {
    id: "experiments",
    index: 2,
    label: "Client sites",
    subtitle: "Selected client work",
    eyebrow: "Selected client work",
    title: "Websites I've built with PandaVisuals",
    hash: "#lab/experiments",
    pageAnchor: "work",
  },
  {
    id: "repair",
    index: 3,
    label: "Repair bench",
    subtitle: "WordPress & WooCommerce troubleshooting",
    eyebrow: "Repair bench",
    title: "Troubleshooting, fixed at the cause",
    hash: "#lab/repair",
    pageAnchor: "services",
  },
  {
    id: "servers",
    index: 4,
    label: "Server cabinet",
    subtitle: "Hosting, deployment, maintenance, and other services",
    eyebrow: "Server cabinet",
    title: "Services",
    hash: "#lab/servers",
    pageAnchor: "services",
  },
  {
    id: "notebook",
    index: 5,
    label: "Lab notebook",
    subtitle: "About me and how I work",
    eyebrow: "Lab notebook",
    title: "The developer behind DexterDevLab",
    hash: "#lab/notebook",
    pageAnchor: "about",
  },
  {
    id: "comms",
    index: 6,
    label: "Comms terminal",
    subtitle: "Contact: discuss your project",
    eyebrow: "Communication terminal",
    title: "Discuss your project",
    hash: "#lab/comms",
    pageAnchor: "contact",
  },
];

export const STATION_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s])) as Record<StationId, StationMeta>;

export const HASH_TO_STATION: Record<string, StationId> = Object.fromEntries(
  STATIONS.map((s) => [s.hash, s.id]),
);

export function isStationId(value: unknown): value is StationId {
  return typeof value === "string" && value in STATION_BY_ID;
}
