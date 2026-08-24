// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Milestones() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section id="milestones" className="section-pad py-24 border-b border-border">
      <p className="hud mb-4">Key Milestones</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-14">
        Achievements & journey.
      </h2>

      <div className="relative border-l border-border ml-2">
        {milestones.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative pl-10 pb-12 last:pb-0"
          >
            <span className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
            <div className="hud mb-2 flex gap-3 text-ink/60">
              <span className="text-accent">{m.tag}</span>
              <span>{m.date}</span>
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">{m.title}</h3>
            <p className="text-muted text-sm leading-relaxed max-w-lg">{m.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
