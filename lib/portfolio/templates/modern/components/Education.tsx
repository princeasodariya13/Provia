// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Education() {
  const templateData = useTemplateData();
  const { education = [] } = (templateData as any) || {};

  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <SectionHeading index="05" label="Education" title="Academic background." />

        <div className="grid md:grid-cols-2 gap-5">
          {education.map((e: any, i: number) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="mn-card p-8 group">
                <div className="section-label mb-4 text-accent">{e.years}</div>
                <h3 className="font-display text-xl font-bold text-ink mb-2 group-hover:text-accent transition-colors tracking-tight">
                  {e.school}
                </h3>
                <div className="text-ink-dim font-medium text-sm mb-1">{e.degree}</div>
                {e.note && <div className="text-muted text-sm">{e.note}</div>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
