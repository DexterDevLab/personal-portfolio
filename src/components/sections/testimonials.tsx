import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/reveal";
import { testimonials } from "@/content/testimonials";

/** Renders only when real quotes exist (§14.1). */
export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <Section id="testimonials">
      <SectionHeading eyebrow="What clients say" title="Kind words." />
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.06}>
            <figure className="h-full rounded-card border border-border bg-surface p-6">
              <blockquote className="text-sm leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm text-muted">
                — {t.name}, {t.role}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
