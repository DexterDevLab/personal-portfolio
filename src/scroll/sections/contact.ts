/**
 * Contact: the communication console powers on as it enters view — an
 * invitation, not a transmission. The form itself is untouched.
 */
import { entryOnce, type SectionContext } from "../signal";

export function setupContact(ctx: SectionContext) {
  const section = document.getElementById("contact");
  if (!section) return;

  const console_ = section.querySelector<HTMLElement>("[data-console]");
  const strip = console_?.querySelector<HTMLElement>(".console-strip");
  if (!console_ || !strip) return;

  entryOnce(ctx, console_, {
    start: "top 75%",
    init: () => console_.classList.add("is-off"),
    play: () => {
      // A short press on the strip, then the lights come on.
      ctx.gsap
        .timeline()
        .to(strip, { y: 2, duration: 0.12, ease: "power1.in" })
        .add(() => console_.classList.remove("is-off"))
        .to(strip, { y: 0, duration: 0.2, ease: "back.out(2)", clearProps: "transform" });
    },
  });
}
