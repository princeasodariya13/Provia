// @ts-nocheck
"use client";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Services() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section id="services" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="My services" title="How I Can Help" />

        <div className="grid sm:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <Reveal key={s.number} delay={i * 0.08}>
              <div className="glass rounded-2xl p-7 h-full hover:border-accent transition-colors">
                <div className="font-mono text-accent/50 text-4xl font-bold mb-4">{s.number}</div>
                <h3 className="font-display font-semibold text-xl mb-2">{s.title}</h3>
                <p className="text-muted-light dark:text-muted-dark text-sm leading-relaxed">
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
