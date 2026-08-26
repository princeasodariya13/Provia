// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { useTemplateData } from "../context";

export default function Projects() {
  const templateData = useTemplateData();
  const { projects = [] } = (templateData as any) || {};

  if (!projects || projects.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="projects" />
      </section>
    );
  }

  return (
    <section id="work" className="section-pad py-28 border-t border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow mb-5"
      >
        [04] Selected Work
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-5xl md:text-6xl font-black tracking-tight mb-16"
      >
        What I&apos;ve built<span className="text-accent">.</span>
      </motion.h2>

      <div className="divide-y divide-border border-t border-border">
        {projects.map((p: any, i: number) => (
          <motion.a
            href={p.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            key={p.title || i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="project-row group flex items-center justify-between py-8 md:py-10 hover:bg-surface/30 transition-all duration-300 px-0 hover:px-5 rounded-xl -mx-5 gap-6"
          >
            <div className="flex items-center gap-6 md:gap-10 min-w-0">
              <span className="eyebrow shrink-0 text-muted/60">{p.index}</span>
              <div className="min-w-0">
                <h3 className="font-display text-2xl md:text-4xl font-black text-ink group-hover:text-accent transition-colors duration-300 tracking-tight truncate">
                  {p.title?.trim() || "Project"}
                </h3>
                {p.description && (
                  <p className="text-muted text-sm mt-1.5 leading-relaxed line-clamp-1 hidden sm:block">
                    {p.description}
                  </p>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4 shrink-0">
              {p.tag && <span className="tag-pill">{p.tag}</span>}
              {p.period && <span className="eyebrow text-muted">{p.period}</span>}
              <span className="project-arrow text-accent text-xl font-bold">↗</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
