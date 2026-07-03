# Portfolio Plan — Dexter Dela Iglesia (DexterDevLab)

> **Status:** 🟢 Planning COMPLETE & content-ready — strategy, design system, architecture, SEO/a11y/perf, homepage wireframe, 6 real projects + blurbs, full section copy, domain (dexteriglesia.com), GitHub (DexterDevLab) all decided. Awaiting only: user greenlight to build + hand-off assets (résumé PDF, portrait, optional testimonials/metrics).
> **Type:** Living document (PRD + UX spec + design brief + content strategy + tech architecture)
> **Owner:** Dexter Dela Iglesia — Frontend Developer
> **Last updated:** 2026-07-02

> **Note on file location:** During the planning phase this document lives at the Claude plan path.
> Once we exit planning and begin implementation, it will be copied into the repo as `portfolio-plan.md`.

---

## Context (why we're building this)
Dexter is an experienced (5+ yrs), self-employed frontend developer based in the Philippines whose real, shipped work is a strong set of **WordPress/WooCommerce client sites** across many industries, with a growing React/Next.js skill set and an AI-accelerated workflow. He has **no dedicated portfolio** to convert interest into freelance inquiries or to present a credible, modern profile to agencies/startups. This project builds a **premium-minimal, client-first portfolio** (brand: **DexterDevLab**, domain: **dexteriglesia.com**) that (1) generates freelance/client inquiries, (2) presents an honest, confident professional profile, and (3) is itself proof of React/Next.js capability (clean, public Next.js repo). Intended outcome: a memorable, fast, accessible one-page-plus site that makes his value obvious in 5 seconds. Planning was completed via an 8-round interview (see Interview Log); user has greenlit the build.

## 0. How to read this document
This document evolves through the interview. Nothing is overwritten — decisions are appended and refined.
Sections marked `⏳ TBD` are pending answers. Sections marked `✅` are decided. `💡` marks a panel recommendation.

---

## 1. Project Overview
- **Person:** Dexter Dela Iglesia
- **Brand:** DexterDevLab (working) — vs. personal name (TBD, see Q1)
- **Profession:** Frontend Developer
- **Focus areas (stated):** Modern web apps, UI/UX, performance, automation, AI-assisted development, clean engineering.
- **Goal:** A memorable, premium, highly interactive portfolio that immediately demonstrates frontend skill.
- **Explicit constraint:** Plan fully before any code is written.

---

## 2. Goals & Success Metrics ✅
- **Primary goal:** Generate **freelance/client inquiries** ("work with me"), while presenting a clean, credible profile that startups/recruiters also respect.
- **Secondary goal:** Serve as durable long-term personal brand hub (no deadline) and as living proof of React/Next.js capability.
- **Success signals:** contact-form/email inquiries · résumé downloads · time-on-site & project-card engagement · quality of inbound (right-fit clients) · this repo as a shareable code sample.

---

## 3. Personal Branding 🟡 (direction decided)
- **Experience framing ✅ (corrected in Round 7):** **5+ years, self-employed/freelance.** Upgrade from Round 1's "mid-level" guess — we can confidently say *"5+ years building websites for clients."* Established, credible freelancer (WordPress-heavy), now expanding into modern React/Next.js. Tone: confident + warm, no overclaiming on React seniority specifically.
- **Career strategy ✅ (panel call, user asked us to decide):** **Freelance/client work now → build toward React/Next.js employability later.** One "bridge" identity serves both; long runway = build real depth, don't fake seniority.
- **Public positioning ✅ (Position A):** *"Frontend developer who designs and builds fast, modern websites and web apps."*
  - True today (covers WordPress + React), grows toward React over time, serves both audiences, no overclaiming.
  - WordPress = present strength/revenue (client path). React/Next.js = growth edge (this site + 1 flagship = proof).
- **AI-assisted angle ✅:** **Supporting theme, not headline.** Framing: *"I ship fast by pairing AI leverage with real engineering judgment."* One-line/one-section treatment.
- **React/Next.js truthful claim level ✅:** "Shipped 1–2 real Next.js/React apps (AI-assisted); actively deepening." This site's code is Exhibit A.
- **Brand name ✅:** **DexterDevLab** (studio-style wordmark) as the visual logo. Signals a service/brand → reinforces freelance/client tilt.
- **Domain ✅:** **dexteriglesia.com** (personal name; canonical `https://dexteriglesia.com/` — apex primary, www redirects to apex).
- **Brand/domain reconciliation ✅:** logo/wordmark = **"DexterDevLab"**; person name = **"Dexter Iglesia"** (used in `<title>`, About, footer, JSON-LD `Person`). Personal-name domain = better SEO + human trust; studio wordmark = brand feel. Best-of-both.
- **Voice ✅:** **Calm & confident + Warm & human** = "premium but approachable / a pro you'd enjoy working with." Short, precise, first-person, no hype.
- **⚑ Emphasis correction (panel, Round 4):** User chose a studio brand + targets = SMB + agencies + startups, and did NOT select "established tech companies." → Real center of gravity is **client/freelance work**, startup-friendly as bonus. **Flip Round 1's "recruiters-first" to "client/'work-with-me'-first, with a clean profile startup recruiters also respect."** (Pending explicit confirmation.)

