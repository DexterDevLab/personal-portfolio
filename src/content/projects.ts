export type Project = {
  slug: string;
  name: string;
  blurb: string;
  tags: string[];
  /** Live URL — omit for private/internal products (card renders without a link). */
  url?: string;
  image: string;
};

export const projects: Project[] = [
  {
    slug: "panda-central",
    name: "Panda Central",
    blurb:
      "A self-hosted platform managing 40+ client WordPress sites from one dashboard — automated updates, backups, uptime & vulnerability monitoring, and white-labeled client reports.",
    tags: ["Next.js", "TypeScript", "BullMQ", "Postgres"],
    url: "https://manager.pandavisuals.cloud/",
    image: "/images/projects/panda-central.jpg",
  },
  {
    slug: "kaufbeiuns",
    name: "Kaufbeiuns",
    blurb:
      "A large-scale B2B shop for an electronics & IT wholesaler, built to handle a deep catalog across 100+ brands.",
    tags: ["WordPress", "WooCommerce", "B2B"],
    url: "https://www.kaufbeiuns.de/",
    image: "/images/projects/kaufbeiuns.jpg",
  },
  {
    slug: "glanzstueck",
    name: "Glanzstück",
    blurb:
      "A rental platform for an events-equipment company — WooCommerce reshaped into a clean “rent, don’t buy” experience.",
    tags: ["WordPress", "WooCommerce", "Rental"],
    url: "https://www.glanzstueck-verleih.de/",
    image: "/images/projects/glanzstueck.jpg",
  },
  {
    slug: "mr-saddle-fitting",
    name: "MR Saddle Fitting",
    blurb:
      "A trilingual site for a specialist equestrian saddle-fitter, with a crisp black-and-white design.",
    tags: ["WordPress", "WPML", "Multilingual"],
    url: "https://www.mrsaddlefitting.com/",
    image: "/images/projects/mr-saddle-fitting.jpg",
  },
  {
    slug: "luxury-lashshop",
    name: "Luxury Lashshop",
    blurb:
      "A luxury beauty brand’s shop, training courses, and portfolio in one polished, conversion-focused site.",
    tags: ["WordPress", "WooCommerce", "Elementor"],
    url: "https://www.luxury-lashshop.de/",
    image: "/images/projects/luxury-lashshop.jpg",
  },
  {
    slug: "kuechen-galerie",
    name: "Küchen-Galerie",
    blurb:
      "A showroom site for a custom-kitchen studio, pairing premium-brand presentation with an embedded 3D planner.",
    tags: ["WordPress", "Showroom"],
    url: "https://www.kuechen-for-you.de/",
    image: "/images/projects/kuechen-galerie.jpg",
  },
];
