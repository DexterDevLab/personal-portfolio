# Handoff — DexterDevLab laboratory (Three.js) on the Astro site

Branch: `astro-migration`. Commits so far: Next.js → Astro migration + redesign; the laboratory; and the **orbit-controls / composition fix pass** described first below. Earlier notes follow.

## Robot, zoom and lamp (latest)

- **Robot** — what was wrong: the dome head sat 0.14 units inside the torso (no neck), the arm pivots were inside a 0.5-wide body so the arms were hidden, the "visor" read as a stripe through the head, and it stood on a hover ring and never moved. Rebuilt (`src/lab/scene/robot.ts`): legs + feet, pelvis, rounded torso with chest panel and belt, neck, boxy head with visor, two eyes, ear discs and antenna, arms on shoulder joints outside the body. It now **walks** a loop of six waypoints through the free floor (`robot.setPath([...])` in `src/lab/index.ts`), with a leg/arm gait and body bob, turns toward its direction of travel, pauses 2–5 s at each stop to look around, keeps tracking what you hover, stops and points while a station is focused, resumes on Back, and stands still under reduced motion.
- **Zoom** — `zoomToCursor` on OrbitControls (zoom lands on what you point at), zoom speed 0.9, overview distance 2.4–17 (was 5–22, which kept you far away and let the room shrink to a thumbnail), station 1.6–9, near plane 0.25.
- **Floor lamp** — the arm was a 2 cm charcoal rod against a charcoal backdrop, so the shade floated beside a bare post; now a thicker metal pole, orange elbow, angled arm, hinge and a larger outlined shade.
- Verified in Chrome via `__lab.debug.advance(seconds)` (synchronous simulated frames, since the automation window is hidden): the robot reached its first waypoint in 4 s with legs swinging and continued; close-up renders of the robot and lamp; a single wheel event zooms toward the cursor and clamps at 2.4 / 17. Note: wheel input is ignored while a camera travel is in flight (controls disabled), by design.

## Scene fixes

- **Notebook table**: the tilt sign was inverted relative to the surface helper, so legs stopped short of the raised edge and the sketch lines floated; fixed (`tilt = 0.35`, `surf(z)`), legs now reach the top, stretchers + feet added, pencil/mug/pages sit on the surface, the table faces the station camera so the portrait reads upright, and the camera looks down steeply enough to show the open page.
- **Desk lamp** rebuilt as a mounted anglepoise (base → two arm segments → shade aimed at the page) instead of three loose parts.
- **Room lamp**: the ceiling-hung lamp had nothing to hang from in a roofless room; it is now a floor lamp beside the console (still hidden while the console is focused).
- **Wall wordmark**: "DexterDevLab" painted on the back wall above the console backdrop (canvas texture in Geist Mono, redrawn once the web font loads; a child of the wall so it hides with it when you orbit behind). Edit the text in `buildWordmark()` in `src/lab/scene/room.ts`.
- Supports on the other stations were checked against their tops (bench legs, console cabinet, comms pedestal) and are flush.

## Fix pass: 360° orbit, composition, framing

### Root causes found

1. **No rotation on drag** — the first lab version had a deliberately fixed camera (per the earlier brief): no controls were attached; `pointermove` only ran hover raycasts and a drag was ignored.
2. **Intro card hid the room** — the overlay was a full-width card (`max-w-lg`, headline + full paragraph + loader) laid over the stage, and on narrow screens it stacked on top of the canvas instead of beside it.
3. **Panda Central too close / lamp in the way** — the console pose was 4 units from the monitor with a 1.0 height and approached from the right; the hanging lamp sat at (1.1, 2.6, −0.7), right on that line of sight; the comms terminal also crossed it once the distance grew.
4. **Mobile blank area** — the canvas was `absolute inset-0` on an `h-dvh` section, and `frame()` dollied the camera far back to keep the whole room width in a 0.46 aspect, so a tiny room sat in the middle with the intro card over it and the station list far below.
5. The render loop, state machine and panels were sound; no console errors (confirmed again).

### Changes made

