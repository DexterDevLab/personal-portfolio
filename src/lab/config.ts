/**
 * Scene settings: palette, room size, camera, timing. Tweak here first.
 */
export const PALETTE = {
  wall: 0xf3eee4,
  wallShade: 0xe6dfd2,
  floor: 0xd9d2c4,
  floorLine: 0xc9c1b1,
  charcoal: 0x2b2b30,
  charcoalLight: 0x3d3d45,
  blue: 0x4f7cff,
  blueDeep: 0x3b63e6,
  teal: 0x2bb3a3,
  tealDeep: 0x1f8c80,
  orange: 0xff8a3d,
  red: 0xe5484d,
  green: 0x3ccf7a,
  cream: 0xfff8ec,
  wood: 0xc8a97a,
  woodDark: 0x9c7a4f,
  metal: 0x9aa3ad,
  metalDark: 0x6b737c,
  paper: 0xfdfaf2,
  glass: 0xbfe9ff,
  robot: 0xf6f1e7,
  outline: 0x24242a,
} as const;

export const ROOM = {
  minX: -4,
  maxX: 4,
  minZ: -3,
  maxZ: 2,
  height: 3.4,
  /** Right wall only runs from the back to here, leaving the front open. */
  rightWallEndZ: -0.6,
} as const;

export const CAMERA = {
  fov: 35,
  designAspect: 1.6,
  maxFov: 62,
  /** Fraction of the design width kept visible on the narrowest screens. */
  portraitKeep: 0.62,
  near: 0.5,
  far: 60,
  overview: { position: [7.4, 6.0, 9.2] as const, target: [0, 1.05, -0.6] as const },
  travelSeconds: 1.1,
} as const;

export const DPR = { desktop: 2, narrow: 1.5 } as const;

export const OUTLINE_WIDTH = 0.02;
