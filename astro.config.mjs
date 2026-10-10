// @ts-check
import { defineConfig, envField } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Required for the sitemap, canonical URLs, and absolute og:image URLs.
  site: "https://dexteriglesia.com",

  // Everything is prerendered except the contact endpoint and the no-JS
  // contact error page, which opt out with `export const prerender = false`.
  output: "static",
  adapter: vercel(),

  integrations: [
    sitemap({
      // Contact status pages are post-submit destinations, not content.
      filter: (page) => !page.includes("/contact/"),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  redirects: {
    // The Next.js build served /sitemap.xml; @astrojs/sitemap writes an index.
    "/sitemap.xml": { status: 301, destination: "/sitemap-index.xml" },
  },

  env: {
    schema: {
      BREVO_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      CONTACT_EMAIL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
});
