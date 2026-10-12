export type ProcessStep = {
  /** Short name on the marker. */
  short: string;
  title: string;
  description: string;
};

export const processIntro =
  "Most projects follow this path. Troubleshooting work usually skips straight to diagnosis and a fix.";

export const processSteps: ProcessStep[] = [
  {
    short: "Requirements",
    title: "Understand the project",
    description: "What the site or app needs to do, what's currently broken, and the technical constraints. I ask the technical questions early.",
  },
  {
    short: "Design",
    title: "Coordinate on design",
    description: "I work with PandaVisuals on the design and what it needs from the build, so the layout and the implementation line up before development starts.",
  },
  {
    short: "Development",
    title: "Build, debug, and test",
    description: "I develop the site or app, test it on real devices and browsers, and track down anything that doesn't behave.",
  },
  {
    short: "Launch & maintain",
    title: "Deploy and keep it running",
    description: "Hosting, DNS, and deployment, then updates, backups, and technical care after launch.",
  },
];
