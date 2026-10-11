/**
 * Page choreography: one signal travelling through the laboratory.
 *
 * Enter the lab → Panda Central → client work → services → how I work →
 * about → contact. The hero's console socket hands the signal to a trunk
 * cable in the left margin (wide screens) or to each section's stub; every
 * section performs one short, meaningful action as the signal reaches it
 * (src/scroll/sections/*). Settings live in motion.ts.
 *
 * Natural scrolling only: no pinning, no hijacking; scrub is used for the two
 * travelling signals, everything else plays once on entry. GSAP + ScrollTrigger
 * load lazily and only when motion is allowed; with reduced motion the page
 * shows the completed states ("static" mode) and nothing is loaded.
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
  const wide = matchMedia(`(min-width: ${MOTION.trunkMinWidth}px)`);
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
    if (mode === "static") {
      cleanup = applyStatic(body);
      return;
    }
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

/** Reduced motion: completed states, every port lit, the signals parked. */
function applyStatic(body: HTMLElement): Cleanup {
  document.querySelectorAll("[data-signal-port]").forEach((el) => el.setAttribute("data-signal", "done"));
  // The markup already shows every illustration finished; only the process
  // signal needs parking at the last step, which Process.astro does in markup.
  return () => {
    delete body.dataset.choreo;
    document.querySelectorAll("[data-signal-port]").forEach((el) => el.removeAttribute("data-signal"));
  };
}

async function start(body: HTMLElement, mode: Exclude<ChoreoMode, "static">): Promise<Cleanup> {
  const [{ gsap }, { ScrollTrigger }, sections] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    Promise.all([
      import("./sections/trunk"),
      import("./sections/hero"),
      import("./sections/featured"),
      import("./sections/work"),
      import("./sections/services"),
      import("./sections/process"),
      import("./sections/about"),
      import("./sections/contact"),
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

  const [trunk, hero, featured, work, services, process, about, contact] = sections;
  const gsapCtx = gsap.context(() => {
    trunk.setupTrunk(ctx);
    hero.setupHero(ctx);
    featured.setupFeatured(ctx);
    work.setupWork(ctx);
    services.setupServices(ctx);
    process.setupProcess(ctx);
    about.setupAbout(ctx);
    contact.setupContact(ctx);
  }, body);

  // Layout settles after fonts/images and when the hero changes (3D lab on/off):
  // recompute trigger positions and the trunk, debounced.
  let pending = 0;
  const refresh = () => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  window.addEventListener("load", refresh, { once: true });
  const ro = new ResizeObserver(refresh);
  ro.observe(body);

  return () => {
    ro.disconnect();
    cancelAnimationFrame(pending);
    gsapCtx.revert();
    document.querySelectorAll("[data-signal-port]").forEach((el) => el.removeAttribute("data-signal"));
    document.querySelectorAll("[data-notebook]").forEach((el) => el.removeAttribute("data-cover"));
    document.querySelectorAll(".console.is-off").forEach((el) => el.classList.remove("is-off"));
    document.querySelectorAll("[data-display]").forEach((el) => el.classList.add("is-on"));
  };
}
