// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import MagneticButton from "./MagneticButton";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.25 } },
};
const word = {
  hidden: { y: "115%", rotate: 3, opacity: 0 },
  show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  const templateData = useTemplateData();
  const {
    profile      = {},
    projects     = [],
    experience   = [],
    skills       = [],
    socials      = [],
    marqueeItems = [],
  } = (templateData as any) || {};

  const headline = profile.role || "Engineering fast, alive interfaces.";
  const words = headline.split(" ");
  const marqueeSkills = marqueeItems.length > 0
    ? marqueeItems
    : (skills || []).flatMap((s: any) => s.skills || []).slice(0, 14);

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden pt-24 pb-0">

      {/* Ambient blobs */}
      <div className="absolute top-[-5%] right-[-8%] w-[500px] h-[500px] rounded-full bg-gradient1 opacity-[0.12] blur-[120px] animate-floaty pointer-events-none" />
      <div className="absolute bottom-[5%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient2 opacity-[0.07] blur-[120px] animate-floaty2 pointer-events-none" />
      <div className="absolute inset-0 bg-dot-grid opacity-100 pointer-events-none" />

      <div className="section-pad relative z-10">

        {/* Top eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="w-5 h-px bg-gradient-brand" />
          <span className="eyebrow">{profile.name} — Creative Developer</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-display font-black tracking-tight leading-[0.92] max-w-4xl mb-8"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6.5rem)" }}
        >
          {words.map((w: string, i: number) => {
            const isHighlight = ["fast", "alive", "creative", "motion", "fast,"].includes(w.toLowerCase().replace(/[.,!?]/, ""));
            return (
              <span key={i} className="inline-block overflow-hidden mr-[0.22em] last:mr-0">
                <motion.span variants={word} className="inline-block">
                  {isHighlight
                    ? <span className="text-gradient">{w}</span>
                    : <span className="text-ink">{w}</span>
                  }
                </motion.span>
              </span>
            );
          })}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-ink-dim text-lg leading-relaxed max-w-xl mb-10"
        >
          {profile.tagline || profile.subhead}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-wrap items-center gap-4 mb-16 relative z-50"
        >
          <MagneticButton
            href="#work"
            className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-brand text-white font-semibold text-sm px-7 py-3.5 hover:shadow-[0_8px_30px_rgba(124,92,255,0.4)] transition-all hover:-translate-y-0.5"
          >
            See the work
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </MagneticButton>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface text-ink-dim font-semibold text-sm px-7 py-3.5 hover:border-border-strong hover:text-ink transition-all"
          >
            Get in touch
          </a>
          {socials.slice(0, 2).map((s: any) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="eyebrow text-muted hover:text-accent transition-colors"
            >
              {s.label?.trim() || s.href?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"} ↗
            </a>
          ))}
        </motion.div>

        {/* Quick stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex flex-wrap gap-6"
        >
          {projects.length > 0 && (
            <Stat value={`${projects.length}+`} label="Projects" />
          )}
          {experience.length > 0 && (
            <Stat value={`${experience.length}+`} label="Roles" />
          )}
          {skills.length > 0 && (
            <Stat value={`${skills.flatMap((s: any) => s.skills || []).length}+`} label="Technologies" />
          )}
        </motion.div>
      </div>

      {/* Marquee band */}
      {marqueeSkills.length > 0 && (
        <div className="mt-20 border-t border-b border-border py-4 overflow-hidden relative z-10">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...marqueeSkills, ...marqueeSkills, ...marqueeSkills].map((s: string, i: number) => (
              <span key={i} className="eyebrow px-8 text-muted">
                {s} <span className="text-gradient inline-block">✦</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-3xl font-black text-gradient">{value}</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}
