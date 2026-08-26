// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16,1,0.3,1] } },
};

export default function About() {
  const templateData = useTemplateData();
  const {
    profile      = {},
    stats        = [],
    skills       = [],
    capabilities = [],
  } = (templateData as any) || {};

  const techCount = skills.reduce((acc: number, g: any) => acc + (g.skills?.length || 0), 0);

  const metaItems = [
    { label: "Location",      value: profile.base   || "Global" },
    { label: "Status",        value: profile.badge  || "Open to work" },
    { label: "Roles",         value: stats[0]       ? `${stats[0].value}${stats[0].suffix}` : null },
    { label: "Projects",      value: stats[1]       ? `${stats[1].value}${stats[1].suffix}` : null },
    { label: "Technologies",  value: techCount > 0  ? `${techCount}+` : null },
    { label: "Focus",         value: capabilities[0]?.title || null },
  ].filter(m => !!m.value);

  return (
    <section className="section-pad py-28 border-t border-border">
      <div className="grid md:grid-cols-2 gap-16 items-start">

        {/* Left: copy */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="eyebrow mb-5">[02] About</p>
          <h2 className="font-display text-5xl md:text-6xl font-black tracking-tight leading-[0.95] mb-8">
            {profile.name}<span className="text-accent">.</span>
          </h2>
          <p className="text-ink-dim text-lg leading-relaxed mb-6 max-w-md">
            {profile.subhead}
          </p>
          {profile.tagline && (
            <p className="text-muted text-base leading-relaxed max-w-md">
              {profile.tagline}
            </p>
          )}

          <div className="mt-10 flex gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-[#050507] font-semibold text-sm px-6 py-3 hover:bg-accent/90 transition-all hover:-translate-y-0.5"
            >
              Get in touch →
            </a>
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-full border border-border text-ink-dim font-semibold text-sm px-6 py-3 hover:border-border-strong hover:text-ink transition-all"
            >
              See work
            </a>
          </div>
        </motion.div>

        {/* Right: meta grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.12 }}
          className="grid grid-cols-2 gap-3"
        >
          {metaItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * i, duration: 0.5 }}
              className="glass-card p-5 group"
            >
              <div className="eyebrow mb-2">{item.label}</div>
              <div className="font-display text-2xl font-black text-accent">{item.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
