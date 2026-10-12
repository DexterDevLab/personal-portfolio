/**
 * Scene settings: palette, room size, camera, timing. Tweak here first.
 */
export const PALETTE = {
  wall: 0xf5eedc,
  wallShade: 0xe8dfc9,
  floor: 0xdcd3bd,
  floorLine: 0xcbc1a9,
  charcoal: 0x25252b,
  charcoalLight: 0x3d3d45,
  blue: 0x4f7cff,
  blueDeep: 0x3b63e6,
  teal: 0x258f83,
  tealDeep: 0x1b7268,
  orange: 0xf58a35,
  red: 0xdb5149,
  green: 0x3ccf7a,
  cream: 0xfff8ec,
  wood: 0xc8a97a,
  woodDark: 0x9c7a4f,
  metal: 0x9aa3ad,
  metalDark: 0x6b737c,
  paper: 0xfdfaf2,
  glass: 0xbfe9ff,
  robot: 0xf6f1e7,
  outline: 0x1e1e23,
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
  near: 0.25,
  far: 60,
  overview: { position: [6.6, 5.45, 8.1] as const, target: [0, 1.05, -0.6] as const },
  travelSeconds: 1.1,
} as const;

export const DPR = { desktop: 2, narrow: 1.5 } as const;

export const OUTLINE_WIDTH = 0.02;
