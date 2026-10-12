import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { PALETTE, ROOM } from "../config";
import { PartBuilder, box, cyl, rbox, sphere, type Xyz } from "../geometry";
import type { Animator, BuildContext } from "./types";

export interface RoomParts {
  group: Group;
  /** Walls that get hidden when the camera orbits behind them. */
  walls: { back: Mesh; left: Mesh; right: Mesh; skirtBack: Mesh; skirtLeft: Mesh; skirtRight: Mesh };
  /** Hanging lamp, hidden while the console is focused so it never blocks the monitor. */
  lamp: Group;
  /** Ambient motion owned by the room (the wall clock). */
  animators: Animator[];
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
  // The logo plaque on the back wall, and something on the side walls
  const sign = buildLogoSign(ctx);
  sign.position.set(0, ROOM.height / 2 - 0.1, t / 2 + 0.01 + 0.03);
  back.add(sign);
  const animators = decorateLeftWall(ctx, left, t);
  decorateRightWall(ctx, right, t);

  return { group, walls: { back, left, right, skirtBack, skirtLeft, skirtRight }, lamp, animators };
}

/**
 * The site logo (src/assets/logo.svg) engraved on a cream plaque: the SVG is
 * rasterised onto a canvas texture once it has loaded; until then the plaque
 * is blank. The SVG only has a viewBox, so explicit dimensions are injected
 * before drawing to get a crisp raster.
 */
function buildLogoSign(ctx: BuildContext) {
  const sign = new Group();
  sign.name = "wordmark";
  const W = 3.1;
  const H = 1.0;
  const parts = new PartBuilder(ctx.makeMaterials());
  parts.add(rbox(W, H, 0.06, 0.04), PALETTE.cream, { position: [0, 0, 0] });
  // A slight inner step so the plaque reads as engraved, not printed
  parts.add(rbox(W - 0.16, H - 0.16, 0.02, 0.03), PALETTE.wall, { position: [0, 0, 0.03] });
  parts.build(sign, ctx.shared.outline);

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 532; // 1500 × 390 viewBox
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const logo = new Mesh(new PlaneGeometry(2.6, 2.6 * (532 / 2048)), new MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }));
  logo.position.z = 0.045;
  sign.add(logo);

  if (ctx.logoSrc) {
    fetch(ctx.logoSrc)
      .then((r) => r.text())
      .then((svg) => {
        const sized = svg.replace(/<svg\b/, '<svg width="1500" height="390"');
        const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
        const img = new Image();
        img.onload = () => {
          const c = canvas.getContext("2d");
          if (c) {
            c.clearRect(0, 0, canvas.width, canvas.height);
            c.drawImage(img, 0, 0, canvas.width, canvas.height);
            texture.needsUpdate = true;
            ctx.requestRender?.();
          }
          URL.revokeObjectURL(url);
        };
        img.onerror = () => URL.revokeObjectURL(url);
        img.src = url;
      })
      .catch(() => {});
  }
  return sign;
}

/**
 * Left wall (x = minX, faces +x): a corkboard with pinned notes on the open
 * front stretch, a wall clock high in the back corner above the rack. Children of the wall mesh so they
 * hide with it; positions are in the wall's local space.
 */
