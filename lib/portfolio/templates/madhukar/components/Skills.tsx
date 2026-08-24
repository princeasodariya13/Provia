// @ts-nocheck
"use client";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Skills() {
  const templateData = useTemplateData();
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  const skillGroups = Array.isArray(skills) ? skills.map((s: any) => ({
    title: s.category || "Skills",
    note: "",
    items: s.skills || []
  })) : [];

  if (true) {
  const isMissing = (!skills || skills.length === 0) && (!stack || stack.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="skills" />
      </section>
    );
  }
}
  return (
    <section id="skills" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="My expertise" title="Technical Stack" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.06}>
              <div className="glass rounded-2xl p-6 h-full">
                <h3 className="font-display font-semibold text-lg mb-1">{g.title}</h3>
                <p className="text-xs text-muted-light dark:text-muted-dark mb-4">{g.note}</p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <span
                      key={item}
                      className="text-xs rounded-full border border-line-light dark:border-line-dark px-3 py-1.5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
