import type { Group, Mesh, Vector3 } from "three";
import type { CameraPose } from "../camera";
import type { MaterialSet, SharedMaterials } from "../materials";
import type { LabTextures } from "../loader";
import type { StationId } from "../stations";

export interface Animator {
  id: string;
  /** Advance by `dt` seconds at time `t`; return true if a frame must render. */
  update(dt: number, t: number): boolean;
}

export interface StationDefinition {
  id: StationId;
  group: Group;
  /** Invisible generous meshes used for raycasting. */
  hotspots: Mesh[];
  /** Highlighted on hover/focus. */
  materials: MaterialSet;
  /** Nudged on selection. */
  pressTarget: Group | Mesh;
  pose: CameraPose;
  /** Where the robot looks / points when this station is active. */
  focus: Vector3;
  animators: Animator[];
  /** Runs when the camera arrives; may return a cleanup for deselect. */
  onSelect?(): void | (() => void);
}

export interface BuildContext {
  shared: SharedMaterials;
  textures: LabTextures;
  reducedMotion: boolean;
  makeMaterials(): MaterialSet;
  /** Site logo URL for the wall sign. */
  logoSrc?: string;
  /** Ask the runtime for a frame (e.g. after a texture finished drawing). */
  requestRender?(): void;
}
