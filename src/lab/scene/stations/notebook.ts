import { Euler, Group, Mesh, Quaternion, Vector3 } from "three";
import { PALETTE } from "../../config";
import { PartBuilder, box, contactShadow, cyl, hitBox, plane, rbox, type Xyz } from "../../geometry";
import { screenMaterial } from "../../materials";
import { poseFor } from "../../camera";
import type { BuildContext, StationDefinition } from "../types";

/**
 * Station 5 — lab notebook (about & process). A drafting table whose top
 * rises toward the back, an open notebook with the portrait on the left
 * page and sketch lines on the right, a mug, a pencil and an anglepoise
 * lamp aimed at the page. The table faces +z so the station camera (which
 * approaches from the front) reads the page the right way up.
 */
export function buildNotebook(ctx: BuildContext): StationDefinition {
  const mats = ctx.makeMaterials();
  const group = new Group();
  group.name = "station:notebook";
  const X = 2.85;
  const Z = 0.55;
  group.position.set(X, 0, Z);
  group.rotation.y = -0.2; // front edge toward the room's open side

  // Positive rotation about x lowers +z: the back edge (−z) rises, the
  // front edge (+z, where the sitter is) drops.
  const tilt = 0.35;
  const topY = 0.9;
  const topT = 0.06;
  /** Height of the table surface at local depth z. */
  const surf = (z: number) => topY + topT / 2 - z * Math.tan(tilt);
  /** Euler for an object whose local +y should point along `dir`. */
  const alignY = (dir: Vector3): Xyz => {
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
    const e = new Euler().setFromQuaternion(q);
    return [e.x, e.y, e.z];
  };
  /** A cylinder running from `a` to `b`. */
  const beam = (a: Vector3, b: Vector3, r: number) => {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a);
    return { geometry: cyl(r, r, dir.length(), 8), position: mid.toArray() as Xyz, rotation: alignY(dir) };
  };

  const legZ = 0.42;
  const backH = surf(-legZ) - topT / 2;
  const frontH = surf(legZ) - topT / 2;

  const parts = new PartBuilder(mats);
  parts
    .add(rbox(1.5, topT, 1.0, 0.02), PALETTE.wood, { position: [0, topY, 0], rotation: [tilt, 0, 0] })
    // Legs reach the tilted top: taller at the back, shorter at the front
    .add(rbox(0.06, backH, 0.06, 0.02), PALETTE.charcoal, { position: [-0.66, backH / 2, -legZ] })
    .add(rbox(0.06, backH, 0.06, 0.02), PALETTE.charcoal, { position: [0.66, backH / 2, -legZ] })
    .add(rbox(0.06, frontH, 0.06, 0.02), PALETTE.charcoal, { position: [-0.66, frontH / 2, legZ] })
    .add(rbox(0.06, frontH, 0.06, 0.02), PALETTE.charcoal, { position: [0.66, frontH / 2, legZ] })
    // Stretchers between the legs and small feet
    .add(rbox(1.32, 0.04, 0.04, 0.01), PALETTE.charcoal, { position: [0, 0.3, -legZ] })
    .add(rbox(1.32, 0.04, 0.04, 0.01), PALETTE.charcoal, { position: [0, 0.3, legZ] })
    .add(rbox(0.04, 0.04, 0.84, 0.01), PALETTE.charcoal, { position: [-0.66, 0.3, 0] })
    .add(rbox(0.04, 0.04, 0.84, 0.01), PALETTE.charcoal, { position: [0.66, 0.3, 0] })
    .add(rbox(0.1, 0.03, 0.1, 0.01), PALETTE.charcoal, { position: [-0.66, 0.015, -legZ] })
    .add(rbox(0.1, 0.03, 0.1, 0.01), PALETTE.charcoal, { position: [0.66, 0.015, -legZ] })
    .add(rbox(0.1, 0.03, 0.1, 0.01), PALETTE.charcoal, { position: [-0.66, 0.015, legZ] })
    .add(rbox(0.1, 0.03, 0.1, 0.01), PALETTE.charcoal, { position: [0.66, 0.015, legZ] })
    // Lip along the front edge so the notebook doesn't slide
    .add(rbox(1.5, 0.05, 0.04, 0.01), PALETTE.woodDark, { position: [0, surf(0.5) + 0.01, 0.5], rotation: [tilt, 0, 0] })
    // Notebook: two pages + spine, lying on the top
    .add(rbox(0.56, 0.03, 0.72, 0.01), PALETTE.paper, { position: [-0.3, surf(0) + 0.015, 0], rotation: [tilt, 0, 0] })
    .add(rbox(0.56, 0.03, 0.72, 0.01), PALETTE.paper, { position: [0.3, surf(0) + 0.015, 0], rotation: [tilt, 0, 0] })
    .add(rbox(0.04, 0.05, 0.74, 0.01), PALETTE.red, { position: [0, surf(0) + 0.02, 0], rotation: [tilt, 0, 0] })
    // Mug (front right) and a pencil lying on the right page
    .add(cyl(0.07, 0.06, 0.16, 12), PALETTE.teal, { position: [0.62, surf(0.38) + 0.08, 0.38], rotation: [tilt, 0, 0] })
    .add(cyl(0.012, 0.012, 0.3, 6), PALETTE.orange, { position: [0.32, surf(0.22) + 0.045, 0.22], rotation: [tilt, 0.35, Math.PI / 2] });

  // Anglepoise lamp: base on the back-left corner, two arm segments, shade aimed at the page
  const baseAt = new Vector3(-0.6, surf(-0.38) + 0.02, -0.38);
  const elbow = new Vector3(-0.62, baseAt.y + 0.5, -0.46);
  const shadeAt = new Vector3(-0.38, baseAt.y + 0.62, -0.1);
  const pageAt = new Vector3(-0.3, surf(0), 0.02);
  const lower = beam(baseAt, elbow, 0.018);
  const upper = beam(elbow, shadeAt, 0.018);
  const shadeDir = pageAt.clone().sub(shadeAt); // the wide opening (−y of the cone) points at the page
  parts
    .add(rbox(0.18, 0.04, 0.14, 0.01), PALETTE.charcoal, { position: baseAt.toArray() as Xyz, rotation: [tilt, 0, 0] })
    .add(lower.geometry, PALETTE.charcoal, { position: lower.position, rotation: lower.rotation })
    .add(cyl(0.03, 0.03, 0.04, 8), PALETTE.orange, { position: elbow.toArray() as Xyz, rotation: [0, 0, Math.PI / 2] })
    .add(upper.geometry, PALETTE.charcoal, { position: upper.position, rotation: upper.rotation })
    .add(cyl(0.05, 0.14, 0.18, 14), PALETTE.orange, { position: shadeAt.toArray() as Xyz, rotation: alignY(shadeDir.clone().negate()) });
  parts.build(group, ctx.shared.outline, new Set([PALETTE.wood, PALETTE.charcoal]));

  // Left page: portrait (top of the photo toward the back of the table)
  const photo = new Mesh(plane(0.38, 0.5), screenMaterial(ctx.textures.portrait));
  photo.position.set(-0.3, surf(0) + 0.035, 0);
  photo.rotation.x = -Math.PI / 2 + tilt;
  group.add(photo);
  // Right page: sketch lines
  const lineGeo = box(0.4, 0.004, 0.02);
  for (let i = 0; i < 6; i++) {
    const w = i % 3 === 0 ? 0.28 : 0.4;
    const z = -0.24 + i * 0.09;
    const l = new Mesh(lineGeo, ctx.shared.paperLines);
    l.scale.x = w / 0.4;
    l.position.set(0.3 - (0.4 - w) / 2, surf(z) + 0.035, z);
    l.rotation.x = tilt;
    group.add(l);
  }
  // Glowing disc in the shade opening
  const lampLight = new Mesh(cyl(0.11, 0.11, 0.01, 14), ctx.shared.ledOrange);
  const opening = shadeAt.clone().add(shadeDir.clone().normalize().multiplyScalar(0.09));
  lampLight.position.copy(opening);
  lampLight.rotation.set(...alignY(shadeDir.clone().negate()));
  group.add(lampLight);

  group.add(contactShadow(ctx.shared, 0.75, { position: [0, 0, 0], scale: [1.1, 1, 0.75] }));

  const hotspots = [hitBox(1.7, 1.5, 1.2, { position: [0, 0.8, 0] })];
  hotspots.forEach((h) => group.add(h));

  const focus = new Vector3(X, 1.0, Z);
  return {
    id: "notebook",
    group,
    hotspots,
    materials: mats,
    pressTarget: group,
    // Steep enough to read the open notebook, not just the table's edge.
    pose: poseFor(focus, new Vector3(-0.15, 0, 1), 2.7, 2.1, 0.1),
    focus,
    animators: [],
  };
}
