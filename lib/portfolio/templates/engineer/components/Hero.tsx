// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

const headline = "Engineering resilient systems that scale and adapt.";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.3 },
  },
};

const word = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section id="profile" className="relative pt-40 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_40%,transparent_100%)]" />

      <div className="section-pad relative">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="eyebrow mb-6"
        >
          [01] {profile.name} — Portfolio
        </motion.p>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-display text-[13vw] leading-[0.95] md:text-[6.2rem] font-bold tracking-tight max-w-5xl"
        >
          {headline.split(" ").map((w, i) => (
            <span key={i} className="inline-block overflow-hidden mr-4 md:mr-5">
              <motion.span variants={word} className="inline-block">
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-8 max-w-xl text-muted text-lg leading-relaxed"
        >
          {profile.subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-sm font-medium text-base transition-transform hover:-translate-y-0.5"
          >
            Start a project
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <span className="eyebrow flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent2 animate-blink" />
            {profile.badge}
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
        className="section-pad mt-20 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="md:col-span-2 relative aspect-[16/9] rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(204,255,0,0.12),transparent_60%)]" />
          <div className="absolute bottom-5 left-5 eyebrow">3D Abstract Object</div>
        </div>
        <div className="flex flex-col gap-4">
          <StatChip label={`★ ${profile.age} yrs old`} />
          <StatChip label="✦ 3rd Place — Hackathon" />
          <StatChip label="⚡ TS, REACT, NODE" />
        </div>
      </motion.div>
    </section>
  );
}

function StatChip({ label }: { label: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-border bg-surface px-5 py-4 flex items-center font-mono text-xs text-ink/80">
      {label}
    </div>
  );
}
