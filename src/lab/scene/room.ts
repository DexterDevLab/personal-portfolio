import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { PALETTE, ROOM } from "../config";
import { box, cyl, rbox, sphere } from "../geometry";
import type { BuildContext } from "./types";

export interface RoomParts {
  group: Group;
  /** Walls that get hidden when the camera orbits behind them. */
  walls: { back: Mesh; left: Mesh; right: Mesh; skirtBack: Mesh; skirtLeft: Mesh; skirtRight: Mesh };
  /** Hanging lamp, hidden while the console is focused so it never blocks the monitor. */
  lamp: Group;
}

/**
 * The room shell: a roofless dollhouse. Floor with a subtle tile grid, back
 * and left walls, a short right wall, skirting, a ceiling rail for the arm
 * and one hanging lamp. Walls are plain meshes so the runtime can toggle
 * their visibility depending on where the camera is.
 */
export function buildRoom(ctx: BuildContext): RoomParts {
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

  // Tile grid lines on the floor, merged into one mesh (one draw call)
  const lineParts: PlaneGeometry[] = [];
  for (let z = ROOM.minZ + 1; z < ROOM.maxZ; z += 1) {
    const g = new PlaneGeometry(width, 0.012);
    g.rotateX(-Math.PI / 2);
    g.translate(cx, 0.002, z);
    lineParts.push(g);
  }
  for (let x = ROOM.minX + 1; x < ROOM.maxX; x += 1) {
    const g = new PlaneGeometry(0.012, depth);
    g.rotateX(-Math.PI / 2);
    g.translate(x, 0.002, cz);
    lineParts.push(g);
  }
  const grid = mergeGeometries(lineParts, false);
  lineParts.forEach((g) => g.dispose());
  if (grid) group.add(new Mesh(grid, shared.floorLine));

  // Walls
  const back = new Mesh(box(width + t * 2, ROOM.height, t), shared.wall);
  back.position.set(cx, ROOM.height / 2, ROOM.minZ - t / 2);
  const left = new Mesh(box(t, ROOM.height, depth + t), shared.wallShade);
  left.position.set(ROOM.minX - t / 2, ROOM.height / 2, cz - t / 2);
  const rightLen = ROOM.rightWallEndZ - ROOM.minZ;
  const right = new Mesh(box(t, ROOM.height, rightLen + t), shared.wallShade);
  right.position.set(ROOM.maxX + t / 2, ROOM.height / 2, ROOM.minZ + rightLen / 2 - t / 2);
  group.add(back, left, right);

  // Skirting boards (charcoal band at the base of each wall)
  const skirtMat = ctx.makeMaterials().toon(PALETTE.charcoal);
  const skirtBack = new Mesh(box(width, 0.14, 0.04), skirtMat);
  skirtBack.position.set(cx, 0.07, ROOM.minZ + 0.02);
  const skirtLeft = new Mesh(box(0.04, 0.14, depth), skirtMat);
  skirtLeft.position.set(ROOM.minX + 0.02, 0.07, cz);
  const skirtRight = new Mesh(box(0.04, 0.14, rightLen), skirtMat);
  skirtRight.position.set(ROOM.maxX - 0.02, 0.07, ROOM.minZ + rightLen / 2);
  group.add(skirtBack, skirtLeft, skirtRight);

  // A chalkboard-style strip on the back wall gives the console a backdrop.
  // It sits just inside the wall so it stays when the wall is hidden.
  const stripMat = ctx.makeMaterials().toon(PALETTE.charcoalLight);
  const strip = new Mesh(box(3.6, 1.9, 0.05), stripMat);
  strip.position.set(0, 1.85, ROOM.minZ + 0.03);
  group.add(strip);

  // Ceiling rail for the arm (front-left)
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

  // Tall floor lamp (the room has no ceiling to hang one from): weighted
  // base, pole, a short arm and a shade pointing down over the console side.
  // The runtime hides it while the console is focused.
  const lamp = new Group();
  lamp.name = "lamp";
  lamp.position.set(-1.05, 0, -1.5); // clear of the robot's walk
  lamp.rotation.y = 0.5; // arm reaches toward the console
  const lampBase = new Mesh(cyl(0.2, 0.3, 0.08, 16), metal.toon(PALETTE.charcoal));
  lampBase.position.y = 0.04;
  const poleH = 2.3;
  const pole = new Mesh(cyl(0.04, 0.05, poleH, 10), metal.toon(PALETTE.metalDark));
  pole.position.y = 0.08 + poleH / 2;
  const elbow = new Mesh(sphere(0.08, 12, 10), metal.toon(PALETTE.orange));
  elbow.position.y = 0.08 + poleH;
  // Arm angles up and out from the elbow, then the shade hangs from its end
  const armLen = 0.8;
  const armAngle = 0.95; // from vertical
  const lampArm = new Mesh(cyl(0.035, 0.035, armLen, 10), metal.toon(PALETTE.metalDark));
  lampArm.rotation.z = -armAngle;
  lampArm.position.set(Math.sin(armAngle) * (armLen / 2), elbow.position.y + Math.cos(armAngle) * (armLen / 2), 0);
  const armEndX = Math.sin(armAngle) * armLen;
  const armEndY = elbow.position.y + Math.cos(armAngle) * armLen;
  const hinge = new Mesh(sphere(0.06, 10, 8), metal.toon(PALETTE.orange));
  hinge.position.set(armEndX, armEndY, 0);
  const shade = new Mesh(cyl(0.09, 0.32, 0.3, 18), metal.toon(PALETTE.orange));
  shade.position.set(armEndX, armEndY - 0.17, 0);
  const shadeHull = new Mesh(shade.geometry, shared.outline);
  shadeHull.position.copy(shade.position);
  const bulb = new Mesh(cyl(0.07, 0.07, 0.03, 12), shared.ledTeal);
  bulb.position.set(armEndX, armEndY - 0.33, 0);
  lamp.add(lampBase, pole, elbow, lampArm, hinge, shade, shadeHull, bulb);
  group.add(lamp);

  // Wordmark painted on the back wall above the console backdrop. It is a
  // child of the wall so it hides together with it.
  const sign = buildWordmark(ctx, "DexterDevLab");
  sign.position.set(0, ROOM.height / 2 - 0.1, t / 2 + 0.01 + 0.03);
  back.add(sign);

  return { group, walls: { back, left, right, skirtBack, skirtLeft, skirtRight }, lamp };
}

/**
 * Text rendered to a canvas texture on a plane, in the site's mono face.
 * Drawn with the fallback first and redrawn once the web font is ready.
 */
function buildWordmark(ctx: BuildContext, text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 192;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;

  const draw = () => {
    const c = canvas.getContext("2d");
    if (!c) return;
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.font = `700 118px "Geist Mono", ui-monospace, monospace`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#4f7cff";
    c.fillText(text, canvas.width / 2, canvas.height / 2 + 6);
    texture.needsUpdate = true;
    ctx.requestRender?.();
  };
  draw();
  document.fonts?.load('700 118px "Geist Mono"').then(draw).catch(() => {});

  // Plate behind the lettering so it reads on the wall colour
  const plate = new Mesh(new PlaneGeometry(2.9, 0.56), ctx.makeMaterials().toon(PALETTE.charcoal));
  const letters = new Mesh(new PlaneGeometry(2.56, 0.48), new MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }));
  letters.position.z = 0.012;
  const sign = new Group();
  sign.name = "wordmark";
  sign.add(plate, letters);
  return sign;
}
