# Handoff — DexterDevLab laboratory (Three.js) on the Astro site

Branch: `astro-migration`. Two pieces of work live here: the Next.js → Astro migration and redesign (first commit, see "Earlier migration notes" at the end), and the interactive laboratory on top of it (this handoff).

## What was implemented

**An original cartoon inventor's lab as the homepage experience**, with the readable page kept intact underneath.

- **Two views, one URL.** `html[data-view="lab|page"]` is decided before paint by an inline script in `src/layouts/Base.astro`: `?view=lab|page` wins, then the remembered choice (`localStorage.view`), then **lab on screens ≥ 768px with WebGL2**, page otherwise. No JS → page. A persistent **"Explore the lab / View as a page"** switch sits in the header, the mobile menu, and the page hero. Deep links `/#work`, `/#services`, `/#about`, `/#contact` open the matching station in lab view and scroll in page view. `/work/panda-central` is untouched.
- **The room** (`src/lab/scene/`): procedural Three.js geometry, toon-shaded (3-step gradient), selective inverted-hull outlines, warm off-white walls / charcoal / blue / teal / orange palette, no shadow maps, no postprocessing. Six stations as named groups with generous invisible hit boxes:
  1. **Control console** — Panda Central: oversized monitor showing the real dashboard screenshot as a texture, lever/knob clusters, wall "site" tiles wired to the monitor with flowing dashed links (no numbers, no telemetry).
  2. **Experiments** — client projects: a rack of five specimen units, each with a small screen showing that client site's real screenshot, a bubbling flask.
  3. **Repair bench** — troubleshooting: a site device in a fault state (red lamp, bent antenna, crooked) under a ceiling-mounted mechanical arm. Selecting it runs the repair sequence: arm swings down, sparks, antenna straightens, lamp turns green, device sits straight. Reset on leaving. Instant end state under reduced motion.
  4. **Server cabinet** — hosting & maintenance: six slots, slow fan, restrained status LEDs, cable tray to the console.
  5. **Lab notebook** — about & process: drafting table, open notebook with the portrait on the left page and sketch lines on the right, mug, lamp.
  6. **Comms terminal** — contact: chunky teal terminal with a glowing cradle and beacon, front and centre.
  Plus a small original **robot assistant** (bobs, blinks, turns its head toward what you hover, points at the active station, gestures during the repair) and ambient motion on the arm, console links, LEDs, flask and beacon. All ambient animation stops under `prefers-reduced-motion`.
- **Interaction**: click-to-explore only. Pointer hover highlights a station (emissive tint, cursor, matching HTML button). Click = press nudge + GSAP camera travel (1.1 s, `power3.inOut`) to a predefined pose + an HTML panel. State machine `loading → overview ⇄ transitioning → station`; a new selection mid-travel cancels and retargets; the last request wins. Resize re-frames (portrait keeps ~62 % of the design width, widens fov to 62°, dollies back); on wide screens the frustum is offset so the room sits right of the intro card, and left of the open panel.
- **Panels** (`src/components/lab/StationPanel.astro`, filled in `Lab.astro`): six `<dialog>`s rendered at build time from the **same data as the page sections** (`src/content/work`, `src/data/*`, new `src/data/about.ts` holding the intro/about/featured copy so nothing drifts). Non-modal (`show()`), focus moves to the heading, Escape / "Back to lab" closes and returns focus to the trigger, `aria-pressed` on the station list, live-region status, hash kept in sync. Side column on desktop, bottom sheet on mobile. The contact panel contains the real form (second instance with prefixed ids; `ContactForm.astro` now binds every form on the page).
- **Loading / failure**: the intro overlay (headline, intro, "Discuss your project", mode switch, station list) is server-rendered and visible instantly. The runtime (`three` + `gsap`, ~650 KB minified / ~165 KB gzip) is a separate chunk loaded after `load`; the only measurable progress is the 7 textures, shown on a real `<progress>`; the chunk download is indeterminate. Any failure (no WebGL2, import error, texture error, context creation error, 20 s watchdog) → friendly notice + page view, nothing persisted, no retry loop.
- **Performance**: ~24 draw calls, ~8.5 k triangles, 5 shader programs in the overview; DPR capped at 2 (1.5 on narrow screens); manual rAF loop with a dirty flag that stops when nothing animates; rendering pauses when the section is off-screen, the tab is hidden, or the page view is active; full `dispose()` (geometries, materials, textures, renderer, listeners, GSAP context) with an HMR singleton guard.
- **No Blender models were used.** Everything is code-built geometry structured so GLB assets can replace it (see "Replacing props with final models").

## Run and build

```bash
npm install
npm run dev      # http://localhost:4321 (lab + API route work locally)
npm run check    # astro check — 0 errors
npm run build    # dist/ + .vercel/output/
```

Dev-only test flags: `?motion=reduce` (reduced-motion path), `?nowebgl=1` (treat WebGL as missing), `?view=lab&labfail=1` (force the failure path). `window.__lab.debug` exposes renderer/scene/camera, `frames`, `animators`, and `step()` (render one frame synchronously).

## Where to edit

| What | Where |
|---|---|
| Copy: headline, intro, about, featured problem/solution, troubleshooting steps, contact hints | `src/data/about.ts` |
| Station names, panel titles, hashes | `src/lab/stations.ts` |
| Panel bodies | `src/components/lab/Lab.astro` |
| Palette, room size, camera (fov, overview pose, travel time, portrait framing), DPR caps, outline width | `src/lab/config.ts` |
| Each station's props, hit box, camera pose, ambient animators | `src/lab/scene/stations/<station>.ts` |
| Robot / arm | `src/lab/scene/robot.ts`, `src/lab/scene/arm.ts` |
| Repair sequence, camera travel, press, robot gestures | `src/lab/sequences.ts` |
| View-mode decision (breakpoint, defaults) | inline script in `src/layouts/Base.astro`; mode CSS in `src/styles/global.css` |
| Projects, services, process, site constants | unchanged: `src/content/work/*.md`, `src/data/*.ts` |

