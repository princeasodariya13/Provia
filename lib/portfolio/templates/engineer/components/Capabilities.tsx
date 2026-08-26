// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Capabilities() {
  const templateData = useTemplateData();
  const { capabilities = [], skills = [] } = (templateData as any) || {};

  // Prefer skills array if capabilities are empty
  const items = capabilities.length > 0
    ? capabilities
    : skills.map((s: any, i: number) => ({
        index: String(i + 1).padStart(2, "0"),
        title: s.category || "Skill",
        description: (s.skills || []).join(", "),
      }));

  if (!items || items.length === 0) return null;

  return (
    <section className="section-pad py-28 border-t border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow mb-5"
      >
        [05] Capabilities
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-5xl md:text-6xl font-black tracking-tight mb-16"
      >
        What I can do<span className="text-accent">.</span>
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-5">
        {items.map((c: any, i: number) => (
          <motion.div
            key={c.title || i}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: i * 0.08 }}
            className="glass-card p-8 group hover:-translate-y-1 hover:border-accent/30 transition-all duration-300"
          >
            {/* Accent number */}
            <div className="font-mono-custom text-3xl font-black text-accent/20 group-hover:text-accent/40 transition-colors mb-6 leading-none">
              {c.index}
            </div>
            <h3 className="font-display text-xl font-black text-ink mb-3 tracking-tight">
              {c.title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {c.description}
            </p>

            {/* Bottom accent line on hover */}
            <div className="mt-6 h-0.5 w-0 bg-gradient-to-r from-accent to-accent2 rounded-full transition-all duration-500 group-hover:w-full" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
