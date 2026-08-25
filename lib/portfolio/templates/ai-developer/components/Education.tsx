// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Education() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { education = [] } = templateData || {};

  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="section-pad py-24 border-b border-border">
      <p className="hud mb-4">Academic Background</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-14">
        Education & Training.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {education.map((edu, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-surface p-8 hover:border-accent/50 transition-all duration-300"
          >
            <div className="hud mb-3 text-accent">
              {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} — {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
            </div>
            <h3 className="font-display text-2xl font-bold text-ink mb-2">
              {edu.institution}
            </h3>
            <p className="text-muted leading-relaxed">
              {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
