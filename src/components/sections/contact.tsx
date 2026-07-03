import { Download, Mail } from "lucide-react";
import { GithubIcon } from "@/components/ui/github-icon";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/reveal";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site";

export function Contact() {
  return (
    <Section id="contact">
      <SectionHeading
        eyebrow="Contact"
        title="Let’s build something."
        description="Have a project in mind, or just want to say hi? Send a message and I’ll get back to you within a day or two."
      />
      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        <Reveal>
          <ContactForm />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Direct
            </p>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <Mail className="size-4" aria-hidden="true" />
              {site.email}
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <GithubIcon />
              github.com/DexterDevLab
            </a>
            <a
              href="/resume.pdf"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-button border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-muted hover:bg-surface"
            >
              <Download className="size-4" aria-hidden="true" />
              Download résumé
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
