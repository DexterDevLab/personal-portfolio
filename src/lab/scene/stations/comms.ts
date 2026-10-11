import { Group, Mesh, Vector3 } from "three";
import { PALETTE } from "../../config";
import { PartBuilder, contactShadow, cyl, hitBox, rbox, sphere, torus } from "../../geometry";
import { poseFor } from "../../camera";
import type { Animator, BuildContext, StationDefinition } from "../types";

/**
 * Station 6 — communication terminal (contact). A chunky teal terminal on a
 * pedestal: a glowing handset cradle, a dial, a pneumatic tube that goes up
 * into the ceiling and a small antenna. Front and centre, hard to miss.
 */
export function buildComms(ctx: BuildContext): StationDefinition {
  const mats = ctx.makeMaterials();
  const group = new Group();
  group.name = "station:comms";
  const X = 1.3;
  const Z = 1.35;
  group.position.set(X, 0, Z);
  group.rotation.y = 0.35;

  const parts = new PartBuilder(mats);
  parts
    .add(cyl(0.3, 0.38, 0.12, 16), PALETTE.charcoal, { position: [0, 0.06, 0] })
    .add(cyl(0.12, 0.14, 0.7, 12), PALETTE.charcoalLight, { position: [0, 0.47, 0] })
    .add(rbox(0.9, 0.5, 0.6, 0.08), PALETTE.teal, { position: [0, 1.05, 0] })
    .add(rbox(0.5, 0.2, 0.05, 0.02), PALETTE.cream, { position: [0, 1.1, 0.3] })
    .add(cyl(0.11, 0.11, 0.05, 16), PALETTE.cream, { position: [0.28, 1.12, 0.3], rotation: [Math.PI / 2, 0, 0] })
    .add(cyl(0.03, 0.03, 0.06, 8), PALETTE.charcoal, { position: [0.28, 1.19, 0.31], rotation: [Math.PI / 2, 0, 0] })
    // Handset on top
    .add(torus(0.18, 0.045), PALETTE.charcoal, { position: [-0.1, 1.42, -0.05], rotation: [0, 0, 0] })
    .add(sphere(0.07, 10, 8), PALETTE.charcoal, { position: [-0.28, 1.42, -0.05] })
    .add(sphere(0.07, 10, 8), PALETTE.charcoal, { position: [0.08, 1.42, -0.05] })
    // Pneumatic tube + antenna
    .add(cyl(0.07, 0.07, 1.9, 12), PALETTE.metal, { position: [-0.35, 2.25, -0.2] })
    .add(cyl(0.11, 0.11, 0.1, 12), PALETTE.orange, { position: [-0.35, 1.35, -0.2] })
    .add(cyl(0.015, 0.015, 0.5, 6), PALETTE.metalDark, { position: [0.3, 1.55, -0.15] })
    .add(sphere(0.04, 8, 6), PALETTE.red, { position: [0.3, 1.82, -0.15] });
  parts.build(group, ctx.shared.outline, new Set([PALETTE.teal, PALETTE.charcoal]));

  // Glowing cradle under the handset + a ring light around the dial
  const glow = new Mesh(torus(0.2, 0.03), ctx.shared.glow);
  glow.position.set(-0.1, 1.31, -0.05);
  glow.rotation.x = Math.PI / 2;
  const beacon = new Mesh(sphere(0.045, 8, 6), ctx.shared.ledBlue);
  beacon.position.set(0.3, 1.82, -0.15);
  group.add(glow, beacon);

  group.add(contactShadow(ctx.shared, 0.5, { position: [0, 0, 0] }));

  const hotspots = [hitBox(1.3, 2.0, 1.0, { position: [0, 1.0, 0] })];
  hotspots.forEach((h) => group.add(h));

  const animators: Animator[] = [
    {
      id: "commsBeacon",
      update: (_dt, t) => {
        const pulse = 0.5 + Math.sin(t * 2.2) * 0.5;
        ctx.shared.glow.opacity = 0.2 + pulse * 0.35;
        beacon.scale.setScalar(0.9 + pulse * 0.3);
        return true;
      },
    },
  ];

  const focus = new Vector3(X, 1.15, Z);
  return {
    id: "comms",
    group,
    hotspots,
    materials: mats,
    pressTarget: group,
    pose: poseFor(focus, new Vector3(0.5, 0, 1), 3.9, 1.2, 0.05),
    focus,
    animators,
  };
}
