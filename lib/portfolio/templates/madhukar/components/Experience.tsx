// @ts-nocheck
"use client";
import { useTemplateData } from "../context";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { Reveal, SectionHeading } from "./Reveal";

export default function Experience() {
  const templateData = useTemplateData();
  const { experience = [] } = templateData || {};

  if (!experience || experience.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="experience" />
      </section>
    );
  }

  return (
    <section id="experience" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="My Background" title="Professional Experience" />

        <div className="space-y-6">
          {experience.map((exp, i) => (
            <Reveal key={exp.title + i} delay={i * 0.08}>
              <div className="glass rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-6 hover:border-accent transition-colors group relative">
                <div className="md:w-1/4 shrink-0">
                  <div className="eyebrow text-accent mb-2">{exp.year}</div>
                  <h3 className="font-display font-bold text-xl mb-1">{exp.company}</h3>
                  <div className="text-muted-light dark:text-muted-dark text-sm">{exp.title}</div>
                </div>
                <div className="md:w-3/4">
                  <p className="text-muted-light dark:text-muted-dark leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
