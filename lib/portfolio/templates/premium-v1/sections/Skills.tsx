"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { SectionLabel } from "./Experience";

const PROFICIENCY_COLORS: Record<string, string> = {
  expert: "bg-violet-500",
  advanced: "bg-cyan-500",
  intermediate: "bg-emerald-500",
  beginner: "bg-white/30",
};

function SkillTag({ name, delay }: { name: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" as const, delay }}
      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-white/60 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10 cursor-default transition-all duration-300"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 group-hover:bg-violet-400 transition-colors" />
      {name}
    </motion.span>
  );
}

export function SkillsCloud({ data }: { data: PortfolioDocumentDTO["skills"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <SectionLabel label="Skills & Expertise" />
      <div className="mt-10 space-y-8">
        {data.map((group, gi) => (
          <div key={gi}>
            <h3 className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">{group.category}</h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill, si) => (
                <SkillTag key={si} name={skill} delay={(gi * 0.05) + (si * 0.03)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
