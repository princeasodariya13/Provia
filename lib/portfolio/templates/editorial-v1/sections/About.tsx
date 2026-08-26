"use client";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";

function SectionLabel({ label, index }: { label: string; index: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="text-[10px] font-black text-[#CC2936] tracking-[0.25em] uppercase">{index}</span>
      <div className="w-8 h-[2px] bg-[#CC2936]" aria-hidden />
      <h3 className="text-xs font-black tracking-[0.25em] uppercase text-[#111]">{label}</h3>
    </div>
  );
}

export { SectionLabel };

export function About({ data }: { data: PortfolioDocumentDTO["about"] }) {
  if (!data.summary) return null;
  const sentences = data.summary.split(/(?<=[.!?])\s+/).filter(Boolean);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <SectionLabel label="About Me" index="01" />

      {/* Pull-quote — first sentence large */}
      <blockquote className="border-l-[3px] border-[#CC2936] pl-5 mb-8">
        <p className="text-xl md:text-2xl font-semibold text-[#111] leading-snug tracking-tight">
          &ldquo;{sentences[0] || data.summary}&rdquo;
        </p>
      </blockquote>

      {/* Remaining sentences */}
      {sentences.length > 1 && (
        <div className="space-y-4">
          {sentences.slice(1).map((s, i) => (
            <p key={i} className="text-base text-[#555] leading-relaxed font-light">
              {s}
            </p>
          ))}
        </div>
      )}

      {/* Career themes */}
      {data.careerThemes && data.careerThemes.length > 0 && (
        <div className="mt-8 pt-8 border-t border-[#D9D2C9]">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#888] mb-4">Focus Areas</p>
          <div className="flex flex-col gap-2">
            {data.careerThemes.map((theme, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#E5DDD6] last:border-0">
                <div className="w-1.5 h-1.5 bg-[#CC2936] shrink-0" aria-hidden />
                <span className="text-sm font-semibold text-[#333] uppercase tracking-wide">{theme}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}
