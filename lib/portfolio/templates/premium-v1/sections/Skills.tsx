"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { SectionHeader } from "./SectionHeader";

type SkillGroup = PortfolioDocumentDTO["skills"][number];

const CATEGORY_PALETTES = [
  { accent: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", dot: "bg-violet-400", tag: "hover:bg-violet-500/15 hover:text-violet-200 hover:border-violet-400/30" },
  { accent: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", dot: "bg-cyan-400", tag: "hover:bg-cyan-500/15 hover:text-cyan-200 hover:border-cyan-400/30" },
  { accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400", tag: "hover:bg-emerald-500/15 hover:text-emerald-200 hover:border-emerald-400/30" },
  { accent: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", dot: "bg-rose-400", tag: "hover:bg-rose-500/15 hover:text-rose-200 hover:border-rose-400/30" },
  { accent: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400", tag: "hover:bg-amber-500/15 hover:text-amber-200 hover:border-amber-400/30" },
  { accent: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", dot: "bg-indigo-400", tag: "hover:bg-indigo-500/15 hover:text-indigo-200 hover:border-indigo-400/30" },
];

function SkillGroup({ group, groupIndex }: { group: SkillGroup; groupIndex: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const palette = CATEGORY_PALETTES[groupIndex % CATEGORY_PALETTES.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay: groupIndex * 0.08 }}
      className="p-6 md:p-7 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-white/[0.12] transition-colors duration-300"
    >
      {/* Category header */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-8 h-8 rounded-lg ${palette.bg} border ${palette.border} flex items-center justify-center shrink-0`}>
          <div className={`w-2.5 h-2.5 rounded-full ${palette.dot}`} />
        </div>
        <h3 className={`text-sm font-black uppercase tracking-[0.15em] ${palette.accent}`}>
          {group.category}
        </h3>
        <span className="ml-auto text-[10px] font-bold text-white/50 tabular-nums">
          {group.skills.length}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {group.skills.map((skill, si) => (
          <motion.span
            key={si}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.35, ease: "easeOut", delay: groupIndex * 0.06 + si * 0.025 }}
            className={`cursor-default px-3.5 py-2 rounded-xl text-xs font-semibold text-white/90 bg-white/[0.04] border border-white/[0.08] transition-all duration-200 ${palette.tag}`}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export function SkillsCloud({ data }: { data: PortfolioDocumentDTO["skills"] }) {
  if (!data || data.length === 0) return null;
  const totalSkills = data.reduce((acc, g) => acc + g.skills.length, 0);

  return (
    <section className="py-28 md:py-36 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
      <SectionHeader
        index="04"
        label="Skills"
        subtitle={`${totalSkills} skills across ${data.length} categories`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {data.map((group, gi) => (
          <SkillGroup key={gi} group={group} groupIndex={gi} />
        ))}
      </div>
    </section>
  );
}
