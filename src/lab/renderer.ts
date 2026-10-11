import { WebGLRenderer } from "three";
import { DPR } from "./config";

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    stencil: false,
  });
  renderer.setClearColor(0x000000, 0);
  applyPixelRatio(renderer);
  return renderer;
}

export function applyPixelRatio(renderer: WebGLRenderer) {
  const narrow = matchMedia("(max-width: 767px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? DPR.narrow : DPR.desktop));
}