- **OrbitControls** (`three/addons/controls/OrbitControls.js`) on the canvas: full, unlimited horizontal revolution; polar angle clamped to 17°–74° in the overview (14°–86° at a station, where the poses are lower); zoom bounded 5–22 units (1.8–9 at a station); panning disabled; damping 0.08; the controls set `touch-action: none` on the canvas only (page scroll is locked in lab view anyway, and the page view is one tap away). The room's walls hide when the camera orbits behind them (`updateWalls()` in `src/lab/index.ts`), so the roofless dollhouse reads from every angle; hit boxes are the only raycast targets, so a hidden wall never intercepts a click.
- **Gesture discrimination** — pointer-down position is recorded; more than 6 px of travel marks the gesture as a drag (cursor `grabbing`, hover cleared); `pointerup` raycasts only for non-drag gestures; `pointercancel`/`pointerleave` end the gesture without selecting. Hover raycasts run at most once per frame while the pointer moves and never during a drag.
- **Controls ↔ GSAP coordination** — `controls.enabled = false` and `controls.update()` is skipped while a camera travel owns the camera; GSAP tweens `camera.position` and `controls.target` together; orbit limits are switched *before* each travel so the controls never clamp the destination; after arrival `controls.update()` re-syncs and input is re-enabled. Orbit stays available at a station (tight range). A new selection mid-travel cancels and retargets (last request wins). **Back / Escape** returns to the view the visitor was exploring from (saved on first selection); **Reset view** returns to the default framing.
- **Composition** — the intro is now a slim column (headline, one-liner, CTA, mode switch); on wide screens it floats top-left and the frustum is offset so the room sits beside it; while a panel is open on desktop the intro steps aside. The HUD (station buttons, rotate-left/right, Reset view, "Drag to rotate · Select a station") sits bottom-left so the right-side panel never covers it. Mobile uses a real layout: CSS grid rows `intro / stage / stations`; the canvas is sized to the stage via `ResizeObserver`, the stage's own aspect drives `frame()`, and the room keeps ~62 % of its design width on the narrowest screens instead of dollying away. Bottom-sheet panels shift the frustum so the station stays visible above the sheet.
- **Framing** — console approaches from the left at 5.2 units (comms terminal and lamp out of the line of sight), the lamp moved to (−1.1, 2.6, −0.9) and is hidden while the console is focused (restored on leave); comms 3.9 / notebook 3.2 units; the robot now idles right of the console at (1.55, 0, −0.75) instead of between the camera and the desk.
- **Accessibility** — station buttons use `aria-expanded` + `aria-controls="panel-<id>"` (they expand a panel; they are not checkboxes/toggles); rotate-left/right and Reset view buttons with labels; `←`/`→` rotate while focus is inside the lab (not in form fields); Escape closes and focus returns to the trigger; reduced motion keeps drag rotation and makes travel/rotation instant.
- **Performance** — floor grid merged into one mesh. Measured in the overview at 2206×1624 CSS px, DPR 1.25 (cap 2 / 1.5 narrow): **160 draw calls, 41.4 k triangles, 7 shader programs, 8 textures, ~130 geometries**; one renderer, one rAF loop (frame counter stops in page view and when hidden; 4 mode switches keep the same instance, 1 canvas). No shadow maps, no postprocessing. Lab chunk 673 KB minified (three + gsap + OrbitControls).

### Controls and interaction

- **Drag** (mouse or one finger): orbit, any amount, both directions. **Wheel / pinch**: zoom within bounds. No pan.
- **Click/tap a station** (short, < 6 px): press nudge, camera travel, panel. **Drag over a station**: rotates, never selects.
- **Station buttons** (keyboard/touch equivalents), **← / →** keys, **rotate buttons**, **Reset view**, **Back to lab / Escape** (returns to where you were).

### Verified (Chrome automation)

- Desktop: complete 360° revolution by repeated drags (azimuth 37° → −104° → −188° → 74° → −14°); drags from empty floor and from over the console rotate without opening a panel; zoom clamps at 5 and 22; Reset view returns exactly to the default (az 37.1°, 13.24 units); every station's framing re-shot after the changes; rapid console→servers→notebook→experiments ends on experiments; Escape restores the pre-selection azimuth/distance; `←` and rotate buttons change azimuth; four rapid mode switches keep one lab instance and one canvas, frames stop in page view.
- Mobile (iframe harness): 390×844 page view by default with no horizontal overflow; lab view shows intro / 389 px stage with the whole room / station rows with no blank band; 360×780 the same; opening a station framed it above the bottom sheet.
- Reduced motion (`?motion=reduce`) and the no-WebGL / forced-failure paths unchanged and passing. `astro check` 0 errors; `astro build` passes.

### Not verified / limitations

- The automation window was hidden (`document.visibilityState === "hidden"`), so `requestAnimationFrame` never fired: transitions and damping were advanced with a synchronous `__lab.debug.step()` (which also ticks GSAP). Timing/feel of the live animation still needs one look in a visible window.
- **Real touch** (one-finger orbit, pinch zoom, tap selection) was not exercised; the code path is OrbitControls' standard pointer handling plus the same gesture threshold.
- Browser-resize mid-travel is handled (`resize()` retargets the active tween) but was only exercised via the mobile iframes, not an interactive window resize.
- Seen from directly behind, the console's chalkboard strip and monitor back are plain dark slabs (intentional, simple).

---

## Laboratory (previous commit)

**An original cartoon inventor's lab as the homepage experience**, with the readable page kept intact underneath.

