/**
 * Site-wide constants. Edit copy, availability, and contact settings here;
 * everything else (header, footer, metadata, JSON-LD, contact form) reads
 * from this object.
 */
export const site = {
  name: "DexterDevLab",
  person: "Dexter Dela Iglesia",
  shortPerson: "Dexter Iglesia",
  role: "Web Developer",
  url: "https://dexteriglesia.com",
  email: "info@dexteriglesia.com",
  github: "https://github.com/DexterDevLab",
  resume: "/resume.pdf",
  title: "Dexter Iglesia — Web Developer | DexterDevLab",
  description:
    "Web developer in the Philippines working with PandaVisuals: WordPress and WooCommerce development and troubleshooting, custom web apps, hosting, deployment, and ongoing maintenance.",

  /** Hero availability badge. Set `show: false` to hide it. */
  availability: {
    show: true,
    label: "Available for new projects",
  },

  /** Response-time promise shown in the contact section. */
  responseTime: "within a day or two",

  /** The design partner. Copy mentions the name; PartnerText.astro links it. */
  partner: { name: "PandaVisuals", url: "https://www.pandavisuals.de/" },
} as const;

export const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;
