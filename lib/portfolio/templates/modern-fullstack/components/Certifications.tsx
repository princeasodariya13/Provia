// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
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

      <div className="grid md:grid-cols-2 gap-6">
        {certifications.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 hover:shadow-lg transition-all"
          >
            {c.url && c.url !== "#" ? (
              <div className="w-full h-48 rounded-xl overflow-hidden bg-surface2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.url} alt={c.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-48 rounded-xl bg-surface2 flex items-center justify-center">
                <Award className="h-10 w-10 text-border" />
              </div>
            )}
            <div>
              <p className="font-display font-bold text-lg text-deep">{c.name}</p>
              {c.organization && (
                <p className="text-muted text-sm mt-2 leading-relaxed">{c.organization}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
