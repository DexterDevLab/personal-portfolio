import { Group, Mesh, Vector3 } from "three";
import { PALETTE } from "../../config";
import { PartBuilder, contactShadow, cyl, hitBox, plane, rbox, sphere } from "../../geometry";
import { poseFor } from "../../camera";
import type { BuildContext, StationDefinition } from "../types";

export interface RepairParts {
  device: Group;
  antenna: Mesh;
  lamp: Mesh;
  sparks: Mesh[];
  /** Local-space point above the device the arm aims at. */
  workPoint: Vector3;
}

/**
 * Station 3 — repair bench (troubleshooting). A workbench with a boxy "site
 * device" that starts in a fault state: red lamp, bent antenna. The
 * sequence in sequences.ts fixes it. Exposes its moving parts.
 */
export function buildRepair(ctx: BuildContext): StationDefinition & { parts: RepairParts } {
  const mats = ctx.makeMaterials();
  const group = new Group();
  group.name = "station:repair";
  const X = -1.9;
  const Z = 0.95;
  group.position.set(X, 0, Z);

  const builder = new PartBuilder(mats);
  builder
    // Bench top, legs, drawer
    .add(rbox(1.7, 0.1, 0.8, 0.03), PALETTE.wood, { position: [0, 0.8, 0] })
    .add(rbox(0.08, 0.76, 0.08, 0.02), PALETTE.woodDark, { position: [-0.76, 0.38, -0.32] })
    .add(rbox(0.08, 0.76, 0.08, 0.02), PALETTE.woodDark, { position: [0.76, 0.38, -0.32] })
    .add(rbox(0.08, 0.76, 0.08, 0.02), PALETTE.woodDark, { position: [-0.76, 0.38, 0.32] })
    .add(rbox(0.08, 0.76, 0.08, 0.02), PALETTE.woodDark, { position: [0.76, 0.38, 0.32] })
    .add(rbox(0.7, 0.22, 0.6, 0.02), PALETTE.charcoal, { position: [0.4, 0.62, 0] })
    .add(rbox(0.16, 0.03, 0.03, 0.01), PALETTE.orange, { position: [0.4, 0.62, 0.31] })
    // Toolbox + tools
    .add(rbox(0.42, 0.22, 0.24, 0.03), PALETTE.red, { position: [0.58, 0.96, -0.15] })
    .add(rbox(0.3, 0.03, 0.05, 0.01), PALETTE.charcoal, { position: [0.58, 1.09, -0.15] })
    .add(cyl(0.015, 0.015, 0.3, 6), PALETTE.metal, { position: [-0.1, 0.87, 0.3], rotation: [0, 0, Math.PI / 2] })
    .add(rbox(0.06, 0.03, 0.08, 0.01), PALETTE.orange, { position: [0.07, 0.87, 0.3] })
    .add(cyl(0.05, 0.05, 0.06, 10), PALETTE.metalDark, { position: [-0.55, 0.88, 0.25] })
    .add(cyl(0.05, 0.05, 0.06, 10), PALETTE.metalDark, { position: [-0.43, 0.88, 0.3] });
  builder.build(group, ctx.shared.outline, new Set([PALETTE.wood, PALETTE.charcoal, PALETTE.red]));

  // The device being repaired (separate group so it can be animated)
  const device = new Group();
  device.position.set(-0.3, 0.85, -0.05);
  const deviceParts = new PartBuilder(mats);
  deviceParts
    .add(rbox(0.5, 0.34, 0.36, 0.05), PALETTE.cream, { position: [0, 0.17, 0] })
    .add(rbox(0.36, 0.2, 0.03, 0.01), PALETTE.charcoal, { position: [0, 0.18, 0.18] })
    .add(rbox(0.1, 0.04, 0.04, 0.01), PALETTE.teal, { position: [0.14, 0.05, 0.19] })
    .add(cyl(0.03, 0.03, 0.06, 8), PALETTE.charcoal, { position: [-0.16, 0.37, 0] });
  deviceParts.build(device, ctx.shared.outline, new Set([PALETTE.cream]));
  // Fault state: the whole box sits crooked, the antenna is bent
  device.rotation.z = 0.09;
  const antenna = new Mesh(cyl(0.012, 0.012, 0.3, 8), mats.toon(PALETTE.metalDark));
  antenna.position.set(-0.16, 0.4, 0);
  antenna.geometry.translate(0, 0.15, 0); // pivot at the base
  antenna.rotation.z = 0.9;
  const antennaTip = new Mesh(sphere(0.03, 8, 6), ctx.shared.ledOrange);
  antennaTip.position.y = 0.3;
  antenna.add(antennaTip);
  device.add(antenna);
  const lamp = new Mesh(sphere(0.045, 10, 8), ctx.shared.ledRed);
  lamp.position.set(0.16, 0.34, 0.1);
  device.add(lamp);
  // Screen shows a flat "error" bar; it turns teal when fixed via lamp swap only
  const face = new Mesh(plane(0.3, 0.14), ctx.shared.screenOff);
  face.position.set(0, 0.18, 0.2);
  device.add(face);
  group.add(device);

  // Sparks (hidden until the sequence runs)
  const sparks = [0, 1, 2, 3].map((k) => {
    const s = new Mesh(plane(0.08, 0.08), ctx.shared.spark);
    s.position.set(-0.3 + (k - 1.5) * 0.12, 1.3 + (k % 2) * 0.08, -0.05);
    s.rotation.z = k * 0.7;
    s.scale.setScalar(0);
    group.add(s);
    return s;
  });

  group.add(contactShadow(ctx.shared, 0.8, { position: [0, 0, 0], scale: [1.2, 1, 0.6] }));

  const hotspots = [hitBox(1.9, 1.5, 1.1, { position: [0, 0.85, 0] })];
  hotspots.forEach((h) => group.add(h));

  const focus = new Vector3(X - 0.2, 1.0, Z);
  return {
    id: "repair",
    group,
    hotspots,
    materials: mats,
    pressTarget: device,
    pose: poseFor(focus, new Vector3(0.45, 0, 1), 2.9, 1.0),
    focus,
    animators: [],
    parts: { device, antenna, lamp, sparks, workPoint: new Vector3(X - 0.3, 1.35, Z - 0.05) },
  };
}
