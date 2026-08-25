// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";

export default function Experience() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { experience = [] } = templateData || {};

  if (!experience || experience.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="experience" />
      </section>
    );
  }

  return (
    <section id="experience" className="section-pad py-24 border-t border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow mb-4"
      >
        [03] Experience
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12"
      >
        Where I&apos;ve been.
      </motion.h2>

      <div className="divide-y divide-border border-t border-border">
        {experience.map((exp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group flex flex-col md:flex-row items-baseline gap-6 md:gap-12 py-8 hover:bg-surface/50 transition-all duration-300"
          >
            <div className="w-full md:w-1/4 shrink-0 eyebrow text-muted">
              {exp.startDate ? new Date(exp.startDate).getFullYear() : ""} — {exp.isCurrent ? "Present" : (exp.endDate ? new Date(exp.endDate).getFullYear() : "")}
            </div>
            
            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold text-ink mb-1 group-hover:text-accent transition-colors">
                {exp.title}
              </h3>
              <div className="text-accent mb-4 font-mono text-sm">{exp.company}</div>
              <p className="text-muted leading-relaxed max-w-3xl">
                {exp.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
