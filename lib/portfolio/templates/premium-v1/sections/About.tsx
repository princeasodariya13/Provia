"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Quote } from "lucide-react";
import { SectionLabel } from "./Experience";

export function AboutSection({ data }: { data: PortfolioDocumentDTO["about"] }) {
  if (!data?.summary) return null;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <SectionLabel label="About" />
      <div className="mt-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          className="relative"
        >
          <Quote className="absolute -top-4 -left-4 w-8 h-8 text-violet-500/20 rotate-180" />
          <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light pl-6 border-l-2 border-gradient-to-b from-violet-500 to-transparent border-violet-500/30">
            {data.summary}
          </p>
        </motion.div>

        {/* Career themes */}
        {data.careerThemes && data.careerThemes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" as const }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {data.careerThemes.map((theme, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/20 text-violet-300/80"
              >
                {theme}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
