# dexteriglesia.com — DexterDevLab

Personal portfolio of **Dexter Dela Iglesia** (DexterDevLab) — a frontend developer with 10+ years building fast, modern websites and web apps for businesses, agencies, and startups.

Premium-minimal, dark-first, single-page site built as both a client-facing portfolio and a living proof of React/Next.js capability.

## Stack

- **Next.js 16** (App Router, TypeScript, RSC, fully static)
- **Tailwind CSS v4** with CSS-variable design tokens (dark + light themes)
- **Framer Motion** — subtle scroll reveals, `prefers-reduced-motion` respected
- **Radix UI** (accessible mobile drawer) · **lucide-react** icons
- **React Hook Form + Zod → Brevo API** contact form (server action, honeypot, zero-dependency fetch)
- **Geist Sans / Geist Mono** via `next/font`

## Getting started

```bash
npm install
cp .env.example .env.local   # add your Brevo API key
npm run dev
```

## Content

All content is typed local data in `src/content/` — projects, services, skills, and testimonials. Site-wide constants (name, domain, email, GitHub) live in `src/lib/site.ts`.

To-do before launch:

- [ ] Drop `resume.pdf` into `/public`
- [ ] Add 2–3 testimonials to `src/content/testimonials.ts` (section auto-appears)
- [ ] Set `BREVO_API_KEY` in Vercel env (sender email must be verified in Brevo)

## Plan

The full PRD / design brief that guided this build is in [`portfolio-plan.md`](./portfolio-plan.md).
