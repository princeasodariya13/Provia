// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Stack() {
  const templateData = useTemplateData();
  const { stack = [], skills = [] } = (templateData as any) || {};

  // Fall back to skills if stack is empty
  const items = stack.length > 0
    ? stack
    : skills.map((s: any) => ({ name: s.category, description: (s.skills || []).slice(0, 4).join(", ") }));

  if (!items || items.length === 0) return null;

  return (
    <section className="section-pad py-28 border-t border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow mb-5"
      >
        [REF] Core Stack
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-5xl md:text-6xl font-black tracking-tight mb-16"
      >
        The arsenal<span className="text-accent">.</span>
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-px bg-border-strong/30 rounded-2xl overflow-hidden border border-border">
        {items.map((s: any, i: number) => (
          <motion.div
            key={s.name || i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="group bg-surface p-8 hover:bg-surface2 transition-all duration-300 relative overflow-hidden"
          >
            {/* Accent corner dot */}
            <div className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="font-display text-xl font-black mb-2 group-hover:text-accent transition-colors duration-300">{s.name}</h3>
            <p className="text-muted text-sm leading-relaxed">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
