// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Stack() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section className="section-pad py-24 border-t border-border">
      <p className="eyebrow mb-4">[REF] Core Stack</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12">
        Verify the arsenal.
      </h2>

      <div className="grid md:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border">
        {stack.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="bg-surface p-8 hover:bg-surface2 transition-colors"
          >
            <h3 className="font-display text-xl font-semibold mb-2">{s.name}</h3>
            <p className="text-muted text-sm leading-relaxed">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
