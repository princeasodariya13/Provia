// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { useTemplateData } from "../context";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden grid-bg"
    >
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      <div
        className="absolute -top-40 right-[-10%] w-[560px] h-[560px] rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #5EEAD4, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 w-full">
        <motion.div variants={container} initial="hidden" animate="show">
          {profile.available && (
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="section-label">Available for work</span>
            </motion.div>
          )}

          <motion.h1
            variants={item}
            className="font-display font-semibold text-[13vw] leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl tracking-tight"
          >
            Hi, I&apos;m
            <br />
            <span className="text-accent">{profile.name}</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-xl text-muted text-lg leading-relaxed">
            {profile.tagline}
          </motion.p>

          <motion.div variants={item} className="mt-2 flex items-center gap-2 text-sm text-muted">
            <MapPin size={14} className="text-accent" />
            {profile.location}
          </motion.div>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-base px-6 py-3 text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              View My Work
              <ArrowRight size={16} />
            </a>
            <a
              href={profile.resumeUrl}
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors"
            >
              View Resume
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Signature element: scrolling skill marquee */}
      <div className="absolute bottom-0 inset-x-0 border-t border-border bg-surface/60 backdrop-blur-sm py-4 overflow-hidden">
        <div className="flex w-max animate-marquee">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((word, i) => (
            <span
              key={i}
              className="mx-6 font-mono text-sm uppercase tracking-widest text-muted whitespace-nowrap"
            >
              {word} <span className="text-accent">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
