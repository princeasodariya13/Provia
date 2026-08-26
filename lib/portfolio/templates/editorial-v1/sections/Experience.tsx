"use client";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";
import { SectionLabel } from "./About";
import { MapPin } from "lucide-react";

type Exp = PortfolioDocumentDTO["experience"][number];

function formatYear(iso?: string | null) {
  if (!iso) return "";
  try { return new Date(iso).getFullYear().toString(); } catch { return iso; }
}

function formatDuration(start?: string | null, end?: string | null, isCurrent?: boolean) {
  const s = start ? new Date(start) : null;
  const e = end && !isCurrent ? new Date(end) : new Date();
  if (!s) return "";
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 12) return `${months}mo`;
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${yrs}y ${rem}mo` : `${yrs}y`;
}

function ExperienceItem({ exp, index }: { exp: Exp; index: number }) {
  const duration = formatDuration(exp.startDate, exp.endDate, exp.isCurrent);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: Math.min(index * 0.08, 0.4), duration: 0.6, ease: "easeOut" }}
      className="group relative"
    >
      {/* Diamond marker */}
      <div
        className="absolute -left-[49px] top-3 w-4 h-4 rotate-45 bg-[#111] group-hover:bg-[#CC2936] transition-colors duration-300"
        aria-hidden
      />

      <div className="pb-16 last:pb-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3">
          <h4
            className="font-black uppercase tracking-tight text-[#111] leading-tight"
            style={{ fontSize: "clamp(1.25rem, 3vw, 1.875rem)" }}
          >
            {exp.title}
          </h4>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-[#888] uppercase tracking-widest font-mono">
              {formatYear(exp.startDate)} — {exp.isCurrent ? "Present" : formatYear(exp.endDate)}
            </span>
            {duration && (
              <span className="text-[10px] font-bold text-[#F5F0EA] bg-[#111] px-2 py-0.5 uppercase tracking-widest">
                {duration}
              </span>
            )}
          </div>
        </div>

        {/* Company + location */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-lg font-bold text-[#CC2936]">{exp.company}</span>
          {exp.isCurrent && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#CC2936] text-white px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Current
            </span>
          )}
          {exp.location && (
            <span className="flex items-center gap-1 text-sm text-[#888] font-medium">
              <MapPin className="w-3 h-3" />
              {exp.location}
            </span>
          )}
        </div>

        {/* Description */}
        {exp.description && (
          <p className="text-base md:text-lg text-[#555] font-light leading-relaxed max-w-2xl">
            {exp.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function Experience({ data }: { data: PortfolioDocumentDTO["experience"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section>
      <SectionLabel label="Experience" index="02" />
      <div className="border-l-[2px] border-[#111] pl-12 md:pl-16">
        {data.map((exp, i) => (
          <ExperienceItem key={i} exp={exp} index={i} />
        ))}
      </div>
    </section>
  );
}
