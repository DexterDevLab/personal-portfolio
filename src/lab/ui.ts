/**
 * Light UI layer for the lab (no Three.js). Owns the view mode (lab/page),
 * the station panels, the station list, view controls, hash deep links,
 * focus management, and booting the heavy runtime. Works on its own when the
 * runtime never loads (mobile page view, no WebGL, load failure).
 */
import { HASH_TO_STATION, STATION_BY_ID, isStationId, type StationId } from "./stations";
import type { LabEvents, LabHandle, LabRuntimeModule } from "./types";

type View = "lab" | "page";

export interface LabUiOptions {
  boot: () => Promise<LabRuntimeModule>;
}

const BOOT_TIMEOUT_MS = 20_000;
const ROTATE_STEP = Math.PI / 8;

export function initLabUi(root: HTMLElement, options: LabUiOptions) {
  const html = document.documentElement;
  const canvas = root.querySelector<HTMLCanvasElement>("[data-lab-canvas]")!;
  const loading = root.querySelector<HTMLElement>("[data-lab-loading]");
  const progress = root.querySelector<HTMLProgressElement>("[data-lab-progress]");
  const loadingText = root.querySelector<HTMLElement>("[data-lab-loading-text]");
  const notice = root.querySelector<HTMLElement>("[data-lab-notice]");
  const status = root.querySelector<HTMLElement>("[data-lab-status]");
  const stationButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-station]")];
  const panels = new Map<StationId, HTMLDialogElement>();
  root.querySelectorAll<HTMLDialogElement>("[data-station-panel]").forEach((d) => {
    const id = d.dataset.stationPanel;
    if (isStationId(id)) panels.set(id, d);
  });

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches || devFlag("motion") === "reduce";

  let lab: LabHandle | null = null;
  let booting: Promise<void> | null = null;
  let openId: StationId | null = null;
  let lastTrigger: HTMLElement | null = null;

  const view = (): View => (html.dataset.view === "lab" ? "lab" : "page");
  const labSupported = html.hasAttribute("data-lab-supported");

  // ---------- view mode ----------

  function setView(next: View, opts: { persist?: boolean; hash?: string } = {}) {
    const { persist = true } = opts;
    html.dataset.view = next;
    if (persist) {
      try {
        localStorage.setItem("view", next);
      } catch {}
    }
    const url = new URL(location.href);
    url.searchParams.delete("view");
    history.replaceState(null, "", url.pathname + url.search + (opts.hash ?? location.hash));

    if (next === "lab") {
      window.scrollTo(0, 0);
      lab?.resume();
      void ensureBooted();
      const target = stationFromHash(location.hash);
      if (target) requestStation(target, null);
    } else {
      closePanel({ restoreFocus: false });
      lab?.back();
      lab?.pause();
    }
  }

  function scrollToAnchor(hash: string) {
    const id = stationFromHash(hash);
    const anchor = id ? STATION_BY_ID[id].pageAnchor : hash.replace(/^#/, "");
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (!el) return;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" }));
  }

  // ---------- panels ----------

  function openPanel(id: StationId, trigger: HTMLElement | null) {
    if (openId === id) return;
    if (openId) closePanel({ restoreFocus: false, silent: true });
    const panel = panels.get(id);
    if (!panel) return;
    openId = id;
    if (trigger) lastTrigger = trigger;
    if (!panel.open) panel.show();
    root.dataset.panel = id;
    stationButtons.forEach((b) => b.setAttribute("aria-expanded", String(b.dataset.station === id)));
    const meta = STATION_BY_ID[id];
    if (status) status.textContent = `Viewing: ${meta.label}`;
    if (location.hash !== meta.hash) history.replaceState(null, "", location.pathname + location.search + meta.hash);
    const heading = panel.querySelector<HTMLElement>("h2");
    heading?.focus({ preventScroll: true });
    panel.scrollTop = 0;
  }

  function closePanel(opts: { restoreFocus?: boolean; silent?: boolean } = {}) {
    const { restoreFocus = true, silent = false } = opts;
    if (!openId) return;
    const panel = panels.get(openId);
    panel?.close();
    openId = null;
    delete root.dataset.panel;
    stationButtons.forEach((b) => b.setAttribute("aria-expanded", "false"));
    if (!silent) {
      if (status) status.textContent = "Back at the lab overview";
    }
    if (location.hash.startsWith("#lab/")) history.replaceState(null, "", location.pathname + location.search);
    if (restoreFocus) lastTrigger?.focus({ preventScroll: true });
  }

  const runtimeReady = () => !!lab && lab.getState().phase !== "loading" && lab.getState().phase !== "error";

  /** Station request from any source: list button, hotspot, hash, link. */
  function requestStation(id: StationId, trigger: HTMLElement | null) {
    if (trigger) lastTrigger = trigger;
    if (runtimeReady()) lab!.select(id, "api");
    else openPanel(id, trigger);
  }

  function goBack() {
    const trigger = lastTrigger;
    closePanel();
    lab?.back();
    trigger?.focus({ preventScroll: true });
  }

  // ---------- runtime boot ----------

  function ensureBooted(): Promise<void> {
    if (lab || booting) return booting ?? Promise.resolve();
    if (!labSupported) return Promise.resolve();
    root.dataset.labState = "loading";
    booting = (async () => {
      const watchdog = setTimeout(() => fail(new Error("Timed out starting the lab")), BOOT_TIMEOUT_MS);
      try {
        if (devFlag("labfail")) throw new Error("Forced failure (dev)");
        const mod = await options.boot();
        const thumbs = JSON.parse(root.dataset.thumbSrcs ?? "[]") as string[];
        lab = mod.createLab(root, canvas, {
          screenSrc: root.dataset.screenSrc ?? "",
          portraitSrc: root.dataset.portraitSrc ?? "",
          thumbSrcs: thumbs,
          logoSrc: root.dataset.logoSrc,
          reducedMotion,
        });
        await lab.ready;
        clearTimeout(watchdog);
        root.dataset.labState = "ready";
        if (loading) loading.hidden = true;
        // Apply any station requested while loading.
        const wanted = openId ?? stationFromHash(location.hash);
        if (wanted) lab.select(wanted, "hash");
        if (view() === "page") lab.pause();
      } catch (error) {
        clearTimeout(watchdog);
        fail(error);
      }
    })();
    return booting;
  }

  function fail(error: unknown) {
    if (root.dataset.labState === "error") return;
    console.error("[lab] could not start:", error);
    root.dataset.labState = "error";
    lab?.dispose();
    lab = null;
    if (loading) loading.hidden = true;
    if (notice) {
      notice.textContent = "The 3D lab couldn't start on this device, so here is the page version instead.";
      notice.hidden = false;
    }
    setView("page", { persist: false });
  }

  // ---------- runtime events ----------

  const on = <K extends keyof LabEvents>(type: K, handler: (detail: LabEvents[K]) => void) =>
    root.addEventListener(type, (e) => handler((e as CustomEvent<LabEvents[K]>).detail));

  on("lab:progress", ({ loaded, total }) => {
    if (progress && total > 0) {
      progress.max = total;
      progress.value = loaded;
    }
    if (loadingText) loadingText.textContent = total > 0 ? `Loading the lab… ${loaded}/${total}` : "Loading the lab…";
  });
  on("lab:station", ({ id }) => {
    if (id) openPanel(id, null);
    else closePanel({ restoreFocus: false });
  });
  on("lab:hover", ({ id }) => {
    stationButtons.forEach((b) => b.toggleAttribute("data-hover", b.dataset.station === id));
  });
  on("lab:error", ({ error }) => fail(error));

  // ---------- DOM wiring ----------

  stationButtons.forEach((button) => {
    const id = button.dataset.station;
    if (!isStationId(id)) return;
    button.addEventListener("click", () => {
      if (openId === id) goBack();
      else requestStation(id, button);
    });
    button.addEventListener("focus", () => lab?.hover(id));
    button.addEventListener("blur", () => lab?.hover(null));
    button.addEventListener("pointerenter", () => lab?.hover(id));
    button.addEventListener("pointerleave", () => lab?.hover(null));
  });

  root.querySelectorAll<HTMLElement>("[data-station-link]").forEach((el) => {
    const id = el.dataset.stationLink;
    if (!isStationId(id)) return;
    el.addEventListener("click", (event) => {
      event.preventDefault();
      requestStation(id, el);
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-lab-back]").forEach((b) => b.addEventListener("click", goBack));

  root.querySelectorAll<HTMLButtonElement>("[data-lab-rotate]").forEach((b) => {
    const dir = b.dataset.labRotate === "left" ? 1 : -1;
    b.addEventListener("click", () => lab?.rotate(dir * ROTATE_STEP));
  });
  root.querySelector<HTMLButtonElement>("[data-lab-reset]")?.addEventListener("click", () => {
    if (openId) closePanel({ restoreFocus: false });
    lab?.resetView();
    if (status) status.textContent = "View reset to the overview";
  });

  // Arrow keys rotate while focus is inside the lab section (not in a form field).
  root.addEventListener("keydown", (event) => {
    if (!lab || view() !== "lab") return;
    const target = event.target as HTMLElement | null;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      lab.rotate(ROTATE_STEP);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      lab.rotate(-ROTATE_STEP);
    }
  });

  // "Jump to this section": close the panel and scroll the page to the
  // matching section below the lab.
  root.querySelectorAll<HTMLAnchorElement>("[data-section-link]").forEach((a) => {
    a.addEventListener("click", (event) => {
      event.preventDefault();
      const anchor = a.dataset.sectionLink ?? "";
      closePanel({ restoreFocus: false });
      lab?.back();
      const el = document.getElementById(anchor);
      el?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      (el?.querySelector<HTMLElement>("h2") ?? el)?.focus?.({ preventScroll: true });
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-lab-zoom]").forEach((b) => {
    const factor = b.dataset.labZoom === "in" ? 0.8 : 1.25;
    b.addEventListener("click", () => lab?.zoom(factor));
  });

  document.querySelectorAll<HTMLButtonElement>("[data-mode-switch]").forEach((button) => {
    button.addEventListener("click", () => {
      setView(view() === "lab" ? "page" : "lab");
      // Close the mobile menu if the switch lives inside it.
      button.closest("dialog")?.close();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && openId && view() === "lab") {
      event.preventDefault();
      goBack();
    }
  });

  // Hash routing. Station deep links live under `#lab/<id>`; every other
  // hash is a page section the browser scrolls to on its own. Navigating to
  // a section while a station panel is open closes the panel first.
  window.addEventListener("hashchange", () => {
    const id = stationFromHash(location.hash);
    if (id) {
      if (view() === "lab") requestStation(id, null);
      else scrollToAnchor(location.hash);
      return;
    }
    if (openId) {
      closePanel({ restoreFocus: false, silent: true });
      lab?.back();
    }
  });

  // Secondary view controls collapse behind a disclosure on narrow screens.
  const viewControls = root.querySelector<HTMLDetailsElement>("[data-view-controls]");
  if (viewControls) {
    const wide = matchMedia("(min-width: 768px)");
    const sync = () => {
      if (wide.matches) viewControls.open = true;
    };
    sync();
    wide.addEventListener("change", sync);
  }

  // ---------- initial state ----------

  if (view() === "lab") {
    const id = stationFromHash(location.hash);
    if (id) {
      window.scrollTo(0, 0);
      openPanel(id, null);
    }
    const start = () => void ensureBooted();
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
  } else {
    if (loading) loading.hidden = true;
    const id = stationFromHash(location.hash);
    if (id) scrollToAnchor(location.hash);
  }
}

function stationFromHash(hash: string): StationId | null {
  const id = HASH_TO_STATION[hash];
  return id ?? null;
}

/** Dev-only query flags for testing failure paths (`?labfail=1`, `?motion=reduce`). */
function devFlag(name: string): string | null {
  if (!import.meta.env.DEV) return null;
  return new URLSearchParams(location.search).get(name);
}
