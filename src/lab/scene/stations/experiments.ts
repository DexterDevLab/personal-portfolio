import { Group, Mesh, Vector3 } from "three";
import { PALETTE } from "../../config";
import { PartBuilder, contactShadow, cyl, hitBox, plane, rbox, sphere, torus } from "../../geometry";
import { screenMaterial } from "../../materials";
import { poseFor } from "../../camera";
import type { Animator, BuildContext, StationDefinition } from "../types";

/**
 * Station 2 — experiment stations (client projects). A rack against the
 * left wall holding five "specimen" units, each with a small screen showing
 * one client site, plus a flask that bubbles slowly.
 */
export function buildExperiments(ctx: BuildContext): StationDefinition {
  const mats = ctx.makeMaterials();
  const group = new Group();
  group.name = "station:experiments";
  const X = -3.45;
  const Z = -0.9;
  group.position.set(X, 0, Z);
  group.rotation.y = Math.PI / 2; // faces +x into the room

  const parts = new PartBuilder(mats);
  // Rack: two uprights, three shelves (local +z faces the room)
  parts
    .add(rbox(0.08, 2.3, 0.5, 0.02), PALETTE.charcoal, { position: [-0.95, 1.15, 0] })
    .add(rbox(0.08, 2.3, 0.5, 0.02), PALETTE.charcoal, { position: [0.95, 1.15, 0] })
    .add(rbox(1.95, 0.06, 0.52, 0.02), PALETTE.wood, { position: [0, 0.55, 0] })
    .add(rbox(1.95, 0.06, 0.52, 0.02), PALETTE.wood, { position: [0, 1.3, 0] })
    .add(rbox(1.95, 0.06, 0.52, 0.02), PALETTE.wood, { position: [0, 2.05, 0] })
    .add(rbox(1.9, 0.14, 0.04, 0.02), PALETTE.teal, { position: [0, 2.22, 0.22] });

  // Six client-site units: boxes with a screen bezel, three per shelf
  const units: [number, number][] = [
    [-0.62, 0.58],
    [0, 0.58],
    [0.62, 0.58],
    [-0.62, 1.33],
    [0, 1.33],
    [0.62, 1.33],
  ];
  units.forEach(([x, y], i) => {
    parts
      .add(rbox(0.5, 0.42, 0.34, 0.04), i % 2 ? PALETTE.cream : PALETTE.blue, { position: [x, y + 0.21, 0] })
      .add(rbox(0.42, 0.28, 0.03, 0.01), PALETTE.charcoal, { position: [x, y + 0.24, 0.17] })
      .add(cyl(0.025, 0.025, 0.03, 8), PALETTE.orange, { position: [x + 0.17, y + 0.06, 0.17], rotation: [Math.PI / 2, 0, 0] });
  });

  // Flask on the top shelf + coiled cable
  parts
    .add(cyl(0.06, 0.06, 0.16, 10), PALETTE.glass, { position: [0.55, 2.3, 0.05] })
    .add(sphere(0.14, 14, 10), PALETTE.glass, { position: [0.55, 2.2, 0.05] })
    .add(torus(0.09, 0.02), PALETTE.charcoal, { position: [-0.55, 2.12, 0.1], rotation: [Math.PI / 2, 0, 0] })
    .add(torus(0.09, 0.02), PALETTE.charcoal, { position: [-0.55, 2.16, 0.1], rotation: [Math.PI / 2, 0, 0] })
    .add(torus(0.09, 0.02), PALETTE.charcoal, { position: [-0.55, 2.2, 0.1], rotation: [Math.PI / 2, 0, 0] });
  parts.build(group, ctx.shared.outline, new Set([PALETTE.charcoal, PALETTE.blue, PALETTE.cream]));

  // Screens with the client-site thumbnails
  units.forEach(([x, y], i) => {
    const tex = ctx.textures.thumbs[i];
    const mat = tex ? screenMaterial(tex) : ctx.shared.screenOff;
    if (tex) {
      // show the top of each screenshot in a 3:2 window
      const img = tex.image as { width?: number; height?: number } | undefined;
      const aspect = (img?.width ?? 320) / (img?.height ?? 200);
      const vis = Math.min(1, aspect / 1.5);
      tex.repeat.set(1, vis);
      tex.offset.set(0, 1 - vis);
    }
    const screen = new Mesh(plane(0.36, 0.24), mat);
    screen.position.set(x, y + 0.24, 0.19);
    group.add(screen);
  });

  // Steam bubbles over the flask
  const bubbles = [0, 1, 2].map((k) => {
    const b = new Mesh(sphere(0.03 + k * 0.01, 8, 6), ctx.shared.steam);
    b.position.set(0.55 + (k - 1) * 0.04, 2.4 + k * 0.08, 0.05);
    group.add(b);
    return b;
  });

  group.add(contactShadow(ctx.shared, 0.9, { position: [0, 0, 0.1], scale: [1.2, 1, 0.6] }));

  const hotspots = [hitBox(2.1, 2.4, 0.9, { position: [0, 1.2, 0.1] })];
  hotspots.forEach((h) => group.add(h));

  const animators: Animator[] = [
    {
      id: "flaskSteam",
      update: (dt, t) => {
        bubbles.forEach((b, k) => {
          b.position.y += dt * 0.12;
          if (b.position.y > 2.85) b.position.y = 2.38;
          const life = (b.position.y - 2.38) / 0.47;
          const s = 0.6 + Math.sin(t * 2 + k) * 0.1 + life * 0.5;
          b.scale.setScalar(s);
        });
        return true;
      },
    },
  ];

  const focus = new Vector3(X + 0.4, 1.3, Z);
  return {
    id: "experiments",
    group,
    hotspots,
    materials: mats,
    pressTarget: group,
    pose: poseFor(focus, new Vector3(1, 0, 0.55), 3.4, 0.7),
    focus,
    animators,
  };
}
