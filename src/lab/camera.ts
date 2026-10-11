import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { CAMERA } from "./config";

export interface CameraPose {
  position: Vector3;
  target: Vector3;
}

export const OVERVIEW_POSE: CameraPose = {
  position: new Vector3(...CAMERA.overview.position),
  target: new Vector3(...CAMERA.overview.target),
};

export function createCamera(aspect: number) {
  return new PerspectiveCamera(CAMERA.fov, aspect, CAMERA.near, CAMERA.far);
}

/** Camera placed `dist` away from `focus` along `facing`, raised by `height`. */
export function poseFor(focus: Vector3, facing: Vector3, dist = 3.1, height = 1.0, lookDrop = 0): CameraPose {
  const dir = facing.clone().setY(0).normalize();
  const position = focus.clone().add(dir.multiplyScalar(dist));
  position.y = focus.y + height;
  const target = focus.clone();
  target.y -= lookDrop;
  return { position, target };
}

/**
 * Responsive framing. Below the design aspect (portrait phones) keep the
 * horizontal field of view constant by widening the vertical fov; once the
 * fov cap is hit, dolly the camera back for the remainder.
 */
export function frame(camera: PerspectiveCamera, pose: CameraPose, aspect: number): CameraPose {
  let fov: number = CAMERA.fov;
  let dolly = 1;
  if (aspect < CAMERA.designAspect) {
    // Portrait screens keep most, not all, of the horizontal extent: letting
    // the room's outer edges crop keeps the props readable on a phone.
    const keep = MathUtils.lerp(CAMERA.portraitKeep, 1, MathUtils.clamp(aspect / CAMERA.designAspect, 0, 1));
    const halfW = Math.tan(MathUtils.degToRad(CAMERA.fov / 2)) * CAMERA.designAspect * keep;
    const wanted = MathUtils.radToDeg(2 * Math.atan(halfW / aspect));
    fov = Math.min(wanted, CAMERA.maxFov);
    dolly = Math.tan(MathUtils.degToRad(wanted / 2)) / Math.tan(MathUtils.degToRad(fov / 2));
  }
  if (camera.fov !== fov || camera.aspect !== aspect) {
    camera.fov = fov;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }
  const target = pose.target.clone();
  const position = target.clone().add(pose.position.clone().sub(pose.target).multiplyScalar(dolly));
  return { position, target };
}
