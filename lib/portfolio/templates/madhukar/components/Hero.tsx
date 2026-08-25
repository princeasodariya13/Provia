// @ts-nocheck
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTemplateData } from "../context";

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
    <section id="home" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      <div className="blob absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-accent animate-blob pointer-events-none" />
      <div
        className="blob absolute bottom-0 right-[-10%] w-[380px] h-[380px] rounded-full bg-accent2 animate-blob pointer-events-none"
        style={{ animationDelay: "4s" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-5 gap-12 items-center">
        <motion.div variants={container} initial="hidden" animate="show" className="lg:col-span-3">
          {profile.available && (
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="eyebrow">Available for opportunities</span>
            </motion.div>
          )}

          <motion.h1
            variants={item}
            className="font-display font-bold text-[11vw] leading-[1.02] sm:text-5xl md:text-6xl tracking-tight"
          >
            {(profile.headline || profile.name || "Professional").split(" ").map((w: string, i: number) =>
              i === 1 ? (
                <span key={i} className="gradient-text">
                  {w}{" "}
                </span>
              ) : (
                <span key={i}>{w} </span>
              )
            )}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-lg text-muted-light dark:text-muted-dark text-lg leading-relaxed"
          >
            {profile.bio}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get In Touch
              <ArrowRight size={16} />
            </a>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium hover:border-accent transition-colors"
            >
              View My Work
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-12 flex gap-10">
            {(profile.stats || []).map((s: any) => (
              <div key={s.label}>
                <div className="font-display font-bold text-3xl">{s.value}</div>
                <div className="eyebrow mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2 relative"
        >
          <div className="relative aspect-[4/5] max-w-sm mx-auto rounded-[2rem] overflow-hidden glass p-2">
            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
              <Image src={about.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070"} alt={profile.name} fill className="object-cover" priority />
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-5 py-2 whitespace-nowrap">
            <span className="eyebrow">I am {profile.name}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
