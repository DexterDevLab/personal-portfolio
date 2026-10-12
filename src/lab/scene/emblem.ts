import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from "three";
import { sphere } from "../geometry";
import type { BuildContext } from "./types";

/**
 * The logo's symbol (the "D" monitor from src/assets/logo.svg) as a small
 * emblem for props such as the robot's chest: the symbol rasterised onto a
 * square plane, with its antenna ball as a tiny 3D beacon and a glow over
 * the `<>` on its screen. `update(t)` animates both (pulse, blink, heartbeat).
 * Facing +z; `size` is the plane's edge in scene units.
 */
export interface Emblem {
  group: Group;
  update(t: number): void;
}

const VIEW = 400; // square viewBox the symbol is centred in (see generate-brand-assets.mjs)
const OFFSET = { x: 45, y: 20 }; // symbol translate inside that viewBox

export function buildEmblem(ctx: BuildContext, size: number): Emblem {
  const group = new Group();
  group.name = "emblem";

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const face = new Mesh(new PlaneGeometry(size, size), new MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }));
  group.add(face);

  const toPlane = (x: number, y: number): [number, number] => [((x + OFFSET.x) / VIEW - 0.5) * size, (0.5 - (y + OFFSET.y) / VIEW) * size];

  // Antenna ball as a beacon
  const [bx, by] = toPlane(182, 46);
  const r = (28 / VIEW) * size;
  const beacon = new Group();
  beacon.position.set(bx, by, r);
  const ball = new Mesh(sphere(r, 12, 10), ctx.shared.ledOrange);
  beacon.add(new Mesh(sphere(r * 1.16, 12, 10), ctx.shared.outline), ball);
  group.add(beacon);

  // Glow over the <> on the screen
  const glyph = document.createElement("canvas");
  glyph.width = 182;
  glyph.height = 102;
  const gc = glyph.getContext("2d");
  if (gc) {
    gc.strokeStyle = "#dff7f2";
    gc.lineWidth = 28;
    gc.lineCap = "round";
    gc.lineJoin = "round";
    const P = (x: number, y: number): [number, number] => [(x - 119) * 2, (y - 179) * 2];
    gc.beginPath();
    gc.moveTo(...P(145, 184)); gc.lineTo(...P(124, 205)); gc.lineTo(...P(145, 225));
    gc.moveTo(...P(184, 184)); gc.lineTo(...P(205, 205)); gc.lineTo(...P(184, 225));
    gc.stroke();
  }
  const glowTex = new CanvasTexture(glyph);
  glowTex.colorSpace = SRGBColorSpace;
  const glowMat = new MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const [gx, gy] = toPlane(164.5, 204.5);
  const glow = new Mesh(new PlaneGeometry((91 / VIEW) * size, (51 / VIEW) * size), glowMat);
  glow.position.set(gx, gy, 0.002);
  group.add(glow);

  if (ctx.logoSrc) {
    fetch(ctx.logoSrc)
      .then((res) => res.text())
      .then((svg) => {
        const style = svg.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
        const symbol = svg.match(/<g id="symbol">([\s\S]*?)<\/g>\s*<g id="wordmark"/)?.[1];
        if (!symbol) return;
        // Painted ball removed: the 3D beacon stands in for it
        const noBall = symbol
          .replace(/<circle cx="182" cy="46" r="32"[^>]*\/>\s*/g, "")
          .replace(/<circle cx="182" cy="46" r="28"[^>]*\/>\s*/g, "")
          .replace(/<circle cx="175" cy="38" r="7"[^>]*\/>\s*/g, "");
        const art =
          `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEW}" height="${VIEW}" viewBox="0 0 ${VIEW} ${VIEW}">` +
          `<defs><style>${style}</style></defs><g transform="translate(${OFFSET.x} ${OFFSET.y})">${noBall}</g></svg>`;
        const url = URL.createObjectURL(new Blob([art], { type: "image/svg+xml" }));
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

  return {
    group,
    update(t) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
      const blink = t % 1 < 0.15;
      beacon.scale.setScalar(1 + pulse * 0.12 + (blink ? 0.1 : 0));
      ball.material = blink ? ctx.shared.lampBulb : ctx.shared.ledOrange;
      glowMat.opacity = 0.3 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.6));
    },
  };
}
