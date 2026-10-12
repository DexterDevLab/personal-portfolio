/**
 * The page robot (PageRobot.astro): fixed in the viewport's left margin, it
 * "walks" as the page scrolls past — legs and arms swing with scroll speed,
 * the body bobs — and settles when scrolling stops. It steps out below the
 * hero, cruises at ~55 % of the viewport, and stops above the footer. At
 * each section it says a short line in its bubble. Wide screens only (the
 * CSS hides it below 1280px) and never with reduced motion (the "static"
 * mode never calls this).
 */
import type { SectionContext } from "../signal";

const LINES: Record<string, string> = {
  "panda-central": "This console runs Panda Central.",
  work: "Client sites are on the shelves.",
  services: "Four things I can do for you.",
  process: "Here's how a project goes.",
  about: "That's me, in the notebook.",
  contact: "Tell me about your project!",
};

const CRUISE = 0.55; // viewport fraction the robot walks at
const BUBBLE_SECONDS = 3.2;

export function setupRobot(ctx: SectionContext): () => void {
  const robot = document.querySelector<HTMLElement>("[data-page-robot]");
  const bubble = robot?.querySelector<HTMLElement>("[data-robot-bubble]");
  const bubbleText = robot?.querySelector<HTMLElement>("[data-robot-bubble-text]");
  const legs = [...(robot?.querySelectorAll<SVGGElement>("[data-robot-leg]") ?? [])];
  const arms = [...(robot?.querySelectorAll<SVGGElement>("[data-robot-arm]") ?? [])];
  const torso = robot?.querySelector<SVGGElement>("[data-robot-torso]");
  const head = robot?.querySelector<SVGGElement>("[data-robot-head]");
  const eyes = [...(robot?.querySelectorAll<SVGRectElement>(".page-robot__eye") ?? [])];
  const hero = document.querySelector<HTMLElement>("[data-page-body]");
  const contact = document.getElementById("contact");
  if (!robot || !bubble || !bubbleText || !torso || !head || !hero || !contact || legs.length < 2) return () => {};

  robot.dataset.active = "";

  // ----- walking -----
  let phase = 0; // gait phase, radians
  let swing = 0; // current stride amplitude (0 when standing)
  let lastY = window.scrollY;
  let lastMove = performance.now();
  let raf = 0;
  let shown = false;
  let look = 0; // 0 = straight ahead, 1 = turned toward the section title
  let lookTarget = 0;
  let blink = 1; // eye scaleY

  const place = () => {
    const vh = window.innerHeight;
    const h = robot.offsetHeight || 120;
    const bodyTop = hero.getBoundingClientRect().top; // where the page below the hero starts
    const contactBottom = contact.getBoundingClientRect().bottom;
    // Step out below the hero, cruise, then stop above the footer.
    let y = Math.max(vh * CRUISE, bodyTop + 24);
    y = Math.min(y, contactBottom - h - 24);
    robot.style.transform = `translate3d(0, ${Math.round(y)}px, 0)`;
    const visible = bodyTop < vh * 0.9;
    if (visible !== shown) {
      shown = visible;
      robot.style.opacity = visible ? "1" : "0";
    }
  };

  const pose = () => {
    const s = Math.sin(phase) * swing;
    const bob = Math.abs(Math.cos(phase)) * swing * 0.12;
    legs[0]!.style.transform = `rotate(${s * 28}deg)`;
    legs[1]!.style.transform = `rotate(${-s * 28}deg)`;
    arms[0]!.style.transform = `rotate(${-s * 22}deg)`;
    arms[1]!.style.transform = `rotate(${s * 22}deg)`;
    torso.style.transform = `translateY(${-bob}px)`;
    // A small tilt toward the title (pivot at the neck) and the eyes glance that way
    head.style.transform = `translateY(${-bob * 1.4}px) rotate(${s * 2 + look * 6}deg)`;
    eyes.forEach((e) => (e.style.transform = `translateX(${look * 3}px) scaleY(${blink})`));
  };
  const settled = () => swing === 0 && Math.abs(look - lookTarget) < 0.005 && blink === 1;

  const tick = (now: number) => {
    raf = 0;
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    if (dy !== 0) {
      lastMove = now;
      phase += Math.min(0.35, Math.abs(dy) * 0.02) * Math.sign(dy);
      swing = Math.min(1, swing + 0.15);
    } else if (now - lastMove > 120) {
      // Come to rest: ease the stride out and the legs back together.
      swing *= 0.82;
      const rest = Math.round(phase / Math.PI) * Math.PI;
      phase += (rest - phase) * 0.2;
      if (swing < 0.01) {
        swing = 0;
        phase = rest;
      }
    }
    look += (lookTarget - look) * 0.12;
    if (Math.abs(look - lookTarget) < 0.005) look = lookTarget;
    place();
    pose();
    if (!settled() || dy !== 0) raf = requestAnimationFrame(tick);
  };
  const wake = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", wake, { passive: true });
  place();
  pose();

  // Blink now and then
  const blinker = window.setInterval(() => {
    blink = 0.15;
    wake();
    window.setTimeout(() => {
      blink = 1;
      wake();
    }, 110);
  }, 3800);

  // ----- bubbles at each section -----
  let hide = 0;
  const say = (text: string) => {
    bubbleText.textContent = text;
    bubble.classList.add("is-on");
    lookTarget = 1; // glance at the section title while speaking
    wake();
    window.clearTimeout(hide);
    hide = window.setTimeout(() => {
      bubble.classList.remove("is-on");
      lookTarget = 0;
      wake();
    }, BUBBLE_SECONDS * 1000);
  };
  for (const [id, line] of Object.entries(LINES)) {
    const section = document.getElementById(id);
    if (!section) continue;
    ctx.ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      end: "bottom 60%",
      onEnter: () => say(line),
      onEnterBack: () => say(line),
    });
  }

  return () => {
    window.removeEventListener("scroll", wake);
    window.removeEventListener("resize", wake);
    if (raf) cancelAnimationFrame(raf);
    window.clearInterval(blinker);
    window.clearTimeout(hide);
    bubble.classList.remove("is-on");
    delete robot.dataset.active;
    robot.style.opacity = "0";
  };
}
