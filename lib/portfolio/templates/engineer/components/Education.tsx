// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Education() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { education = [] } = templateData || {};

  if (!education || education.length === 0) {
    return null;
  }

  return (
    <section id="education" className="section-pad py-24 border-t border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow mb-4"
      >
        [04] Education
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12"
      >
        Academic background.
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {education.map((edu, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-surface p-8 hover:border-accent/50 transition-colors"
          >
            <h3 className="font-display text-2xl font-bold text-ink mb-2">
              {edu.institution}
            </h3>
            <div className="text-accent mb-4 font-mono text-sm">
              {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
            </div>
            <div className="eyebrow text-muted">
              {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} — {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