function decorateLeftWall(ctx: BuildContext, wall: Mesh, t: number): Animator[] {
  const face = t / 2 + 0.01; // local x of the wall's inner face
  const local = (y: number, z: number): Xyz => [face, y - ROOM.height / 2, z - wall.position.z];
  const group = new Group();
  group.name = "leftWallDecor";
  const parts = new PartBuilder(ctx.makeMaterials());

  // Corkboard on the open front stretch of the wall (the rack covers the back)
  const bz = 1.0;
  const by = 2.05;
  parts
    .add(box(0.05, 0.8, 1.05), PALETTE.wood, { position: local(by, bz) })
    .add(box(0.03, 0.7, 0.95), 0xd8bf92, { position: [face + 0.035, by - ROOM.height / 2, bz - wall.position.z] });
  const notes: [number, number, number, number, number][] = [
    // dy, dz, w, h, colour
    [0.17, -0.3, 0.22, 0.2, PALETTE.paper],
    [0.14, 0.12, 0.2, 0.26, PALETTE.orange],
    [-0.16, -0.22, 0.24, 0.18, PALETTE.teal],
    [-0.14, 0.22, 0.2, 0.2, PALETTE.paper],
  ];
  notes.forEach(([dy, dz, w, h, color], i) => {
    const tilt = (i % 2 ? 1 : -1) * 0.08;
    parts.add(box(0.015, h, w), color, { position: [face + 0.06, by + dy - ROOM.height / 2, bz + dz - wall.position.z], rotation: [tilt, 0, 0] });
    parts.add(cyl(0.02, 0.02, 0.02, 8), i % 2 ? PALETTE.red : PALETTE.charcoal, {
      position: [face + 0.08, by + dy + h / 2 - 0.03 - ROOM.height / 2, bz + dz - wall.position.z],
      rotation: [0, 0, Math.PI / 2],
    });
  });

  // Wall clock high in the back corner, above the rack: rim, face, hour marks
  const cz = -2.45;
  const cy = 2.95;
  parts
    .add(cyl(0.27, 0.27, 0.04, 24), PALETTE.charcoal, { position: local(cy, cz), rotation: [0, 0, Math.PI / 2] })
    .add(cyl(0.23, 0.23, 0.02, 24), PALETTE.cream, { position: [face + 0.03, cy - ROOM.height / 2, cz - wall.position.z], rotation: [0, 0, Math.PI / 2] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const big = i % 3 === 0;
    parts.add(box(0.01, big ? 0.04 : 0.025, 0.012), PALETTE.charcoal, {
      position: [face + 0.042, cy + Math.cos(a) * 0.19 - ROOM.height / 2, cz - Math.sin(a) * 0.19 - wall.position.z],
      rotation: [-a, 0, 0],
    });
  }
  parts.build(group, ctx.shared.outline, new Set([PALETTE.wood, PALETTE.charcoal, PALETTE.orange, PALETTE.teal, PALETTE.paper]));

  // Hands pivot at the centre and follow real time; the second hand ticks.
  const mats = ctx.makeMaterials();
  const pivot = new Group();
  pivot.position.set(face + 0.048, cy - ROOM.height / 2, cz - wall.position.z);
  const hand = (length: number, width: number, color: number, lift: number) => {
    const h = new Group();
    const blade = new Mesh(box(0.01, length, width), mats.toon(color));
    blade.position.set(lift, length / 2 - 0.02, 0);
    h.add(blade);
    pivot.add(h);
    return h;
  };
  const hour = hand(0.12, 0.03, PALETTE.charcoal, 0);
  const minute = hand(0.17, 0.025, PALETTE.charcoal, 0.006);
  const second = hand(0.2, 0.012, PALETTE.orange, 0.012);
  const cap = new Mesh(cyl(0.025, 0.025, 0.02, 10), mats.toon(PALETTE.orange));
  cap.rotation.z = Math.PI / 2;
  cap.position.x = 0.018;
  pivot.add(cap);
  group.add(pivot);
  wall.add(group);

  // Seen from inside the room (looking toward −x) clockwise runs +y → −z,
  // which is a negative rotation about x.
  const TWO_PI = Math.PI * 2;
  const setHands = (ms: number) => {
    const d = new Date(ms);
    const s = d.getSeconds() + d.getMilliseconds() / 1000;
    const m = d.getMinutes() + s / 60;
    const h = (d.getHours() % 12) + m / 60;
    hour.rotation.x = -(h / 12) * TWO_PI;
    minute.rotation.x = -(m / 60) * TWO_PI;
    return d.getSeconds();
  };
  let shownSecond = setHands(Date.now());
  second.rotation.x = -(shownSecond / 60) * TWO_PI;
  let tickStart = -1;
  let fromAngle = second.rotation.x;
  const TICK = 0.16;
  const clock: Animator = {
    id: "wallClock",
    update: (_dt, t) => {
      const now = Date.now();
      const sec = setHands(now);
      if (sec !== shownSecond) {
        shownSecond = sec;
        fromAngle = second.rotation.x;
        tickStart = t;
      }
      const target = -(shownSecond / 60) * TWO_PI;
      if (tickStart >= 0) {
        // Short jump with a small overshoot, like a quartz movement
        const k = Math.min(1, (t - tickStart) / TICK);
        const ease = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); // back.out-ish
        // keep the jump going the short way round (59 → 0)
        let delta = target - fromAngle;
        if (delta > Math.PI) delta -= TWO_PI;
        if (delta < -Math.PI) delta += TWO_PI;
        second.rotation.x = fromAngle + delta * ease;
        if (k >= 1) {
          second.rotation.x = target;
          tickStart = -1;
        }
        return true;
      }
      // Minute/hour hands creep; redraw a few times a minute is plenty
      return false;
    },
  };
  return [clock];
}

