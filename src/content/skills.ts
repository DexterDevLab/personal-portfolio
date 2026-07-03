export type SkillGroup = {
  label: string;
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    label: "Core",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript"],
  },
  {
    label: "CMS & E-commerce",
    skills: ["WordPress", "WooCommerce", "Elementor", "WPML"],
  },
  {
    label: "Workflow",
    skills: ["Git", "Figma", "AI-assisted development", "Vercel"],
  },
];
