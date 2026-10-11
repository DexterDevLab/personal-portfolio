import { Group, MathUtils, Mesh, Vector3 } from "three";
import { PALETTE } from "../config";
import { contactShadow, cyl, plane, rbox, sphere } from "../geometry";
import type { Animator, BuildContext } from "./types";

/**
 * A small, original lab assistant: a rounded body on a hover base, a dome
 * head with one wide eye-screen, two stub arms. It idles, looks at what the
 * visitor is looking at, and points at the active station.
 */
export class Robot {
  readonly group = new Group();
  readonly head: Group;
  readonly armLeft: Group;
  readonly armRight: Group;
  readonly eye: Mesh;
  readonly body: Group;
  /** World-space point the head turns toward. */
  lookTarget = new Vector3(4, 1.2, 4);
  /** Set by sequences while a gesture is playing. */
  busy = false;
  private blinkAt = 2.5;
  private readonly homeY = 0.42;

  constructor(ctx: BuildContext) {
    const mats = ctx.makeMaterials();
    const g = this.group;
    g.name = "robot";

    this.body = new Group();
    g.add(this.body);

    const base = new Mesh(cyl(0.22, 0.3, 0.14, 16), mats.toon(PALETTE.charcoal));
    base.position.y = 0.07;
    const ring = new Mesh(cyl(0.3, 0.3, 0.04, 16), mats.toon(PALETTE.teal));
    ring.position.y = 0.16;
    const torso = new Mesh(rbox(0.5, 0.62, 0.42, 0.14), mats.toon(PALETTE.robot));
    torso.position.y = 0.55;
    const belly = new Mesh(rbox(0.3, 0.2, 0.05, 0.03), mats.toon(PALETTE.blue));
    belly.position.set(0, 0.5, 0.2);
    const bolt = new Mesh(sphere(0.035, 8, 6), mats.toon(PALETTE.orange));
    bolt.position.set(0.17, 0.62, 0.2);
    this.body.add(base, ring, torso, belly, bolt);

    // Outline hulls for the big shapes
    const hullTorso = new Mesh(torso.geometry, ctx.shared.outline);
    hullTorso.position.copy(torso.position);
    this.body.add(hullTorso);

    this.head = new Group();
    this.head.position.y = 0.98;
    const dome = new Mesh(sphere(0.26, 18, 12), mats.toon(PALETTE.robot));
    const domeHull = new Mesh(dome.geometry, ctx.shared.outline);
    const visor = new Mesh(rbox(0.34, 0.16, 0.1, 0.05), mats.toon(PALETTE.charcoal));
    visor.position.set(0, 0.02, 0.2);
    this.eye = new Mesh(plane(0.24, 0.07), ctx.shared.ledBlue);
    this.eye.position.set(0, 0.02, 0.255);
    const antenna = new Mesh(cyl(0.012, 0.012, 0.22, 8), mats.toon(PALETTE.metalDark));
    antenna.position.set(0.1, 0.34, 0);
    const tip = new Mesh(sphere(0.04, 10, 8), mats.toon(PALETTE.orange));
    tip.position.set(0.1, 0.46, 0);
    this.head.add(dome, domeHull, visor, this.eye, antenna, tip);
    this.body.add(this.head);

    const makeArm = (side: 1 | -1) => {
      const pivot = new Group();
      pivot.position.set(side * 0.28, 0.72, 0);
      const upper = new Mesh(cyl(0.05, 0.05, 0.3, 10), mats.toon(PALETTE.metal));
      upper.position.y = -0.15;
      const hand = new Mesh(sphere(0.07, 10, 8), mats.toon(PALETTE.teal));
      hand.position.y = -0.33;
      pivot.add(upper, hand);
      pivot.rotation.z = side * 0.25;
      return pivot;
    };
    this.armLeft = makeArm(-1);
    this.armRight = makeArm(1);
    this.body.add(this.armLeft, this.armRight);

    g.add(contactShadow(ctx.shared, 0.34, { position: [0, 0, 0] }));
    this.body.position.y = this.homeY;
  }

  /** Idle animator: hover bob, head tracking, blink. */
  animator(): Animator {
    const tmp = new Vector3();
    return {
      id: "robotIdle",
      update: (dt, t) => {
        if (!this.busy) this.body.position.y = this.homeY + Math.sin(t * 1.6) * 0.03;
        // Yaw the head toward the look target (damped), keep it modest.
        this.group.worldToLocal(tmp.copy(this.lookTarget));
        const wantedYaw = MathUtils.clamp(Math.atan2(tmp.x, tmp.z), -1.2, 1.2);
        const wantedPitch = MathUtils.clamp(-Math.atan2(tmp.y - 1.4, Math.hypot(tmp.x, tmp.z)), -0.35, 0.25);
        this.head.rotation.y = MathUtils.damp(this.head.rotation.y, wantedYaw, 4, dt);
        this.head.rotation.x = MathUtils.damp(this.head.rotation.x, wantedPitch, 4, dt);
        if (t > this.blinkAt) {
          this.eye.visible = !this.eye.visible;
          this.blinkAt = t + (this.eye.visible ? 2.5 + Math.random() * 3 : 0.12);
        }
        return true;
      },
    };
  }
}
