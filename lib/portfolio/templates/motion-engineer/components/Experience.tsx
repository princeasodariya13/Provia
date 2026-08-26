// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";

export default function Experience() {
  const templateData = useTemplateData();
  const { experience = [] } = (templateData as any) || {};

  if (!experience || experience.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="experience" />
      </section>
    );
  }

  return (
    <section id="experience" className="section-pad py-28 border-t border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow mb-5"
      >
        Experience
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-5xl md:text-6xl font-black tracking-tight mb-16 text-ink"
      >
        Where I&apos;ve <span className="text-gradient">contributed.</span>
      </motion.h2>

      <div className="relative">
        {/* Vertical line */}
        <div className="hidden md:block absolute left-[180px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-0 divide-y divide-border border-t border-border">
          {experience.map((exp: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="exp-item group grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 py-10 hover:bg-surface/40 transition-all duration-300 px-0 hover:px-4 rounded-xl -mx-4"
            >
              {/* Date */}
              <div className="pt-1 shrink-0">
                <div className="eyebrow text-muted">{exp.period}</div>
              </div>

              {/* Content */}
              <div>
                {/* Timeline dot */}
                <div className="exp-dot hidden md:block absolute left-[176.5px] mt-2 w-2 h-2 rounded-full bg-border transition-all duration-300" />

                <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                  <h3 className="font-display text-2xl md:text-3xl font-black text-ink group-hover:text-gradient transition-all duration-300 tracking-tight">
                    {exp.role?.trim() || "Role"}
                  </h3>
                </div>
                <div className="font-mono text-sm text-gradient mb-4">{exp.company?.trim() || "Company"}</div>
                <p className="text-ink-dim leading-relaxed max-w-2xl">
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
