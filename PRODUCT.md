# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Prospective clients evaluating a freelance web developer to hire:

- **Small and local businesses** that need a site built, fixed, or kept running.
- **Agencies and designers** looking for a dependable developer to handle the build side.
- **Founders and teams** that need a custom web app or an internal tool.

Typical situation: a visitor lands on dexteriglesia.com, skims the work and services, and decides whether to reach out. The job to be done is "decide whether Dexter is the right person to build, fix, or maintain my website or web app, then make contact."

## Product Purpose

A personal portfolio for **Dexter Iglesia** (brand: **DexterDevLab**) that converts visitors into freelance inquiries by showing real work, a clear offer, and a practical, persistent way of working. Success = a contact-form submission or direct email from a real prospect.

## Positioning

**Freelance web developer who builds, troubleshoots, launches, and maintains websites and web apps.** Strongest in WordPress/WooCommerce, HTML/CSS/JavaScript, some PHP; building custom web apps (Panda Central is the proof). Works with a designer colleague when a project needs design; clients can hire Dexter directly or the two of them as a team.

AI-assisted development is part of the workflow and is stated plainly, but it is a supporting theme, not the headline. Do not position Dexter as a graphic designer, branding expert, agency, or an expert in technologies the work doesn't substantiate.

## Operating Context

- Homepage at **dexteriglesia.com** has two views of the same content: an explorable cartoon **inventor's laboratory** (Three.js, six stations: control console = Panda Central, experiments = client work, repair bench = troubleshooting, server cabinet = services, notebook = about, comms terminal = contact) and a readable **page view** with anchor sections (`#work`, `#services`, `#about`, `#contact`). Lab is the default on wide WebGL-capable screens; page is the default on phones, without WebGL, and without JS. Plus one case-study route, `/work/panda-central`.
- The lab is an original design (Dexter's-Laboratory *mood*, no copied characters, props, or branding) and an enhancement, never the only way to reach content.
- Contact runs through a **Brevo**-powered form delivering to **info@dexteriglesia.com**. Works without JavaScript (server redirect to a status page). This flow must keep working.
- A downloadable **résumé** is served at `/resume.pdf`.
- Deployed on Vercel, auto-deploying on push to `main`.

## Capabilities and Constraints

- **Services presented:** Website development (with designer collaboration) · WordPress & WooCommerce troubleshooting · Custom web applications · Hosting, deployment & maintenance.
- **Work section:** 1 featured project (Panda Central, with case study) + 5 client WordPress sites credited as "Development · Design by a designer colleague".
- **Tech constraint:** Astro 7, static output, no UI framework; see `AGENTS.md`.
- **Motion is intentionally capped.** Page view: aurora glow, scroll reveals, a light hero-frame tilt on hover. Lab: restrained ambient life (robot, arm, console links, LEDs, flask, beacon), camera travel on selection, the repair sequence; no camera sway, flashes, particles, audio, or scroll hijacking. Everything respects `prefers-reduced-motion`.
- **Lab performance budget:** DPR ≤ 2 (1.5 narrow), no shadow maps or postprocessing, draw calls well under 150, render on demand, pause when hidden.
- **Performance is a hard constraint.** The hero image is the LCP element and loads eagerly; nothing above the fold waits for JavaScript; no backdrop-blur or opacity entrances above the fold.

## Brand Commitments

- **Wordmark:** DexterDevLab. **Person:** Dexter Dela Iglesia (short: Dexter Iglesia). **Role:** Freelance Web Developer.
- **Colors:** accent `#4f7cff`, near-black background `#0a0a0b`; light theme is a first-class citizen. **Type:** Geist (sans) / Geist Mono (mono wordmark and section kickers).
- **Section kickers** (mono uppercase labels) are a deliberate brand element — keep them.
- **Contact identity:** info@dexteriglesia.com · GitHub DexterDevLab.
- **Copy claims to preserve:** "10+ years", Philippines-based / working worldwide, "Available for freelance projects" (configurable in `src/data/site.ts`).

## Evidence on Hand

- **`public/resume.pdf`** backs the 10+ years claim.
- **Panda Central** (manager.pandavisuals.cloud, login-gated) — real internal web app managing client WordPress sites; one dashboard screenshot on hand. Backups / uptime / vulnerability monitoring are described features carried over from earlier copy, not visible in the screenshot.
- **5 real client sites** with live URLs and screenshots.
- **No testimonials, metrics, logos, awards, or certifications** — never fabricate them. No empty testimonial sections.

## Product Principles

1. **Every choice serves the inquiry.** Clarity and credibility over decoration.
2. **Truthful and verifiable.** Real projects, real contribution, honest about AI assistance and collaboration.
3. **The site is the sample.** Fast, accessible, and maintainable, because that is what's being sold.
4. **Easy to maintain.** Content lives in markdown and small TS files; no CMS.
5. **Brand and confirmed copy are fixed authority.** Preserve wordmark, palette, type, and existing claims unless the user changes them.

## Accessibility & Inclusion

Baseline: semantic HTML and heading hierarchy, keyboard-accessible navigation and dialog, visible focus rings, labelled form fields with inline validation, meaningful alt text, AA contrast in both themes, 44px touch targets, reduced-motion fallbacks, no hover-only information.
