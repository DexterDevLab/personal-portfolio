import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { Reveal } from "@/components/reveal";
import { Spotlight } from "@/components/spotlight";
import { projects } from "@/content/projects";
import { site } from "@/lib/site";

export function Work() {
  return (
    <Section id="work">
      <SectionHeading
        eyebrow="Selected work"
        title="Real sites, shipped for real clients."
        description="E-commerce, rental platforms, multilingual and booking sites — across many industries."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={(i % 3) * 0.06}>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block h-full rounded-card border border-border bg-surface transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-muted"
            >
              <Spotlight />
              <div className="overflow-hidden rounded-t-card border-b border-border">
                <Image
                  src={project.image}
                  alt={`Screenshot of the ${project.name} website`}
                  width={800}
                  height={500}
                  className="aspect-16/10 w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                <h3 className="flex items-center gap-1.5 text-base font-medium">
                  {project.name}
                  <ArrowUpRight
                    className="size-4 text-muted transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    aria-hidden="true"
                  />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {project.blurb}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2}>
        <p className="mt-8 text-sm text-muted">
          More work available on request —{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-accent underline-offset-4 hover:underline"
          >
            just ask
          </a>
          .
        </p>
      </Reveal>
    </Section>
  );
}
