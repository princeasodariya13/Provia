// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import AnimatedCounter from "./AnimatedCounter";

export default function Stats() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section className="section-pad py-20 border-b border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <div className="font-display text-4xl md:text-5xl font-bold">
              <AnimatedCounter value={s.value} suffix={s.suffix} />
            </div>
            <div className="eyebrow mt-2">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
