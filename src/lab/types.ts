import type { StationId } from "./stations";

export type { StationId };

export type LabPhase = "loading" | "overview" | "transitioning" | "station" | "error";

export type SelectSource = "pointer" | "api" | "hash";

export interface LabState {
  phase: LabPhase;
  active: StationId | null;
  pending: StationId | "overview" | null;
  hovered: StationId | null;
  reducedMotion: boolean;
  visible: boolean;
  progress: number;
}

export type LabEvents = {
  "lab:progress": { loaded: number; total: number };
  "lab:ready": undefined;
  "lab:error": { error: unknown };
  "lab:phase": { phase: LabPhase };
  "lab:station": { id: StationId | null; source: SelectSource };
  "lab:hover": { id: StationId | null };
};

export interface LabOptions {
  screenSrc: string;
  portraitSrc: string;
  thumbSrcs: string[];
  /** The site logo (SVG URL), engraved on the back wall. */
  logoSrc?: string;
  reducedMotion: boolean;
}

export interface LabHandle {
  /** Resolves when textures are loaded and the first frame rendered. */
  ready: Promise<void>;
  select(id: StationId, source?: SelectSource): void;
  /** Leave the station and return to where the visitor was exploring. */
  back(): void;
  /** Return to the default overview framing. */
  resetView(): void;
  /** Orbit by an angle in radians (positive = counter-clockwise from above). */
  rotate(radians: number): void;
  /** Dolly by a factor (< 1 zooms in, > 1 zooms out), within the current limits. */
  zoom(factor: number): void;
  hover(id: StationId | null): void;
  pause(): void;
  resume(): void;
  requestRender(): void;
  getState(): Readonly<LabState>;
  dispose(): void;
  /** Dev inspection: renderer / scene / camera / controls and a frame counter. */
  debug: Record<string, unknown>;
}

export interface LabRuntimeModule {
  createLab(root: HTMLElement, canvas: HTMLCanvasElement, options: LabOptions): LabHandle;
}
