/**
 * Site-wide constants. Edit copy, availability, and contact settings here;
 * everything else (header, footer, metadata, JSON-LD, contact form) reads
 * from this object.
 */
export const site = {
  name: "DexterDevLab",
  person: "Dexter Dela Iglesia",
  shortPerson: "Dexter Iglesia",
  role: "Freelance Web Developer",
  url: "https://dexteriglesia.com",
  email: "info@dexteriglesia.com",
  github: "https://github.com/DexterDevLab",
  resume: "/resume.pdf",
  title: "Dexter Iglesia — Freelance Web Developer | DexterDevLab",
  description:
    "Freelance web developer in the Philippines with 10+ years building websites and web apps. WordPress & WooCommerce troubleshooting, custom web apps, hosting, deployment, and ongoing maintenance.",

  /** Hero availability badge. Set `show: false` to hide it. */
  availability: {
    show: true,
    label: "Available for freelance projects",
  },

  /** Response-time promise shown in the contact section. */
  responseTime: "within a day or two",

  /** How the design collaborator is referred to in copy. */
  designer: "a designer colleague",
} as const;

export const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;
