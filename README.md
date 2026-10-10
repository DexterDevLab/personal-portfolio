# dexteriglesia.com — DexterDevLab

Personal portfolio of **Dexter Iglesia** (DexterDevLab), a freelance web developer based in the Philippines: websites and web apps, WordPress & WooCommerce troubleshooting, hosting, deployment, and maintenance.

## Stack

- **Astro 7** — static output; one on-demand route (`/api/contact`) and the no-JS contact error page run as Vercel functions via `@astrojs/vercel`
- **Tailwind CSS 4** with CSS-variable design tokens (`light-dark()` for both themes) in `src/styles/global.css`
- **Content collections** for projects (`src/content/work/*.md`), plain TS for site constants and services
- **Zod → Brevo** contact form (progressive enhancement: works without JavaScript)
- **Geist / Geist Mono** self-hosted from `public/fonts`
- `@lucide/astro` icons, `@astrojs/sitemap`, `astro:assets` image optimisation

## Commands

```bash
npm install
cp .env.example .env.local   # add your Brevo API key for local form testing
npm run dev                  # http://localhost:4321
npm run build                # outputs dist/ and .vercel/output/
npm run check                # astro check (types + templates)
npm run brand                # regenerate favicon / og.png from scripts/generate-brand-assets.mjs
```

`astro preview` is not supported with the Vercel adapter; test server routes with `npm run dev` or on a Vercel preview deployment.

## Where to edit things

| What | Where |
|---|---|
| Name, role, email, GitHub, résumé path, page title/description | `src/data/site.ts` |
| Availability badge (show/hide, label) | `src/data/site.ts` → `availability` |
| Response-time promise | `src/data/site.ts` → `responseTime` |
| Navigation links | `src/data/site.ts` → `navLinks` |
| Services (4 cards + engagement line) | `src/data/services.ts` |
| "How I work" steps | `src/data/process.ts` |
| Projects (cards, featured project, case study) | `src/content/work/*.md` — one file per project; frontmatter is validated by `src/content.config.ts` |
| Panda Central case study text | `src/content/work/panda-central.md` (markdown body) |
| Screenshots / portrait | `src/assets/projects/*.jpg`, `src/assets/portrait.jpg` |
| Hero, About, Contact copy | `src/components/sections/*.astro` |
| Colours, fonts, motion, prose styles | `src/styles/global.css` |
| Metadata, favicon links, theme script | `src/layouts/Base.astro` |
| Contact delivery (Brevo) | `src/lib/contact.ts`; messages in `src/lib/contact-messages.ts`; validation in `src/lib/contact-schema.ts` |
| Résumé | `public/resume.pdf` |

### Adding a project

Create `src/content/work/<slug>.md` with the frontmatter fields from `src/content.config.ts` (title, summary, role, stack, screenshot, screenshotAlt, order, …). Set `caseStudy: true` and write a markdown body to get a page at `/work/<slug>`. Exactly one project should have `featured: true`; it appears in the hero and the featured block.

## Environment variables

| Variable | Purpose |
|---|---|
| `BREVO_API_KEY` | Brevo transactional email key (server only). Without it the form returns a "not set up yet" message and nothing is sent. |
| `CONTACT_EMAIL` | Where messages are delivered; must be a verified Brevo sender. Defaults to `site.email`. |

## Deployment

Vercel, auto-deploying from `main`. The Vercel project's **Framework Preset must be set to Astro** (it was Next.js before the migration). Build command `astro build`, output handled by the adapter. Env vars above must be present in the Vercel project.

## History

The original brief and design notes from the first (Next.js) build are kept in [`portfolio-plan.md`](./portfolio-plan.md). Migration notes, verification, and open questions are in [`HANDOFF.md`](./HANDOFF.md).
