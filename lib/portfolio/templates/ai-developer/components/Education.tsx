// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Education() {
  const templateData = useTemplateData();
  const { education = [] } = (templateData as any) || {};

  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="section-pad py-28 border-b border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="hud-accent mb-4"
      >
        // Academic Background
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-4xl md:text-5xl font-black tracking-tight mb-16 text-ink"
      >
        Education<span className="text-accent">_</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {education.map((edu: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="ai-card p-8 group hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Year range */}
            <div className="inline-flex items-center gap-1.5 ai-tag text-accent border-accent/30 bg-accent-dim mb-5">
              {edu.startDate ? new Date(edu.startDate).getFullYear() : ""}
              {" — "}
              {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
            </div>

            <h3 className="font-display text-2xl font-black text-ink mb-2 group-hover:text-accent transition-colors duration-300 tracking-tight">
              {edu.institution}
            </h3>
            <p className="text-ink-dim leading-relaxed">
              {edu.degree}
              {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
            </p>
            {edu.description && (
              <p className="text-muted text-sm leading-relaxed mt-3">{edu.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
