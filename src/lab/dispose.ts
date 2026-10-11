import { Material, Mesh, Line, Texture, type Object3D, type WebGLRenderer } from "three";

/** Frees every geometry, material and texture reachable from `root`. */
export function disposeTree(root: Object3D) {
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  root.traverse((obj) => {
    if (obj instanceof Mesh || obj instanceof Line) {
      obj.geometry?.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        if (!(m instanceof Material)) continue;
        materials.add(m);
        for (const value of Object.values(m)) if (value instanceof Texture) textures.add(value);
      }
    }
  });
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}

export function disposeRenderer(renderer: WebGLRenderer) {
  renderer.dispose();
  renderer.forceContextLoss();
}
