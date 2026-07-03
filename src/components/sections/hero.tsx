import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/reveal";

export function Hero() {
  return (
    <div id="top" className="relative overflow-hidden">
      {/* Aurora glow — pure decoration (§7.1) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-[-20%] h-125 w-200 -translate-x-1/2 rounded-full bg-accent-weak blur-[120px]" />
      </div>

      <Container className="flex min-h-[min(92svh,860px)] flex-col justify-center pb-16 pt-32">
        <Reveal>
          <Eyebrow className="mb-5">DexterDevLab — Frontend Developer</Eyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            I build fast, modern websites and web apps.
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            I&rsquo;m Dexter Iglesia — a frontend developer with 10+ years
            building sites for clients. I help businesses, agencies, and
            startups ship polished, fast websites using modern tools and an
            AI-accelerated workflow. Based in the Philippines, working with
            clients locally and worldwide.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="#contact">
              Work with me
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button href="#work" variant="secondary">
              View my work
            </Button>
            <span className="flex items-center gap-2 text-sm text-muted">
              <span
                className="size-2 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              Available for freelance projects
            </span>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
