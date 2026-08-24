// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Capabilities() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section id="capabilities" className="section-pad py-24 border-b border-border">
      <p className="eyebrow mb-4">Capabilities</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-14">
        What I bring to a build.
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {capabilities.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-surface p-8 hover:-translate-y-1 hover:border-accent/50 transition-all duration-300"
          >
            <span className="eyebrow text-accent">{c.index}</span>
            <h3 className="font-display text-xl font-semibold mt-4 mb-3">{c.title}</h3>
            <p className="text-muted leading-relaxed">{c.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
