import { Group, MathUtils, Mesh, Vector3 } from "three";
import { PALETTE } from "../config";
import { contactShadow, cyl, plane, rbox, sphere } from "../geometry";
import type { Animator, BuildContext } from "./types";

/**
 * A small, original lab assistant that walks around the room. Proportions:
 * two stubby legs with feet, a rounded torso with a chest panel, a short
 * neck, a boxy head with a wide visor and two eyes, one antenna. It roams a
 * loop of waypoints between the stations, pauses to look around, turns its
 * head toward what the visitor hovers, and points at the active station.
 */
export class Robot {
  readonly group = new Group();
  /** Everything above the feet; bobs while walking and yaws when pointing. */
  readonly body = new Group();
  readonly head: Group;
  readonly armLeft: Group;
  readonly armRight: Group;
  readonly legLeft: Group;
  readonly legRight: Group;
  readonly eyes: Mesh[];
  /** World-space point the head turns toward. */
  lookTarget = new Vector3(4, 1.2, 4);
  /** Set by sequences while a gesture is playing; the robot stands still. */
  busy = false;
  /** Walk the loop when true (overview); stops while a station is focused. */
  roaming = true;

  private blinkAt = 2.5;
  private phase = 0;
  private path: Vector3[] = [];
  private segment = 0;
  private progress = 0;
  private pauseUntil = 0;
  private readonly speed = 0.42; // units per second
  private readonly from = new Vector3();
  private readonly to = new Vector3();

  constructor(ctx: BuildContext) {
    const mats = ctx.makeMaterials();
    const g = this.group;
    g.name = "robot";
    g.add(this.body);

    // Legs + feet (pivot at the hip)
    const makeLeg = (side: 1 | -1) => {
      const hip = new Group();
      hip.position.set(side * 0.1, 0.4, 0);
      const leg = new Mesh(cyl(0.05, 0.045, 0.3, 10), mats.toon(PALETTE.metal));
      leg.position.y = -0.15;
      const foot = new Mesh(rbox(0.14, 0.07, 0.22, 0.03), mats.toon(PALETTE.charcoal));
      foot.position.set(0, -0.365, 0.03);
      hip.add(leg, foot);
      return hip;
    };
    this.legLeft = makeLeg(-1);
    this.legRight = makeLeg(1);
    this.body.add(this.legLeft, this.legRight);

    // Pelvis + torso
    const pelvis = new Mesh(cyl(0.17, 0.15, 0.1, 14), mats.toon(PALETTE.charcoal));
    pelvis.position.y = 0.44;
    const torso = new Mesh(rbox(0.44, 0.5, 0.36, 0.12), mats.toon(PALETTE.robot));
    torso.position.y = 0.72;
    const torsoHull = new Mesh(torso.geometry, ctx.shared.outline);
    torsoHull.position.copy(torso.position);
    const chest = new Mesh(rbox(0.22, 0.16, 0.03, 0.02), mats.toon(PALETTE.blue));
    chest.position.set(0, 0.74, 0.185);
    const button = new Mesh(sphere(0.03, 8, 6), mats.toon(PALETTE.orange));
    button.position.set(0.14, 0.6, 0.18);
    const belt = new Mesh(cyl(0.2, 0.2, 0.05, 14), mats.toon(PALETTE.teal));
    belt.position.y = 0.49;
    this.body.add(pelvis, torso, torsoHull, chest, button, belt);

    // Neck + head
    const neck = new Mesh(cyl(0.07, 0.08, 0.1, 10), mats.toon(PALETTE.metalDark));
    neck.position.y = 1.0;
    this.body.add(neck);
    this.head = new Group();
    this.head.position.y = 1.04; // pivot at the neck
    const skull = new Mesh(rbox(0.42, 0.32, 0.36, 0.1), mats.toon(PALETTE.robot));
    skull.position.y = 0.17;
    const skullHull = new Mesh(skull.geometry, ctx.shared.outline);
    skullHull.position.copy(skull.position);
    const visor = new Mesh(rbox(0.34, 0.14, 0.06, 0.04), mats.toon(PALETTE.charcoal));
    visor.position.set(0, 0.18, 0.17);
    const eyeL = new Mesh(plane(0.08, 0.05), ctx.shared.ledBlue);
    eyeL.position.set(-0.08, 0.18, 0.205);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.08;
    const earL = new Mesh(cyl(0.05, 0.05, 0.04, 10), mats.toon(PALETTE.teal));
    earL.rotation.z = Math.PI / 2;
    earL.position.set(-0.23, 0.17, 0);
    const earR = earL.clone();
    earR.position.x = 0.23;
    const antenna = new Mesh(cyl(0.012, 0.012, 0.2, 8), mats.toon(PALETTE.metalDark));
    antenna.position.set(0.08, 0.42, 0);
    const tip = new Mesh(sphere(0.04, 10, 8), mats.toon(PALETTE.orange));
    tip.position.set(0.08, 0.53, 0);
    this.head.add(skull, skullHull, visor, eyeL, eyeR, earL, earR, antenna, tip);
    this.body.add(this.head);
    this.eyes = [eyeL, eyeR];

    // Arms (pivot at the shoulder, outside the torso)
    const makeArm = (side: 1 | -1) => {
      const shoulder = new Group();
      shoulder.position.set(side * 0.27, 0.9, 0);
      const joint = new Mesh(sphere(0.06, 10, 8), mats.toon(PALETTE.teal));
      const upper = new Mesh(cyl(0.04, 0.035, 0.28, 10), mats.toon(PALETTE.metal));
      upper.position.y = -0.16;
      const hand = new Mesh(sphere(0.065, 10, 8), mats.toon(PALETTE.charcoal));
      hand.position.y = -0.33;
      shoulder.add(joint, upper, hand);
      shoulder.rotation.z = side * 0.15;
      return shoulder;
    };
    this.armLeft = makeArm(-1);
    this.armRight = makeArm(1);
    this.body.add(this.armLeft, this.armRight);

    g.add(contactShadow(ctx.shared, 0.3, { position: [0, 0, 0] }));
  }

