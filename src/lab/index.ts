/**
 * Lab runtime entry. Builds the Three.js scene, owns the single animation
 * loop, the orbit controls, the station state machine, pointer gestures,
 * and teardown. Loaded lazily by src/lab/ui.ts; talks back via CustomEvents.
 */
import { gsap } from "gsap";
import { DirectionalLight, HemisphereLight, Material, MathUtils, Raycaster, Scene, Vector2, Vector3, type Mesh } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CAMERA, ROOM } from "./config";
import { OVERVIEW_POSE, createCamera, frame, type CameraPose } from "./camera";
import { createRenderer, applyPixelRatio } from "./renderer";
import { loadTextures } from "./loader";
import { MaterialSet, makeGradientMap, makeSharedMaterials } from "./materials";
import { disposeRenderer, disposeTree } from "./dispose";
import { buildRoom, type RoomParts } from "./scene/room";
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

const UP = new Vector3(0, 1, 0);
/** Pointer travel (px) beyond which a gesture counts as a drag, not a click. */
const DRAG_THRESHOLD = 6;

function buildLab(root: HTMLElement, canvas: HTMLCanvasElement, options: LabOptions): LabHandle {
  const emit = <K extends keyof LabEvents>(type: K, detail: LabEvents[K]) =>
    root.dispatchEvent(new CustomEvent(type, { detail }));

  // The canvas is sized to its stage element (full section on desktop, the
  // middle row of the mobile layout), never to the window.
  const stage = canvas.parentElement ?? root;

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
  const camera = createCamera(stage.clientWidth / Math.max(1, stage.clientHeight));
  camera.position.copy(OVERVIEW_POSE.position);

  // ----- orbit controls -----
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(OVERVIEW_POSE.target);
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.6;
  /** Orbit limits for exploring the whole room vs. looking at one station. */
  const LIMITS = {
    overview: { minPolar: 0.3, maxPolar: 1.3, minDistance: 5, maxDistance: 22 },
    station: { minPolar: 0.25, maxPolar: 1.5, minDistance: 1.8, maxDistance: 9 },
  } as const;
  const applyLimits = (mode: keyof typeof LIMITS) => {
    const l = LIMITS[mode];
    controls.minPolarAngle = l.minPolar; // never straight down
    controls.maxPolarAngle = l.maxPolar; // never below the floor
    controls.minDistance = l.minDistance;
    controls.maxDistance = l.maxDistance;
  };
  applyLimits("overview");
  controls.update();

  scene.add(new HemisphereLight(0xfff6ea, 0x8a7f74, 1.25));
  const sun = new DirectionalLight(0xffffff, 2.1);
  sun.position.set(5, 8, 6);
  scene.add(sun);

  const gradientMap = makeGradientMap();
  const shared = makeSharedMaterials();
  const materialSets: MaterialSet[] = [];
  const gsapCtx = gsap.context(() => {});

  // ----- scene refs -----
  const animators: Animator[] = [];
  const raycaster = new Raycaster();
  const pointer = new Vector2(-2, -2);
  const hotspotMeshes: Mesh[] = [];
  const stations = new Map<StationId, StationDefinition>();
  let room: RoomParts | null = null;
  let robot: Robot | null = null;
  let arm: MechArm | null = null;
  let repairParts: ReturnType<typeof buildStations>["repair"] | null = null;
  let currentPose: CameraPose = OVERVIEW_POSE;
  /** Where the visitor was exploring before selecting a station. */
  let savedView: CameraPose | null = null;
  let travel: gsap.core.Timeline | null = null;
  let selectCleanup: (() => void) | null = null;

  // ----- loop -----
  let raf = 0;
  let last = 0;
  let dirty = true;
  let frames = 0;
  let pointerDirty = false;
  let paused = false;
  const lastCam = new Vector3(Infinity, Infinity, Infinity);

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
    // Damping keeps the controls moving after the pointer is released. While a
    // camera travel owns the camera the controls stay out of the way.
    if (controls.enabled && controls.update(dt)) any = true;
    if (!camera.position.equals(lastCam)) {
      lastCam.copy(camera.position);
      updateWalls();
      dirty = true;
    }
    if (dirty || any) {
      renderer.render(scene, camera);
      frames++;
      dirty = false;
    }
    if (any || gsap.globalTimeline.isActive()) schedule();
    else last = 0;
  };

  /** Roofless dollhouse: hide whichever wall the camera is looking through. */
  const updateWalls = () => {
    if (!room) return;
    const { back, left, right, skirtBack, skirtLeft, skirtRight } = room.walls;
    const p = camera.position;
    const showBack = p.z > ROOM.minZ + 0.4;
    const showLeft = p.x > ROOM.minX + 0.4;
    const showRight = p.x < ROOM.maxX - 0.4 || p.z > ROOM.rightWallEndZ + 0.4;
    back.visible = skirtBack.visible = showBack;
    left.visible = skirtLeft.visible = showLeft;
    right.visible = skirtRight.visible = showRight;
  };

  // ----- sizing -----
  const stageSize = () => ({ w: stage.clientWidth, h: stage.clientHeight });
  const narrow = () => stageSize().w < 768;

  const resize = () => {
    const { w, h } = stageSize();
    if (!w || !h) return;
    applyPixelRatio(renderer);
    renderer.setSize(w, h, false);
    const framed = frame(camera, currentPose, w / h);
    if (travel?.isActive()) {
      travel.kill();
      travelTo(currentPose, travelArrival, 0.3);
    } else if (state.phase === "overview" && state.active === null && !userOrbited) {
      camera.position.copy(framed.position);
      controls.target.copy(framed.target);
    }
    applyViewOffset();
    controls.update();
    requestRender();
  };
  const ro = new ResizeObserver(() => resize());
  ro.observe(stage);

  /** Has the visitor moved the camera away from the default framing? */
  let userOrbited = false;
  controls.addEventListener("start", () => {
    userOrbited = true;
  });
  controls.addEventListener("change", () => requestRender());

  /**
   * Shift the frustum so the room sits beside the intro column in the
   * overview, left of the side panel in a station view (wide screens), or
   * above the bottom sheet (narrow screens).
   */
  const applyViewOffset = () => {
    const { w, h } = stageSize();
    const stationView = state.active !== null || (state.phase === "transitioning" && state.pending !== "overview");
    if (w >= 1024 && stationView) {
      camera.setViewOffset(w, h, Math.min(460, w) * 0.5, 0, w, h);
    } else if (w >= 1024) {
      camera.setViewOffset(w, h, -w * 0.1, h * 0.03, w, h);
    } else if (w < 768 && stationView) {
      camera.setViewOffset(w, h, 0, h * 0.26, w, h);
    } else {
      camera.clearViewOffset();
    }
  };

  // ----- visibility -----
  const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && document.visibilityState === "visible"));
  io.observe(root);
  document.addEventListener("visibilitychange", () => setVisible(document.visibilityState === "visible"), { signal });
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

  // ----- hover / gestures -----
  const seq = { camera, lookTarget: controls.target, reducedMotion: state.reducedMotion, requestRender };

  function setHover(id: StationId | null) {
    if (state.hovered === id) return;
    if (state.hovered) stations.get(state.hovered)?.materials.setHighlight(false);
    state.hovered = id;
    if (id) stations.get(id)?.materials.setHighlight(true);
    canvas.style.cursor = id ? "pointer" : dragging ? "grabbing" : "grab";
    if (robot && state.phase === "overview") {
      robot.lookTarget.copy(id ? stations.get(id)!.focus : camera.position);
    }
    emit("lab:hover", { id });
    requestRender();
  }

  function pick(): StationId | null {
    if (!hotspotMeshes.length) return null;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hotspotMeshes, false);
    const id = hits[0]?.object.userData.station;
    return isStationId(id) ? id : null;
  }

  function updateHover() {
    if (state.phase === "transitioning" || state.phase === "loading" || dragging) return;
    setHover(pick());
  }

  const toNdc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };

  // Gesture discrimination: a press that moves more than DRAG_THRESHOLD is a
  // drag (OrbitControls handles it); anything shorter is a click/tap that
  // raycasts once on release. Hover raycasts run at most once per frame while
  // the pointer moves, never while dragging.
  let down: { x: number; y: number; id: number } | null = null;
  let dragging = false;
  canvas.style.cursor = "grab";

  canvas.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      down = { x: e.clientX, y: e.clientY, id: e.pointerId };
      dragging = false;
    },
    { signal },
  );
  canvas.addEventListener(
    "pointermove",
    (e) => {
      if (down && down.id === e.pointerId && !dragging) {
        if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_THRESHOLD) {
          dragging = true;
          setHover(null);
          canvas.style.cursor = "grabbing";
        }
      }
      if (e.pointerType === "touch" || dragging) return;
      toNdc(e);
      pointerDirty = true;
      schedule();
    },
    { signal, passive: true },
  );
  const endGesture = (e: PointerEvent, click: boolean) => {
    if (!down || down.id !== e.pointerId) return;
    const wasDrag = dragging;
    down = null;
    dragging = false;
    canvas.style.cursor = "grab";
    if (!click || wasDrag) return;
    if (state.phase === "loading" || state.phase === "transitioning") return;
    toNdc(e);
    const id = pick();
    if (!id) return;
    const station = stations.get(id)!;
    press(seq, station.pressTarget);
    select(id, "pointer");
  };
  canvas.addEventListener("pointerup", (e) => endGesture(e, true), { signal });
  canvas.addEventListener("pointercancel", (e) => endGesture(e, false), { signal });
  canvas.addEventListener(
    "pointerleave",
    (e) => {
      if (!down) setHover(null);
      else if (e.pointerType === "mouse") endGesture(e, false);
    },
    { signal },
  );

  // ----- state machine -----
  function setPhase(phase: LabState["phase"]) {
    if (state.phase === phase) return;
    state.phase = phase;
    emit("lab:phase", { phase });
  }

  let travelArrival: () => void = () => {};

  function travelTo(pose: CameraPose, onArrive: () => void, seconds: number = CAMERA.travelSeconds) {
    travel?.kill();
    currentPose = pose;
    travelArrival = onArrive;
    const { w, h } = stageSize();
    const framed = frame(camera, pose, w / Math.max(1, h));
    controls.enabled = false;
    const tl = cameraTravel(seq, framed, seconds);
    travel = tl;
    tl.eventCallback("onComplete", () => {
      if (travel === tl) travel = null;
      controls.update();
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
    if (state.active === null) {
      savedView = { position: camera.position.clone(), target: controls.target.clone() };
    }
    runDeselect();
    const station = stations.get(id)!;
    setHover(null);
    setPhase("transitioning");
    state.pending = null;
    state.active = id;
    applyViewOffset();
    // Orbiting stays available around the station, within a tight range.
    applyLimits("station");
    if (robot) robotPoint(seq, robot, station.focus);
    travelTo(station.pose, () => {
      setPhase("station");
      controls.enabled = true;
      const cleanup = station.onSelect?.();
      selectCleanup = typeof cleanup === "function" ? cleanup : null;
      emit("lab:station", { id, source });
      drainPending();
    });
  }

  function leaveStation(pose: CameraPose, onArrive: () => void) {
    runDeselect();
    state.active = null;
    setPhase("transitioning");
    state.pending = null;
    applyViewOffset();
    applyLimits("overview");
    if (robot) robotPoint(seq, robot, null);
    travelTo(pose, () => {
      controls.enabled = true;
      setPhase("overview");
      emit("lab:station", { id: null, source: "api" });
      onArrive();
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
    const pose = savedView ?? OVERVIEW_POSE;
    leaveStation(pose, () => {});
  }

  function resetView() {
    if (state.phase === "loading" || state.phase === "error") return;
    savedView = null;
    userOrbited = false;
    if (state.phase === "transitioning") {
      state.pending = "overview";
      return;
    }
    if (state.active !== null) {
      leaveStation(OVERVIEW_POSE, () => {});
      return;
    }
    setPhase("transitioning");
    travelTo(OVERVIEW_POSE, () => {
      controls.enabled = true;
      setPhase("overview");
      drainPending();
    }, 0.8);
  }

  /** Keyboard/button orbit: rotate the camera around the current target. */
  function rotate(radians: number) {
    if (state.phase === "transitioning" || state.phase === "loading" || state.phase === "error") return;
    userOrbited = true;
    const offset = camera.position.clone().sub(controls.target);
    const proxy = { a: 0 };
    const start = offset.clone();
    gsap.killTweensOf(proxy);
    gsap.to(proxy, {
      a: radians,
      duration: state.reducedMotion ? 0 : 0.45,
      ease: "power2.out",
      onUpdate: () => {
        camera.position.copy(start).applyAxisAngle(UP, proxy.a).add(controls.target);
        requestRender();
      },
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

    room = buildRoom(ctx);
    scene.add(room.group);
    const built = buildStations(ctx);
    repairParts = built.repair;
    for (const s of built.list) {
      scene.add(s.group);
      stations.set(s.id, s);
      hotspotMeshes.push(...s.hotspots);
      animators.push(...s.animators);
    }

    robot = new Robot(ctx);
    // Stands right of the console, out of every station's line of sight.
    robot.group.position.set(1.55, 0, -0.75);
    robot.group.rotation.y = -0.6;
    scene.add(robot.group);
    animators.push(robot.animator());

    const repairStation = stations.get("repair")!;
    arm = new MechArm(ctx, repairStation.group.position.x - 0.3, 0.9);
    scene.add(arm.group);
    animators.push(arm.animator());

    repairStation.onSelect = () => repairSequence(seq, repairParts!, arm!, robot!, shared);

    // The lamp would hang between the camera and the monitor; tuck it away
    // while the console is in focus.
    const consoleStation = stations.get("console")!;
    consoleStation.onSelect = () => {
      room!.lamp.visible = false;
      requestRender();
      return () => {
        room!.lamp.visible = true;
        requestRender();
      };
    };

    resize();
    updateWalls();
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
    resetView,
    rotate,
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
      controls.dispose();
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
      controls,
      get frames() {
        return frames;
      },
      get animators() {
        return animators;
      },
      get azimuth() {
        return MathUtils.radToDeg(controls.getAzimuthalAngle());
      },
      get polar() {
        return MathUtils.radToDeg(controls.getPolarAngle());
      },
      get distance() {
        return controls.getDistance();
      },
      stations: STATION_BY_ID,
      gsap,
      /** Run one frame synchronously (useful when rAF is paused, e.g. hidden tabs). */
      step: () => {
        gsap.ticker.tick();
        tick(performance.now());
      },
    },
  };
  return handle;
}
