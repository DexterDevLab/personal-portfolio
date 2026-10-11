import {
  BackSide,
  DataTexture,
  LineDashedMaterial,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshToonMaterial,
  NearestFilter,
  RedFormat,
  type Texture,
} from "three";
import { OUTLINE_WIDTH, PALETTE } from "./config";

/** Three-step gradient for the toon look. Shared by every toon material. */
export function makeGradientMap() {
  const tex = new DataTexture(new Uint8Array([90, 160, 235]), 3, 1, RedFormat);
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Per-station material set. Each station gets its own toon instances so the
 * hover highlight (emissive) can be applied to one station at a time while
 * all instances share a single shader program.
 */
export class MaterialSet {
  readonly toons: MeshToonMaterial[] = [];
  private cache = new Map<number, MeshToonMaterial>();

  constructor(private gradientMap: Texture) {}

  toon(color: number) {
    let m = this.cache.get(color);
    if (!m) {
      m = new MeshToonMaterial({ color, gradientMap: this.gradientMap });
      this.cache.set(color, m);
      this.toons.push(m);
    }
    return m;
  }

  setHighlight(on: boolean) {
    for (const m of this.toons) {
      m.emissive.setHex(on ? PALETTE.blue : 0x000000);
      m.emissiveIntensity = on ? 0.28 : 0;
    }
  }

  dispose() {
    for (const m of this.toons) m.dispose();
    this.toons.length = 0;
    this.cache.clear();
  }
}

/** Materials shared by the whole scene (not highlighted). */
export function makeSharedMaterials() {
  const outline = new MeshBasicMaterial({ color: PALETTE.outline, side: BackSide });
  // Inverted hull: push vertices out along their normals so the back faces
  // peek out as a dark rim. Needs smooth normals (RoundedBox / spheres).
  outline.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>\n transformed += normal * ${OUTLINE_WIDTH.toFixed(3)};`,
    );
  };

  // LineDashedMaterial has no dash offset, so add one uniform and shift the
  // pattern in the fragment shader; animating it makes the links "flow".
  const linksOffset = { value: 0 };
  const links = new LineDashedMaterial({ color: PALETTE.blue, dashSize: 0.07, gapSize: 0.09, transparent: true, opacity: 0.9 });
  links.onBeforeCompile = (shader) => {
    shader.uniforms.uDashOffset = linksOffset;
    shader.fragmentShader = shader.fragmentShader
      .replace("varying float vLineDistance;", "varying float vLineDistance;\nuniform float uDashOffset;")
      .replace("mod( vLineDistance, totalSize )", "mod( vLineDistance + uDashOffset, totalSize )");
  };

  return {
    outline,
    links,
    linksOffset,
    wall: new MeshLambertMaterial({ color: PALETTE.wall }),
    wallShade: new MeshLambertMaterial({ color: PALETTE.wallShade }),
    floor: new MeshLambertMaterial({ color: PALETTE.floor }),
    floorLine: new MeshBasicMaterial({ color: PALETTE.floorLine }),
    shadow: new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12, depthWrite: false }),
    ledOff: new MeshBasicMaterial({ color: 0x4a4a52 }),
    ledTeal: new MeshBasicMaterial({ color: PALETTE.teal }),
    ledOrange: new MeshBasicMaterial({ color: PALETTE.orange }),
    ledRed: new MeshBasicMaterial({ color: PALETTE.red }),
    ledGreen: new MeshBasicMaterial({ color: PALETTE.green }),
    ledBlue: new MeshBasicMaterial({ color: PALETTE.blue }),
    glow: new MeshBasicMaterial({ color: PALETTE.blue, transparent: true, opacity: 0.35, depthWrite: false }),
    spark: new MeshBasicMaterial({ color: PALETTE.orange, transparent: true, depthWrite: false }),
    steam: new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false }),
    screenOff: new MeshBasicMaterial({ color: 0x1b1d26 }),
    paperLines: new MeshBasicMaterial({ color: 0xcfd6e6 }),
  };
}

export type SharedMaterials = ReturnType<typeof makeSharedMaterials>;

export function screenMaterial(map: Texture) {
  return new MeshBasicMaterial({ map, toneMapped: false });
}