## 4. Audience & Positioning ✅ (Round 1)
- **Primary audience:** Both — **recruiters weighted first**, with a lightweight "work with me" path for freelance/agency clients.
- **Design implication:** Optimize for recruiter's 5-second scan (clear specialization, skimmable proof, obvious resume + contact), then a secondary CTA path for client work.
- **Primary conversion goals:** (1) recruiter → contact/resume; (2) client → "work with me" inquiry.
- **Target segments ✅ (Round 4):** SMB / local businesses · digital agencies/studios · startups/small product teams. (Established big-tech NOT targeted → confirms client/freelance tilt.)
- **Location/market ✅ (Round 6):** **Philippines-based, local + remote.** → Local PH SEO keywords + strong remote/global positioning + timezone-flexibility note.
- **Differentiator / superpower ✅:** **Speed — ships polished work fast** (AI-accelerated + practical focus). Lead differentiator in hero/about.
- **Testimonials ✅:** none yet, **will request** → build section but hide until 2–3 collected (see outreach template §14.1).
- **Featured work reality ✅:** **mostly WordPress client sites** → present honestly as real client work (screenshot + live link + role + stack). React/Next.js proven by this site (+ optional flagship later).

### Aesthetic Direction ✅ (Round 1)
- **Chosen:** **Premium minimal — Linear / Vercel school.** Dark-first, restrained palette (1 accent), precise typography, subtle motion, generous whitespace, crisp cards, mono touches.
- **Rationale:** Strongest "senior, tasteful, product-minded" signal for a frontend dev; lowest risk of style-over-substance.

### Scope Direction ✅ (Round 1)
- **Chosen:** **Focused & sharp** — one long-scroll home + dedicated Projects + 2–3 case studies + About + downloadable resume.
- **v1 sitemap seed:** `/` (long-scroll home) · `/projects` · `/projects/[slug]` (case studies) · `/about` · `resume.pdf`. Blog/Uses/Speaking = optional later (see §17).

## 4b. Confirmed Strategy (end of Round 4) ✅
- **Emphasis:** **Client / "work-with-me" first** (DexterDevLab studio), with a clean honest profile startups also respect. Primary CTA = *Work with me*; secondary = *View work* / *Resume*.
- **Proof style:** **Visual gallery + short blurbs** (polished project cards, light descriptions, live links). _Panel note: keep the door open to promote 1 project into a deeper flagship case study later._
- **v1 sections (confirmed):** Hero · Services/What I do · Featured work (gallery) · Tech stack/Skills · Testimonials · About · Contact + Resume download.
- **Still needed from user:** real project inventory; live domain.

## 5. Sitemap & Information Architecture 🟡 (v1 draft)
Given "focused & sharp" + client-first, v1 is a **long-scroll home** plus light subpages:
```
/                     Long-scroll home:
                        1. Hero (positioning + primary CTA)
                        2. Services / What I do
                        3. Featured work (gallery + blurbs)
                        4. Tech stack / Skills
                        5. Testimonials
                        6. About (condensed) 
                        7. Contact + Resume
/work        (optional) Full project gallery if home grid overflows
/work/[slug] (optional) Individual project / future flagship case study
/about       (optional) Longer about, if home section isn't enough
resume.pdf   Downloadable résumé
```
Nav (sticky, minimal): Work · Services · About · Contact + **Resume** button. Mobile: hamburger/drawer.

