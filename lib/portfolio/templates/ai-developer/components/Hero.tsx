// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import AnimatedCounter from "./AnimatedCounter";

export default function Hero() {
  const templateData = useTemplateData();
  const {
    profile    = {},
    milestones = [],
    projects   = [],
    stack      = [],
    marqueeItems = [],
    stats      = [],
    social     = [],
    email      = "",
  } = (templateData as any) || {};

  const derivedStats = [
    { label: "Experience", value: milestones.length || 0, suffix: "+" },
    { label: "Projects",   value: projects.length   || 0, suffix: "+" },
    { label: "Skills",     value: stack.length      || 0, suffix: "+" },
  ];

  const displayStats = stats.length > 0 ? stats : derivedStats;

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden border-b border-border pt-24 pb-0">

      {/* HUD grid background */}
      <div className="absolute inset-0 bg-hud-grid opacity-100 pointer-events-none" />
      <div className="absolute inset-0 bg-radial pointer-events-none" />

      {/* Corner HUD brackets */}
      <div className="absolute top-24 left-6 md:left-12 w-8 h-8 border-l-2 border-t-2 border-accent/30 pointer-events-none" />
      <div className="absolute top-24 right-6 md:right-12 w-8 h-8 border-r-2 border-t-2 border-accent/30 pointer-events-none" />
      <div className="absolute bottom-20 left-6 md:left-12 w-8 h-8 border-l-2 border-b-2 border-accent/30 pointer-events-none" />
      <div className="absolute bottom-20 right-6 md:right-12 w-8 h-8 border-r-2 border-b-2 border-accent/30 pointer-events-none" />

      <div className="section-pad relative z-10">
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-12 items-center">

          {/* Left: main content */}
          <div>
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2 mb-8"
            >
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
              <span className="hud text-accent">{profile.status || "Available for opportunities"}</span>
            </motion.div>

            {/* Name & role */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display font-black tracking-tight leading-[0.95] mb-6"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
            >
              <span className="text-ink">{profile.name}</span>
              <span className="text-accent glow-text">.</span>
              <br />
              <span className="text-ink-dim font-semibold" style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)" }}>
                {profile.role || profile.headline}
              </span>
            </motion.h1>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-ink-dim text-lg leading-relaxed max-w-xl mb-10"
            >
              {profile.tagline || profile.bio}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap gap-4 relative z-50"
            >
              <a
                href="#connect"
                className="inline-flex items-center gap-2 rounded-full bg-accent text-[#02020A] hud font-bold px-7 py-3.5 hover:bg-accent/90 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(56,189,248,0.35)]"
              >
                Let&apos;s Connect →
              </a>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-7 py-3.5 hud text-ink-dim hover:border-accent hover:text-accent transition-all"
              >
                View Projects
              </a>
            </motion.div>
          </div>

          {/* Right: stat grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-3 md:grid-cols-1 gap-3"
          >
            {displayStats.map((s: any, i: number) => (
              <div
                key={s.label || i}
                className="ai-card p-5 md:p-6 text-center md:text-left"
              >
                <div className="font-display text-3xl md:text-4xl font-black text-accent glow-text mb-1">
                  <AnimatedCounter value={s.value} />
                  {s.suffix || ""}
                </div>
                <div className="hud">{s.label}</div>
              </div>
            ))}

            {/* Social links card */}
            {social.length > 0 && (
              <div className="ai-card p-5 col-span-3 md:col-span-1">
                <div className="hud mb-3">Connect</div>
                <div className="flex flex-wrap gap-2">
                  {social.map((s: any) => (
                    <a
                      key={s.url || s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ai-tag hover:border-accent hover:text-accent transition-colors"
                    >
                      {s.platform?.trim() || s.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Marquee scrolling tech band */}
      {marqueeItems.length > 0 && (
        <div className="mt-16 border-t border-border py-4 overflow-hidden bg-surface/50 relative z-10">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((tag: string, i: number) => (
              <span key={i} className="hud-accent px-8 opacity-70">
                {tag} ·
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
