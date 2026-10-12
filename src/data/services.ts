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
      "Marketing sites, online shops, and multilingual sites built on WordPress and WooCommerce, from setup through to launch.",
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
      "Internal tools and web apps when a plugin won't do the job, like Panda Central, the dashboard we use to manage client WordPress sites.",
    icon: "app",
  },
  {
    title: "Hosting, deployment & maintenance",
    description:
      "Server and DNS setup, deployments, updates, backups, and the ongoing care that keeps a site working after launch.",
    icon: "server",
  },
];

export const servicesIntro = "I handle the technical work behind our projects, from development and deployment to troubleshooting and maintenance.";

export const engagementLine = "For new projects or technical support, get in touch and tell me what you need.";
