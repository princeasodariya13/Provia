// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Process() {
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
    <section className="section-pad py-24 border-b border-border">
      <p className="eyebrow mb-4">How I work</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-14">
        Four steps, no shortcuts.
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
        {process.map((p, i) => (
          <motion.div
            key={p.step}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="border-t-2 border-accent pt-5"
          >
            <span className="eyebrow">{p.step}</span>
            <h3 className="font-display text-xl font-semibold mt-2 mb-2">{p.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{p.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
