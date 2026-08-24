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
    <section className="section-pad py-24 border-t border-border">
      <p className="eyebrow mb-4">[05] The Numbers</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12">
        Data driven results.
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-surface p-8 text-center"
          >
            <div className="font-display text-5xl font-bold text-accent">
              <AnimatedCounter value={s.value} suffix={s.suffix} />
            </div>
            <div className="eyebrow mt-3">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
