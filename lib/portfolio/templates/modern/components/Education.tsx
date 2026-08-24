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
    <section id="education" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading index="05" label="Education" title="My academic path." />

        <div className="grid sm:grid-cols-2 gap-6">
          {education.map((ed, i) => (
            <Reveal key={ed.degree} delay={i * 0.1}>
              <div className="rounded-2xl border border-border bg-card/60 p-6 h-full">
                <div className="section-label mb-3">{ed.years}</div>
                <h3 className="font-display text-lg font-semibold mb-1">{ed.degree}</h3>
                <div className="text-accent text-sm mb-3">{ed.school}</div>
                <p className="text-muted text-sm leading-relaxed">{ed.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
