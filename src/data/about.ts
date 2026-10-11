/**
 * Shared copy used by both the readable page sections and the lab station
 * panels, so the two never drift apart. Edit text here.
 */
import { site } from "./site";

export const intro = {
  headline: "Websites and web apps, built and maintained.",
  paragraph: `I'm ${site.shortPerson}, a freelance web developer based in the Philippines. I build websites and custom web apps, troubleshoot WordPress and WooCommerce issues, and handle hosting, deployment, and ongoing maintenance. When your project needs design, I collaborate with a designer.`,
  /** One-liner for the lab overlay, where the room is the centrepiece. */
  short: `I'm ${site.shortPerson}, a freelance web developer in the Philippines. I build websites and web apps, solve WordPress and WooCommerce problems, and handle hosting and maintenance.`,
};

export const featuredCopy = {
  problemTitle: "The problem",
  problem:
    "Every client WordPress site needs the same recurring care: core, plugin, and theme updates, backups, uptime checks, and a periodic report. Across many sites, doing that one admin login at a time is slow and easy to get wrong.",
  builtTitle: "What I built",
  built:
    "A self-hosted dashboard that shows every managed site in one place, runs updates as queued background jobs, logs every action and failure, and groups sites by client for reporting. My designer colleague and I shaped the idea; I planned and developed it with substantial AI assistance, and we use it every day.",
};

export const aboutParagraphs = [
  "I've been building websites for over 10 years, starting with WordPress and growing from there into custom web applications. I'm a programmer first: what I enjoy is working out why something doesn't behave, and building the thing that makes it work.",
  `I work with ${site.designer} who brings in clients and handles design; I take projects from setup through development, launch, and maintenance. You can hire me directly or work with the two of us together. It's a two-person collaboration, not an agency.`,
  "AI-assisted development is part of how I work now. I use it to move faster on implementation and to explore approaches, and I take responsibility for reviewing, testing, and shipping what comes out of it. Panda Central is the clearest example: a production tool, built that way.",
];

export const stack = [
  "WordPress",
  "WooCommerce",
  "HTML & CSS",
  "JavaScript",
  "PHP",
  "Next.js & TypeScript",
  "Astro",
  "Git",
  "Vercel",
  "AI-assisted development",
];

/** How a WordPress / WooCommerce problem gets fixed. Shown at the repair bench. */
export const troubleshootingSteps = [
  {
    title: "Reproduce the issue",
    description: "Get the broken checkout, white screen, or error to happen on purpose, on a staging copy when possible.",
  },
  {
    title: "Inspect the errors",
    description: "Turn on WordPress debugging, read debug.log and the browser console, and check recent plugin or theme changes.",
  },
  {
    title: "Identify the cause",
    description: "Narrow it down: a plugin conflict, a theme function, a server limit, or a bad update. Confirm by isolating it.",
  },
  {
    title: "Fix and verify",
    description: "Apply the fix, test the original scenario again, and leave notes so it doesn't come back next update.",
  },
];

export const contactHelp = ["What kind of project it is", "The current problem, if something's broken", "Your intended timeline"];
