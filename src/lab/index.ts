/**
 * Lab runtime entry. Builds the Three.js scene, owns the single animation
 * loop, the station state machine, pointer interaction, and teardown.
 * Loaded lazily by src/lab/ui.ts; communicates back through CustomEvents.
 */
import { gsap } from "gsap";
import { DirectionalLight, HemisphereLight, Material, Raycaster, Scene, Vector2 } from "three";
import { CAMERA } from "./config";
import { OVERVIEW_POSE, createCamera, frame, type CameraPose } from "./camera";
import { createRenderer, applyPixelRatio } from "./renderer";
import { loadTextures } from "./loader";
import { MaterialSet, makeGradientMap, makeSharedMaterials } from "./materials";
import { disposeRenderer, disposeTree } from "./dispose";
import { buildRoom } from "./scene/room";
import { Robot } from "./scene/robot";
import { MechArm } from "./scene/arm";
import { buildStations } from "./scene/stations";
import type { Animator, BuildContext, StationDefinition } from "./scene/types";
import { cameraTravel, press, repairSequence, robotPoint } from "./sequences";
import { STATION_BY_ID, isStationId, type StationId } from "./stations";
import type { LabEvents, LabHandle, LabOptions, LabState, SelectSource } from "./types";

declare global {
  interface Window {
    __lab?: LabHandle;
  }
}

export function createLab(root: HTMLElement, canvas: HTMLCanvasElement, options: LabOptions): LabHandle {
  window.__lab?.dispose();
  const lab = buildLab(root, canvas, options);
  window.__lab = lab;
  return lab;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => window.__lab?.dispose());
}

