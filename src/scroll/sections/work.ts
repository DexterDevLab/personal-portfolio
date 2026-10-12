/**
 * Selected client work: each display frame switches on (status light + ring,
 * CSS transitions) as it enters view. Screenshots are never animated and
 * nothing waits for the switch-on.
 */
import { entryOnce, type SectionContext } from "../signal";

export function setupWork(ctx: SectionContext) {
  const section = document.getElementById("work");
  if (!section) return;

  section.querySelectorAll<HTMLElement>("[data-display]").forEach((frame) => {
    entryOnce(ctx, frame, {
      start: "top 85%",
      play: () => frame.classList.add("is-on"),
      complete: () => frame.classList.add("is-on"),
    });
  });
}
