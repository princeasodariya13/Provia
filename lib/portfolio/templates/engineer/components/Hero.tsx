// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
};
const word = {
  hidden: { y: "110%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  const templateData = useTemplateData();
  const {
    profile    = {},
    socials    = [],
    projects   = [],
    capabilities = [],
    stats      = [],
  } = (templateData as any) || {};

  const headline = profile.role || "Engineering resilient systems that scale.";
  const words = headline.split(" ");

  return (
    <section id="profile" className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden pt-24 pb-20">

      {/* Background grid */}
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)] opacity-50 pointer-events-none" />

      {/* Accent orb */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(200,255,0,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(0,255,178,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="section-pad relative z-10">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse-ring" />
          <span className="eyebrow">[01] {profile.name} — Portfolio</span>
        </motion.div>

        {/* Animated headline */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[0.92] font-black tracking-tight max-w-5xl mb-8 break-words"
        >
          {words.map((w: string, i: number) => (
            <span key={i} className="inline-block overflow-hidden mr-[0.22em] last:mr-0">
              <motion.span variants={word} className="inline-block">
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* Sub-heading */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.0 }}
          className="text-ink-dim text-lg leading-relaxed max-w-xl mb-10"
        >
          {profile.tagline || profile.subhead}
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-wrap items-center gap-4 mb-16 relative z-50"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2.5 rounded-full bg-accent text-base font-semibold text-[#050507] px-7 py-3.5 text-sm hover:bg-accent/90 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,255,0,0.3)]"
          >
            Start a project
            <span className="transition-transform group-hover:translate-x-1 text-base">→</span>
          </a>
          <a
            href="#work"
            className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-7 py-3.5 text-sm font-semibold text-ink hover:border-border-strong hover:bg-surface2 transition-all"
          >
            View my work
          </a>
          {socials.slice(0, 2).map((s: any) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="eyebrow text-muted hover:text-accent transition-colors"
            >
              {s.label?.trim() || s.href?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"}↗
            </a>
          ))}
        </motion.div>

        {/* Stat chips row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex flex-wrap gap-3"
        >
          {profile.base && <StatChip icon="📍" label={profile.base} />}
          {projects.length > 0 && <StatChip icon="🚀" label={`${projects.length}+ Projects`} />}
          {stats.length > 0 && stats.map((s: any, i: number) => (
            <StatChip key={i} icon="⚡" label={`${s.value}${s.suffix || ""} ${s.label}`} />
          ))}
          {capabilities.slice(0, 2).map((c: any, i: number) => (
            <StatChip key={`cap-${i}`} icon="●" label={c.title} accent />
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-base to-transparent pointer-events-none" />
    </section>
  );
}

function StatChip({ icon, label, accent = false }: { icon: string; label: string; accent?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs border font-mono-custom ${
      accent
        ? "bg-accent-dim border-accent/30 text-accent"
        : "bg-surface border-border text-ink-dim"
    }`}>
      <span className="text-[10px]">{icon}</span>
      {label}
    </div>
  );
}
