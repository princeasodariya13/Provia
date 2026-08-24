// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Projects() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  if (true) {
  const isMissing = (!projects || projects.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="projects" />
      </section>
    );
  }
}
  return (
    <section id="work" className="section-pad py-24 border-t border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow mb-4"
      >
        [02] Selected Work / 2024 — 2026
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12"
      >
        What I&apos;ve built.
      </motion.h2>

      <div className="divide-y divide-border border-t border-border">
        {projects.map((p, i) => (
          <motion.a
            href="#"
            key={p.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group flex items-center justify-between py-8 hover:pl-3 transition-all duration-300"
          >
            <div className="flex items-baseline gap-6">
              <span className="eyebrow">{p.index}</span>
              <h3 className="font-display text-2xl md:text-4xl font-medium text-ink group-hover:text-accent transition-colors">
                {p.title}
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-6 eyebrow">
              <span>{p.tag}</span>
              <span>{p.period}</span>
              <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                ↗
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
