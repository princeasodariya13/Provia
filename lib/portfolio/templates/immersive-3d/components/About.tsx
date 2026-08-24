// @ts-nocheck
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function About() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section id="about" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="01 // About" title={about.heading} />

        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-3 space-y-5">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <p className="text-muted leading-relaxed text-lg">{p}</p>
              </Reveal>
            ))}
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {about.stats.map((s, i) => (
              <Reveal key={s.label} delay={0.15 + i * 0.08}>
                <div className="glass rounded-2xl p-5 h-full hover:border-cyan transition-colors">
                  <div className="eyebrow mb-2">{s.label}</div>
                  <div className="font-display text-lg font-semibold">{s.value}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
