import { Group, Mesh } from "three";
import { PALETTE, ROOM } from "../config";
import { cyl, rbox } from "../geometry";
import type { Animator, BuildContext } from "./types";

/**
 * Ceiling-mounted mechanical arm above the repair bench: a trolley on the
 * rail, a yaw joint, an upper segment, an elbow and a two-finger claw.
 * Sways gently when idle; sequences.ts drives it during the repair.
 */
export class MechArm {
  readonly group = new Group();
  readonly yaw = new Group();
  readonly elbow = new Group();
  readonly wrist = new Group();
  busy = false;

  constructor(ctx: BuildContext, x: number, z: number) {
    const mats = ctx.makeMaterials();
    const g = this.group;
    g.name = "arm";
    g.position.set(x, ROOM.height - 0.1, z);

    const trolley = new Mesh(rbox(0.3, 0.16, 0.22, 0.04), mats.toon(PALETTE.charcoal));
    trolley.position.y = -0.1;
    g.add(trolley);

    this.yaw.position.y = -0.18;
    g.add(this.yaw);

    const shoulder = new Mesh(cyl(0.09, 0.09, 0.12, 12), mats.toon(PALETTE.orange));
    const upper = new Mesh(rbox(0.1, 0.9, 0.1, 0.04), mats.toon(PALETTE.metal));
    upper.position.y = -0.5;
    this.yaw.add(shoulder, upper);

    this.elbow.position.y = -0.95;
    this.yaw.add(this.elbow);
    const joint = new Mesh(cyl(0.08, 0.08, 0.14, 12), mats.toon(PALETTE.orange));
    joint.rotation.z = Math.PI / 2;
    const fore = new Mesh(rbox(0.08, 0.7, 0.08, 0.03), mats.toon(PALETTE.metal));
    fore.position.y = -0.38;
    this.elbow.add(joint, fore);

    this.wrist.position.y = -0.74;
    this.elbow.add(this.wrist);
    const palm = new Mesh(rbox(0.16, 0.08, 0.12, 0.03), mats.toon(PALETTE.charcoal));
    const fingerL = new Mesh(rbox(0.04, 0.14, 0.08, 0.015), mats.toon(PALETTE.teal));
    fingerL.position.set(-0.06, -0.1, 0);
    const fingerR = fingerL.clone();
    fingerR.position.x = 0.06;
    this.wrist.add(palm, fingerL, fingerR);

    // Resting pose: tucked up a little
    this.elbow.rotation.x = 0.5;
  }

  animator(): Animator {
    return {
      id: "armSway",
      update: (_dt, t) => {
        if (this.busy) return false;
        this.yaw.rotation.y = Math.sin(t * 0.5) * 0.18;
        this.elbow.rotation.x = 0.5 + Math.sin(t * 0.7 + 1) * 0.08;
        return true;
      },
    };
  }
}
