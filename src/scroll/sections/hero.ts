/**
 * Laboratory → Panda Central. As the hero leaves the viewport the console's
 * output socket lights and, when the 3D room is running, the console itself
 * gives one pulse (its tile lights run and the links speed up briefly). No
 * camera motion: the pulse is a material change, so it reads from any angle,
 * and the HTML port covers the room-off case.
 */
import { setPortState, type SectionContext } from "../signal";

export function setupHero(ctx: SectionContext) {
  // The page body starts exactly where the hero ends, whichever hero is shown.
  ctx.ScrollTrigger.create({
    trigger: ctx.body,
    start: "top 92%",
    onEnter: () => {
      setPortState("hero", "done");
      window.__lab?.pulse();
    },
    onLeaveBack: () => setPortState("hero", "active"),
  });
  setPortState("hero", "active");
}
