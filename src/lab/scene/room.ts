import { Group, Mesh, PlaneGeometry } from "three";
import { PALETTE, ROOM } from "../config";
import { box, cyl, rbox } from "../geometry";
import type { BuildContext } from "./types";

/**
 * The room shell: floor with a subtle tile grid, back and left walls, a
 * short right wall so the front-right stays open to the camera, skirting,
 * a ceiling rail for the mechanical arm and one hanging lamp.
 */
export function buildRoom(ctx: BuildContext) {
  const { shared } = ctx;
  const group = new Group();
  group.name = "room";
  const width = ROOM.maxX - ROOM.minX;
  const depth = ROOM.maxZ - ROOM.minZ;
  const cx = (ROOM.minX + ROOM.maxX) / 2;
  const cz = (ROOM.minZ + ROOM.maxZ) / 2;
  const t = 0.18; // wall thickness

  // Floor slab (slightly larger than the room so the edges read as a base)
  const floor = new Mesh(rbox(width + 0.6, 0.3, depth + 0.6, 0.08), shared.floor);
  floor.position.set(cx, -0.15, cz);
  group.add(floor);

  // Tile grid lines on the floor
  const lines = new Group();
  const lineGeoX = new PlaneGeometry(width, 0.012);
  const lineGeoZ = new PlaneGeometry(0.012, depth);
  for (let z = ROOM.minZ + 1; z < ROOM.maxZ; z += 1) {
    const l = new Mesh(lineGeoX, shared.floorLine);
    l.rotation.x = -Math.PI / 2;
    l.position.set(cx, 0.002, z);
    lines.add(l);
  }
  for (let x = ROOM.minX + 1; x < ROOM.maxX; x += 1) {
    const l = new Mesh(lineGeoZ, shared.floorLine);
    l.rotation.x = -Math.PI / 2;
    l.position.set(x, 0.002, cz);
    lines.add(l);
  }
  group.add(lines);

  // Back wall
  const back = new Mesh(box(width + t * 2, ROOM.height, t), shared.wall);
  back.position.set(cx, ROOM.height / 2, ROOM.minZ - t / 2);
  group.add(back);

  // Left wall
  const left = new Mesh(box(t, ROOM.height, depth + t), shared.wallShade);
  left.position.set(ROOM.minX - t / 2, ROOM.height / 2, cz - t / 2);
  group.add(left);

  // Short right wall (back portion only)
  const rightLen = ROOM.rightWallEndZ - ROOM.minZ;
  const right = new Mesh(box(t, ROOM.height, rightLen + t), shared.wallShade);
  right.position.set(ROOM.maxX + t / 2, ROOM.height / 2, ROOM.minZ + rightLen / 2 - t / 2);
  group.add(right);

  // Skirting boards (charcoal band at the base of each wall)
  const skirtMat = ctx.makeMaterials().toon(PALETTE.charcoal);
  const skirtBack = new Mesh(box(width, 0.14, 0.04), skirtMat);
  skirtBack.position.set(cx, 0.07, ROOM.minZ + 0.02);
  const skirtLeft = new Mesh(box(0.04, 0.14, depth), skirtMat);
  skirtLeft.position.set(ROOM.minX + 0.02, 0.07, cz);
  const skirtRight = new Mesh(box(0.04, 0.14, rightLen), skirtMat);
  skirtRight.position.set(ROOM.maxX - 0.02, 0.07, ROOM.minZ + rightLen / 2);
  group.add(skirtBack, skirtLeft, skirtRight);

  // A chalkboard-style strip on the back wall gives the console a backdrop
  const stripMat = ctx.makeMaterials().toon(PALETTE.charcoalLight);
  const strip = new Mesh(box(3.6, 1.9, 0.03), stripMat);
  strip.position.set(0, 1.85, ROOM.minZ + 0.02);
  group.add(strip);

  // Ceiling rail for the arm (front-left) and a hanging lamp over the console
  const metal = ctx.makeMaterials();
  const rail = new Mesh(cyl(0.035, 0.035, 2.6), metal.toon(PALETTE.metalDark));
  rail.rotation.z = Math.PI / 2;
  rail.position.set(-2.0, ROOM.height - 0.1, 0.9);
  group.add(rail);
  const railPostA = new Mesh(cyl(0.03, 0.03, 0.3), metal.toon(PALETTE.metalDark));
  railPostA.position.set(-3.2, ROOM.height - 0.25, 0.9);
  const railPostB = railPostA.clone();
  railPostB.position.x = -0.8;
  group.add(railPostA, railPostB);

  const lampX = 1.1;
  const lampZ = -0.7;
  const cord = new Mesh(cyl(0.012, 0.012, 0.7), metal.toon(PALETTE.charcoal));
  cord.position.set(lampX, ROOM.height - 0.35, lampZ);
  const shade = new Mesh(cyl(0.12, 0.34, 0.26, 16), metal.toon(PALETTE.orange));
  shade.position.set(lampX, ROOM.height - 0.78, lampZ);
  const bulb = new Mesh(cyl(0.06, 0.06, 0.04, 10), shared.ledTeal);
  bulb.position.set(lampX, ROOM.height - 0.92, lampZ);
  group.add(cord, shade, bulb);

  return group;
}
