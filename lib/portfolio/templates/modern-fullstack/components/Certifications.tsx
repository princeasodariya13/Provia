// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { useTemplateData } from "../context";

export default function Certifications() {
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
  const isMissing = (!certifications || certifications.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="certifications" />
      </section>
    );
  }
}
  return (
    <section id="certifications" className="section-pad py-24 border-b border-border">
      <p className="eyebrow mb-4">Milestones</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-deep mb-14">
        Certifications.
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {certifications.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-6"
          >
            <div className="h-10 w-10 rounded-full bg-surface2 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-display font-semibold text-deep">{c.name}</p>
              <p className="eyebrow mt-1">{c.issuer}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
