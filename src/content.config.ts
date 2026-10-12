import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Projects shown on the homepage. One markdown file per project in
 * `src/content/work/`. Only entries with `caseStudy: true` get their own
 * page at `/work/<file-name>` (the markdown body is the case study).
 */
const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One-line description shown on the card. */
      summary: z.string().max(240),
      /** Very short label (a few words) used under the hero preview. */
      tagline: z.string().max(80).optional(),
      /** What Dexter did on the project (shown on the card). */
      role: z.string(),
      /** Who handled design, if not Dexter. Omitted = not shown. */
      design: z.string().optional(),
      stack: z.array(z.string()).min(1),
      screenshot: image(),
      /** Alt text for the screenshot. */
      screenshotAlt: z.string(),
      liveUrl: z.url().optional(),
      /** Lower numbers appear first. */
      order: z.number().int(),
      /** Featured project: hero visual + the featured block. Exactly one. */
      featured: z.boolean().default(false),
      /** Build a page at /work/<id> from the markdown body. */
      caseStudy: z.boolean().default(false),
      status: z.enum(["live", "in-progress", "private"]).default("live"),
      /** Short status line for the case-study header. */
      statusLabel: z.string().optional(),
    }),
});

export const collections = { work };
