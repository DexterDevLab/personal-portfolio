/**
 * About: the notebook's decorative cover opens and the taped portrait
 * settles. The biography, portrait and résumé button are never transformed.
 */
import { entryOnce, type SectionContext } from "../signal";

export function setupAbout(ctx: SectionContext) {
  const section = document.getElementById("about");
  if (!section) return;

  const notebook = section.querySelector<HTMLElement>("[data-notebook]");
  const cover = notebook?.querySelector<HTMLElement>("[data-notebook-cover]");
  const photo = notebook?.querySelector<HTMLElement>("[data-notebook-photo]");
  if (!notebook || !cover || !photo) return;

  const { gsap } = ctx;
  entryOnce(ctx, notebook, {
    start: "top 70%",
    init: () => {
      notebook.dataset.cover = "closed";
      gsap.set(photo, { rotation: -7, y: 10 });
    },
    play: () => {
      const tl = gsap.timeline({ onComplete: () => delete notebook.dataset.cover });
      tl.to(cover, { rotateY: -160, duration: 0.9, ease: "power2.inOut" }).to(
        photo,
        { rotation: -2, y: 0, duration: 0.5, ease: "back.out(1.2)", clearProps: "transform" },
        0.45,
      );
    },
  });
}
