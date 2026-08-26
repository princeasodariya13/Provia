// @ts-nocheck
"use client";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Services() {
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

  return (
    <section id="services" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="My services" title="How I Can Help" />

        <div className="grid sm:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <Reveal key={s.number || i} delay={i * 0.08}>
              <div className="glass rounded-2xl p-7 h-full hover:border-accent transition-colors">
                <div className="font-mono text-accent/50 text-4xl font-bold mb-4">{s.number || String(i + 1).padStart(2, '0')}</div>
                <h3 className="font-display font-semibold text-xl mb-2">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">
                  {s.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
