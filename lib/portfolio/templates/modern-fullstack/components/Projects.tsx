// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { ArrowUpRight } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
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
    <section id="projects" className="section-pad py-24 border-b border-border">
      <p className="eyebrow mb-4">Selected Work</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-deep mb-14">
        Apps and the APIs behind them.
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-surface p-8 hover:border-accent/60 transition-colors duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-2xl font-semibold text-deep">{p.title?.trim() || "Project"}</h3>
                <p className="eyebrow mt-1 text-accent">Application</p>
              </div>
            </div>

            <p className="text-muted text-sm leading-relaxed mb-6">{p.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {p.tags.map((t) => (
                <span key={t} className="eyebrow rounded-full border border-border px-3 py-1">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {p.link && p.link !== "#" && (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="eyebrow flex items-center gap-1 hover:text-accent transition-colors">
                  Live Demo <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
