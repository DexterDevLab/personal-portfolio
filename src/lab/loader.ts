import { LinearMipmapLinearFilter, LoadingManager, SRGBColorSpace, TextureLoader, type Texture, type WebGLRenderer } from "three";

export interface LabTextures {
  screen: Texture;
  portrait: Texture;
  thumbs: Texture[];
}

/**
 * Loads the few photo textures with real progress reporting. Everything
 * else in the scene is procedural.
 */
export async function loadTextures(
  renderer: WebGLRenderer,
  srcs: { screen: string; portrait: string; thumbs: string[] },
  onProgress: (loaded: number, total: number) => void,
): Promise<LabTextures> {
  const manager = new LoadingManager();
  manager.onProgress = (_url, loaded, total) => onProgress(loaded, total);
  const loader = new TextureLoader(manager);
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const prep = (tex: Texture) => {
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = maxAniso;
    tex.generateMipmaps = true;
    tex.minFilter = LinearMipmapLinearFilter;
    tex.needsUpdate = true;
    return tex;
  };

  const [screen, portrait, ...thumbs] = await Promise.all(
    [srcs.screen, srcs.portrait, ...srcs.thumbs].map((src) => loader.loadAsync(src).then(prep)),
  );
  return { screen: screen!, portrait: portrait!, thumbs };
}
