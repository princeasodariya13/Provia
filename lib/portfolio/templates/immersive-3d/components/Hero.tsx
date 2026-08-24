// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTemplateData } from "../context";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

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
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <Hero3D />
      <div className="absolute inset-0 bg-gradient-to-t from-base via-base/60 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 w-full pointer-events-none">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl pointer-events-auto"
        >
          {profile.available && (
            <motion.div variants={item} className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan" />
              </span>
              <span className="eyebrow">Available for work</span>
            </motion.div>
          )}

          <motion.h1
            variants={item}
            className="font-display font-bold text-[12vw] leading-[1.02] sm:text-5xl md:text-6xl tracking-tight"
          >
            {profile.name}
          </motion.h1>

          <motion.p variants={item} className="mt-4 gradient-text font-display font-semibold text-xl sm:text-2xl">
            {profile.headline}
          </motion.p>

          <motion.p variants={item} className="mt-5 max-w-lg text-muted text-lg leading-relaxed">
            {profile.tagline}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-cyan text-base px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              View My Work
              <ArrowRight size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium hover:border-cyan transition-colors"
            >
              Contact Me
            </a>
          </motion.div>

          <motion.p variants={item} className="mt-10 text-xs text-muted font-mono">
            Drag to rotate the scene
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
