export type ServiceIcon = "layout" | "wrench" | "app" | "server";

export type Service = {
  title: string;
  description: string;
  /** Maps to a lucide icon in Services.astro. */
  icon: ServiceIcon;
};

export const services: Service[] = [
  {
    title: "Website development",
    description:
      "Marketing sites, shops, and multilingual sites built on WordPress and WooCommerce. I develop from start to finish; when a project needs design, I collaborate with a designer.",
    icon: "layout",
  },
  {
    title: "WordPress & WooCommerce troubleshooting",
    description:
      "Broken checkouts, plugin conflicts, white screens, slow pages. I reproduce the problem, turn on WordPress debugging, read debug.log, and fix the cause instead of the symptom.",
    icon: "wrench",
  },
  {
    title: "Custom web applications",
    description:
      "Internal tools and web apps when a plugin won't cut it, like Panda Central, the platform I built to manage our client WordPress sites.",
    icon: "app",
  },
  {
    title: "Hosting, deployment & maintenance",
    description:
      "Server and DNS setup, deployments, updates, backups, and the ongoing care that keeps a site working after launch.",
    icon: "server",
  },
];

export const engagementLine =
  "Hire me directly, or work with my designer colleague and me as a two-person team. Fixed-scope projects, ongoing maintenance, or hourly troubleshooting.";