## 5c. Homepage Wireframe (v1 — desktop; responsive notes below) ✅
```
┌──────────────────────────────────────────────────────────────────────┐
│  DexterDevLab            Work  Services  About  Contact   [ Résumé ]  ☾ │  ← sticky nav, blur on scroll
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   DexterDevLab — Frontend Developer            (mono eyebrow)          │
│                                                                        │
│   I build fast, modern                          ◜ subtle aurora glow ◞ │
│   websites and web apps.                        (accent, very low op)  │
│                                                                        │
│   I'm Dexter Iglesia — 5+ years building sites for clients.            │
│   Businesses, agencies & startups. PH-based, working worldwide.        │
│                                                                        │
│   [ Work with me ]   [ View my work ]      ● Available for freelance   │
│                                                                        │
├──────────────────────────────────────────────────────────────────────┤
│   WHAT I DO                                              (section head) │
│   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────┐ │
│   │ Website design│ │ Web apps      │ │ WordPress     │ │ Redesigns │ │
│   │ & build       │ │ React/Next.js │ │ development   │ │ & perf    │ │
│   │ 1-line value  │ │ 1-line value  │ │ 1-line value  │ │ 1-line    │ │
│   └───────────────┘ └───────────────┘ └───────────────┘ └───────────┘ │
│   Project · retainer · hourly — and open to the right full-time role.  │
├──────────────────────────────────────────────────────────────────────┤
│   SELECTED WORK                                         (section head)  │
│   ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐ │
│   │ [screenshot]       │  │ [screenshot]       │  │ [screenshot]     │ │
│   │ Kaufbeiuns         │  │ Glanzstück         │  │ MR Saddle Fitting│ │
│   │ blurb · tags · ↗   │  │ blurb · tags · ↗   │  │ blurb · tags · ↗ │ │
│   └────────────────────┘  └────────────────────┘  └──────────────────┘ │
│   ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐ │
│   │ Luxury Lashshop    │  │ Küchen-Galerie     │  │ Perlenweiss      │ │
│   └────────────────────┘  └────────────────────┘  └──────────────────┘ │
│                         More work available on request →               │
├──────────────────────────────────────────────────────────────────────┤
│   TECH & TOOLS                                          (section head)  │
│   Core: React · Next.js · TypeScript · Tailwind                        │
│   CMS:  WordPress · WooCommerce · Elementor                            │
│   Workflow: Git · Figma · AI-assisted dev · Vercel                    │
│   (grouped mono badges; honest "growing" group if useful)              │
├──────────────────────────────────────────────────────────────────────┤
│   WHAT CLIENTS SAY   (hidden until 2–3 real quotes gathered)           │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                   │
│   │ "quote…"     │ │ "quote…"     │ │ "quote…"     │                   │
│   │ — Name, Co.  │ │ — Name, Co.  │ │ — Name, Co.  │                   │
│   └──────────────┘ └──────────────┘ └──────────────┘                   │
├──────────────────────────────────────────────────────────────────────┤
│   ABOUT                                                                 │
│   ┌────────────┐   For over 5 years I've helped businesses get         │
│   │ [portrait] │   online with clean, modern websites…                 │
│   │            │   Reliable · clear communication · fast delivery.      │
│   └────────────┘   WordPress → React/Next.js + AI-accelerated workflow. │
├──────────────────────────────────────────────────────────────────────┤
│   LET'S BUILD SOMETHING.                                                │
│   Have a project in mind? Send a message — reply within a day or two.   │
│   ┌───────────────────────────┐   Direct: email · LinkedIn · GitHub    │
│   │ Name                      │   [ Download résumé ]                   │
│   │ Email                     │                                        │
│   │ Message                   │                                        │
│   │            [ Send ]       │                                        │
│   └───────────────────────────┘                                        │
├──────────────────────────────────────────────────────────────────────┤
│  DexterDevLab   ·  Work Services About Contact  ·  in gh  · © 2026     │
│  "Designed & built by Dexter Iglesia with Next.js."                    │
└──────────────────────────────────────────────────────────────────────┘
```
### Wireframe / layout & responsive notes
- **Grid:** 12-col, container ~1120–1200px, section padding 96–128px (desktop) / 64px (mobile).
- **Nav:** sticky, transparent→blurred bg on scroll; Résumé is the one accent button; mobile → hamburger drawer.
- **Hero:** left-aligned text, generous whitespace, aurora glow behind (pure decoration, `aria-hidden`). Single `h1`.
- **Services:** 4 cards desktop → 2×2 tablet → 1-col mobile. Optional bento (one card spans 2) for visual rhythm.
- **Selected work:** 3-col → 2-col → 1-col; card hover = lift + border→accent + image subtle zoom. Screenshots captured from live sites (16:10), `next/image`.
- **Tech:** grouped mono badges, wrap fluidly; no skill "percentage bars" (cliché).
- **Testimonials:** section rendered only when data exists; 3-col → 1-col; optional slow marquee.
- **About:** 2-col (portrait + text) → stacked on mobile; portrait rounded, subtle border.
- **Contact:** 2-col (form + direct links) → stacked; inline validation, success toast; honeypot hidden field.
- **Reveal:** each section fades+rises on scroll (stagger children); disabled under `prefers-reduced-motion`.

## 6. Page-by-Page Content (v1 — long-scroll home)
1. **Hero** — eyebrow (mono): "DexterDevLab · Frontend Developer" · headline (see §14) · subhead · CTAs (Work with me / View work) · availability badge · subtle aurora bg.
2. **Services / What I do** — 3–4 cards: Website design & build · Web apps (React/Next.js) · WordPress development · Redesigns & performance. Each: 1-line value + what's included.
   - **Engagement models ✅ (Round 7):** project-based (fixed scope) · ongoing/retainer & maintenance (care plans) · hourly/consulting. Present as "How we can work together." Plus a subtle *"Open to full-time opportunities"* line for startups.
3. **Featured work (gallery)** — grid of `ProjectCard`s (screenshot, title, blurb, tags, live/GitHub). ⏳ *needs real projects.*
4. **Tech stack / Skills** — grouped, honest: Core (React, Next.js, TypeScript, Tailwind) · CMS (WordPress) · Tooling/Workflow (Git, Figma, AI-assisted) · Learning/growing (labeled honestly).
5. **Testimonials** — 2–3 real quotes (name, role/company, avatar). ⏳ *needs real quotes.*
6. **About (condensed)** — portrait + short bridge-story bio + a few highlights; link to longer /about if needed.
   - **Emotional hook ✅ (Round 7):** *"reliable and easy to work with."* Trust + communication forward, warm. Draft: *"For 5+ years I've helped businesses get online with clean, modern websites — and I'm the developer clients come back to because I'm easy to work with, communicate clearly, and deliver fast."*
7. **Contact + Résumé** — short pitch + form (name/email/message) + direct email + socials + résumé download.
- **Footer:** wordmark, nav, socials, "Built with Next.js" note, © year.

## 7. Design System ✅ (Round 5)

