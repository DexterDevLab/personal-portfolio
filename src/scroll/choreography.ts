/**
 * Section scenes: every section of the page is a station in the laboratory
 * with one short, meaningful action that plays once as it comes into view
 * (src/scroll/sections/*). Settings live in motion.ts.
 *
 * Natural scrolling only: no pinning, no hijacking, no scroll-scrubbed
 * motion. GSAP + ScrollTrigger load lazily and only when motion is allowed;
 * with reduced motion the page shows the completed states ("static" mode)
 * and nothing is loaded. The markup's default is always the completed state,
 * so the content reads fully if this never runs.
 */
import { MOTION, type ChoreoMode } from "./motion";
import type { SectionContext } from "./signal";

type Cleanup = () => void;
let cleanup: Cleanup | null = null;
let started = false;

export function initChoreography() {
  if (started) return; // one init per page load (no client-side router here)
  started = true;
  const body = document.querySelector<HTMLElement>("[data-page-body]");
  if (!body) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const wide = matchMedia(`(min-width: ${MOTION.wideMinWidth}px)`);
  const devReduce = import.meta.env.DEV && new URLSearchParams(location.search).get("motion") === "reduce";

  const modeFor = (): ChoreoMode => (reduced.matches || devReduce ? "static" : wide.matches ? "full" : "simple");
  let current: ChoreoMode | null = null;

  const apply = () => {
    const mode = modeFor();
    if (mode === current) return;
    current = mode;
    cleanup?.();
    cleanup = null;
    body.dataset.choreo = mode;
    if (mode === "static") return;
    const token = mode;
    void start(body, mode).then((c) => {
      // The mode may have changed while the chunk loaded.
      if (current === token) cleanup = c;
      else c();
    });
  };

  apply();
  reduced.addEventListener("change", apply);
  wide.addEventListener("change", apply);
  window.addEventListener("pagehide", () => cleanup?.(), { once: true });
}

async function start(body: HTMLElement, mode: Exclude<ChoreoMode, "static">): Promise<Cleanup> {
  const [{ gsap }, { ScrollTrigger }, sections] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    Promise.all([
      import("./sections/work"),
      import("./sections/services"),
      import("./sections/process"),
      import("./sections/about"),
      import("./sections/contact"),
      import("./sections/robot"),
    ]),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  // Dev inspection (the hidden automation tab never runs rAF): tick with
  // `__choreo.gsap.ticker.tick()` after `__choreo.ScrollTrigger.update()`.
  if (import.meta.env.DEV) (window as unknown as { __choreo?: unknown }).__choreo = { gsap, ScrollTrigger };

  const ctx: SectionContext = {
    gsap,
    ScrollTrigger,
    mode,
    body,
    distance: mode === "full" ? MOTION.distance.wide : MOTION.distance.narrow,
  };

  const [work, services, process, about, contact, robot] = sections;
  let stopRobot: (() => void) | null = null;
  const gsapCtx = gsap.context(() => {
    work.setupWork(ctx);
    services.setupServices(ctx);
    process.setupProcess(ctx);
    about.setupAbout(ctx);
    contact.setupContact(ctx);
    // The page robot only has room in the margin of the "full" mode
    if (mode === "full") stopRobot = robot.setupRobot(ctx);
  }, body);

  // Layout settles after fonts/images and when the hero changes (3D lab on/off):
  // recompute trigger positions, debounced.
  let pending = 0;
  const refresh = () => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  window.addEventListener("load", refresh, { once: true });
  const ro = new ResizeObserver(refresh);
  ro.observe(body);

  return () => {
    stopRobot?.();
    ro.disconnect();
    cancelAnimationFrame(pending);
    gsapCtx.revert();
    // Scenes that had not played yet return to their completed markup state.
    document.querySelectorAll("[data-notebook]").forEach((el) => el.removeAttribute("data-cover"));
    document.querySelectorAll(".console.is-off").forEach((el) => el.classList.remove("is-off"));
    document.querySelectorAll("[data-display]").forEach((el) => el.classList.add("is-on"));
    document.querySelectorAll("[data-step]").forEach((el) => el.setAttribute("data-step", "done"));
  };
}
