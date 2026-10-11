import { Group, Mesh, Vector3 } from "three";
import { PALETTE } from "../../config";
import { PartBuilder, box, contactShadow, cyl, hitBox, plane, rbox } from "../../geometry";
import { screenMaterial } from "../../materials";
import { poseFor } from "../../camera";
import type { BuildContext, StationDefinition } from "../types";

/**
 * Station 5 — lab notebook (about & process). A drafting table with an open
 * notebook: the portrait on the left page, sketched process lines on the
 * right. A mug and a desk lamp keep it personal.
 */
export function buildNotebook(ctx: BuildContext): StationDefinition {
  const mats = ctx.makeMaterials();
  const group = new Group();
  group.name = "station:notebook";
  const X = 2.85;
  const Z = 0.55;
  group.position.set(X, 0, Z);
  group.rotation.y = -Math.PI / 2 + 0.55; // faces the camera corner

  const tilt = -0.35;
  const parts = new PartBuilder(mats);
  parts
    .add(rbox(1.5, 0.06, 1.0, 0.02), PALETTE.wood, { position: [0, 0.9, 0], rotation: [tilt, 0, 0] })
    .add(rbox(0.06, 0.8, 0.06, 0.02), PALETTE.charcoal, { position: [-0.65, 0.4, -0.35] })
    .add(rbox(0.06, 0.8, 0.06, 0.02), PALETTE.charcoal, { position: [0.65, 0.4, -0.35] })
    .add(rbox(0.06, 0.6, 0.06, 0.02), PALETTE.charcoal, { position: [-0.65, 0.3, 0.35] })
    .add(rbox(0.06, 0.6, 0.06, 0.02), PALETTE.charcoal, { position: [0.65, 0.3, 0.35] })
    .add(rbox(1.3, 0.04, 0.04, 0.01), PALETTE.charcoal, { position: [0, 0.6, 0] })
    // Notebook: two pages + spine
    .add(rbox(0.56, 0.03, 0.72, 0.01), PALETTE.paper, { position: [-0.3, 0.96, 0.02], rotation: [tilt, 0, 0] })
    .add(rbox(0.56, 0.03, 0.72, 0.01), PALETTE.paper, { position: [0.3, 0.96, 0.02], rotation: [tilt, 0, 0] })
    .add(rbox(0.04, 0.05, 0.74, 0.01), PALETTE.red, { position: [0, 0.96, 0.02], rotation: [tilt, 0, 0] })
    // Mug + pencil + lamp
    .add(cyl(0.07, 0.06, 0.16, 12), PALETTE.teal, { position: [0.62, 0.84, 0.42], rotation: [tilt, 0, 0] })
    .add(cyl(0.012, 0.012, 0.3, 6), PALETTE.orange, { position: [0.45, 0.98, 0.2], rotation: [tilt, 0, 1.2] })
    .add(rbox(0.16, 0.03, 0.12, 0.01), PALETTE.charcoal, { position: [-0.62, 0.92, -0.42], rotation: [tilt, 0, 0] })
    .add(cyl(0.02, 0.02, 0.6, 8), PALETTE.charcoal, { position: [-0.62, 1.2, -0.42], rotation: [0.25, 0, 0.3] })
    .add(cyl(0.05, 0.14, 0.16, 12), PALETTE.orange, { position: [-0.42, 1.44, -0.3], rotation: [0.5, 0, 0.9] });
  parts.build(group, ctx.shared.outline, new Set([PALETTE.wood, PALETTE.charcoal]));

  // Left page: portrait
  const portraitTex = ctx.textures.portrait;
  const photo = new Mesh(plane(0.38, 0.5), screenMaterial(portraitTex));
  photo.position.set(-0.3, 0.985, 0.0);
  photo.rotation.x = -Math.PI / 2 + tilt;
  group.add(photo);
  // Right page: sketch lines
  const lineGeo = box(0.4, 0.004, 0.02);
  for (let i = 0; i < 6; i++) {
    const w = i % 3 === 0 ? 0.28 : 0.4;
    const l = new Mesh(lineGeo, ctx.shared.paperLines);
    l.scale.x = w / 0.4;
    l.position.set(0.3 - (0.4 - w) / 2, 0.98 + Math.sin(tilt) * (0.22 - i * 0.09), 0.02 + Math.cos(tilt) * (-0.22 + i * 0.09));
    l.rotation.x = tilt;
    group.add(l);
  }
  const lampLight = new Mesh(cyl(0.05, 0.05, 0.02, 12), ctx.shared.ledOrange);
  lampLight.position.set(-0.39, 1.4, -0.27);
  lampLight.rotation.set(0.5, 0, 0.9);
  group.add(lampLight);

  group.add(contactShadow(ctx.shared, 0.75, { position: [0, 0, 0], scale: [1.1, 1, 0.75] }));

  const hotspots = [hitBox(1.7, 1.4, 1.2, { position: [0, 0.8, 0] })];
  hotspots.forEach((h) => group.add(h));

  const focus = new Vector3(X, 1.0, Z);
  return {
    id: "notebook",
    group,
    hotspots,
    materials: mats,
    pressTarget: group,
    pose: poseFor(focus, new Vector3(-0.2, 0, 1), 2.7, 1.3, 0.05),
    focus,
    animators: [],
  };
}
