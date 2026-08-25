// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import AnimatedCounter from "./AnimatedCounter";

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
    <section className="relative pt-40 pb-20 overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-radial pointer-events-none" />

      <div className="section-pad relative grid md:grid-cols-[1.3fr_1fr] gap-12 items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hud inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 mb-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-blink" />
            {profile.availability}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]"
          >
            {profile.name}
            <span className="text-accent">.</span>
            <br />
            <span className="text-muted text-2xl md:text-3xl font-medium">
              {profile.role}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-muted text-lg max-w-xl leading-relaxed"
          >
            {profile.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8"
          >
            <a
              href="#connect"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-base px-6 py-3 hud font-medium hover:opacity-90 transition-opacity"
            >
              Let&apos;s Connect →
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-surface p-5 text-center"
            >
              <div className="font-display text-3xl font-bold text-accent">
                <AnimatedCounter value={s.value} />
              </div>
              <div className="hud mt-2">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-16 border-t border-border py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((tag, i) => (
            <span key={i} className="hud px-6 text-ink/60">
              {tag} •
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