  /** Waypoints (world space, y ignored) the robot walks between in a loop. */
  setPath(points: Vector3[]) {
    this.path = points.map((p) => new Vector3(p.x, 0, p.z));
    this.segment = 0;
    this.progress = 0;
    if (this.path.length) {
      this.group.position.copy(this.path[0]!);
      this.pauseUntil = 0;
    }
  }

  private faceToward(dir: Vector3, dt: number, lambda = 5) {
    const wanted = Math.atan2(dir.x, dir.z);
    let current = this.group.rotation.y;
    // Shortest turn
    let delta = wanted - current;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    this.group.rotation.y = current + delta * Math.min(1, lambda * dt);
  }

  animator(): Animator {
    const tmp = new Vector3();
    const dir = new Vector3();
    return {
      id: "robot",
      update: (dt, t) => {
        const walking = this.roaming && !this.busy && this.path.length > 1 && t >= this.pauseUntil;

        if (walking) {
          const a = this.path[this.segment]!;
          const b = this.path[(this.segment + 1) % this.path.length]!;
          this.from.copy(a);
          this.to.copy(b);
          const len = this.from.distanceTo(this.to);
          this.progress += (this.speed * dt) / Math.max(0.001, len);
          if (this.progress >= 1) {
            this.progress = 0;
            this.segment = (this.segment + 1) % this.path.length;
            this.group.position.copy(b);
            this.pauseUntil = t + 2 + Math.random() * 3; // look around for a bit
          } else {
            this.group.position.lerpVectors(this.from, this.to, this.progress);
          }
          dir.subVectors(this.to, this.from);
          this.faceToward(dir, dt);
          // Gait: legs swing, arms counter-swing, body bobs
          this.phase += dt * 7;
          const s = Math.sin(this.phase);
          this.legLeft.rotation.x = s * 0.55;
          this.legRight.rotation.x = -s * 0.55;
          if (!this.busy) {
            this.armLeft.rotation.x = -s * 0.35;
            this.armRight.rotation.x = s * 0.35;
          }
          this.body.position.y = Math.abs(Math.cos(this.phase)) * 0.035;
        } else {
          // Settle into a standing pose
          this.legLeft.rotation.x = MathUtils.damp(this.legLeft.rotation.x, 0, 8, dt);
          this.legRight.rotation.x = MathUtils.damp(this.legRight.rotation.x, 0, 8, dt);
          // Only settle the arms when the gait stopped them mid-swing; while a
          // station is focused the pointing gesture owns the arms.
          if (this.roaming && !this.busy) {
            this.armLeft.rotation.x = MathUtils.damp(this.armLeft.rotation.x, 0, 8, dt);
            this.armRight.rotation.x = MathUtils.damp(this.armRight.rotation.x, 0, 8, dt);
          }
          this.body.position.y = MathUtils.damp(this.body.position.y, Math.sin(t * 1.6) * 0.012 + 0.012, 6, dt);
        }

        // Head tracks the look target (damped), within a comfortable range
        this.head.getWorldPosition(tmp);
        const local = this.head.parent!.worldToLocal(this.lookTarget.clone());
        local.sub(this.head.position);
        const wantedYaw = MathUtils.clamp(Math.atan2(local.x, local.z), -1.1, 1.1);
        const wantedPitch = MathUtils.clamp(-Math.atan2(local.y, Math.hypot(local.x, local.z)), -0.35, 0.3);
        this.head.rotation.y = MathUtils.damp(this.head.rotation.y, wantedYaw, 4, dt);
        this.head.rotation.x = MathUtils.damp(this.head.rotation.x, wantedPitch, 4, dt);

        if (t > this.blinkAt) {
          const open = !this.eyes[0]!.visible;
          this.eyes.forEach((e) => (e.visible = open));
          this.blinkAt = t + (open ? 2.5 + Math.random() * 3 : 0.12);
        }
        return true;
      },
    };
  }
}
