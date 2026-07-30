import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tag } from "@/components/ui/tag";
import { Reveal } from "@/components/reveal";
import { skillGroups } from "@/content/skills";

export function Tech() {
  return (
    <Section id="tech">
      <SectionHeading
        eyebrow="Tech & tools"
        title="A modern, practical stack."
      />
      <div className="flex flex-col gap-6">
        {skillGroups.map((group, i) => (
          <Reveal key={group.label} delay={i * 0.06}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline">
              <span className="w-40 shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Tag key={skill} className="text-foreground">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
