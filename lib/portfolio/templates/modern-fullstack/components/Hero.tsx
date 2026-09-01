// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Hero() {
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
    <section id="top" className="relative pt-40 pb-24 overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-dots bg-dots opacity-40 [mask-image:radial-gradient(ellipse_55%_45%_at_50%_0%,#000_40%,transparent_100%)]" />

      <div className="section-pad relative">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="eyebrow inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {profile.availability}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] max-w-3xl text-deep"
        >
          {profile.headline}
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mt-6">
          {profile.avatar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-surface shadow-xl shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </motion.div>
          )}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-muted text-lg max-w-xl leading-relaxed"
          >
            {profile.subhead}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-9 flex flex-wrap items-center gap-4 relative z-50"
        >
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-3 text-sm font-medium hover:bg-deep transition-colors"
          >
            View my work →
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium hover:border-accent transition-colors"
          >
            Get in touch
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 flex gap-4"
        >
          {skills?.flatMap((s: any) => s.skills || []).slice(0, 3).map((skillName: string, i: number) => (
            <PlatformCard key={i} label={skillName || "Skill"} sub="Proficient" delay={i * 0.4} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PlatformCard({ label, sub, delay }: { label: string; sub: string; delay: number }) {
  return (
    <div
      className="rounded-2xl border border-border bg-surface px-6 py-5 animate-floaty"
      style={{ animationDelay: `${delay}s` }}
    >
      <p className="font-display font-semibold text-deep">{label}</p>
      <p className="eyebrow mt-1">{sub}</p>
    </div>
  );
}
