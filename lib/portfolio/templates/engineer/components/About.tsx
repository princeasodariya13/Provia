// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function About() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section className="section-pad py-24 border-t border-border">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="eyebrow mb-4">DEVELOPER · ENGINEER</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            {profile.name}.
          </h2>
          <p className="mt-6 text-muted text-lg leading-relaxed max-w-md">
            {profile.tagline} I build to remove real friction, not to pad a
            resume — every project starts from a concrete problem someone
            actually has.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-4"
        >
          <InfoCard value={profile.age} label="Age" />
          <InfoCard value={profile.commute} label="Daily Commute" />
          <InfoCard value="12+" label="Systems Shipped" />
          <InfoCard value={profile.base} label="Base" />
        </motion.div>
      </div>
    </section>
  );
}

function InfoCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 hover:border-accent/50 transition-colors">
      <div className="font-display text-3xl font-bold text-accent">{value}</div>
      <div className="eyebrow mt-2">{label}</div>
    </div>
  );
}
