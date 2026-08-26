// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function About() {
  const templateData = useTemplateData();
  const { about = {}, profile = {}, experience = [], projects = [], skills = {} } = (templateData as any) || {};

  const techCount = Object.values(skills as Record<string, string[]>).flat().length;

  const stats = about.stats || [
    ...(projects.length  > 0 ? [{ label: "Projects",     value: `${projects.length}+` }] : []),
    ...(experience.length > 0 ? [{ label: "Roles",        value: `${experience.length}+` }] : []),
    ...(techCount > 0          ? [{ label: "Technologies", value: `${techCount}+` }] : []),
  ];

  return (
    <section id="about" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <SectionHeading index="01" label="About" title="About Me" />

        <div className="grid md:grid-cols-[1.5fr_1fr] gap-12 items-start">
          {/* Bio text */}
          <div className="space-y-5">
            {(about.paragraphs || [profile.bio]).filter(Boolean).map((p: string, i: number) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-ink-dim leading-relaxed text-lg">{p}</p>
              </Reveal>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s: any, i: number) => (
              <Reveal key={s.label} delay={0.12 + i * 0.07}>
                <div className="mn-card p-6 text-center hover:bg-accent-light group">
                  <div className="font-display text-3xl font-black text-accent mb-1">{s.value}</div>
                  <div className="section-label">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