function buildLab(root: HTMLElement, canvas: HTMLCanvasElement, options: LabOptions): LabHandle {
  const emit = <K extends keyof LabEvents>(type: K, detail: LabEvents[K]) =>
    root.dispatchEvent(new CustomEvent(type, { detail }));

  const state: LabState = {
    phase: "loading",
    active: null,
    pending: null,
    hovered: null,
    reducedMotion: options.reducedMotion,
    visible: true,
    progress: 0,
  };

  const abort = new AbortController();
  const { signal } = abort;
  const renderer = createRenderer(canvas);
  const scene = new Scene();
  const camera = createCamera(root.clientWidth / Math.max(1, root.clientHeight));
  const lookTarget = OVERVIEW_POSE.target.clone();
  camera.position.copy(OVERVIEW_POSE.position);

  scene.add(new HemisphereLight(0xfff6ea, 0x8a7f74, 1.25));
  const sun = new DirectionalLight(0xffffff, 2.1);
  sun.position.set(5, 8, 6);
  scene.add(sun);

  const gradientMap = makeGradientMap();
  const shared = makeSharedMaterials();
  const materialSets: MaterialSet[] = [];
  const gsapCtx = gsap.context(() => {});

  // ----- loop -----
  let raf = 0;
  let last = 0;
  let dirty = true;
  let frames = 0;
  const animators: Animator[] = [];
  const pointer = new Vector2(-2, -2);
  let pointerDirty = false;
  const raycaster = new Raycaster();
  let hotspots: { mesh: import("three").Mesh; id: StationId }[] = [];
  let stations = new Map<StationId, StationDefinition>();
  let robot: Robot | null = null;
  let arm: MechArm | null = null;
  let repairParts: ReturnType<typeof buildStations>["repair"] | null = null;
  let currentPose: CameraPose = OVERVIEW_POSE;
  let travel: gsap.core.Timeline | null = null;
  let selectCleanup: (() => void) | null = null;

  const requestRender = () => {
    dirty = true;
    schedule();
  };
  const schedule = () => {
    if (!raf && state.visible) raf = requestAnimationFrame(tick);
  };
  const tick = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now;
    let any = false;
    if (pointerDirty) {
      pointerDirty = false;
      updateHover();
      dirty = true;
    }
    if (!state.reducedMotion && state.visible) {
      const t = now / 1000;
      for (const a of animators) any = a.update(dt, t) || any;
    }
    camera.lookAt(lookTarget);
    if (dirty || any) {
      renderer.render(scene, camera);
      frames++;
      dirty = false;
    }
    if (any || gsap.globalTimeline.isActive()) schedule();
    else last = 0;
  };

  // ----- sizing -----
  const resize = () => {
    const w = root.clientWidth;
    const h = root.clientHeight;
    if (!w || !h) return;
    applyPixelRatio(renderer);
    renderer.setSize(w, h, false);
    const framed = frame(camera, currentPose, w / h);
    if (travel?.isActive()) {
      travel.kill();
      travel = cameraTravel(seq, framed, 0.3);
    } else if (state.phase !== "transitioning") {
      camera.position.copy(framed.position);
      lookTarget.copy(framed.target);
    }
    applyViewOffset();
    requestRender();
  };
  const ro = new ResizeObserver(() => resize());
  ro.observe(root);

  /**
   * Shift the frustum so the room sits right of the intro card in the
   * overview, and left of the side panel when a station is open (wide
   * screens only; narrow screens use the full viewport).
   */
  const applyViewOffset = () => {
    const w = root.clientWidth;
    const h = root.clientHeight;
    const stationView = state.active !== null || (state.phase === "transitioning" && state.pending !== "overview");
    if (w >= 1024 && stationView) {
      camera.setViewOffset(w, h, Math.min(460, w) * 0.5, 0, w, h);
    } else if (w >= 1024) {
      camera.setViewOffset(w, h, -w * 0.11, h * 0.03, w, h);
    } else if (w < 768 && stationView) {
      // Bottom-sheet panel: keep the station in the upper part of the screen.
      camera.setViewOffset(w, h, 0, h * 0.28, w, h);
    } else if (w < 768) {
      // Compact intro card at the top: sit the room a little lower.
      camera.setViewOffset(w, h, 0, -h * 0.06, w, h);
    } else {
      camera.clearViewOffset();
    }
  };

  // ----- visibility -----
  const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && document.visibilityState === "visible"));
  io.observe(root);
  document.addEventListener("visibilitychange", () => setVisible(document.visibilityState === "visible" && !paused), { signal });
  let paused = false;
  function setVisible(v: boolean) {
    const next = v && !paused;
    if (state.visible === next) return;
    state.visible = next;
    if (next) {
      last = 0;
      schedule();
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  // ----- hover / pointer -----
  const seq = { camera, lookTarget, reducedMotion: state.reducedMotion, requestRender };

  function setHover(id: StationId | null) {
    if (state.hovered === id) return;
    if (state.hovered) stations.get(state.hovered)?.materials.setHighlight(false);
    state.hovered = id;
    if (id) stations.get(id)?.materials.setHighlight(true);
    canvas.style.cursor = id ? "pointer" : "";
    if (robot && state.phase === "overview") {
      robot.lookTarget.copy(id ? stations.get(id)!.focus : camera.position);
    }
    emit("lab:hover", { id });
    requestRender();
  }

  function pick(): StationId | null {
    if (!hotspots.length) return null;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      hotspots.map((h) => h.mesh),
      false,
    );
    const id = hits[0]?.object.userData.station;
    return isStationId(id) ? id : null;
  }

  function updateHover() {
    if (state.phase === "transitioning" || state.phase === "loading") return;
    setHover(pick());
  }

  let downAt: { x: number; y: number; t: number } | null = null;
  const toNdc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  canvas.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      toNdc(e);
      pointerDirty = true;
      schedule();
    },
    { signal, passive: true },
  );
  canvas.addEventListener("pointerleave", () => setHover(null), { signal });
  canvas.addEventListener("pointerdown", (e) => (downAt = { x: e.clientX, y: e.clientY, t: performance.now() }), { signal });
  canvas.addEventListener(
    "pointerup",
    (e) => {
      if (!downAt) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      const held = performance.now() - downAt.t;
      downAt = null;
      if (moved > 8 || held > 500) return;
      if (state.phase === "loading" || state.phase === "transitioning") return;
      toNdc(e);
      const id = pick();
      if (!id) return;
      const station = stations.get(id)!;
      press(seq, station.pressTarget);
      select(id, "pointer");
    },
    { signal },
  );

  // ----- state machine -----
  function setPhase(phase: LabState["phase"]) {
    if (state.phase === phase) return;
    state.phase = phase;
    emit("lab:phase", { phase });
  }

  function travelTo(pose: CameraPose, onArrive: () => void) {
    travel?.kill();
    currentPose = pose;
    const framed = frame(camera, pose, root.clientWidth / Math.max(1, root.clientHeight));
    const tl = cameraTravel(seq, framed, CAMERA.travelSeconds);
    travel = tl;
    tl.eventCallback("onComplete", () => {
      if (travel === tl) travel = null;
      onArrive();
    });
    if (state.reducedMotion) tl.progress(1);
  }

  function select(id: StationId, source: SelectSource = "api") {
    if (state.phase === "loading" || state.phase === "error") return;
    if (state.phase === "transitioning") {
      state.pending = id;
      return;
    }
    if (state.active === id) return;
    runDeselect();
    const station = stations.get(id)!;
    setHover(null);
    setPhase("transitioning");
    state.pending = null;
    state.active = id;
    applyViewOffset();
    if (robot) robotPoint(seq, robot, station.focus);
    travelTo(station.pose, () => {
      setPhase("station");
      const cleanup = station.onSelect?.();
      selectCleanup = typeof cleanup === "function" ? cleanup : null;
      emit("lab:station", { id, source });
      drainPending();
    });
  }

  function back() {
    if (state.phase === "loading" || state.phase === "error") return;
    if (state.phase === "transitioning") {
      state.pending = "overview";
      return;
    }
    if (state.phase === "overview") return;
    runDeselect();
    state.active = null;
    setPhase("transitioning");
    state.pending = null;
    applyViewOffset();
    if (robot) robotPoint(seq, robot, null);
    travelTo(OVERVIEW_POSE, () => {
      setPhase("overview");
      emit("lab:station", { id: null, source: "api" });
      drainPending();
    });
  }

  function runDeselect() {
    selectCleanup?.();
    selectCleanup = null;
  }

  function drainPending() {
    const next = state.pending;
    state.pending = null;
    if (next === "overview") back();
    else if (next) select(next, "api");
  }

  // ----- build -----
  const ready = (async () => {
    const textures = await loadTextures(
      renderer,
      { screen: options.screenSrc, portrait: options.portraitSrc, thumbs: options.thumbSrcs },
      (loaded, total) => {
        state.progress = total ? loaded / total : 0;
        emit("lab:progress", { loaded, total });
      },
    );
    if (signal.aborted) return;

    const ctx: BuildContext = {
      shared,
      textures,
      reducedMotion: state.reducedMotion,
      makeMaterials: () => {
        const set = new MaterialSet(gradientMap);
        materialSets.push(set);
        return set;
      },
    };

    scene.add(buildRoom(ctx));
    const built = buildStations(ctx);
    repairParts = built.repair;
    for (const s of built.list) {
      scene.add(s.group);
      stations.set(s.id, s);
      for (const h of s.hotspots) hotspots.push({ mesh: h, id: s.id });
      animators.push(...s.animators);
    }

    robot = new Robot(ctx);
    robot.group.position.set(-0.55, 0, -0.55);
    robot.group.rotation.y = 0.8;
    scene.add(robot.group);
    animators.push(robot.animator());

    const repairStation = stations.get("repair")!;
    arm = new MechArm(ctx, repairStation.group.position.x - 0.3, 0.9);
    scene.add(arm.group);
    animators.push(arm.animator());

    repairStation.onSelect = () => repairSequence(seq, repairParts!, arm!, robot!, shared);

    resize();
    renderer.render(scene, camera);
    frames++;
    setPhase("overview");
    emit("lab:ready", undefined);
    schedule();
  })();
  ready.catch((error) => {
    setPhase("error");
    emit("lab:error", { error });
  });

  // ----- context loss -----
  canvas.addEventListener(
    "webglcontextlost",
    (e) => {
      e.preventDefault();
      setVisible(false);
    },
    { signal },
  );
  canvas.addEventListener("webglcontextrestored", () => setVisible(true), { signal });
  canvas.addEventListener("webglcontextcreationerror", (e) => emit("lab:error", { error: e }), { signal });

  // ----- handle -----
  const handle: LabHandle = {
    ready,
    select,
    back,
    hover: (id) => {
      if (state.phase === "overview" || state.phase === "station") setHover(id);
    },
    pause: () => {
      paused = true;
      setVisible(false);
    },
    resume: () => {
      paused = false;
      setVisible(true);
      requestRender();
    },
    requestRender,
    getState: () => state,
    dispose: () => {
      abort.abort();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      travel?.kill();
      gsapCtx.revert();
      gsap.globalTimeline.clear();
      runDeselect();
      disposeTree(scene);
      materialSets.forEach((m) => m.dispose());
      Object.values(shared).forEach((m) => {
        if (m instanceof Material) m.dispose();
      });
      gradientMap.dispose();
      disposeRenderer(renderer);
      if (window.__lab === handle) delete window.__lab;
    },
    debug: {
      renderer,
      scene,
      camera,
      get frames() {
        return frames;
      },
      get animators() {
        return animators;
      },
      stations: STATION_BY_ID,
      lookTarget,
      /** Run one frame synchronously (useful when rAF is paused, e.g. hidden tabs). */
      step: () => tick(performance.now()),
    },
  };
  return handle;
}
