// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Education() {
  const templateData = useTemplateData();
  const { education = [] } = (templateData as any) || {};

  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="section-pad py-28 border-t border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow mb-5"
      >
        Education
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-5xl md:text-6xl font-black tracking-tight mb-16 text-ink"
      >
        Academic <span className="text-gradient">background.</span>
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-5">
        {education.map((edu: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
            className="me-card p-8 group hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(124,92,255,0.15)] transition-all duration-500"
          >
            {/* Year badge */}
            <div className="inline-flex items-center gap-1.5 me-tag mb-5 text-accent border-accent/30">
              {edu.startDate ? new Date(edu.startDate).getFullYear() : ""}
              {" — "}
              {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
            </div>

            <h3 className="font-display text-2xl font-black text-ink mb-2 tracking-tight group-hover:text-gradient transition-all duration-500">
              {edu.institution}
            </h3>
            <div className="text-gradient font-mono text-sm mb-2">
              {edu.degree}
              {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
            </div>
            {edu.description && (
              <p className="text-ink-dim text-sm leading-relaxed mt-4">{edu.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
