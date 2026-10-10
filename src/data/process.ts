export type ProcessStep = {
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    title: "Understand the requirements",
    description:
      "We talk through what the site or app needs to do, what's broken, and what the constraints are. I ask the technical questions early.",
  },
  {
    title: "Collaborate on design",
    description:
      "If the project needs design, my designer colleague joins and we agree on the layout before I build. If you already have designs, I work from those.",
  },
  {
    title: "Build, debug, and test",
    description:
      "I develop the site or app, test it on real devices and browsers, and track down anything that doesn't behave.",
  },
  {
    title: "Launch and maintain",
    description:
      "I handle hosting, DNS, and deployment, then keep the site updated and backed up after launch.",
  },
];
