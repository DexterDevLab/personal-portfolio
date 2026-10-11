/**
 * Scroll choreography for the page: flying props in the margins and the
 * signal on the process cable. GSAP + ScrollTrigger are loaded lazily and
 * only when the viewport is wide enough and motion is allowed; otherwise
 * the props are placed statically (or hidden) and the content is unchanged.
 */
import { CHOREOGRAPHY, PROPS, type PropRoute } from "./config";

type Cleanup = () => void;
let cleanup: Cleanup | null = null;

export function initChoreography() {
  const layer = document.querySelector<HTMLElement>("[data-props-layer]");
  const body = layer?.parentElement;
  if (!layer || !body || !CHOREOGRAPHY.enabled) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const wide = matchMedia(`(min-width: ${CHOREOGRAPHY.minWidth}px)`);

  const apply = () => {
    cleanup?.();
    cleanup = null;
    if (reduced.matches || !wide.matches) {
      cleanup = placeStatic(layer, body, !reduced.matches && wide.matches);
    } else {
      void startFlying(layer, body).then((c) => {
        // The mode may have changed while the chunk loaded
        if (!reduced.matches && wide.matches) cleanup = c;
        else c();
      });
    }
  };

  apply();
  reduced.addEventListener("change", apply);
  wide.addEventListener("change", apply);
  // Astro has no client-side router here, but keep teardown symmetric.
  window.addEventListener("pagehide", () => cleanup?.(), { once: true });
}

/** Column geometry: the content is a centred 70rem column with 1.5rem gutters. */
function columnEdges() {
  const max = 70 * 16;
  const gutter = 24;
  const w = document.documentElement.clientWidth;
  const inner = Math.min(max, w - gutter * 2);
  const left = (w - inner) / 2;
  return { left, right: left + inner, width: w };
}

function targetY(el: Element, body: HTMLElement) {
  const r = el.getBoundingClientRect();
  const b = body.getBoundingClientRect();
  return { top: r.top - b.top, center: r.top - b.top + r.height / 2 };
}

function sideX(route: PropRoute) {
  const { left, right, width } = columnEdges();
  const half = route.size / 2;
  if (route.side === "left") return Math.max(half + 8, left - CHOREOGRAPHY.marginInset - half);
  return Math.min(width - half - 8, right + CHOREOGRAPHY.marginInset - half);
}

/**
 * No motion / narrow screens: a few props sit statically beside their
 * sections (hidden entirely below 1024px, where there is no margin).
 */
function placeStatic(layer: HTMLElement, body: HTMLElement, _wide: boolean): Cleanup {
  const show = document.documentElement.clientWidth >= 1024;
  layer.dataset.props = show ? "static" : "off";
  const place = () => {
    for (const route of PROPS) {
      const el = layer.querySelector<HTMLElement>(`[data-prop="${route.id}"]`);
      const to = document.querySelector(route.to);
      if (!el || !to) continue;
      const y = targetY(to, body).center - route.size / 2;
      el.style.transform = `translate(${sideX(route)}px, ${y}px) rotate(${route.rotate[1]}deg)`;
      el.style.opacity = show ? "1" : "0";
    }
  };
  place();
  const ro = new ResizeObserver(place);
  ro.observe(body);
  return () => {
    ro.disconnect();
    delete layer.dataset.props;
  };
}

async function startFlying(layer: HTMLElement, body: HTMLElement): Promise<Cleanup> {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
  gsap.registerPlugin(ScrollTrigger);
  layer.dataset.props = "flying";

  const ctx = gsap.context(() => {
    for (const route of PROPS) {
      const el = layer.querySelector<HTMLElement>(`[data-prop="${route.id}"]`);
      const from = document.querySelector(route.from);
      const to = document.querySelector(route.to);
      if (!el || !from || !to) continue;

      // Recomputed on every ScrollTrigger refresh (resize, fonts, images)
      const geometry = () => {
        const x = sideX(route);
        const y0 = targetY(from, body).top - route.size;
        const y1 = targetY(to, body).center - route.size / 2;
        return { x, y0, y1 };
      };
      let g = geometry();
      gsap.set(el, { x: g.x, y: g.y0, rotation: route.rotate[0], opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: from,
          start: "top 85%",
          endTrigger: to,
          end: "center 55%",
          scrub: CHOREOGRAPHY.scrub,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            g = geometry();
          },
        },
      });
      tl.to(el, { opacity: 1, duration: 0.08, ease: "none" }, 0)
        .to(el, { y: () => g.y1, rotation: route.rotate[1], duration: 1, ease: "none" }, 0)
        .to(el, { x: () => g.x + (route.drift ?? 0), duration: 1, ease: "sine.inOut" }, 0);
    }

    // Process cable: the signal travels along the path as the section passes
    const cablePath = document.querySelector<SVGPathElement>("[data-cable-path]");
    const signal = document.querySelector<SVGCircleElement>("[data-cable-signal]");
    const process = document.querySelector("#process");
    if (cablePath && signal && process) {
      const length = cablePath.getTotalLength();
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: process,
          start: "top 80%",
          end: "bottom 60%",
          scrub: CHOREOGRAPHY.scrub,
        },
        onUpdate: () => {
          const pt = cablePath.getPointAtLength(state.p * length);
          signal.setAttribute("cx", pt.x.toFixed(1));
          signal.setAttribute("cy", pt.y.toFixed(1));
        },
      });
    }
  }, body);

  // Images/fonts settle after init; refresh positions once they do.
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh, { once: true });
  const ro = new ResizeObserver(() => ScrollTrigger.refresh());
  ro.observe(body);

  return () => {
    ro.disconnect();
    ctx.revert();
    delete layer.dataset.props;
  };
}
