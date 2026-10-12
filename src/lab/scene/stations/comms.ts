import { Group, Mesh, Vector3 } from "three";
import { PALETTE } from "../../config";
import { PartBuilder, contactShadow, cyl, hitBox, rbox, sphere, torus } from "../../geometry";
import { poseFor } from "../../camera";
import type { Animator, BuildContext, StationDefinition } from "../types";

/**
 * Station 6 — communication terminal (contact). A vintage desk telephone,
 * oversized, on a pedestal: teal body, a handset resting on two cradle
 * posts, a rotary dial with finger holes on the front, a coiled cord down
 * the side and a small antenna with a blinking beacon. Front and centre.
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
  // Pedestal
  parts
    .add(cyl(0.3, 0.38, 0.12, 16), PALETTE.charcoal, { position: [0, 0.06, 0] })
    .add(cyl(0.12, 0.14, 0.7, 12), PALETTE.charcoalLight, { position: [0, 0.47, 0] });
  // Telephone body: a wide rounded base with a narrower shoulder on top
  parts
    .add(rbox(0.92, 0.36, 0.62, 0.1), PALETTE.teal, { position: [0, 1.0, 0] })
    .add(rbox(0.72, 0.16, 0.48, 0.07), PALETTE.teal, { position: [0, 1.25, -0.03] })
    // Cradle posts the handset rests on
    .add(cyl(0.045, 0.05, 0.14, 10), PALETTE.charcoal, { position: [-0.24, 1.4, -0.03] })
    .add(cyl(0.045, 0.05, 0.14, 10), PALETTE.charcoal, { position: [0.24, 1.4, -0.03] })
    // Handset: a bar across the posts with an earpiece and mouthpiece cup at each end
    .add(cyl(0.045, 0.045, 0.64, 12), PALETTE.charcoal, { position: [0, 1.53, -0.03], rotation: [0, 0, Math.PI / 2] })
    .add(cyl(0.1, 0.085, 0.11, 14), PALETTE.charcoal, { position: [-0.34, 1.47, -0.03] })
    .add(cyl(0.1, 0.085, 0.11, 14), PALETTE.charcoal, { position: [0.34, 1.47, -0.03] })
    // Rotary dial on the front
    .add(cyl(0.21, 0.21, 0.05, 24), PALETTE.charcoal, { position: [0.12, 1.0, 0.32], rotation: [Math.PI / 2, 0, 0] })
    .add(cyl(0.15, 0.15, 0.03, 24), PALETTE.cream, { position: [0.12, 1.0, 0.355], rotation: [Math.PI / 2, 0, 0] })
    .add(cyl(0.05, 0.05, 0.02, 12), PALETTE.charcoal, { position: [0.12, 1.0, 0.375], rotation: [Math.PI / 2, 0, 0] })
    // finger stop
    .add(rbox(0.03, 0.09, 0.03, 0.01), PALETTE.orange, { position: [0.3, 0.9, 0.36], rotation: [0, 0, -0.6] });
  // Ten finger holes around the dial
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * 0.15 + (i / 10) * Math.PI * 1.7;
    parts.add(cyl(0.025, 0.025, 0.02, 10), PALETTE.charcoal, {
      position: [0.12 + Math.cos(a) * 0.135, 1.0 + Math.sin(a) * 0.135, 0.372],
      rotation: [Math.PI / 2, 0, 0],
    });
  }
  // Coiled cord from the handset down the right side of the body
  for (let k = 0; k < 4; k++) {
    parts.add(torus(0.05, 0.016), PALETTE.charcoal, { position: [0.46, 1.36 - k * 0.09, 0.02 + k * 0.03], rotation: [0.3, Math.PI / 2, 0] });
  }
  // Antenna at the back
  parts
    .add(cyl(0.015, 0.015, 0.55, 6), PALETTE.metalDark, { position: [-0.36, 1.55, -0.2] })
    .add(sphere(0.04, 8, 6), PALETTE.red, { position: [-0.36, 1.84, -0.2] });
  parts.build(group, ctx.shared.outline, new Set([PALETTE.teal, PALETTE.charcoal, PALETTE.cream]));

  // Glowing ring between the cradle posts + the beacon on the antenna
  const glow = new Mesh(torus(0.17, 0.03), ctx.shared.glow);
  glow.position.set(0, 1.34, -0.03);
  glow.rotation.x = Math.PI / 2;
  const beacon = new Mesh(sphere(0.045, 8, 6), ctx.shared.ledBlue);
  beacon.position.set(-0.36, 1.84, -0.2);
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