/**
 * Right wall (x = maxX, faces −x; it only runs from the back to
 * ROOM.rightWallEndZ): a whiteboard with a sketched plan and a marker tray
 * beside the server cabinet, and a vent grille up near the top.
 */
function decorateRightWall(ctx: BuildContext, wall: Mesh, t: number) {
  const face = -(t / 2 + 0.01);
  const group = new Group();
  group.name = "rightWallDecor";
  const parts = new PartBuilder(ctx.makeMaterials());
  const ly = (y: number) => y - ROOM.height / 2;
  const lz = (z: number) => z - wall.position.z;

  // Whiteboard between the cabinet and the wall's end
  const wz = -1.15;
  const wy = 2.05;
  const bw = 0.9;
  const bh = 0.66;
  parts
    .add(rbox(0.05, bh, bw, 0.02), PALETTE.charcoalLight, { position: [face, ly(wy), lz(wz)] })
    // marker tray with two markers
    .add(box(0.08, 0.03, 0.5), PALETTE.charcoal, { position: [face - 0.03, ly(wy - bh / 2 - 0.03), lz(wz)] })
    .add(cyl(0.015, 0.015, 0.14, 8), PALETTE.teal, { position: [face - 0.045, ly(wy - bh / 2 - 0.0), lz(wz - 0.1)], rotation: [Math.PI / 2, 0, 0] })
    .add(cyl(0.015, 0.015, 0.14, 8), PALETTE.orange, { position: [face - 0.045, ly(wy - bh / 2 - 0.0), lz(wz + 0.08)], rotation: [Math.PI / 2, 0, 0] });
  // Vent grille up high, above the cabinet
  const vz = -2.25;
  const vy = 3.0;
  parts.add(rbox(0.04, 0.3, 0.6, 0.02), PALETTE.charcoal, { position: [face, ly(vy), lz(vz)] });
  for (let i = 0; i < 4; i++) {
    parts.add(box(0.02, 0.035, 0.5), PALETTE.metal, { position: [face - 0.025, ly(vy - 0.1 + i * 0.065), lz(vz)] });
  }
  parts.build(group, ctx.shared.outline, new Set([PALETTE.charcoal, PALETTE.charcoalLight, PALETTE.teal, PALETTE.orange]));

  // The board face: a sketched plan drawn on a canvas (boxes and arrows)
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 376;
  const c = canvas.getContext("2d");
  if (c) {
    c.fillStyle = "#fdfaf2";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.lineCap = "round";
    c.lineJoin = "round";
    const boxAt = (x: number, y: number, w: number, h: number, color: string) => {
      c.strokeStyle = color;
      c.lineWidth = 9;
      c.beginPath();
      c.roundRect(x, y, w, h, 14);
      c.stroke();
    };
    const line = (x1: number, y1: number, x2: number, y2: number, color: string, width = 7) => {
      c.strokeStyle = color;
      c.lineWidth = width;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.stroke();
    };
    // three site boxes → one console box, plus a checklist
    boxAt(40, 50, 110, 74, "#258f83");
    boxAt(40, 150, 110, 74, "#258f83");
    boxAt(40, 250, 110, 74, "#258f83");
    boxAt(300, 140, 170, 100, "#25252b");
    line(150, 87, 300, 170, "#f58a35", 8);
    line(150, 187, 300, 190, "#f58a35", 8);
    line(150, 287, 300, 210, "#f58a35", 8);
    line(330, 170, 440, 170, "#258f83", 6);
    line(330, 200, 410, 200, "#258f83", 6);
    for (let i = 0; i < 3; i++) {
      line(320, 285 + i * 30, 338, 303 + i * 30, "#25252b", 6);
      line(338, 303 + i * 30, 362, 275 + i * 30, "#25252b", 6);
      line(380, 290 + i * 30, 470, 290 + i * 30, "#b9b3a7", 6);
    }
  }
  const sketch = new CanvasTexture(canvas);
  sketch.colorSpace = SRGBColorSpace;
  sketch.anisotropy = 4;
  const board = new Mesh(new PlaneGeometry(bw - 0.08, bh - 0.08), new MeshBasicMaterial({ map: sketch, toneMapped: false }));
  board.position.set(face - 0.03, ly(wy), lz(wz));
  board.rotation.y = -Math.PI / 2;
  group.add(board);
  wall.add(group);
}