### 7.1 Color — dark-first, one accent (electric indigo)
Design as CSS variables / Tailwind tokens; mirror for light theme. Values are starting points (tune for contrast).
| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0A0A0B` | `#FFFFFF` | Page background |
| `--surface` | `#141416` | `#F6F7F9` | Cards, panels |
| `--surface-2` | `#1D1D21` | `#EDEEF1` | Hover/elevated |
| `--border` | `#26262B` | `#E4E6EB` | Hairlines |
| `--text` | `#EDEDEF` | `#0A0A0B` | Primary text |
| `--muted` | `#8A8A94` | `#5B5F66` | Secondary text |
| `--accent` | `#4F7CFF` | `#3B63E6` | CTAs, links, highlights |
| `--accent-weak` | `rgba(79,124,255,.14)` | `rgba(59,99,230,.10)` | Accent tints/glow |
- **Rule:** accent used *sparingly* — CTA, active nav, link hover, key highlight only. Everything else grayscale.
- Subtle **aurora/gradient glow** behind hero using `--accent-weak` (very low opacity). No rainbow gradients.

### 7.2 Typography — Geist Sans + Geist Mono
- **Sans (Geist):** headings + body. **Mono (Geist Mono):** eyebrow labels, tags, code, stats.
- Load via `next/font` (self-hosted, zero layout shift).
- **Scale (fluid, clamp):** Display 3.5–5rem / H1 2.5–3.5 / H2 2–2.5 / H3 1.5 / body 1–1.125 / small 0.875 / label 0.75 mono uppercase, tracked.
- Headings: tight leading (1.05–1.15), slightly negative letter-spacing. Body: 1.6 leading, max-width ~68ch.

### 7.3 Spacing, radius, elevation
- Spacing scale: 4-based (4/8/12/16/24/32/48/64/96/128). Section padding ~96–128px desktop, 64px mobile.
- Radius: cards `16px`, buttons `10px`, pills `999px`. Border: 1px hairline `--border`.
- Elevation: prefer borders + subtle inner glow over heavy shadows (premium-minimal). One soft shadow token for hovers.
- Layout: 12-col grid, container max ~1120–1200px, generous gutters. Optional bento grid for Services/Skills.

### 7.4 Motion — tasteful & subtle (Framer Motion)
- Scroll-reveal: fade + 12–16px rise, `once: true`, staggered children (~60ms).
- Hover: cards lift 2–4px + border brightens to accent; buttons slight scale/opacity.
- Page/section transitions: 200–300ms, ease-out. Hero: gentle animated aurora glow.
- **Accessibility gate:** honor `prefers-reduced-motion` — swap to instant/opacity-only. See §9 + §12.

## 8. Component Inventory ✅ (v1)
Built on **shadcn/ui** primitives (Radix a11y) + custom, styled with Tailwind. Icons: **lucide-react**.
- **Layout:** `Header/Nav` (sticky, blur-on-scroll), `MobileDrawer`, `Footer`, `Container`, `Section`, `ThemeToggle` (next-themes).
- **Hero:** headline + subhead + primary/secondary CTA + subtle aurora background + optional availability badge ("Available for freelance").
- **Buttons:** primary (accent), secondary (outline), ghost; optional magnetic hover (subtle).
- **Cards:** `ProjectCard` (thumbnail, title, 1-line blurb, tags, live/GitHub links), `ServiceCard`, `SkillBadge`, `TestimonialCard`.
- **Sections:** `Services` (bento/grid), `FeaturedWork` (gallery grid + hover), `TechStack` (grouped badges), `Testimonials` (grid/marquee), `About` (portrait + short bio + highlights), `Contact` (form + direct email + socials).
- **Utility:** `Eyebrow` (mono label), `SectionHeading`, `Tag/Pill`, `RevealOnScroll` wrapper, `ResumeButton`, SEO `<Meta>` helper.

## 9. Animation & Motion Spec ✅ (v1)
- **Library:** Framer Motion (+ CSS where cheaper). Keep JS light.
- **Patterns:** scroll-reveal (fade+rise, stagger), hover lift on cards/buttons, nav blur/shrink on scroll, animated hero aurora, count-up ONLY if a real number exists (none yet → skip).
- **Perf:** animate `transform`/`opacity` only; `will-change` sparingly; no layout-thrashing.
- **Reduced motion:** global `prefers-reduced-motion` hook disables transforms → opacity/instant. Never gate essential content behind animation.

