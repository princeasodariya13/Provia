// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { Star, GitFork, CircleDot } from "lucide-react";
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
      <p className="hud mb-4">Active Builds</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
        A curated selection.
      </h2>
      <p className="text-muted max-w-lg mb-14">
        Live projects and experiments, each with a real problem behind it.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((p, i) => (
          <motion.a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            key={p.title || i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.08 }}
            className="group rounded-2xl border border-border bg-surface p-8 hover:border-accent/50 hover:-translate-y-1 transition-all duration-300"
          >
            <p className="hud mb-3 truncate">{p.link !== "#" ? p.link : "Application"}</p>
            <h3 className="font-display text-2xl font-semibold mb-3 group-hover:text-accent transition-colors">
              {p.title}
            </h3>
            <p className="text-muted text-sm leading-relaxed mb-5">
              {p.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {(p.metrics || []).map((m: any, idx: number) => (
                <span key={idx} className="hud rounded-full border border-border px-3 py-1">
                  {m.value}
                </span>
              ))}
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button className="hud border border-border rounded-full px-6 py-3 hover:border-accent hover:text-accent transition-colors">
          Load More Projects
        </button>
      </div>
    </section>
  );
}
