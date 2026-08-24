// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import CursorGlow from "./CursorGlow";
import MagneticButton from "./MagneticButton";

const headline = "Engineering fast, alive interfaces.";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.25 } },
};

const word = {
  hidden: { y: "115%", rotate: 4 },
  show: { y: "0%", rotate: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  const templateData = useTemplateData();
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  const marqueeSkills = Array.isArray(skills) ? skills.flatMap((s: any) => s.skills || []) : [];
  if (marqueeSkills.length === 0) marqueeSkills.push("React", "TypeScript", "Next.js", "Node.js", "Tailwind");

  return (
    <section className="relative pt-40 pb-16 overflow-hidden">
      <CursorGlow />
      <div
        className="absolute top-24 right-[-10%] w-[420px] h-[420px] rounded-full bg-gradient1 opacity-20 blur-[100px] animate-floaty pointer-events-none"
        aria-hidden
      />

      <div className="section-pad relative">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.6 }}
          className="eyebrow mb-6"
        >
          {profile.name} — {profile.role}
        </motion.p>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-display text-[11vw] leading-[0.95] md:text-[5.6rem] font-bold tracking-tight max-w-4xl"
        >
          {headline.split(" ").map((w, i) => (
            <span key={i} className="inline-block overflow-hidden mr-3 md:mr-4">
              <motion.span variants={word} className="inline-block">
                {w === "alive" ? <span className="text-gradient">{w}</span> : w}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 max-w-lg text-muted text-lg leading-relaxed"
        >
          {profile.subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.6 }}
          className="mt-10 flex items-center gap-4"
        >
          <MagneticButton
            href="#work"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient1 px-7 py-3.5 font-medium text-sm text-white hover:shadow-[0_0_30px_rgba(124,92,255,0.35)] transition-shadow"
          >
            See the work
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </MagneticButton>
        </motion.div>
      </div>

      <div className="mt-20 border-y border-border py-5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeSkills, ...marqueeSkills, ...marqueeSkills].map((s, i) => (
            <span key={i} className="eyebrow px-6 text-ink/50">
              {s} ✦
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
