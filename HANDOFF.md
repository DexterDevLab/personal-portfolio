# Handoff — DexterDevLab laboratory (Three.js) on the Astro site

Branch: `astro-migration`. Commits so far: Next.js → Astro migration + redesign; the laboratory; and the **orbit-controls / composition fix pass** described first below. Earlier notes follow.

## Page robot (latest)
The lab assistant now also walks the page: `src/components/decor/PageRobot.astro` is a flat SVG twin of the 3D robot (same proportions and colours), fixed in the viewport's left margin. `src/scroll/sections/robot.ts` drives it: as the page scrolls the legs and arms swing with scroll speed and the body bobs; when scrolling stops it settles upright. It steps out below the hero, cruises at 55 % of the viewport height, and stops above the footer. At each section (`LINES` in robot.ts) it says a short line in a thought bubble that spans the margin above its head and never crosses the content column. It blinks every few seconds. Shown only in the "full" mode (≥ 1280 px, motion allowed): the `simple` mode and reduced motion never start it, and it is hidden from assistive tech and pointer events. Its own listeners and rAF loop are torn down with the choreography. Verified at 1440: walking pose mid-scroll, rest pose after, bubble at 8–148 px with the column at 153 px.

## More room for the lab + panel scrolling
- **Station panels could not scroll** (side panel from `md`): a `<dialog>` has `height: fit-content` in the UA stylesheet, which beat the `top/bottom` anchoring, so the panel was as tall as its content (2966 px for Experiments) and `overflow-y: auto` never kicked in. `h-auto` on the dialog fixes it (693 px tall at 1440 × 757, scrolls inside).
- **Full-width hero**: the intro column and control bar use a window-edge gutter (`--edge: clamp(1.5rem, 4vw, 5rem)`) instead of the 70rem column edge, so on wide screens the room takes the space (at 2000 px: stage 1505 × 915, intro at x 80; at 1440: stage 967 × 625). The header and the sections below keep the centred 70rem column (user's call).
- **Bigger room on desktop**: the stage bleeds to the right edge; the control bar is one row spanning the full width (the visible "Stations" kicker is gone, the `<nav>` keeps its label; the hint chip and the "Scroll to read" cue moved into the intro column under the CTA); the overview camera is 11 % closer (`CAMERA.overview` position 6.6 / 5.45 / 8.1). At 1440 × 757 the stage went from 861 × 573 to 881 × 625 and the hero still fits the viewport exactly; the bar wraps to two rows below ≈ 1330 px wide, where the hero simply grows.

## Logo plaque + side-wall decor
- **Back wall**: the painted "DexterDevLab" text is replaced by a cream plaque with `src/assets/logo.svg` rasterised onto a canvas texture (`buildLogoSign` in `src/lab/scene/room.ts`). The URL reaches the runtime as `data-logo-src` on the lab section (`Lab.astro` → `ui.ts` → `LabOptions.logoSrc` → `BuildContext.logoSrc`). The SVG only has a viewBox, so width/height are injected into the fetched markup before drawing; the plaque is blank until the image has loaded. Replace the logo file and the wall updates with it.
- **Left wall**: a corkboard with four pinned notes on the open front stretch (the experiment rack covers the back half) and a wall clock high in the back corner. **Right wall**: a whiteboard with a sketched sites → console plan (canvas texture) and a marker tray beside the server cabinet, and a vent grille above it. All are children of the wall meshes, so they hide with the walls when the camera looks through them; positions are wall-local in `decorateLeftWall` / `decorateRightWall`.
- Two wall clocks hang on the back wall either side of the monitor (`src/lab/scene/clock.ts`, placed in `buildRoom`): **Manila** (`Asia/Manila`) and **Berlin** (`Europe/Berlin`), labelled on a plate under each face. Zone time comes from `Intl.DateTimeFormat` with `timeZone`; hour and minute hands creep, the second hand ticks once a second with a small overshoot. Under reduced motion the animators are skipped, so they show the time at load. Change zones or labels in the array in `buildRoom`. The old clock spot on the left wall is now a small window with a plant.
- Cost: draw calls 184 → 210 at the overview, triangles ≈ 53 k, two small canvas textures. Checked from the default angle and rotated −44°.

## Notebook lamp
The anglepoise lamp on the notebook table is now on: a warm bulb disc in the shade opening, a faint translucent beam cone to the page, a soft pool of light on the paper (`shared.lampBulb` / `shared.lampBeam` in `src/lab/materials.ts`), and one dim `PointLight` (0.45 cd, range 1.8, placed 0.22 units down the beam so the shade is not blown out) in `src/lab/scene/stations/notebook.ts`. Brightness: change the light's intensity and the `lampBeam` opacity (0.11). The point light adds one lit-shader variant (programs 9 → 10); draw calls are unchanged apart from the three new meshes.

## Section scenes — the page-wide cable is gone

### Removed
- The trunk cable in the left margin, its tracking dot, the per-section taps/sockets, the heading stubs below 1280 px, the hero sockets in both heroes, and the port states (`pending/active/done`). Files: `src/components/decor/Trunk.astro`, `src/scroll/sections/{trunk,hero}.ts`, the `port` prop of `SectionHeading`, the port/trunk/stub CSS. Also the console `pulse()` (lab handle + console station) that only existed for the hero → Panda Central handoff. Nothing reserved layout space for the cable (it sat in the margin), so the sections' alignment is unchanged; `--col-left` stays because the lab hero's intro column uses it.
- Scroll-scrubbed motion is gone entirely; the process signal is now a play-once sequence.

### What ties the sections together now
A shared cartoon language rather than a line: cream surfaces, charcoal outlines, teal equipment, orange for actions and signals; the same cable + signal drawing (outline + core + dot, `.cable-outline/.cable-core/.signal-dot`) used *inside* the diagrams; one timing set (`MOTION.entry` 0.9 s, 0.08 s stagger, `back.out` settles) in `src/scroll/motion.ts`.

### Each section's scene (`src/scroll/sections/*.ts`, all play once on entry and settle)
- **Panda Central** — no decorative diagram (the "sites → one dashboard" illustration was removed at the user's request); the section is the real screenshot with its legend and the text.
- **Client work** — each display frame (`Screenshot display`) switches on once: teal ring + orange status light (CSS transition and a one-shot LED pop). Screenshots are never transformed.
- **Services** — `ServiceArt.astro` holds each finished state with `data-part` groups: components assemble into the page; the faulty device is repaired (antenna straightens, red "!" badge → teal check, lamp recolours, one wrench nudge); modules slide together and their cables draw; the server cable draws and the slot lights come on in order.
- **How I work** — the short cable stays *inside* the section (horizontal from lg, a vertical rail beside the badges below). On entry the signal runs along it once (≈2.2 s) and each step becomes current then done; `data-step` on the `<li>` drives the badge only, text never fades. Final state: all done, signal at step 4 (also the no-JS/static state).
- **About** — a decorative teal cover over the portrait page opens once; the taped photo settles. Biography, portrait and résumé never transform.
- **Contact** — the console strip is dim until the section enters, then a short press and its lights come on. Form, validation, submitting/error/success untouched; nothing simulates a send.
- Robot: left in the 3D room only (no page-side appearances were added, to avoid a decorative mascot).

### Motion behaviour
`entryOnce` (`src/scroll/signal.ts`): a play-once ScrollTrigger; if the trigger is already past at setup (deep link, header jump) the finished state is applied without animating, and ScrollTrigger fires skipped triggers on jumps so nothing is left half-way. Scrolling back never dismantles a finished scene. Modes: `full` (≥ 1024 px), `simple` (shorter distances), `static` (reduced motion: GSAP never loads; the markup *is* the complete state). One `initChoreography()` per page load, one `gsap.context` reverted on teardown, a debounced `ScrollTrigger.refresh()` from a `ResizeObserver` on the body.

### Hero (unchanged from the previous pass, kept)
Desktop grid: intro | room / control bar, `min-height: 100svh` with the header as top padding; natural column below lg. Measured at 1440 × 757: hero 757 px, intro ends y 541, bar starts y 589, CTA fully visible.

### Checks
- `npm run check` 0 errors; `npm run build` passes (GSAP + ScrollTrigger remain lazy chunks).
- Chrome 1440: no `[data-trunk]`, `[data-signal-port]` or `.hero-port` in the DOM; hero measurements as above; each scene's end state after scrolling forward (network hub lit, displays on, four services finished, four steps done with the signal at step 4, cover open, console on); scrolling back to the top leaves every finished scene finished; hash jump `#about` from the top finishes earlier scenes and opens no panel; `?motion=reduce` → `data-choreo="static"`, no GSAP, completed markup; lab 360° rotation, station select / back / reset unaffected; contact endpoint GET 405 / bad JSON 400 / no-JS invalid 303; horizontal overflow 0 at 390 px.

### Limitations
- The automation tab is hidden, so timelines were driven with manual ticks; check the feel of the entry scenes once in a visible window, and touch rotation on a device.
- Deep-link *loads* could not be exercised end-to-end here (smooth scrolling never completes in a hidden tab); jump-after-load was.

## Refinement pass: mobile intro, navigation, contrast, palette, typography

### Root causes found
1. **Mobile intro missing** — a `@media (max-width: 767px)` rule hid `[data-lab-intro-text]` (added when the headline was clipped under the header). Removed; the intro column now shows the headline and a short introduction on every width, and the hero stage has a minimum height so the room is never squeezed out.
2. **Header links opened lab panels** — station deep links reused the section anchors (`#services`, `#work`, …), and the `hashchange` handler treated any such hash as a station request. Stations now live under `#lab/<id>` (`src/lab/stations.ts`); section hashes just scroll, and navigating to a section while a panel is open closes it first (`src/lab/ui.ts`). Case-study links and history are unaffected; `scroll-padding-top: 5rem` keeps headings clear of the sticky header.
3. **Wordmark contrast** — `.plate` was blue (`#4f7cff`) on charcoal (≈3.9:1). Now warm white `#f5eedc` on `#25252b` (measured **13.2:1**) with an orange LED accent.
4. **Faint process text** — `.reveal` started at `opacity: 0` until an IntersectionObserver fired. Entrances are now transform-only (content is always fully opaque); the process section animates the cable signal instead.

### Visual decisions
- **Palette** (`src/styles/global.css` `:root`, `src/lab/config.ts` PALETTE): cream `#F5EEDC` surfaces, charcoal `#25252B` structure/outlines/screens, teal `#258F83` equipment and kickers, orange `#F58A35` actions/selection/signal, red `#DB5149` only for the fault lamp and gauge needles. Beige/grey tones reduced; the floor grid is lighter (5 % lines, 64 px) and used only on the hero.
- **Typography**: Geist stays for body; headings use a `.display` treatment (Geist 800, −0.035em tracking, line-height 1). Desktop hero headline is 51 px (was 29 px) with an intentional break; section titles 32–45 px; mono labels are 0.74 rem / 0.12 em (less tiny and airy); project role/metadata is 14 px.
- **Room props**: console gained two round gauges with needles and bigger lever balls; the comms terminal a larger dial with an orange needle; the server cabinet an antenna with an orange ball and a door gauge. Everything else kept.
- **Flying props** redrawn in the room's language (5-unit charcoal outlines, flat teal/orange/cream fills, hard offset shadow): screwdriver → troubleshooting, gear → experiment rack, circuit board → web apps, connector → process cable, notebook sheet → About, the **robot's head** → contact. Props are sized to the available margin and always sit ≥ 16 px outside the content column; margins under 52 px hide them.
- **Hero layout** stacks (intro / room / stations) below 1024 px; the header hides the 3D switch below `lg` so nothing wraps on tablets. Secondary view controls sit behind a **View controls** disclosure on narrow screens (always open from 768 px).

### Checks completed
- `astro check` 0 errors, `astro build` passes.
- Desktop: header *Services* → `#services`, no panel opened; station button → `#lab/servers` panel; header *About* then closes it. Wordmark contrast 13.2:1 measured. Hero h1 51.2 px. Props outside the column at the test width.
- 390 and 360 px: headline (30 px) and intro rendered with non-zero bounds, view-controls disclosure closed, no horizontal overflow. 820 px: stacked hero, 46 px headline. 1280 px reduced-motion: static props.

### Limitations
- Scrub feel, reveal timing and real touch still need a look in a visible window / on a device (automation window is hidden and much wider than 1440, so desktop screenshots are at ~2750 px CSS).
- No Lighthouse/PSI numbers without a deployed URL.

## Whole-site lab identity + scroll choreography

### Visual system (derived from the room)
- **Tokens** (`src/styles/global.css`, `:root`): warm off-white paper `#f3eee4` / deep `#e9e2d4`, charcoal ink `#2b2b30`, teal `#2bb3a3`, orange `#ff8a3d`, blue `#4f7cff` for "screens on", cream `#fbf8f1` surfaces. Dark theme is the lab at night (charcoal `#1b1b1f` with off-white type); both themes still toggle and follow the OS.
- **Components** (`global.css` + `src/components/ui/*`): `.outlined` / `.outlined-sm` (2 px outline + hard offset shadow = solid cartoon object), `.btn` family (physical buttons that lift on hover and press on click; `btn-primary` orange, `btn-teal`, `btn-ghost`, `btn-sm`), `.plate` (charcoal nameplate like the wall wordmark), `.label-mono` (technical kicker with a `.led` status light), `.bezel` (dark instrument frame for screenshots), `.paper` (ruled notebook page), `.grid-floor` (tile grid backdrop), `.led`.
- **Section compositions**: header = control strip (nameplate, text nav, orange "Discuss your project", 3D lab on/off, theme). Hero = the rotatable room with the intro column and station HUD over it (`Scroll to read` cue). Panda Central = main control system: full bezel display with numbered markers on the real dashboard + legend naming only what is on the screenshot (managed sites, queue health, recent activity). Work = experiment rack: two wide frames on the top shelf, three below, wooden shelf lines, `EXP-0n` labels, contribution note, live link. Services = four stations with original SVG illustrations (`src/components/decor/ServiceArt.astro`), literal service names kept. Process = four numbered nodes on a cable with a travelling signal. About = open lab notebook (taped portrait, ruled page, ring binding). Contact = communication station (teal "open channel" strip, outlined console, direct channels as buttons). Footer = charcoal strip. Case study = paper panel in the same chrome.

### Hero integration (what changed structurally)
- The room is now the hero of **one scrolling page**; the sections always follow. "View as a page" became **3D lab on/off** (static hero when off / no WebGL / failure). Default: lab on for every WebGL2 device, including phones (column layout: buttons / room / stations).
- Plain wheel over the canvas **scrolls the page**; zoom needs ⌘/Ctrl + wheel, pinch, or the new +/− buttons (`src/lab/index.ts` capture-phase wheel listener; `touch-action: pan-y` so vertical swipes scroll, horizontal drags rotate). Station panels still open as overlays; "Jump to this section on the page" closes the panel and scrolls to the matching section.

### Scroll choreography
- `src/scroll/config.ts` — **the file to adjust intensity**: `CHOREOGRAPHY.enabled`, `minWidth` (flying props need real margins; below it they are static, below 1024 px hidden), `scrub`, `marginInset`, and `PROPS` routes (`from` section → settles beside `to`, side, size, rotation, drift).
- `src/scroll/choreography.ts` — lazily imports GSAP + ScrollTrigger only when wide and motion is allowed; one `gsap.context` reverted on teardown; `ResizeObserver` + `load` refresh; media-query listeners switch between flying / static / off. Props are inline SVG in `src/components/decor/PropsLayer.astro`, in a `pointer-events: none` layer at z-index 5 (above section backgrounds, below the z-10 content containers), so they never cross text, links or fields.
- Sequence (desktop ≥ 1280 px): **gear** rolls down the left margin from Panda Central and parks by the experiment rack → **wrench** leaves the right margin by Panda Central and settles beside the troubleshooting station → **circuit board** turns slowly down the left toward the web-apps station → **connector** follows the right margin to the process cable → **notebook sheet** drifts down the right and settles beside the notebook. The process **signal** travels the cable as the section scrolls (`getPointAtLength`), static at step 1 without motion.
- Reduced motion: props placed statically (or hidden on narrow screens), no travel/parallax; reveals disabled; lab travel instant.

### Checks completed
- `astro check` 0 errors; `astro build` passes (lab 619 KB, gsap 70 KB + ScrollTrigger 43 KB as separate lazy chunks).
- Chrome 1440 px, light and dark: hero, Panda Central display, experiment rack, services, process (signal moves with scroll), notebook, contact, footer; prop opacity/positions at several scroll depths (`data-props="flying"`); plain wheel over the room leaves the camera at 13.24 while ⌘-wheel zooms to 8.34; station selection still works; no horizontal overflow (scrollWidth ≤ viewport).
- 390 px: lab-on column layout, `?view=page` static hero, `?motion=reduce`, props off, no overflow; case-study page renders the paper panel.

### Limitations
- Same hidden-window caveat as before: scrub smoothing and reveals were advanced synchronously; feel/timing needs one look in a visible window. Real touch (pan-y scroll vs horizontal rotate) not exercised on a device.
- Props only fly at ≥ 1280 px; 1024–1279 px shows them static beside their sections; below that they are hidden.
- No Lighthouse/PSI numbers (needs a deployed URL).

## Zoom-out from a station

- A station view can now be zoomed all the way out: its zoom range extends to the overview maximum (17), zoom-out eases the target toward the overview home, and past `STATION_EXIT_DISTANCE` (8.5, `src/lab/index.ts`) the station releases in place — panel closes, station buttons collapse, overview orbit limits and view offset apply, robot resumes — with no camera travel. Verified: console view → wheel out → still "station" at 7.7, "overview" with the panel closed at 11.5, target (0, 1.05, −0.6) at 17.

## Zoom-out returns home

- Zoom-in uses zoom-to-cursor (target follows the pointer); zoom-out now dollies straight back and eases the orbit target toward the framing's home target (overview target, or the station's) in proportion to the distance gained — at full zoom-out you are back at the original framing. Pinch-zoom on touch goes through OrbitControls' touch path and does not get this easing (Reset view still works).
- Verified: zoom in to 2.6 units with the target pulled to (1.49, 1.95, −1.88), zoom out → distance 17, target exactly (0, 1.05, −0.6); mixed in/out sequences also return home.

## Robot patrol + thought bubbles

- The walk loop now has nine waypoints and runs along the experiment shelves (x ≈ −2.6, z −1.6 → −0.1) before crossing to the front; the floor lamp moved to (−1.05, 0, −1.5) so it is clear of the route. Edit the loop in `src/lab/index.ts` (`robot.setPath`).
- **Thought bubble**: a camera-facing sprite drawn on a canvas (cream bubble, dark outline, two tail circles, Geist Mono text, wraps to two lines). The robot "thinks" one of `robot.idleLines` (edit in `src/lab/scene/robot.ts`) about 70 % of the times it pauses at a waypoint, and names the station it points at ("Repair bench!") on selection. `robot.say(text, seconds)` from anywhere. Never shown under reduced motion.
- Verified with `__lab.debug.advance()` (robot position trail along the shelves, bubble visible and legible in the overview, bubble on station selection).

## Robot, zoom and lamp

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