- **Two views, one URL.** `html[data-view="lab|page"]` is decided before paint by an inline script in `src/layouts/Base.astro`: `?view=lab|page` wins, then the remembered choice (`localStorage.view`), then **lab on screens ≥ 768px with WebGL2**, page otherwise. No JS → page. A persistent **"Explore the lab / View as a page"** switch sits in the header, the mobile menu, and the page hero. Deep links `/#work`, `/#services`, `/#about`, `/#contact` open the matching station in lab view and scroll in page view. `/work/panda-central` is untouched.
- **The room** (`src/lab/scene/`): procedural Three.js geometry, toon-shaded (3-step gradient), selective inverted-hull outlines, warm off-white walls / charcoal / blue / teal / orange palette. Six stations as named groups with generous invisible hit boxes: control console (Panda Central, real dashboard texture, wired "site" tiles), experiments rack (five units with real client screenshots), repair bench (fault → working sequence with the ceiling arm), server cabinet, lab notebook (portrait), comms terminal (contact). A small original robot assistant and restrained ambient motion; all of it stops under `prefers-reduced-motion`.
- **Panels** (`src/components/lab/StationPanel.astro`, filled in `Lab.astro`): six `<dialog>`s rendered at build time from the **same data as the page sections** (`src/content/work`, `src/data/*`, `src/data/about.ts`). Non-modal, focus to heading, Escape / Back, hash kept in sync. Side column on desktop, bottom sheet on mobile. The contact panel contains the real form (second instance with prefixed ids).
- **Loading / failure**: overlay server-rendered; the runtime is a separate chunk loaded after `load`; real progress for the textures; any failure → friendly notice + page view, nothing persisted.
- **No Blender models were used.** Everything is code-built geometry structured so GLB assets can replace it (below).

## Run and build

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # astro check
npm run build    # dist/ + .vercel/output/
```

Dev-only flags: `?motion=reduce`, `?nowebgl=1`, `?view=lab&labfail=1`. `window.__lab.debug` exposes renderer/scene/camera/controls, `azimuth`/`polar`/`distance`, `frames`, `animators`, `gsap`, and `step()`.

## Where to edit

| What | Where |
|---|---|
| Copy: headline, one-liner, intro, about, featured, troubleshooting steps, contact hints | `src/data/about.ts` |
| Station names, panel titles, hashes | `src/lab/stations.ts`; panel bodies in `src/components/lab/Lab.astro` |
| Palette, room size, camera (fov, overview pose, travel time, portrait framing), DPR caps | `src/lab/config.ts` |
| Orbit limits (polar/zoom per mode), view offsets, wall hiding, robot idle spot | `src/lab/index.ts` (`LIMITS`, `applyViewOffset`, `updateWalls`) |
| Each station's props, hit box, camera pose, ambient animators | `src/lab/scene/stations/<station>.ts` |
| Robot / arm / room shell (walls, lamp) | `src/lab/scene/robot.ts`, `arm.ts`, `room.ts` |
| Sequences (travel, press, repair, robot gestures) | `src/lab/sequences.ts` |
| View-mode decision | inline script in `src/layouts/Base.astro`; mode CSS in `src/styles/global.css` |

## Replacing procedural props with final models

Each station module builds a `Group` and returns `{ group, hotspots, materials, pressTarget, pose, focus, animators }`. To swap in a GLB: load it with `GLTFLoader` from `three/addons/loaders/GLTFLoader.js` in that station's build function; add it to `group` at the same origin/orientation; keep or resize the invisible `hitBox`; give it `MeshToonMaterial`s from `ctx.makeMaterials().toon(color)` so hover highlight works; for the repair bench name the moving parts (`device`, `antenna`, `lamp`) and map them to `RepairParts`.

**Asset brief**: six props + robot + arm, ≤ 15 k triangles each (robot ≤ 8 k), flat/toon shading with vertex colours or one small palette texture, outlines not baked, Y-up, metres, origin at floor contact, forward = +Z, optional clips `arm_idle`, `arm_reach`, `robot_idle`, `robot_point`, `.glb`.

## Dependencies

- `three@0.186.1` (renderer, geometry, materials, raycasting, **OrbitControls**, RoundedBoxGeometry, BufferGeometryUtils), `gsap@3.15.0` (camera travel, press, robot gestures, repair timeline; HTML UI transitions are CSS), `@types/three` (dev). No React, R3F, physics, postprocessing, or state library.

## Content facts still missing

Designer colleague's name/link (`site.designer`, `design:` per project), more Panda Central screenshots (the one on hand shows client names and counts), per-project details, an anonymised troubleshooting example, résumé contact alignment, DKIM, unused `src/assets/portrait-2.jpg`.

## Deployment

Set the Vercel **Framework Preset to Astro**; env vars already present; merge `astro-migration` → `main` after a preview check; resubmit `sitemap-index.xml`; re-scrape OG.
