"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { GraduationCap } from "lucide-react";
import { SectionLabel } from "./Experience";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" }); }
  catch { return iso; }
}

export function EducationSection({ data }: { data: PortfolioDocumentDTO["education"] }) {
  if (!data || data.length === 0) return null;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <SectionLabel label="Education" />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((edu, i) => (
          <motion.div
            ref={i === 0 ? ref : undefined}
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" as const, delay: i * 0.1 }}
            className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-violet-500/25 hover:bg-white/[0.05] transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-violet-400/80" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white leading-tight">{edu.institution}</h3>
                {edu.degree && (
                  <p className="text-sm text-violet-400/70 mt-1">
                    {edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                  </p>
                )}
                {(edu.startDate || edu.endDate) && (
                  <p className="text-xs text-white/25 mt-2 font-mono">
                    {formatDate(edu.startDate)} {edu.startDate && edu.endDate ? "–" : ""} {formatDate(edu.endDate)}
                  </p>
                )}
                {edu.description && (
                  <p className="text-xs text-white/40 mt-2 leading-relaxed line-clamp-2">{edu.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