## 10. Technical Architecture 🟡 (seed decided)
- **Build stack ✅:** Next.js 15 (App Router, TypeScript) + Tailwind + Framer Motion + shadcn/ui, deployed on Vercel.
- **Theme ✅:** **Dark-first with a polished light toggle** (both themes fully designed & QA'd). Use `next-themes`.
- **Strategic note:** Building the site itself in Next.js/React IS the primary proof artifact for the user's React/Next.js capability. Code quality of this repo matters — it will be inspected.
- **Framework:** Next.js 15 App Router, TypeScript, React Server Components where possible; mostly static/SSG.
- **Styling:** Tailwind (v4) + CSS variables for theme tokens; shadcn/ui; `next-themes` for dark/light.
- **Fonts:** `next/font` self-hosted Geist Sans + Geist Mono.
- **Content model:** projects/testimonials/services as **typed local data** (TS/MDX in-repo) for v1 — no CMS needed at this scale. (Sanity/Contentlayer only if a blog is added later.)
- **Contact form ✅:** React Hook Form + Zod validation → **Resend** email API via a Next.js route handler/server action; honeypot + basic rate-limit for spam. Plus visible email + socials.
- **Blog ✅:** **Deferred to phase 2** (no blog in v1; avoids empty-blog problem + CMS overhead).
- **Resume:** static `resume.pdf` in `/public` + a matching HTML section.
- **Analytics:** Vercel Analytics + Speed Insights (privacy-friendly, zero-config). Optional: Plausible.
- **Deployment:** Vercel (preview deploys per PR, edge CDN, image optimization).
- **Repo quality (matters — it's proof):** clean structure, TS strict, ESLint/Prettier, conventional commits, meaningful README with screenshots. **Make public + pin on GitHub** — this is the user's strongest React/Next.js code sample (public repos are otherwise mostly practice projects).
- **Proposed structure:** `app/` (routes) · `components/ui` + `components/sections` · `content/` (projects/testimonials data) · `lib/` · `public/` (og, resume, images).

## 11. SEO Plan ✅ (v1)
- **Primary keywords:** "freelance frontend developer Philippines", "web developer Philippines (remote)", "WordPress developer Philippines", "React / Next.js developer", "modern website design". Blend local (PH) + remote/global intent.
- **Metadata:** Next.js Metadata API — `metadataBase: https://dexteriglesia.com`; unique `<title>`/description per route; canonical URLs.
  - Home `<title>`: *"Dexter Iglesia — Frontend Developer | DexterDevLab"*; description: *"Frontend developer with 5+ years building fast, modern websites and web apps for businesses, agencies, and startups. Based in the Philippines, working worldwide."*
- **Open Graph / Twitter:** custom OG image (1200×630, on-brand) — ideally dynamic via `next/og`. `summary_large_image` cards.
- **Structured data (JSON-LD):** `Person` (name "Dexter Dela Iglesia", jobTitle "Frontend Developer", url dexteriglesia.com, `sameAs`: [github.com/DexterDevLab], knowsAbout: [React, Next.js, WordPress, WooCommerce, TypeScript, Tailwind]) + `WebSite`; `CreativeWork`/`Project` for featured work.
- **Technical:** `sitemap.xml` + `robots.txt` (Next.js file conventions), semantic HTML, descriptive alt text, clean lowercase-hyphen URLs (`/work/project-name`), fast (SEO signal), `lang` set.
- **Off-site:** consistent name/handle + `sameAs` to GitHub, LinkedIn, etc.

## 12. Accessibility Checklist ✅ (target WCAG 2.2 AA)
- Semantic landmarks (`header/nav/main/section/footer`), one `h1`/page, logical heading order.
- Color contrast ≥ 4.5:1 body / 3:1 large & UI — **verify accent on dark meets contrast for text/buttons** (adjust `--accent` if needed).
- Full keyboard operability; visible focus rings (accent); logical tab order; skip-to-content link.
- Radix/shadcn for accessible menus, dialogs, toggles; correct ARIA where custom.
- `prefers-reduced-motion` respected everywhere; no motion-only meaning.
- Forms: labels, error messaging, `aria-invalid`, focus management on submit.
- Alt text on all meaningful images; decorative images `alt=""`. Test with keyboard + screen reader + axe/Lighthouse.

## 13. Performance Checklist ✅ (target Lighthouse ≥ 95, green Core Web Vitals)
- SSG/RSC by default; ship minimal client JS; lazy-load below-the-fold + heavy motion.
- `next/image` for all images (AVIF/WebP, correct sizes, `priority` only on hero); compress screenshots.
- Self-hosted fonts via `next/font` (no layout shift, no external requests).
- Animate transform/opacity only; avoid large blocking scripts; tree-shake icons (import individually).
- Preload hero assets; set explicit width/height (CLS = 0); test on throttled mobile.
- Budget: JS < ~150KB gz on home if feasible; monitor via Vercel Speed Insights.

## 14. Copywriting Notes ✅ (voice: calm + warm, first-person, no hype)
- **Hero headline options (positioning A):**
  - *"I build fast, modern websites and web apps."*
  - *"Frontend developer crafting clean, modern web experiences."*
  - *"Modern websites and web apps — designed and built end to end."*
- **Hero subhead:** *"I'm Dexter — a frontend developer (DexterDevLab) with 5+ years building websites for clients. I help businesses, agencies, and startups ship polished, fast sites and web apps using modern tools and an AI-accelerated workflow."*
- **Primary CTA:** "Work with me" · **Secondary:** "View my work" / "Download résumé".
- **Availability badge:** "● Available for freelance projects".
- **Services framing (client-first):** e.g. *Website design & build · Web apps · WordPress development · Redesigns & performance*.
- **About angle:** honest bridge story — WordPress roots → modern React/Next.js + AI-assisted delivery; care for craft, speed, and clean work. Warm, human, concise.
- **AI theme (one line/section):** *"I pair AI leverage with real engineering judgment to ship more, faster — without cutting corners on quality."*
- **Rules:** no fabricated metrics; qualitative outcomes only until real numbers exist; short sentences; specific > generic.
- **Differentiator line (speed):** *"Fast turnaround without the sloppy result — I ship polished, modern sites quickly."*
- **Location line:** *"Based in the Philippines. Working with clients locally and remotely across timezones."*

### 14.0 Full section copy — DRAFT v1 (ready to edit; voice: calm + warm, first-person)
**Hero**
- Eyebrow (mono): `DexterDevLab — Frontend Developer`
- Headline: **"I build fast, modern websites and web apps."**
- Subhead: "I'm Dexter Iglesia — a frontend developer with 5+ years building sites for clients. I help businesses, agencies, and startups ship polished, fast websites using modern tools and an AI-accelerated workflow. Based in the Philippines, working with clients locally and worldwide."
- CTAs: **[ Work with me ]** · **[ View my work ]**
- Badge: `● Available for freelance projects`

**Services — "What I do"** (4 cards)
- **Website design & build** — "Clean, modern, responsive websites, designed to convert and built to load fast and stay easy to manage."
- **Web apps (React / Next.js)** — "Interactive, modern web applications built with React and Next.js — from idea to deployment."
- **WordPress development** — "Custom WordPress and WooCommerce sites: flexible, maintainable, and tailored to how your business actually works."
- **Redesigns & performance** — "Refresh an aging site or speed up a slow one — modern design plus better Core Web Vitals."
- Engagement line: "Work with me on a fixed-scope project, ongoing care & maintenance, or hourly consulting — and I'm open to the right full-time role."

**About** (condensed)
> "For over 5 years I've helped businesses get online with clean, modern websites — e-commerce stores, rental platforms, multilingual sites, and elegant booking sites across many industries. I'm the developer clients come back to because I'm reliable, communicate clearly, and deliver fast.
> I started with WordPress and today I build with modern tools — React, Next.js, and an AI-accelerated workflow — to ship more, faster, without cutting corners on quality. Based in the Philippines, I work with clients locally and around the world."

**Contact**
- Heading: **"Let's build something."**
- Body: "Have a project in mind, or just want to say hi? Send a message and I'll get back to you within a day or two."
- Fields: Name · Email · Message → Resend. Plus: **direct email · GitHub** · **[ Download résumé ]**. (Minimal set — no LinkedIn/social per user choice.)

**Footer**
- Wordmark `DexterDevLab` · nav · socials · "Designed & built by Dexter Iglesia with Next.js." · © 2026.

### 14.1 Testimonial outreach template (send to past clients)
> Hi [Name] — I'm building out my portfolio and would love to include a short testimonial about working together on [project]. If you're open to it, 2–3 sentences on what the experience was like (and any result you were happy with) would mean a lot. Totally fine to keep it brief — thank you! — Dexter
- Capture per quote: **name · role/company · quote · (optional) photo · link**. Aim for 2–3.

## 15. Project / Case Study Descriptions 🟢 (real client projects captured)

### 15.0 Real client project inventory (verified live, 2026-07-03) — user confirms ALL are client work; "a lot more" exist
Narrative angle: **range + reliability** — real e-commerce (WooCommerce at scale), a rental platform, multilingual, and elegant booking/showroom sites across many industries. Curate the gallery to the **4–6 strongest visually**; leave "result" fields for user to supply.

| # | Name | Type | Industry | What it is | Notable | Live |
|---|------|------|----------|-----------|---------|------|
| 1 | Kaufbeiuns (UG) | WordPress + WooCommerce | B2B electronics/IT | Large wholesaler shop for resellers | Scale: 18+ categories, 100+ brands, MS licenses, CSP | kaufbeiuns.de |
| 2 | Glanzstück GmbH | WordPress (WooCommerce rental) | Events | Event equipment **rental** service (Augsburg) | Rental model on WooCommerce, sustainability + charity, blog | glanzstueck-verleih.de |
| 3 | MR Saddle Fitting | WordPress (WPML) | Equestrian | Saddle-fitting service + premium sales (Spain) | **Trilingual** ES/EN/DE, clean B&W minimal, 3D Equiscan | mrsaddlefitting.com |
| 4 | Luxury Lashshop (Cennet Mavis) | WordPress + Elementor + WooCommerce | Beauty | Lash brand: shop + training + styling (Munich) | Luxury look, shop+courses, 30+ 5★ reviews, TikTok/IG | luxury-lashshop.de |
| 5 | Küchen-Galerie | WordPress | Home/retail | Custom kitchen showroom + consultation | Embedded **3D kitchen planner**, Miele/Siemens partners | kuechen-for-you.de |
| 6 | Perlenweiss | WordPress | Bridal/fashion | Bridal & formal-wear boutique (Königsbrunn) | Elegant photo-led design, booking, featured on TV "Tüll & Tränen" | perlenweiss.com |
- **⏳ Still needed:** real results/metrics per project (orders, traffic, revenue, satisfaction); final curated set (4–6); which 1 (if any) to promote to a deeper flagship case study; screenshots (I'll capture from live sites at build).
- **Redesign-story candidate:** Küchen-Galerie (noted as more dated) — optional "before/after" angle if user did/will redesign it.

### 15.1 Curation & angle decisions ✅ (Round 8)
- **Gallery size:** curate to **5–6 strongest visually**; add *"More work available on request."*
- **Depth:** **gallery blurbs only for v1** (no flagship case study yet). Revisit post-launch (§17).
- **Copy angle:** **range + reliability** — versatile, dependable partner across industries & site types.

### 15.2 Gallery blurbs ✅ (calm+warm voice, no fabricated metrics)
- **Kaufbeiuns** — "A large-scale B2B shop for an electronics & IT wholesaler, built to handle a deep catalog across 100+ brands." `WordPress · WooCommerce · B2B`
- **Glanzstück** — "A rental platform for an events-equipment company — WooCommerce reshaped into a clean 'rent, don't buy' experience." `WordPress · WooCommerce · Rental`
- **MR Saddle Fitting** — "A trilingual site for a specialist equestrian saddle-fitter, with a crisp black-and-white design." `WordPress · WPML · Multilingual`
- **Luxury Lashshop** — "A luxury beauty brand's shop, training courses, and portfolio in one polished, conversion-focused site." `WordPress · WooCommerce · Elementor`
- **Küchen-Galerie** — "A showroom site for a custom-kitchen studio, pairing premium-brand presentation with an embedded 3D planner." `WordPress · Showroom`
- **Perlenweiss** — "An elegant, photography-led boutique site for a bridal studio, centred on easy appointment booking." `WordPress · Booking · Design`
- _When user supplies real results, append a short outcome line to each blurb._

### 15.3 Framing notes
- **Project inventory reality (user, honest):** Most real work is **WordPress client sites**; also building **AI-assisted ("vibe coded") web apps**; **some** React/Next.js knowledge. Several projects exist but **no hard metrics/results yet**.
- **Implication:** Case studies will be framed around *craft, decisions, delivery speed, and screenshots* rather than metrics (we'll extract/estimate impact where possible).
- **⚠️ Positioning risk (flagged by panel):** Do NOT headline as "senior React engineer" — an interview would expose the gap. Position authentically (see §3 / open positioning question). Candidate positionings:
  - **(A) "Frontend developer who ships modern sites & web apps, fast"** — bridges WordPress + Next.js + AI leverage; honest, flexible, serves both audiences.
  - **(B) Freelance-first: "I design & build fast, modern websites for businesses"** — leans into WordPress/client strength now, React/Next.js as the growth edge.
  - **(C) "AI-accelerated frontend developer"** — leads with the vibe-coding/AI edge; on-trend, differentiating, but polarizing for product recruiters.
- **Recommended play:** Position (A) as the public headline; use the AI-assisted angle as a *supporting* theme; ship 1 polished real Next.js project as the flagship to make the React/Next.js claim concrete.

## 16. Visual Inspiration & References ✅
- **Linear** (linear.app) — dark premium minimalism, precise type, restrained subtle motion. → color discipline, spacing, "senior product" feel.
- **Vercel** (vercel.com) — Geist type system, clean grid, crisp cards, tasteful gradients. → typography + layout + OG image approach.
- **Brittany Chiang** (brittanychiang.com) — clean, classy single-page dev portfolio, great IA & nav. → structure of a focused personal site.
- **Josh Comeau** (joshwcomeau.com) — warmth, personality, delightful-but-tasteful motion. → the "warm & human" half of our voice, motion ideas.
- _Secondary to study:_ Emil Kowalski (emilkowal.ski), Rauno (rauno.me), Paco Coursey — craft & motion detail; small studio sites for services framing.

## 17. Future Improvements (post-v1)
- Promote one project into a **deep flagship case study** (`/work/[slug]`).
- Add **Blog / Writing** (MDX or Sanity) if pursuing community/SEO reach.
- **/uses** page, **Now** page, open-source/GitHub activity, speaking/certs — only when real content exists.
- Dynamic OG images per project; light CMS if content grows; i18n if targeting a specific locale.
- Collect real **metrics/testimonials** over time and upgrade blurbs → outcome-driven case studies.

## 18. Launch Checklist
**Pre-build:** finalize domain · gather real project screenshots/links · collect 2–3 testimonials · write résumé PDF · confirm final copy.
**Build:** scaffold Next.js + Tailwind + shadcn + Geist · theme tokens & dark/light · components · sections · content data · contact form (Resend) · responsive pass.
**Quality gates:** Lighthouse ≥95 (all categories) · axe/keyboard/screen-reader a11y pass · reduced-motion verified · cross-browser + real mobile device · contrast check on accent · no console errors · 404 page.
**SEO/meta:** titles/descriptions · OG image renders in social debuggers · sitemap.xml + robots.txt · JSON-LD validates · canonical + metadataBase.
**Ship:** Vercel prod deploy · custom domain + HTTPS · analytics live · form delivers email (test) · resume downloads · favicon/app icons · submit sitemap to Search Console.
**Post-launch:** share on LinkedIn/socials · monitor analytics/vitals · iterate on §17.

---

## 19. Build Execution Plan (ordered)
1. **Scaffold:** `create-next-app` (App Router, TS, Tailwind, ESLint) → add shadcn/ui, Framer Motion, next-themes, lucide-react, `next/font` (Geist Sans + Mono). Init git.
2. **Design tokens & theming:** CSS variables per §7.1 (dark + light), Tailwind theme mapping, `ThemeProvider` + `ThemeToggle`, base typography scale (§7.2), global styles.
3. **Layout shell:** `Container`, `Section`, sticky `Header/Nav` (blur-on-scroll) + `MobileDrawer`, `Footer`. Wire routes/anchors.
4. **Content data layer:** typed `content/` — `projects.ts` (the 6 sites §15.0/§15.2), `services.ts`, `skills.ts`, `testimonials.ts` (empty until provided). Capture project screenshots from live sites → optimized images.
5. **Sections (top-down per §5c wireframe + §14.0 copy):** Hero (+ aurora) → Services → Selected Work (ProjectCard grid) → Tech → Testimonials (conditional) → About (portrait) → Contact → Footer.
6. **Motion:** `RevealOnScroll` wrapper, hover states, nav scroll behavior; `prefers-reduced-motion` guard (§9).
7. **Contact form:** RHF + Zod → route handler/server action → Resend; honeypot + rate-limit; success/error toasts.
8. **Assets:** `/public/resume.pdf`, portrait, favicon/app icons, OG image (`next/og`).
9. **SEO/meta:** Metadata API (`metadataBase`, per-route titles), JSON-LD `Person`/`WebSite`, `sitemap.ts`, `robots.ts` (§11).
10. **QA & polish:** a11y (§12), performance (§13), responsive pass, cross-browser, 404 page.
11. **Deploy:** Vercel + custom domain (dexteriglesia.com) + analytics; make repo public + pin.

## 20. Verification (how we'll know it works)
- **Run locally:** `npm run dev` → click through every section, nav anchors, theme toggle, mobile drawer; verify responsive at 375/768/1280.
- **Contact form:** submit a test message → confirm email arrives via Resend; verify validation + honeypot; success toast shows.
- **Résumé/links:** résumé downloads; GitHub + email links correct; all external links `target=_blank rel=noopener`.
- **A11y:** keyboard-only pass (focus rings, skip link, drawer), axe/Lighthouse a11y ≥ 95, screen-reader spot check, `prefers-reduced-motion` disables transforms.
- **Performance:** Lighthouse (mobile, throttled) ≥ 95 all categories; CLS ~0; images via `next/image`.
- **SEO/meta:** OG image renders in social debuggers; JSON-LD validates (Rich Results Test); sitemap.xml + robots.txt served; canonical + metadataBase correct.
- **Build:** `npm run build` clean (no TS/lint errors); Vercel preview deploy green before production.

## Interview Log
### Round 1 — Foundations (2026-07-02) ✅
Audience: both, recruiters-first · Aesthetic: premium minimal (Linear/Vercel) · Scope: focused & sharp · Seniority: mid-level.

### Round 2 — Substance & build (2026-07-02) ✅
Specialty: user disclosed reality (WordPress + AI-assisted web apps + some React) → reframed positioning · Projects: several, no metrics · Build: Next.js+Tailwind+Framer Motion · Theme: dark-first + light toggle.

### Round 3 — Positioning resolution (2026-07-02) ✅
Career goal: undecided → panel recommended freelance-now/job-later bridge identity · AI angle: supporting theme · React: 1–2 real apps (AI-assisted) · Timeline: no rush / long-term brand.

### Round 4 — Brand voice & positioning tilt (2026-07-02) ✅
Brand: DexterDevLab · Voice: calm+confident & warm+human · Targets: SMB + agencies + startups (not big-tech) → confirmed client/freelance tilt · Domain: user has one (value pending).

### Round 5 — Design system (2026-07-02) ✅
Accent: electric indigo · Type: Geist Sans+Mono · Motion: tasteful & subtle · References: Linear+Vercel, Brittany Chiang+Josh Comeau.

### Round 6 — You & your work (2026-07-02) ✅
Location: PH, local+remote · Superpower: speed (ships polished fast) · Testimonials: none yet, will request · Projects: mostly WordPress client sites.

### Round 7 — Background & sales model (2026-07-02) ✅
Experience: **5+ years, self-employed** (upgrades framing) · Engagement: project + retainer + hourly + open to full-time · About hook: "reliable & easy to work with."

### Round 8 — Real projects & content (2026-07-03) ✅
Fetched 6 live client sites → filled inventory (§15.0) · curate to 5–6 · gallery blurbs only · range+reliability angle · Domain: **dexteriglesia.com** · full section copy drafted (§14.0) · Greenlight: not yet, keep refining.

### Outstanding inputs before build (content only — plan structure is complete)
- ✅ Real project inventory — 6 live client sites captured (§15.0); more exist; results/metrics + final curation still needed.
- ✅ Domain — dexteriglesia.com (wired into SEO/OG plan).
- ✅ Contact links — GitHub + email only (no LinkedIn/social). GitHub URL: ⏳ user to paste.
- ✅ Résumé — user HAS a PDF ready → place at `/public/resume.pdf` + download button. File: ⏳ user to provide at build.
- ✅ Portrait — user HAS a professional photo → About section (rounded, subtle border). File: ⏳ user to provide at build.
- ✅ GitHub — **github.com/DexterDevLab** (Dexter Dela Iglesia, 9 repos). Wired into nav/footer/contact + JSON-LD `sameAs`.
  - _Reviewer note:_ public repos are mostly learning/practice (monsters-rolodex, catch-of-the-day, travel-site) + one bigger TS app (**revents**). → Client sites are primary proof; GitHub is secondary. **Make THIS portfolio repo public + pinned** — it becomes the strongest React/Next.js code sample.
- ⏳ 2–3 real testimonials — use §14.1 outreach template.
- ⏳ (Optional) a few sentences on your origin story — for a richer About.
- ⏳ (Optional) real results/metrics per project.
