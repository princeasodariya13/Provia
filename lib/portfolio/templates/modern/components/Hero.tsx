// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { useTemplateData } from "../context";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item = {
  hidden:  { opacity: 0, y: 24 },
  show:    { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const templateData = useTemplateData();
  const {
    profile      = {},
    about        = {},
    experience   = [],
    projects     = [],
    skills       = {},
    marqueeItems = [],
    socials      = [],
  } = (templateData as any) || {};

  const techCount = Object.values(skills as Record<string, string[]>).flat().length;
  const marqueeWords = marqueeItems.length > 0 ? marqueeItems : Object.values(skills as Record<string, string[]>).flat().slice(0, 12);

  return (
    <section id="home" className="relative min-h-[100svh] flex flex-col justify-center pt-24 pb-0 overflow-hidden grid-bg">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />

      {/* Accent orb */}
      <div className="absolute -top-32 right-[-8%] w-[520px] h-[520px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)" }} />

      <div className="relative max-w-6xl mx-auto px-6 md:px-12 w-full">
        <motion.div variants={container} initial="hidden" animate="show">

          {/* Status badge */}
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 mb-8 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="section-label !text-accent">Available for work</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-display font-black tracking-tight leading-[0.95] mb-6 text-ink"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
          >
            Hi, I&apos;m
            <br />
            <span className="text-accent">{profile.name}</span>
          </motion.h1>

          {/* Role */}
          <motion.p variants={item} className="text-xl md:text-2xl font-medium text-ink-dim mb-4 max-w-2xl">
            {profile.title}
          </motion.p>

          {/* Location */}
          {profile.location && (
            <motion.div variants={item} className="flex items-center gap-1.5 text-muted text-sm mb-8">
              <MapPin size={14} className="text-accent" />
              {profile.location}
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap items-center gap-4 mb-16 relative z-50">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-white font-semibold text-sm px-7 py-3.5 hover:bg-accent/90 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,99,235,0.3)]"
            >
              View My Work <ArrowRight size={15} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface text-ink font-semibold text-sm px-7 py-3.5 hover:border-accent hover:text-accent transition-all hover:shadow-sm"
            >
              Get in touch
            </a>
            {socials.slice(0, 2).map((s: any) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="section-label text-muted hover:text-accent transition-colors"
              >
                {s.platform?.trim() || s.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"} ↗
              </a>
            ))}
          </motion.div>

          {/* Quick stat chips */}
          <motion.div variants={item} className="flex flex-wrap gap-3">
            {projects.length > 0 && <StatChip value={`${projects.length}+`} label="Projects" />}
            {experience.length > 0 && <StatChip value={`${experience.length}+`} label="Roles" />}
            {techCount > 0 && <StatChip value={`${techCount}+`} label="Technologies" />}
          </motion.div>
        </motion.div>
      </div>

      {/* Marquee band */}
      {marqueeWords.length > 0 && (
        <div className="mt-20 border-t border-b border-border bg-surface/70 backdrop-blur-sm py-3.5 overflow-hidden">
          <div className="flex w-max animate-marquee">
            {[...marqueeWords, ...marqueeWords, ...marqueeWords].map((word: string, i: number) => (
              <span key={i} className="mx-7 font-mono text-xs uppercase tracking-widest text-muted whitespace-nowrap">
                {word} <span className="text-accent">/</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-sm">
      <span className="font-display text-lg font-black text-accent">{value}</span>
      <span className="section-label">{label}</span>
    </div>
  );
}
