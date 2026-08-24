// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Stack() {
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

  const skillGroups = Array.isArray(skills) ? skills.map((s: any, i: number) => ({
    index: `0${i + 1}`,
    title: s.category || "Skills",
    skills: s.skills || []
  })) : [];

  return (
    <section id="stack" className="section-pad py-24 border-b border-border">
      <p className="hud mb-4">Interactive Skills Map</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4 max-w-2xl">
        The engineering foundation.
      </h2>
      <p className="text-muted max-w-lg mb-14">
        Tools, languages, and frameworks used to build scalable architectures
        and interactive interfaces.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {skillGroups.map((group, i) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-surface p-8 hover:border-accent/50 transition-colors"
          >
            <div className="flex items-baseline gap-3 mb-6">
              <span className="hud text-accent">{group.index}</span>
              <h3 className="font-display text-xl font-semibold">{group.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((s) => (
                <span
                  key={s}
                  className="hud rounded-full border border-border px-3 py-1.5 text-ink/80"
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
