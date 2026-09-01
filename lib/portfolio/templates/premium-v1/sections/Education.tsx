"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { GraduationCap, CalendarDays, MapPin, BookOpen } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

type Edu = PortfolioDocumentDTO["education"][number];

function EducationCard({ edu, index }: { edu: Edu; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.12 }}
      className="group relative overflow-hidden rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-400 p-7 md:p-8"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      {/* Background glow */}
      <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-violet-500/[0.07] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Icon + Institution */}
        <div className="flex items-start gap-5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-600/15 border border-violet-500/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-violet-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-white leading-tight mb-1">{edu.institution}</h3>
            {edu.degree && (
              <p className="text-sm font-semibold text-violet-400">
                {edu.degree}
                {edu.fieldOfStudy ? <span className="text-white/60"> &middot; {edu.fieldOfStudy}</span> : ""}
              </p>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-xs text-white/60 font-medium mb-5">
          {(edu.startDate || edu.endDate) && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {[formatDate(edu.startDate), formatDate(edu.endDate)].filter(Boolean).join(" – ")}
            </span>
          )}
          {edu.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {edu.location}
            </span>
          )}
        </div>

        {/* Description */}
        {edu.description && (
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-white/50" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Notes</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{edu.description}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function EducationSection({ data }: { data: PortfolioDocumentDTO["education"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section className="py-28 md:py-36 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
      <SectionHeader index="05" label="Education" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {data.map((edu, i) => (
          <EducationCard key={i} edu={edu} index={i} />
        ))}
      </div>
    </section>
  );
}
