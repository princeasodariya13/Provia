// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Capabilities() {
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

  return (
    <section className="section-pad py-24 border-t border-border">
      <p className="eyebrow mb-4">[03] Capabilities</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12">
        What I can do.
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {capabilities.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-surface p-8 hover:border-accent/60 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="eyebrow text-accent">{c.index}</span>
            <h3 className="font-display text-xl font-semibold mt-4 mb-3">
              {c.title}
            </h3>
            <p className="text-muted leading-relaxed">{c.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
