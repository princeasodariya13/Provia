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
        [06] Education
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-5xl md:text-6xl font-black tracking-tight mb-16"
      >
        Academic roots<span className="text-accent">.</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {education.map((edu: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
            className="glass-card p-8 group hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Year badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="tag-pill">
                {edu.startDate ? new Date(edu.startDate).getFullYear() : ""}
                {" — "}
                {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
              </div>
              {i === 0 && (
                <div className="w-8 h-8 rounded-full bg-accent-dim border border-accent/20 flex items-center justify-center">
                  <span className="text-accent text-xs font-black">★</span>
                </div>
              )}
            </div>

            <h3 className="font-display text-2xl font-black text-ink mb-2 tracking-tight group-hover:text-accent transition-colors duration-300">
              {edu.institution}
            </h3>
            <div className="text-accent2 font-mono-custom text-sm mb-2">
              {edu.degree}
              {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
            </div>
            {edu.description && (
              <p className="text-muted text-sm leading-relaxed mt-4">{edu.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
