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
        Selected Work
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-5xl md:text-6xl font-black tracking-tight mb-16 text-ink"
      >
        Products, not <span className="text-gradient">prototypes.</span>
      </motion.h2>

      <div className="flex flex-col gap-5">
        {projects.map((p: any, i: number) => (
          <motion.a
            href={p.link || "#"}
            target={p.link && p.link !== "#" ? "_blank" : undefined}
            rel="noopener noreferrer"
            key={p.title || i}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="proj-row group me-card p-8 md:p-10 grid md:grid-cols-[72px_1fr_auto] gap-6 items-start hover:-translate-y-0.5 block"
          >
            {/* Index */}
            <span className="font-mono text-2xl font-black text-gradient opacity-40 group-hover:opacity-80 transition-opacity">
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* Main content */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="font-display text-2xl md:text-3xl font-black text-ink group-hover:text-gradient transition-all duration-300 tracking-tight">
                  {p.title?.trim() || "Project"}
                </h3>
                {p.category && <span className="me-tag">{p.category}</span>}
              </div>
              <p className="text-ink-dim leading-relaxed max-w-2xl">
                {p.description}
              </p>
            </div>

            {/* Link indicator */}
            <span className="proj-arrow text-gradient text-2xl font-black self-center">↗</span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
