import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/reveal";
import { engagementLine, services } from "@/content/services";

export function Services() {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="What I do"
        title="Design, build, ship — end to end."
        description="Fast turnaround without the sloppy result — I ship polished, modern sites quickly."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, i) => (
          <Reveal key={service.title} delay={i * 0.06}>
            <div className="group h-full rounded-card border border-border bg-surface p-6 transition-colors hover:border-muted">
              <service.icon
                className="mb-4 size-5 text-accent"
                aria-hidden="true"
              />
              <h3 className="text-base font-medium">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {service.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2}>
        <p className="mt-8 text-sm text-muted">{engagementLine}</p>
      </Reveal>
    </Section>
  );
}
