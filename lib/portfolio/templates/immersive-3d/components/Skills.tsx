// @ts-nocheck
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Skills() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

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
    <section id="skills" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="02 // Skills" title="Tools I build with." />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.06}>
              <div className="glass rounded-2xl p-6 h-full hover:border-cyan transition-colors">
                <div className="eyebrow mb-4">{g.title}</div>
                <ul className="space-y-3">
                  {g.items.map((s) => (
                    <li key={s} className="flex items-center gap-3 text-ink">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
