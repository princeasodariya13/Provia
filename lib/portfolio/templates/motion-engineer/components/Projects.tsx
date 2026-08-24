// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { useTemplateData } from "../context";

export default function Projects() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { 
  contact = {},
  profile = {},
  marqueeItems = [],
  certifications = [],
  header = {},
  social = {},
  services = [],
  faq = [],
  milestones = [],
  globals = {},
  steps = [],
  about = {},
  experience = [],
  projects = [],
  skills = [],
  stats = [],
  stack = [],
  capabilities = [],
  education = []
 } = templateData || {};

  if (true) {
  const isMissing = (!projects || projects.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="projects" />
      </section>
    );
  }
}
  return (
    <section id="work" className="section-pad py-24 border-b border-border">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="eyebrow mb-4"
      >
        Selected Work
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-14"
      >
        Products, not prototypes.
      </motion.h2>

      <div className="flex flex-col gap-6">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="group grid md:grid-cols-[80px_1fr_1fr] gap-6 items-start rounded-2xl border border-border bg-surface p-8 hover:border-accent/50 transition-colors duration-300"
          >
            <span className="eyebrow text-accent">{p.index}</span>
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold mb-2 group-hover:text-gradient transition-colors">
                {p.title}
              </h3>
              <p className="eyebrow mb-4">{p.tag} · {p.year}</p>
              <p className="text-muted leading-relaxed max-w-md">{p.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 content-start md:justify-end">
              {p.stack.map((t) => (
                <span key={t} className="eyebrow rounded-full border border-border px-3 py-1.5">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
