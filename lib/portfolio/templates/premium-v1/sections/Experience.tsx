"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

type Exp = PortfolioDocumentDTO["experience"][number];

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function formatDuration(start?: string | null, end?: string | null, isCurrent?: boolean): string {
  const s = start ? new Date(start) : null;
  const e = end && !isCurrent ? new Date(end) : new Date();
  if (!s) return "";
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 12) return `${months}mo`;
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${yrs}y ${rem}mo` : `${yrs}y`;
}

function ExperienceCard({ item, index }: { item: Exp; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isFirst = index === 0;
  const duration = formatDuration(item.startDate, item.endDate, item.isCurrent);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut", delay: Math.min(index * 0.06, 0.4) }}
      className="group relative grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0 md:gap-8"
    >
      {/* Left: Date column */}
      <div className="flex md:flex-col md:items-end md:text-right mb-4 md:mb-0 md:pt-6 gap-3 md:gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-white/70">
          <Calendar className="w-3.5 h-3.5 md:hidden" />
          {item.isCurrent ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Present
            </span>
          ) : (
            formatDate(item.endDate)
          )}
        </div>
        {item.startDate && (
          <span className="text-xs text-white/40 font-mono">{formatDate(item.startDate)}</span>
        )}
        {duration && (
          <span className="text-[10px] text-white/40 font-mono hidden md:block mt-1">
            {duration}
          </span>
        )}
      </div>

      {/* Center: Timeline line & dot */}
      <div className="hidden md:flex flex-col items-center absolute left-[188px] top-0 bottom-0 w-8 -ml-4">
        <div
          className={`w-3 h-3 rounded-full mt-6 shrink-0 z-10 border-2 transition-colors duration-300 ${
            item.isCurrent
              ? "border-emerald-400 bg-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
              : "border-violet-500/50 bg-violet-500/20 group-hover:border-violet-400"
          }`}
        />
        <div className="flex-1 w-px bg-gradient-to-b from-violet-500/25 via-white/8 to-transparent mt-1" />
      </div>

      {/* Right: Card */}
      <div className="md:pb-12">
        <div className="p-6 md:p-8 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-violet-500/25 hover:bg-white/[0.045] transition-all duration-500 shadow-lg hover:shadow-violet-500/10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-white/95">
                {item.title}
              </h3>
              <p className="text-base font-semibold text-violet-400 mt-1">{item.company}</p>
            </div>
            {item.isCurrent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Current
              </span>
            )}
          </div>

          {item.location && (
            <div className="flex items-center gap-1.5 text-xs text-white/60 mb-5 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {item.location}
            </div>
          )}

          {item.description && (
            <p className="text-sm md:text-base text-white/80 leading-[1.8]">
              {item.description}
            </p>
          )}

          {/* Mobile duration badge */}
          {duration && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/6">
              <span className="text-[10px] font-mono text-white/40">{duration}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ExperienceTimeline({ data }: { data: PortfolioDocumentDTO["experience"] }) {
  if (!data || data.length === 0) return null;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 md:py-36 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
      <div ref={ref}>
        <SectionHeader
          index="02"
          label="Experience"
          subtitle={`${data.length} role${data.length !== 1 ? "s" : ""} across my career journey`}
        />
        <div className="relative">
          {data.map((item, i) => (
            <ExperienceCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
