"use client";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";
import { SectionLabel } from "./About";
import { CalendarDays, MapPin, BookOpen } from "lucide-react";

type Edu = PortfolioDocumentDTO["education"][number];

function formatYear(iso?: string | null) {
  if (!iso) return "";
  try { return new Date(iso).getFullYear().toString(); } catch { return iso; }
}

export function Education({ data }: { data: PortfolioDocumentDTO["education"] }) {
  if (!data || data.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <SectionLabel label="Education" index="05" />

      <div className="space-y-5">
        {data.map((edu, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="group border-[2px] border-[#111]  p-6 hover:bg-[#111]  hover:text-[#F5F0EA] transition-all duration-400"
          >
            <h4 className="text-lg font-black uppercase tracking-tight text-[#111]  group-hover:text-white mb-2 transition-colors">
              {edu.institution}
            </h4>
            {(edu.degree || edu.fieldOfStudy) && (
              <p className="text-sm font-bold text-[#CC2936] mb-3 uppercase tracking-wide group-hover:text-[#FF7070] transition-colors">
                {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" · ")}
              </p>
            )}
            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-xs font-medium text-[#888]  group-hover:text-[#AAAAAA] transition-colors">
              {(edu.startDate || edu.endDate) && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3" />
                  {formatYear(edu.startDate)}
                  {edu.startDate && edu.endDate ? " — " : ""}
                  {edu.endDate ? formatYear(edu.endDate) : "Present"}
                </span>
              )}
              {edu.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {edu.location}
                </span>
              )}
            </div>
            {edu.description && (
              <p className="mt-4 pt-4 border-t border-[#D9D2C9]  group-hover:border-[#333] text-sm text-[#555]  group-hover:text-[#BBBBBB] font-light leading-relaxed transition-all">
                {edu.description}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}



