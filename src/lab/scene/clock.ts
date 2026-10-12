import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from "three";
import { PALETTE } from "../config";
import { PartBuilder, box, cyl, rbox } from "../geometry";
import type { Animator, BuildContext } from "./types";

export interface ClockOptions {
  /** Label plate under the face, e.g. "MANILA". */
  label: string;
  /** IANA time zone the hands follow, e.g. "Asia/Manila". */
  timeZone: string;
  radius?: number;
}

/**
 * A wall clock that keeps real time in a given zone. Built facing +z (hang
 * it on a wall whose inner face points that way, or rotate the group). The
 * second hand ticks once a second with a small overshoot; hour and minute
 * hands creep. Returns the group and the animator that drives it.
 */
export function buildClock(ctx: BuildContext, opts: ClockOptions): { group: Group; animator: Animator } {
  const R = opts.radius ?? 0.24;
  const group = new Group();
  group.name = `clock:${opts.timeZone}`;
  const parts = new PartBuilder(ctx.makeMaterials());
  const faceZ = 0.02; // front of the rim

  parts
    .add(cyl(R, R, 0.04, 28), PALETTE.charcoal, { position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0] })
    .add(cyl(R - 0.04, R - 0.04, 0.02, 28), PALETTE.cream, { position: [0, 0, faceZ], rotation: [Math.PI / 2, 0, 0] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const big = i % 3 === 0;
    parts.add(box(0.012, big ? 0.04 : 0.025, 0.01), PALETTE.charcoal, {
      position: [Math.sin(a) * (R - 0.08), Math.cos(a) * (R - 0.08), faceZ + 0.012],
      rotation: [0, 0, -a],
    });
  }
  // Label plate under the face
  const plateW = R * 1.5;
  parts.add(rbox(plateW, 0.09, 0.02, 0.01), PALETTE.charcoal, { position: [0, -R - 0.09, 0.005] });
  parts.build(group, ctx.shared.outline, new Set([PALETTE.charcoal]));

  // Label text
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const c = canvas.getContext("2d");
  if (c) {
    c.font = `700 40px "Geist Mono", ui-monospace, monospace`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#f5eedc";
    c.fillText(opts.label.toUpperCase(), 128, 34);
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  const label = new Mesh(new PlaneGeometry(plateW - 0.04, (plateW - 0.04) / 4), new MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  label.position.set(0, -R - 0.09, 0.018);
  group.add(label);
  document.fonts?.load('700 40px "Geist Mono"').then(() => {
    if (!c) return;
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillText(opts.label.toUpperCase(), 128, 34);
    tex.needsUpdate = true;
    ctx.requestRender?.();
  }).catch(() => {});

  // Hands pivot at the centre, in front of the face
  const mats = ctx.makeMaterials();
  const pivot = new Group();
  pivot.position.z = faceZ + 0.02;
  const hand = (length: number, width: number, color: number, lift: number) => {
    const h = new Group();
    const blade = new Mesh(box(width, length, 0.008), mats.toon(color));
    blade.position.set(0, length / 2 - 0.02, lift);
    h.add(blade);
    pivot.add(h);
    return h;
  };
  const hour = hand(R * 0.5, 0.03, PALETTE.charcoal, 0);
  const minute = hand(R * 0.72, 0.024, PALETTE.charcoal, 0.008);
  const second = hand(R * 0.82, 0.012, PALETTE.orange, 0.016);
  const cap = new Mesh(cyl(0.024, 0.024, 0.02, 10), mats.toon(PALETTE.orange));
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 0.02;
  pivot.add(cap);
  group.add(pivot);

  // Zone time: Intl gives the wall-clock fields for the zone; the fractional
  // second comes from the timestamp itself.
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: opts.timeZone, hour: "numeric", minute: "numeric", second: "numeric", hour12: false });
  const zoned = (ms: number) => {
    const d = new Date(ms);
    let h = 0;
    let m = 0;
    let s = 0;
    for (const p of fmt.formatToParts(d)) {
      if (p.type === "hour") h = Number(p.value) % 12;
      else if (p.type === "minute") m = Number(p.value);
      else if (p.type === "second") s = Number(p.value);
    }
    return { h, m, s, frac: d.getMilliseconds() / 1000 };
  };

  // Seen from the front (looking toward −z, +y up) clockwise runs +y → +x,
  // which is a negative rotation about z.
  const TWO_PI = Math.PI * 2;
  const setSlowHands = (z: ReturnType<typeof zoned>) => {
    const m = z.m + (z.s + z.frac) / 60;
    const h = z.h + m / 60;
    hour.rotation.z = -(h / 12) * TWO_PI;
    minute.rotation.z = -(m / 60) * TWO_PI;
  };
  let now = zoned(Date.now());
  setSlowHands(now);
  let shownSecond = now.s;
  second.rotation.z = -(shownSecond / 60) * TWO_PI;
  let tickStart = -1;
  let fromAngle = second.rotation.z;
  const TICK = 0.16;

  const animator: Animator = {
    id: group.name,
    update: (_dt, t) => {
      now = zoned(Date.now());
      setSlowHands(now);
      if (now.s !== shownSecond) {
        shownSecond = now.s;
        fromAngle = second.rotation.z;
        tickStart = t;
      }
      if (tickStart < 0) return false;
      const target = -(shownSecond / 60) * TWO_PI;
      const k = Math.min(1, (t - tickStart) / TICK);
      const ease = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); // back.out-ish
      let delta = target - fromAngle;
      if (delta > Math.PI) delta -= TWO_PI;
      if (delta < -Math.PI) delta += TWO_PI;
      second.rotation.z = fromAngle + delta * ease;
      if (k >= 1) {
        second.rotation.z = target;
        tickStart = -1;
      }
      return true;
    },
  };
  return { group, animator };
}
