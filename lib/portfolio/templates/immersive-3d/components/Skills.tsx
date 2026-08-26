// @ts-nocheck
import { useTemplateData } from "../context";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./Reveal";

export default function Skills() {
  const templateData = useTemplateData();
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

  const skillGroups = Array.isArray(skills) ? skills.map((s: any) => ({
    title: s.category?.trim() || "Skills",
    items: s.skills || []
  })) : [];

  if (true) {
  const isMissing = (!skills || skills.length === 0) && (!stack || stack.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="skills" />
      </section>
    );
  }
}
  return (
    <section id="skills" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="02 // Skills" title="Tools I build with." />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillGroups.map((g, i) => (
            <Reveal key={`${g.title}-${i}`} delay={i * 0.06}>
              <motion.div 
                whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(94, 247, 240, 0.15)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="glass rounded-2xl p-6 h-full hover:border-cyan/50 transition-colors"
              >
                <div className="eyebrow mb-4">{g.title}</div>
                <ul className="space-y-3">
                  {(g.items || []).map((s) => (
                    <li key={s} className="flex items-center gap-3 text-ink">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
                      {s}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
