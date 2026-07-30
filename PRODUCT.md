# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Prospective clients evaluating a freelance frontend developer to hire — weighted **equally** across three audiences:

- **Small & local businesses** — owners who want a fast, modern site and value reliability over jargon.
- **Agencies** — studios looking to subcontract frontend / overflow work to a dependable dev (white-label capable).
- **Startups** — founders needing polished product UI and web apps shipped quickly.

Typical situation: a visitor lands on dexteriglesia.com, skims the work and services, and decides whether to reach out. The job to be done is "decide whether Dexter is the right person to build/fix my website or web app, then make contact."

## Product Purpose

A personal portfolio for **Dexter Iglesia** (brand: **DexterDevLab**) that converts visitors into qualified freelance inquiries by demonstrating credibility, range, and craft. Success = a contact-form submission (or résumé download / GitHub visit) from a real prospect.

## Positioning

Lead differentiator: an **AI-accelerated workflow** — modern tools plus AI to ship polished, fast websites and web apps faster than a typical freelancer. This is substantiated (not a gimmick) by 10+ years of experience and a real production platform, so the claim reads as "faster *and* dependable," never "cheap shortcut."

## Operating Context

- Single-page site at **dexteriglesia.com**. Work, Services, About, and Contact are scroll-anchor sections on `/`, not separate routes (Search Console correctly reports one indexed page).
- Contact runs through a **Brevo**-powered form delivering to **info@dexteriglesia.com** (MX/SPF/DKIM live). This flow must keep working.
- A downloadable **résumé** is served at `public/resume.pdf`.
- Deployed on Vercel, auto-deploying on push to `main`.

## Capabilities and Constraints

- **Services presented:** Website design & build · Web apps (React / Next.js) · WordPress development · Redesigns & performance.
- **Work section:** 7 real projects.
- **Tech constraint:** built on a modified Next.js 16 — per AGENTS.md, read `node_modules/next/dist/docs/` before writing framework code.
- **Motion is intentionally capped** (aurora glow + cursor spotlight + scroll reveals only); do not add more without cause.
- **Performance is a hard constraint, not a nice-to-have** — the live site is PSI mobile ~99 / LCP ~1.5s. Above-the-fold content must not reintroduce framer-motion, backdrop-blur, or opacity-entrances that regressed LCP previously.

## Brand Commitments

- **Wordmark:** DexterDevLab. **Person:** Dexter Dela Iglesia (short: Dexter Iglesia). **Role:** Frontend Developer.
- **Colors:** accent `#4f7cff`, near-black background `#0a0a0b`. **Type:** Geist (sans) / Geist Mono (mono wordmark).
- **Contact identity:** info@dexteriglesia.com · GitHub DexterDevLab.
- **Copy claims to preserve as-is:** "10+ years" building sites, Philippines-based / working worldwide, available for freelance projects.

## Evidence on Hand

- **`public/resume.pdf`** — real résumé backing the 10+ years claim (keep in sync with any copy changes).
- **7 real projects** in the work section.
- **Panda Central** (manager.pandavisuals.cloud; private repo DexterDevLab/wp-management) — a real Next.js/TS/BullMQ/Postgres platform managing 40+ client WordPress sites; the flagship proof that Dexter builds real systems, not just brochure sites.
- **No testimonials yet** — `src/content/testimonials.ts` is an empty array and the section only renders when real entries are added. Future work must **not fabricate** testimonials, clients, metrics, or press.

## Product Principles

1. **Every choice serves the inquiry.** Credibility and clarity over decoration; the page exists to earn a contact.
2. **Truthful and verifiable.** Real experience, real projects, real platform — never invent testimonials, clients, or numbers.
3. **The site is the sample.** It must itself exemplify the fast, modern craft it sells; performance regressions undermine the pitch.
4. **One message, broad reach.** Serve businesses, agencies, and startups without diluting the AI-accelerated-yet-dependable positioning.
5. **Brand and confirmed copy are fixed authority.** Preserve wordmark, palette, type, and existing claims unless the user changes them.

## Accessibility & Inclusion

No formal standard was set as a product requirement. Baseline good practice is already in the code (visible focus rings, AA-passing accent for button text, reduced-motion fallbacks) and should be maintained as a floor.
