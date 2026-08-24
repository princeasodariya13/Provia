// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Process() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  const processList = templateData?.process || [];

  return (
    <section id="process" className="section-pad py-24 border-t border-border">
      <p className="eyebrow mb-4">[04] Process / How I work</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-12">
        From logic to execution.
      </h2>

      <div className="flex flex-col gap-4">
        {processList.map((step: any, i: number) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="grid md:grid-cols-[120px_1fr_1fr] gap-6 md:gap-10 rounded-2xl border border-border bg-surface p-8 items-start"
          >
            <div>
              <span className="eyebrow text-accent">{step.of}</span>
              <h3 className="font-display text-2xl font-semibold mt-2">
                {step.title}
              </h3>
            </div>
            <p className="text-muted leading-relaxed">{step.description}</p>
            <div className="flex flex-wrap gap-2 content-start">
              {step.tags.map((t) => (
                <span
                  key={t}
                  className="eyebrow rounded-full border border-border px-3 py-1.5"
                >
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
