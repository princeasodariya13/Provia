"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Briefcase, MapPin, ArrowUpRight } from "lucide-react";

type Exp = PortfolioDocumentDTO["experience"][number];

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" }); }
  catch { return iso; }
}

function ExperienceCard({ item, index }: { item: Exp; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" as const, delay: index * 0.08 }}
      className="group relative"
    >
      {/* Timeline line */}
      <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-violet-500/30 to-transparent" />

      <div className="flex gap-5">
        {/* Timeline dot */}
        <div className="relative z-10 mt-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-violet-500/40 group-hover:bg-violet-500/10 transition-all duration-300">
            <Briefcase className="w-4 h-4 text-white/40 group-hover:text-violet-400 transition-colors" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pb-10">
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 group-hover:border-violet-500/20 group-hover:bg-white/[0.05] transition-all duration-300">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-violet-400/80 font-semibold text-sm">{item.company}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/40 border border-white/8">
                  {item.isCurrent ? "Present" : formatDate(item.endDate)}
                </span>
                {item.startDate && (
                  <p className="text-[11px] text-white/25 mt-1">{formatDate(item.startDate)}</p>
                )}
              </div>
            </div>
            {item.location && (
              <div className="flex items-center gap-1.5 text-xs text-white/30 mb-3">
                <MapPin className="w-3 h-3" />
                {item.location}
              </div>
            )}
            {item.description && (
              <p className="text-sm text-white/50 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ExperienceTimeline({ data }: { data: PortfolioDocumentDTO["experience"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <SectionLabel label="Experience" />
      <div className="mt-10">
        {data.map((item, i) => (
          <ExperienceCard key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

export function SectionLabel({ label }: { label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className="flex items-center gap-4"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 px-4">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  );
}
