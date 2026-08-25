// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Education() {
  const templateData = useTemplateData();
  const { education = [] } = templateData || {};

  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="section-pad py-24 bg-[#0a0a0a]">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow text-gradient mb-4"
      >
        [04] Education
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-16"
      >
        Academic Background.
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-8">
        {education.map((edu, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group rounded-3xl border border-border bg-black p-8 hover:shadow-[0_0_40px_rgba(124,92,255,0.15)] hover:border-gradient1/50 transition-all duration-500"
          >
            <div className="eyebrow text-muted mb-4">
              {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} — {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
            </div>
            <h3 className="font-display text-2xl font-bold text-ink mb-2">
              {edu.institution}
            </h3>
            <div className="text-gradient font-mono text-sm">
              {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
