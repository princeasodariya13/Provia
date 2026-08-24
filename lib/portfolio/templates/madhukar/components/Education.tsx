// @ts-nocheck
"use client";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Education() {
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
  const isMissing = (!education || education.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="education" />
      </section>
    );
  }
}
  return (
    <section id="education" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="My background" title="Education Timeline" />

        <div className="relative pl-8 space-y-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-line-light dark:before:bg-line-dark">
          {education.map((e, i) => (
            <Reveal key={e.degree + i} delay={i * 0.08} className="relative">
              <span className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-surface-light dark:bg-surface-dark border-2 border-accent" />
              <div className="glass rounded-2xl p-6">
                <div className="eyebrow mb-2">{e.years}</div>
                <h3 className="font-display font-semibold text-lg mb-1">{e.degree}</h3>
                <div className="text-sm text-muted-light dark:text-muted-dark mb-2">{e.school}</div>
                <span className="text-xs text-accent">{e.note}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
