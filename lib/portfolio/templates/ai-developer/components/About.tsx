// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function About() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section id="about" className="section-pad py-24 border-b border-border">
      <p className="hud mb-4">Engineering & AI // About</p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-2xl md:text-4xl font-semibold leading-snug max-w-4xl"
      >
        I am {profile.name}, an aspiring developer. I love exploring AI
        systems and building tools that make computers feel smarter.
      </motion.h2>

      <div className="mt-14 grid md:grid-cols-[1fr_auto] gap-10 items-start">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-muted leading-relaxed max-w-xl"
        >
          {profile.bio}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 min-w-[280px]"
        >
          <InfoCard label="Institution" value={profile.institution} />
          <InfoCard label="Focus Areas" value={profile.focusAreas} />
        </motion.div>
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="hud mb-2">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
