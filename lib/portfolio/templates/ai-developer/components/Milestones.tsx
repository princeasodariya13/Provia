// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Milestones() {
  const templateData = useTemplateData();
  const { milestones = [] } = (templateData as any) || {};

  if (!milestones || milestones.length === 0) return null;

  return (
    <section id="milestones" className="section-pad py-28 border-b border-border relative">
      {/* Subtle bg glow */}
      <div className="absolute inset-0 bg-radial-center opacity-50 pointer-events-none" />

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="hud-accent mb-4"
        >
          // Experience Timeline
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl md:text-5xl font-black tracking-tight mb-16 text-ink"
        >
          Career milestones<span className="text-accent">_</span>
        </motion.h2>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="hidden md:block absolute left-[180px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-0">
            {milestones.map((m: any, i: number) => (
              <motion.div
                key={m.title || i}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="group grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 py-9 border-t border-border hover:bg-surface/40 transition-all duration-300 px-0 hover:px-4 rounded-xl -mx-4"
              >
                {/* Date + tag */}
                <div className="pt-1">
                  <div className="hud text-muted mb-2">{m.date}</div>
                  {m.tag && (
                    <span className="ai-tag text-accent border-accent/30 bg-accent-dim">
                      {m.tag}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div>
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-[176px] mt-2 w-2 h-2 rounded-full bg-accent ring-4 ring-accent/10" />

                  <h3 className="font-display text-2xl font-black text-ink group-hover:text-accent transition-colors duration-300 tracking-tight mb-2">
                    {m.title?.trim() || "Milestone"}
                  </h3>
                  <p className="text-ink-dim leading-relaxed text-base max-w-2xl">
                    {m.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
