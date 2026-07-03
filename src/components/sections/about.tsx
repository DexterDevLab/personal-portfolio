import Image from "next/image";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/reveal";

export function About() {
  return (
    <Section id="about">
      <SectionHeading eyebrow="About" title="Reliable, and easy to work with." />
      <div className="grid items-start gap-10 md:grid-cols-[240px_1fr]">
        <Reveal>
          <Image
            src="/images/portrait.jpg"
            alt="Portrait of Dexter Dela Iglesia"
            width={900}
            height={1200}
            sizes="(max-width: 768px) 240px, 240px"
            className="aspect-4/5 w-full max-w-60 rounded-card border border-border object-cover object-top"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-muted">
            <p>
              For over 10 years I&rsquo;ve helped businesses get online with
              clean, modern websites — e-commerce stores, rental platforms,
              multilingual sites, and elegant booking sites across many
              industries. I&rsquo;m the developer clients come back to because
              I&rsquo;m reliable, communicate clearly, and deliver fast.
            </p>
            <p>
              I started with WordPress and today I build with modern tools —
              React, Next.js, and an AI-accelerated workflow — to ship more,
              faster, without cutting corners on quality. Based in the
              Philippines, I work with clients locally and around the world.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
