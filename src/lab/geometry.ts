import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  Euler,
  Group,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { MaterialSet, SharedMaterials } from "./materials";

export type Xyz = [number, number, number];

export interface Placement {
  position?: Xyz;
  rotation?: Xyz;
  scale?: Xyz | number;
}

const tmpMatrix = new Matrix4();
const tmpPos = new Vector3();
const tmpQuat = new Quaternion();
const tmpScale = new Vector3();
const tmpEuler = new Euler();

export function placementMatrix(p: Placement = {}) {
  const [px, py, pz] = p.position ?? [0, 0, 0];
  const [rx, ry, rz] = p.rotation ?? [0, 0, 0];
  const s = p.scale ?? 1;
  const [sx, sy, sz] = typeof s === "number" ? [s, s, s] : s;
  tmpPos.set(px, py, pz);
  tmpQuat.setFromEuler(tmpEuler.set(rx, ry, rz));
  tmpScale.set(sx, sy, sz);
  return tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
}

// Rounded boxes have continuous normals, which the inverted-hull outline needs.
export const rbox = (w: number, h: number, d: number, r = 0.03) =>
  new RoundedBoxGeometry(w, h, d, 2, Math.min(r, Math.min(w, h, d) / 2 - 0.001));
export const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d);
export const cyl = (rt: number, rb: number, h: number, seg = 14) => new CylinderGeometry(rt, rb, h, seg);
export const sphere = (r: number, w = 14, h = 10) => new SphereGeometry(r, w, h);
export const plane = (w: number, h: number) => new PlaneGeometry(w, h);
export const circle = (r: number, seg = 20) => new CircleGeometry(r, seg);
export const torus = (r: number, tube: number) => new TorusGeometry(r, tube, 8, 18);

/**
 * Collects static parts by colour and merges them into one mesh per colour,
 * so a whole prop costs a handful of draw calls instead of dozens.
 */
export class PartBuilder {
  private parts = new Map<number, BufferGeometry[]>();

  constructor(private mats: MaterialSet) {}

  add(geometry: BufferGeometry, color: number, placement?: Placement) {
    // Merging requires every part to be indexed or none; normalise to non-indexed.
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    g.applyMatrix4(placementMatrix(placement));
    geometry.dispose();
    const list = this.parts.get(color) ?? [];
    list.push(g);
    this.parts.set(color, list);
    return this;
  }

  /** Merge and add to `group`; returns the merged meshes (for outlines). */
  build(group: Group, outline?: Material, outlineColors?: Set<number>): Mesh[] {
    const meshes: Mesh[] = [];
    for (const [color, list] of this.parts) {
      const merged = mergeGeometries(list, false);
      list.forEach((g) => g.dispose());
      if (!merged) continue;
      const mesh = new Mesh(merged, this.mats.toon(color));
      group.add(mesh);
      meshes.push(mesh);
      if (outline && (!outlineColors || outlineColors.has(color))) {
        const hull = new Mesh(merged, outline);
        hull.renderOrder = -1;
        group.add(hull);
      }
    }
    this.parts.clear();
    return meshes;
  }
}

/** Dark soft disc under a prop. */
export function contactShadow(shared: SharedMaterials, radius: number, placement: Placement) {
  const m = new Mesh(circle(radius, 24), shared.shadow);
  m.rotation.x = -Math.PI / 2;
  const [x, , z] = placement.position ?? [0, 0, 0];
  m.position.set(x, 0.005, z);
  if (placement.scale) {
    const s = placement.scale;
    if (typeof s === "number") m.scale.setScalar(s);
    else m.scale.set(s[0], s[2], 1);
  }
  return m;
}

/** Invisible generous hit target for raycasting. */
export function hitBox(w: number, h: number, d: number, placement: Placement) {
  const m = new Mesh(box(w, h, d));
  m.visible = false;
  const [x, y, z] = placement.position ?? [0, 0, 0];
  m.position.set(x, y, z);
  if (placement.rotation) m.rotation.set(...placement.rotation);
  return m;
}
