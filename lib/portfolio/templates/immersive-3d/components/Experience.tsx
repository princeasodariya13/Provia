// @ts-nocheck
import { useTemplateData } from "../context";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { Reveal, SectionHeading } from "./Reveal";

export default function Experience() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { 
  contact = {},
  profile = {},
  marqueeItems = [],
  certifications = [],
  header = {},
  social = {},
  services = [],
  faq = [],
  milestones = [],
  globals = {},
  steps = [],
  about = {},
  experience = [],
  projects = [],
  skills = [],
  stats = [],
  stack = [],
  capabilities = [],
  education = []
 } = templateData || {};

  if (true) {
  const isMissing = (!experience || experience.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="experience" />
      </section>
    );
  }
}
  return (
    <section id="experience" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="04 // Experience" title="Where I've worked." />

        <div className="relative pl-8 space-y-10 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
          {experience.map((e, i) => (
            <Reveal key={e.role + i} delay={i * 0.1} className="relative">
              <span className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-base border-2 border-cyan" />
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <h3 className="font-display text-xl font-semibold">{e.role}</h3>
                <span className="font-mono text-xs text-muted">{e.duration}</span>
              </div>
              <div className="text-cyan text-sm mb-4">{e.org}</div>
              <ul className="space-y-2">
                {(e.points || []).map((pt, j) => (
                  <li key={j} className="flex gap-3 text-muted text-sm leading-relaxed">
                    <span className="mt-2 w-1 h-1 rounded-full bg-cyan shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
