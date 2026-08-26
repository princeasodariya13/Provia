"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SectionHeaderProps {
  index: string; // e.g. "01"
  label: string; // e.g. "Experience"
  subtitle?: string;
}

export function SectionHeader({ index, label, subtitle }: SectionHeaderProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mb-16"
    >
      <div className="flex items-end gap-6">
        <span className="text-[80px] md:text-[120px] font-black leading-none text-white/[0.04] select-none tabular-nums">
          {index}
        </span>
        <div className="pb-3">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-violet-400/60 mb-2">
            {index}
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-none">
            {label}
          </h2>
          {subtitle && (
            <p className="text-sm text-white/40 mt-3 max-w-md leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-violet-500/30 via-white/10 to-transparent mt-4" />
    </motion.div>
  );
}

// Compact inline divider used between major sections
export function GradientDivider() {
  return (
    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
  );
}
