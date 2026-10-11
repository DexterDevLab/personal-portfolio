import { gsap } from "gsap";
import { Vector3, type Group, type Mesh, type PerspectiveCamera } from "three";
import type { CameraPose } from "./camera";
import type { SharedMaterials } from "./materials";
import type { MechArm } from "./scene/arm";
import type { Robot } from "./scene/robot";
import type { RepairParts } from "./scene/stations/repair";

export interface SequenceContext {
  camera: PerspectiveCamera;
  lookTarget: Vector3;
  reducedMotion: boolean;
  requestRender(): void;
}

/** Tween position and look target separately so the camera arcs smoothly. */
export function cameraTravel(ctx: SequenceContext, pose: CameraPose, seconds: number) {
  const duration = ctx.reducedMotion ? 0 : seconds;
  const tl = gsap.timeline({ onUpdate: ctx.requestRender });
  tl.to(ctx.camera.position, { x: pose.position.x, y: pose.position.y, z: pose.position.z, duration, ease: "power3.inOut" }, 0);
  tl.to(ctx.lookTarget, { x: pose.target.x, y: pose.target.y, z: pose.target.z, duration, ease: "power3.inOut" }, 0);
  return tl;
}

/** Short "button press" dip on the selected station. */
export function press(ctx: SequenceContext, target: Group | Mesh) {
  if (ctx.reducedMotion) return;
  gsap.killTweensOf(target.scale);
  gsap.to(target.scale, { y: 0.95, duration: 0.09, yoyo: true, repeat: 1, ease: "power1.out", onUpdate: ctx.requestRender, onComplete: () => target.scale.y = 1 });
}

/** Robot turns toward a point and raises an arm; `null` relaxes. */
export function robotPoint(ctx: SequenceContext, robot: Robot, point: Vector3 | null) {
  if (point) robot.lookTarget.copy(point);
  const local = point ? robot.group.worldToLocal(point.clone()) : null;
  const yaw = local ? Math.atan2(local.x, local.z) : 0;
  const duration = ctx.reducedMotion ? 0 : 0.5;
  gsap.killTweensOf([robot.body.rotation, robot.armRight.rotation, robot.armLeft.rotation]);
  gsap.to(robot.body.rotation, { y: yaw, duration, ease: "power2.out", onUpdate: ctx.requestRender });
  gsap.to(robot.armRight.rotation, { z: point ? -1.9 : 0.15, x: point ? -0.4 : 0, duration, ease: "power2.out", onUpdate: ctx.requestRender });
  gsap.to(robot.armLeft.rotation, { z: -0.15, x: 0, duration, ease: "power2.out", onUpdate: ctx.requestRender });
}

/**
 * Repair-bench sequence: the arm swings to the device, sparks fly, the
 * antenna straightens, the lamp goes green and the box sits straight.
 * Returns a cleanup that kills the timeline and restores the fault state.
 */
export function repairSequence(
  ctx: SequenceContext,
  parts: RepairParts,
  arm: MechArm,
  robot: Robot,
  shared: SharedMaterials,
) {
  const { device, antenna, lamp, sparks } = parts;
  const tipAt = parts.workPoint;

  // Aim the arm: yaw toward the device, then reach down.
  const armLocal = arm.group.worldToLocal(tipAt.clone());
  const yawTo = Math.atan2(armLocal.x, armLocal.z);

  arm.busy = true;
  robot.busy = true;
  const tl = gsap.timeline({
    onUpdate: ctx.requestRender,
    onComplete: () => {
      arm.busy = false;
      robot.busy = false;
    },
  });

  tl.to(arm.yaw.rotation, { y: yawTo, duration: 0.6, ease: "power2.inOut" }, 0)
    .to(arm.elbow.rotation, { x: 1.15, duration: 0.7, ease: "power2.inOut" }, 0.1)
    .to(arm.wrist.rotation, { x: -0.5, duration: 0.5, ease: "power2.inOut" }, 0.2)
    .call(() => robotPoint(ctx, robot, tipAt), [], 0.2)
    .addLabel("work", 0.85)
    .to(
      sparks.map((s) => s.scale),
      { x: 1, y: 1, z: 1, duration: 0.1, yoyo: true, repeat: 5, stagger: { each: 0.07 }, ease: "power1.out" },
      "work",
    )
    .to(device.rotation, { z: -0.03, duration: 0.08, yoyo: true, repeat: 6 }, "work")
    .to(antenna.rotation, { z: 0, duration: 0.5, ease: "back.out(2.5)" }, "work+=0.7")
    .call(
      () => {
        lamp.material = shared.ledGreen;
        ctx.requestRender();
      },
      [],
      "work+=1.0",
    )
    .to(device.rotation, { z: 0, duration: 0.45, ease: "back.out(2)" }, "work+=1.0")
    .to(device.position, { y: device.position.y + 0.06, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.out" }, "work+=1.0")
    .to(arm.elbow.rotation, { x: 0.5, duration: 0.7, ease: "power2.inOut" }, "work+=1.4")
    .to(arm.wrist.rotation, { x: 0, duration: 0.5, ease: "power2.inOut" }, "work+=1.4")
    .to(arm.yaw.rotation, { y: 0, duration: 0.7, ease: "power2.inOut" }, "work+=1.5");

  if (ctx.reducedMotion) {
    tl.progress(1);
    sparks.forEach((s) => s.scale.setScalar(0));
    ctx.requestRender();
  }

  const restY = device.position.y;
  return () => {
    tl.kill();
    arm.busy = false;
    robot.busy = false;
    sparks.forEach((s) => s.scale.setScalar(0));
    device.rotation.z = 0.09;
    device.position.y = restY;
    antenna.rotation.z = 0.9;
    lamp.material = shared.ledRed;
    gsap.to(arm.yaw.rotation, { y: 0, duration: ctx.reducedMotion ? 0 : 0.5, onUpdate: ctx.requestRender });
    gsap.to(arm.elbow.rotation, { x: 0.5, duration: ctx.reducedMotion ? 0 : 0.5, onUpdate: ctx.requestRender });
    gsap.to(arm.wrist.rotation, { x: 0, duration: ctx.reducedMotion ? 0 : 0.5, onUpdate: ctx.requestRender });
    ctx.requestRender();
  };
}
