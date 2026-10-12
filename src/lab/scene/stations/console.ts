import { BufferGeometry, Float32BufferAttribute, Group, LineSegments, Mesh, Vector3 } from "three";
import { PALETTE, ROOM } from "../../config";
import { PartBuilder, box, contactShadow, cyl, hitBox, plane, rbox, sphere } from "../../geometry";
import { screenMaterial } from "../../materials";
import { poseFor } from "../../camera";
import type { Animator, BuildContext, StationDefinition } from "../types";

/**
 * Station 1 — main control console (Panda Central). A wide desk against the
 * back wall with an oversized monitor showing the real dashboard, a lever
 * cluster, and a column of "site" tiles on the wall wired to the monitor.
 */
export function buildConsole(ctx: BuildContext): StationDefinition {
  const mats = ctx.makeMaterials();
  const group = new Group();
  group.name = "station:console";
  const X = 0;
  const Z = -2.3;
  group.position.set(X, 0, Z);

  const parts = new PartBuilder(mats);
  // Desk
  parts
    .add(rbox(2.8, 0.1, 1.0, 0.04), PALETTE.charcoal, { position: [0, 0.82, 0] })
    .add(rbox(2.6, 0.72, 0.8, 0.04), PALETTE.charcoalLight, { position: [0, 0.4, -0.05] })
    .add(rbox(0.5, 0.5, 0.02, 0.01), PALETTE.teal, { position: [-0.85, 0.42, 0.36] })
    .add(rbox(0.5, 0.5, 0.02, 0.01), PALETTE.teal, { position: [0.85, 0.42, 0.36] })
    // Keyboard + mouse
    .add(rbox(0.9, 0.05, 0.3, 0.015), PALETTE.cream, { position: [0.05, 0.9, 0.22] })
    .add(rbox(0.12, 0.05, 0.18, 0.03), PALETTE.cream, { position: [0.7, 0.9, 0.22] })
    // Lever cluster (left) and knobs (right)
    .add(rbox(0.5, 0.08, 0.34, 0.02), PALETTE.metalDark, { position: [-0.95, 0.91, 0.18] })
    .add(cyl(0.02, 0.02, 0.26, 8), PALETTE.metal, { position: [-1.05, 1.05, 0.18], rotation: [0.5, 0, 0] })
    .add(sphere(0.07, 12, 10), PALETTE.red, { position: [-1.05, 1.19, 0.12] })
    .add(cyl(0.02, 0.02, 0.26, 8), PALETTE.metal, { position: [-0.85, 1.05, 0.18], rotation: [-0.3, 0, 0] })
    .add(sphere(0.07, 12, 10), PALETTE.teal, { position: [-0.85, 1.19, 0.22] })
    // Gauge cluster: two round dials with needles, right of the keyboard
    .add(cyl(0.14, 0.14, 0.06, 20), PALETTE.cream, { position: [0.95, 0.92, 0.3], rotation: [Math.PI / 2, 0, 0] })
    .add(cyl(0.16, 0.16, 0.04, 20), PALETTE.charcoal, { position: [0.95, 0.9, 0.3], rotation: [Math.PI / 2, 0, 0] })
    .add(rbox(0.02, 0.11, 0.01, 0.005), PALETTE.red, { position: [0.98, 0.955, 0.33], rotation: [0, 0, -0.6] })
    .add(cyl(0.14, 0.14, 0.06, 20), PALETTE.cream, { position: [1.28, 0.92, 0.3], rotation: [Math.PI / 2, 0, 0] })
    .add(cyl(0.16, 0.16, 0.04, 20), PALETTE.charcoal, { position: [1.28, 0.9, 0.3], rotation: [Math.PI / 2, 0, 0] })
    .add(rbox(0.02, 0.11, 0.01, 0.005), PALETTE.teal, { position: [1.25, 0.955, 0.33], rotation: [0, 0, 0.5] })
    .add(cyl(0.06, 0.06, 0.06, 12), PALETTE.orange, { position: [0.95, 0.9, 0.0] })
    .add(cyl(0.06, 0.06, 0.06, 12), PALETTE.blue, { position: [1.28, 0.9, 0.0] })
    // Monitor: stand + frame
    .add(cyl(0.08, 0.14, 0.12, 12), PALETTE.charcoal, { position: [0, 0.93, -0.25] })
    .add(rbox(0.1, 0.5, 0.08, 0.02), PALETTE.charcoal, { position: [0, 1.2, -0.28] })
    .add(rbox(1.9, 1.15, 0.09, 0.05), PALETTE.charcoal, { position: [0, 1.95, -0.2] })
    .add(rbox(0.26, 0.06, 0.04, 0.01), PALETTE.orange, { position: [0, 1.33, -0.14] })
    // Wall "site" tiles
    .add(rbox(0.22, 0.16, 0.06, 0.02), PALETTE.cream, { position: [-1.6, 1.5, -0.32] })
    .add(rbox(0.22, 0.16, 0.06, 0.02), PALETTE.cream, { position: [-1.6, 1.8, -0.32] })
    .add(rbox(0.22, 0.16, 0.06, 0.02), PALETTE.cream, { position: [-1.6, 2.1, -0.32] })
    .add(rbox(0.22, 0.16, 0.06, 0.02), PALETTE.cream, { position: [-1.6, 2.4, -0.32] })
    .add(rbox(0.22, 0.16, 0.06, 0.02), PALETTE.cream, { position: [1.6, 1.65, -0.32] })
    .add(rbox(0.22, 0.16, 0.06, 0.02), PALETTE.cream, { position: [1.6, 1.95, -0.32] })
    .add(rbox(0.22, 0.16, 0.06, 0.02), PALETTE.cream, { position: [1.6, 2.25, -0.32] });
  parts.build(group, ctx.shared.outline, new Set([PALETTE.charcoal, PALETTE.charcoalLight]));

  // Screen with the real dashboard (top 16:10 crop of the tall screenshot)
  const tex = ctx.textures.screen;
  const img = tex.image as { width?: number; height?: number } | undefined;
  const srcAspect = (img?.width ?? 1024) / (img?.height ?? 1018);
  const screenAspect = 1.74 / 1.0;
  const vis = Math.min(1, srcAspect / screenAspect);
  tex.repeat.set(1, vis);
  tex.offset.set(0, 1 - vis);
  const screen = new Mesh(plane(1.74, 1.0), screenMaterial(tex));
  screen.position.set(0, 1.97, -0.15);
  group.add(screen);

  // Little lights on the tiles + dashed "connections" to the monitor
  const tilePositions: [number, number, number][] = [
    [-1.6, 1.5, -0.28],
    [-1.6, 1.8, -0.28],
    [-1.6, 2.1, -0.28],
    [-1.6, 2.4, -0.28],
    [1.6, 1.65, -0.28],
    [1.6, 1.95, -0.28],
    [1.6, 2.25, -0.28],
  ];
  const lights = tilePositions.map(([x, y, z]) => {
    const m = new Mesh(box(0.05, 0.05, 0.02), ctx.shared.ledTeal);
    m.position.set(x + (x < 0 ? 0.07 : -0.07), y + 0.04, z);
    group.add(m);
    return m;
  });
  const linkVerts: number[] = [];
  for (const [x, y, z] of tilePositions) {
    const edgeX = x < 0 ? -0.95 : 0.95;
    linkVerts.push(x + (x < 0 ? 0.11 : -0.11), y, z + 0.02, edgeX, Math.min(Math.max(y, 1.5), 2.4), -0.2);
  }
  const linkGeo = new BufferGeometry();
  linkGeo.setAttribute("position", new Float32BufferAttribute(linkVerts, 3));
  const links = new LineSegments(linkGeo, ctx.shared.links);
  links.computeLineDistances();
  group.add(links);

  group.add(contactShadow(ctx.shared, 1.0, { position: [0, 0, 0.1], scale: [1.6, 1, 1] }));

  const hotspots = [hitBox(3.0, 2.2, 1.3, { position: [0, 1.5, 0] })];
  hotspots.forEach((h) => group.add(h));

  const animators: Animator[] = [
    {
      id: "consoleLinks",
      update: (dt) => {
        ctx.shared.linksOffset.value = (ctx.shared.linksOffset.value - dt * 0.35) % 16;
        return true;
      },
    },
    (() => {
      let next = 0;
      let i = 0;
      return {
        id: "consoleTiles",
        update: (_dt, t) => {
          if (t < next) return false;
          next = t + 0.45;
          lights.forEach((l, k) => (l.material = k === i % lights.length ? ctx.shared.ledOrange : ctx.shared.ledTeal));
          i++;
          return true;
        },
      } satisfies Animator;
    })(),
  ];

  const focus = new Vector3(X, 1.55, Z + 0.1);
  return {
    id: "console",
    group,
    hotspots,
    materials: mats,
    pressTarget: group,
    // Approach from the left so the comms terminal never sits in the line of sight.
    pose: poseFor(focus, new Vector3(-0.3, 0, 1), 5.2, 0.9, 0.15),
    focus,
    animators,
  };
}

export const CONSOLE_WALL_Z = ROOM.minZ;
