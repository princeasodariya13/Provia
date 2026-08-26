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
    <section id="projects" className="section-pad py-28 border-b border-border relative">
      <div className="absolute inset-0 bg-hud-grid opacity-50 pointer-events-none" />

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="hud-accent mb-4"
        >
          // Active Builds
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4 text-ink"
        >
          A curated selection<span className="text-accent">_</span>
        </motion.h2>
        <p className="text-ink-dim text-lg max-w-lg mb-16 leading-relaxed">
          Live projects and experiments, each solving a real problem.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((p: any, i: number) => (
            <motion.a
              href={p.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              key={p.title || i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.07 }}
              className="group ai-card p-8 hover:-translate-y-1 hover:border-accent/40 block"
            >
              {/* HUD header */}
              <div className="flex items-center justify-between mb-4">
                <span className="ai-tag">
                  {p.link && p.link !== "#" ? new URL(p.link.startsWith("http") ? p.link : `https://${p.link}`).hostname : "Application"}
                </span>
                <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity text-lg">↗</span>
              </div>

              <h3 className="font-display text-2xl font-black text-ink group-hover:text-accent transition-colors duration-300 tracking-tight mb-3">
                {p.title?.trim() || "Project"}
              </h3>
              <p className="text-ink-dim text-base leading-relaxed mb-5">
                {p.description}
              </p>

              {/* Tech tags */}
              {p.metrics && p.metrics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.metrics.map((m: any, idx: number) => (
                    <span key={idx} className="ai-tag">{m.value || m.label}</span>
                  ))}
                </div>
              )}

              {/* Bottom accent line on hover */}
              <div className="mt-6 h-px w-0 bg-gradient-to-r from-accent to-accent2 rounded-full transition-all duration-500 group-hover:w-full" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
