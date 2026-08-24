// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

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
    <section id="experience" className="section-pad py-24 border-b border-border">
      <p className="eyebrow mb-4">Journey</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-deep mb-14">
        Experience.
      </h2>

      <div className="relative border-l border-border ml-2">
        {experience.map((e, i) => (
          <motion.div
            key={e.role}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative pl-10 pb-12 last:pb-0"
          >
            <span className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="eyebrow mb-2 text-accent">{e.period}</p>
            <h3 className="font-display text-xl font-semibold text-deep mb-1">{e.role}</h3>
            <p className="eyebrow mb-3 text-ink/60">{e.org}</p>
            <p className="text-muted text-sm leading-relaxed max-w-lg">{e.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
