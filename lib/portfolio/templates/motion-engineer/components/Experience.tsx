// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import MagneticButton from "./MagneticButton";

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
    <section id="experience" className="section-pad py-24">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow text-gradient mb-4"
      >
        [03] Experience
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-16"
      >
        Where I&apos;ve contributed.
      </motion.h2>

      <div className="space-y-12">
        {experience.map((exp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="group relative border-l border-border pl-8 md:pl-12 hover:border-gradient1 transition-colors duration-500"
          >
            <div className="absolute left-[-5px] top-2 h-2.5 w-2.5 rounded-full bg-border group-hover:bg-gradient1 transition-colors duration-500" />
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
              <h3 className="font-display text-2xl font-bold text-ink">{exp.role}</h3>
              <span className="eyebrow text-muted mt-2 md:mt-0">{exp.period}</span>
            </div>
            <div className="font-mono text-sm text-gradient mb-6">{exp.company}</div>
            <p className="text-muted leading-relaxed max-w-3xl">
              {exp.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
