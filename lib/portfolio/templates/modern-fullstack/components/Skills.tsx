// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { useTemplateData } from "../context";

export default function Skills() {
  const templateData = useTemplateData();
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

  const skillGroups = Array.isArray(skills) ? skills.map((s: any) => ({
    title: s.category?.trim() || "Skills",
    skills: s.skills || []
  })) : [];

  if (true) {
  const isMissing = (!skills || skills.length === 0) && (!stack || stack.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="skills" />
      </section>
    );
  }
}
  return (
    <section id="skills" className="section-pad py-24 border-b border-border">
      <p className="eyebrow mb-4">Technical Stack</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-deep mb-14">
        Mobile to backend, covered.
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {skillGroups.map((g, i) => (
          <motion.div
            key={`${g.title}-${i}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-surface p-7"
          >
            <h3 className="font-display text-lg font-semibold text-deep mb-4">{g.title}</h3>
            <div className="flex flex-wrap gap-2">
              {g.skills.map((s, si) => (
                <span
                  key={si}
                  className="eyebrow rounded-full border border-border bg-surface2 px-3 py-1.5 text-ink/80"
                >
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
