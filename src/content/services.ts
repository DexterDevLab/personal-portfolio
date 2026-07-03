import { Globe, LayoutTemplate, Rocket, Wrench } from "lucide-react";

export type Service = {
  title: string;
  description: string;
  icon: typeof Globe;
};

export const services: Service[] = [
  {
    title: "Website design & build",
    description:
      "Clean, modern, responsive websites, designed to convert and built to load fast and stay easy to manage.",
    icon: LayoutTemplate,
  },
  {
    title: "Web apps (React / Next.js)",
    description:
      "Interactive, modern web applications built with React and Next.js — from idea to deployment.",
    icon: Rocket,
  },
  {
    title: "WordPress development",
    description:
      "Custom WordPress and WooCommerce sites: flexible, maintainable, and tailored to how your business actually works.",
    icon: Globe,
  },
  {
    title: "Redesigns & performance",
    description:
      "Refresh an aging site or speed up a slow one — modern design plus better Core Web Vitals.",
    icon: Wrench,
  },
];

export const engagementLine =
  "Work with me on a fixed-scope project, ongoing care & maintenance, or hourly consulting — and I’m open to the right full-time role.";
