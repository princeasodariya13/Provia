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
        [03] Experience
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-5xl md:text-6xl font-black tracking-tight mb-16"
      >
        Where I&apos;ve been<span className="text-accent">.</span>
      </motion.h2>

      <div className="relative">
        {/* Timeline vertical line */}
        <div className="hidden md:block absolute left-[200px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-0 divide-y divide-border border-t border-border">
          {experience.map((exp: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.07 }}
              className="group grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-12 py-10 hover:bg-surface/30 transition-all duration-300 px-0 hover:px-4 rounded-xl -mx-4"
            >
              {/* Date column */}
              <div className="shrink-0 pt-1">
                <div className="eyebrow text-muted">
                  {exp.startDate ? new Date(exp.startDate).getFullYear() : ""}
                  {" — "}
                  {exp.isCurrent ? (
                    <span className="text-accent">Present</span>
                  ) : (
                    exp.endDate ? new Date(exp.endDate).getFullYear() : ""
                  )}
                </div>
                {exp.isCurrent && (
                  <div className="mt-2 inline-flex items-center gap-1.5 tag-pill">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Current
                  </div>
                )}
              </div>

              {/* Content column */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl font-black text-ink group-hover:text-accent transition-colors duration-300 tracking-tight">
                      {exp.title}
                    </h3>
                    <p className="text-accent2 font-mono-custom text-sm mt-1">{exp.company}</p>
                  </div>
                  {exp.location && (
                    <span className="tag-pill shrink-0">{exp.location}</span>
                  )}
                </div>
                {exp.description && (
                  <p className="text-ink-dim leading-relaxed text-base max-w-2xl mt-3">
                    {exp.description}
                  </p>
                )}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {exp.technologies.slice(0, 5).map((tech: string, ti: number) => (
                      <span key={ti} className="tag-pill">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
