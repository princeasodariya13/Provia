// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function About() {
  const templateData = useTemplateData();
  const {
    profile  = {},
    about    = {},
    projects = [],
    experience = [],
    skills   = [],
  } = (templateData as any) || {};

  const description = about.description || profile.tagline || "";

  const metaItems = [
    { label: "Location", value: profile.location || "Global" },
    { label: "Projects", value: projects.length > 0 ? `${projects.length}+` : null },
    { label: "Roles",    value: experience.length > 0 ? `${experience.length}+` : null },
    { label: "Stack",    value: skills.length > 0 ? `${skills.flatMap((s: any) => s.skills || []).length}+` : null },
  ].filter(m => !!m.value);

  return (
    <section id="about" className="section-pad py-28 border-t border-border">

      <div className="grid md:grid-cols-[1fr_1.1fr] gap-16 items-start">

        {/* Left: heading + description */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <p className="eyebrow mb-5">About</p>
          <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight leading-[1.05] mb-6 text-ink">
            I build the parts users <span className="text-gradient">feel</span> and the parts they never see.
          </h2>
          <p className="text-ink-dim text-lg leading-relaxed mb-8">
            {description || `Most of my work sits at the boundary between backend architecture and frontend feel — making sure a system that scales also feels instant. Based in ${profile.location || "the world"}.`}
          </p>
          <div className="flex gap-4">
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white font-semibold text-sm px-6 py-3 hover:shadow-[0_6px_24px_rgba(124,92,255,0.35)] transition-all hover:-translate-y-0.5"
            >
              View work →
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border text-ink-dim font-semibold text-sm px-6 py-3 hover:border-border-strong hover:text-ink transition-all"
            >
              Get in touch
            </a>
          </div>
        </motion.div>

        {/* Right: meta stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="grid grid-cols-2 gap-4"
        >
          {metaItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.93 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.07 * i, duration: 0.5 }}
              className="me-card p-6 group"
            >
              <div className="eyebrow mb-2">{item.label}</div>
              <div className="font-display text-3xl font-black text-gradient">{item.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
