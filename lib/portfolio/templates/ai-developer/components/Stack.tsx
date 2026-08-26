// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Stack() {
  const templateData = useTemplateData();
  const { stack = [], skills = [] } = (templateData as any) || {};

  // Build grouped skill categories from skills array
  const groups = skills.length > 0
    ? skills.map((s: any, i: number) => ({
        index: String(i + 1).padStart(2, "0"),
        title: s.category || "Skills",
        items: s.skills || [],
      }))
    : stack.length > 0
    ? [{ index: "01", title: "Core Stack", items: stack.map((s: any) => s.name || s) }]
    : [];

  if (groups.length === 0) return null;

  return (
    <section id="stack" className="section-pad py-28 border-b border-border relative">
      <div className="absolute inset-0 bg-hud-grid opacity-30 pointer-events-none" />

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="hud-accent mb-4"
        >
          // Skills Map
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4 text-ink"
        >
          The engineering foundation<span className="text-accent">_</span>
        </motion.h2>
        <p className="text-ink-dim text-lg max-w-lg mb-16 leading-relaxed">
          Tools, languages, and frameworks powering scalable architectures and intelligent systems.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group: any, i: number) => (
            <motion.div
              key={group.title || i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="ai-card p-7 group hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="hud-accent">{group.index}</span>
                <h3 className="font-display text-lg font-black text-ink">{group.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((skill: string, si: number) => (
                  <span
                    key={si}
                    className="ai-tag hover:border-accent/50 hover:text-accent transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
