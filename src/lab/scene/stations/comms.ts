import { Group, Mesh, Vector3 } from "three";
import { PALETTE } from "../../config";
import { PartBuilder, contactShadow, cyl, hitBox, rbox, sphere, torus, type Xyz } from "../../geometry";
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
  // Telephone: a classic rotary set — low rounded base, a front that slopes
  // up toward the back with the dial on the slope, a hump at the back that
  // carries the cradle, and a dumbbell handset lying across it.
  const TILT = 0.55; // how much the front slopes back (radians)
  const n = new Vector3(0, Math.sin(TILT), Math.cos(TILT)); // slope's outward normal
  const u = new Vector3(0, Math.cos(TILT), -Math.sin(TILT)); // "up" along the slope
  const slopeCenter = new Vector3(0, 1.17, 0.02);
  const faceAt = (ax: number, along: number, out: number): Xyz => {
    const v = slopeCenter.clone().add(n.clone().multiplyScalar(0.19 + out)).add(u.clone().multiplyScalar(along));
    v.x += ax;
    return [v.x, v.y, v.z];
  };
  const faceRot: Xyz = [Math.PI / 2 - TILT, 0, 0];
  parts
    .add(rbox(0.96, 0.24, 0.7, 0.09), PALETTE.teal, { position: [0, 0.93, 0] })
    // sloped front block (thin box tilted back) + rounded hump behind it
    .add(rbox(0.84, 0.52, 0.38, 0.08), PALETTE.teal, { position: [slopeCenter.x, slopeCenter.y, slopeCenter.z], rotation: [-TILT, 0, 0] })
    .add(rbox(0.8, 0.3, 0.42, 0.1), PALETTE.teal, { position: [0, 1.25, -0.24] })
    // Rotary dial on the slope: dark ring, cream face, centre cap, ten holes, finger stop
    .add(cyl(0.21, 0.21, 0.05, 24), PALETTE.charcoal, { position: faceAt(0, -0.02, 0.025), rotation: faceRot })
    .add(cyl(0.155, 0.155, 0.03, 24), PALETTE.cream, { position: faceAt(0, -0.02, 0.06), rotation: faceRot })
    .add(cyl(0.05, 0.05, 0.02, 12), PALETTE.charcoal, { position: faceAt(0, -0.02, 0.08), rotation: faceRot })
    .add(rbox(0.03, 0.1, 0.03, 0.01), PALETTE.orange, { position: faceAt(0.19, -0.14, 0.07), rotation: [faceRot[0], 0, -0.5] });
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * 0.2 + (i / 10) * Math.PI * 1.65;
    parts.add(cyl(0.024, 0.024, 0.02, 10), PALETTE.charcoal, {
      position: faceAt(Math.cos(a) * 0.115, -0.02 + Math.sin(a) * 0.115, 0.075),
      rotation: faceRot,
    });
  }
  // Cradle on the hump: two forks, then the handset resting on them
  parts
    .add(cyl(0.04, 0.05, 0.16, 10), PALETTE.charcoal, { position: [-0.25, 1.48, -0.22] })
    .add(cyl(0.04, 0.05, 0.16, 10), PALETTE.charcoal, { position: [0.25, 1.48, -0.22] })
    // handset: slightly bowed bar (centre + two drooping ends) with big cups
    .add(cyl(0.05, 0.05, 0.46, 12), PALETTE.charcoal, { position: [0, 1.66, -0.22], rotation: [0, 0, Math.PI / 2] })
    .add(cyl(0.05, 0.045, 0.2, 12), PALETTE.charcoal, { position: [-0.3, 1.62, -0.22], rotation: [0, 0, Math.PI / 2 - 0.45] })
    .add(cyl(0.05, 0.045, 0.2, 12), PALETTE.charcoal, { position: [0.3, 1.62, -0.22], rotation: [0, 0, Math.PI / 2 + 0.45] })
    .add(cyl(0.13, 0.11, 0.1, 16), PALETTE.charcoal, { position: [-0.4, 1.55, -0.22] })
    .add(cyl(0.13, 0.11, 0.1, 16), PALETTE.charcoal, { position: [0.4, 1.55, -0.22] })
    .add(cyl(0.08, 0.08, 0.012, 14), PALETTE.cream, { position: [-0.4, 1.496, -0.22] })
    .add(cyl(0.08, 0.08, 0.012, 14), PALETTE.cream, { position: [0.4, 1.496, -0.22] });
  // Coiled cord from the handset's right cup down the side of the body
  for (let k = 0; k < 5; k++) {
    parts.add(torus(0.06, 0.016), PALETTE.charcoal, { position: [0.5, 1.42 - k * 0.09, -0.16 + k * 0.05], rotation: [0.4, Math.PI / 2, 0] });
  }
  // Antenna at the back
  parts
    .add(cyl(0.015, 0.015, 0.55, 6), PALETTE.metalDark, { position: [-0.38, 1.6, -0.3] })
    .add(sphere(0.04, 8, 6), PALETTE.red, { position: [-0.38, 1.89, -0.3] });
  parts.build(group, ctx.shared.outline, new Set([PALETTE.teal, PALETTE.charcoal, PALETTE.cream]));

  // Glowing ring between the cradle posts + the beacon on the antenna
  const glow = new Mesh(torus(0.17, 0.03), ctx.shared.glow);
  glow.position.set(0, 1.42, -0.22);
  glow.rotation.x = Math.PI / 2;
  const beacon = new Mesh(sphere(0.045, 8, 6), ctx.shared.ledBlue);
  beacon.position.set(-0.38, 1.89, -0.3);
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