## Replacing procedural props with final models

Each station module builds a `Group` and returns `{ group, hotspots, materials, pressTarget, pose, focus, animators }`. To swap in a GLB:

1. Load it with `GLTFLoader` from `three/addons/loaders/GLTFLoader.js` inside that station's build function (add the URL to `loadTextures`-style progress if you want it on the progress bar).
2. Add the loaded scene to `group` at the same origin/orientation the procedural props used (the station's `group.position`/`rotation` are the world placement; keep them).
3. Keep or resize the invisible `hitBox` so the whole prop stays clickable; keep `pressTarget` pointing at the main object.
4. For hover highlight, give the model `MeshToonMaterial` instances created through `ctx.makeMaterials().toon(color)` (so `setHighlight` can tint them), or extend `MaterialSet` to accept the model's materials.
5. For the repair bench, name the moving parts in Blender (`device`, `antenna`, `lamp`) and map them to `RepairParts` so `sequences.ts` keeps working.

**Asset brief** (if commissioning models): six props + robot + arm, ≤ 15 k triangles each (robot ≤ 8 k), flat/toon shading with vertex colours or a single small palette texture (no PBR maps), outlines not baked (done in code), Y-up, metres, origin at the floor contact point, forward = +Z. Animation clips optional: `arm_idle`, `arm_reach`, `robot_idle`, `robot_point`. Export glTF binary (`.glb`), Draco optional.

## Dependencies introduced and why

- `three@0.186.1` — renderer, geometry, materials, raycasting. WebGL2 only (r163+), `WebGLRenderer`.
- `gsap@3.15.0` (standard "no charge" license) — camera travel, press nudge, robot gestures, the repair timeline. GSAP is used only for coordinated multi-property sequences; all HTML UI transitions are CSS.
- `@types/three` (dev) — types.
- `three/addons`: `RoundedBoxGeometry` (smooth normals for the outline hull), `BufferGeometryUtils.mergeGeometries` (one mesh per colour per prop).

No React, no R3F, no physics, no postprocessing, no state library.

## Checks completed

- `astro check` 0 errors; `astro build` succeeds (lab chunk is separate; `/` HTML contains all page sections and all six panels with real content).
- Chrome, desktop width: lab loads (overlay first, scene fades in), all six stations open via the station buttons with the right camera framing and panel content; Escape and "Back to lab" return to the overview and restore focus; rapid triple selection ends on the last station with no stuck state; hover highlight; "View as a page" ⇄ "Explore the lab" persists across reload; `/#contact` deep link opens the terminal with the form (two forms on the page, unique ids); `?nowebgl=1` → page view, switch hidden, no runtime loaded; `?labfail=1` → notice + page view, nothing persisted.
- Chrome, 375 px (iframe harness): page view by default with "Explore the lab"; entering the lab shows the portrait-framed room, compact intro, station buttons; panels as bottom sheets with the station framed above.
- Reduced-motion path (`?motion=reduce`): no ambient animators registered, camera jumps, repair shows its end state.
- Contact endpoint unchanged (JSON + no-JS paths verified earlier; no real message sent).

## Known limitations / not verified

- **Animated transitions were not observed live.** The automation tab was in a hidden window, so `requestAnimationFrame` was paused: camera travel, the repair sequence, and ambient motion were verified through the reduced-motion path and single-frame renders, not as moving animation. Open the dev server in a visible window and click through the six stations once; the GSAP timings in `sequences.ts` are easy to adjust.
- Real touch devices were not tested (only a narrow iframe). Tap selection uses the same pointer path; hover is skipped for touch.
- Lighthouse / PSI not run (needs a deployed URL). The page view carries the same LCP decisions as before; the lab view's initial paint is the HTML overlay, with the scene arriving after `load`.
- The light/dark theme switch only affects the HTML chrome; the room has its own fixed palette by design.
- `astro preview` doesn't support the Vercel adapter, so the production bundle of the API route was not exercised locally.

## Content facts still missing

Unchanged from the migration handoff: designer colleague's name/link, more Panda Central screenshots (the one on hand shows client names and counts), per-project details, a real anonymised troubleshooting example, résumé contact details, DKIM. See below.

## Deployment

Same as before: set the Vercel **Framework Preset to Astro**, env vars already present, merge `astro-migration` → `main` after a preview check, resubmit `sitemap-index.xml`, re-scrape OG.

---

## Earlier migration notes (Next.js → Astro, first commit on this branch)

- Framework Next.js 16 → Astro 7.3.8, static output with the Vercel adapter for `/api/contact` and `/contact/error` only.
- Repositioned as "Freelance Web Developer"; designer colleague credited; "40+ sites" and "open to full-time role" removed per your decision; "10+ years" and the availability badge kept.
- Projects in `src/content/work/*.md` (validated by `src/content.config.ts`); only Panda Central has a case study (`/work/panda-central`).
- Progressive-enhancement contact form (JSON + 303 redirect paths), same Brevo delivery and env vars; honeypot returns a fake success.
- Dark/light theme following the OS, persisted, no flash.
- `astro:assets` images, static favicon/OG via `npm run brand`, `sitemap-index.xml` (+ `/sitemap.xml` 301), robots, JSON-LD.
- Missing facts/assets: designer colleague's name & link (`site.designer`, `design:` per project), cropped/extra Panda Central screens, per-project specifics, troubleshooting example, résumé contact alignment, DKIM, unused `src/assets/portrait-2.jpg`.
