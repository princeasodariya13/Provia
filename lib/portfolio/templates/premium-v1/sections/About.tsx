"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { SectionHeader } from "./SectionHeader";

export function AboutSection({ data }: { data: PortfolioDocumentDTO["about"] }) {
  if (!data?.summary) return null;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const sentences = data.summary.split(/(?<=[.!?])\s+/).filter(Boolean);

  return (
    <section className="py-28 md:py-36 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
      <div ref={ref}>
        <SectionHeader index="01" label="About Me" subtitle="A little about who I am and what I bring to the table." />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-start">
          {/* Left: large pull-quote */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-3"
          >
            {/* First sentence as large display text */}
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-[1.3] tracking-tight mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                &ldquo;
              </span>
              {sentences[0] || data.summary}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                &rdquo;
              </span>
            </p>

            {/* Rest of summary as smaller body text */}
            {sentences.length > 1 && (
              <div className="space-y-4">
                {sentences.slice(1).map((sentence, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 + i * 0.08 }}
                    className="text-base md:text-lg text-white/80 leading-relaxed"
                  >
                    {sentence}
                  </motion.p>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Career themes + mini stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Career themes */}
            {data.careerThemes && data.careerThemes.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 mb-5">
                  Areas of Focus
                </p>
                <div className="flex flex-col gap-3">
                  {data.careerThemes.filter(t => t && t.trim().length > 0).map((theme, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 + i * 0.07 }}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 shrink-0" />
                      <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                        {theme}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual accent card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
              className="relative p-6 rounded-2xl overflow-hidden border border-violet-500/15 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-400/50 mb-3">
                  Currently
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-sm font-bold text-white">Open to Work</p>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Seeking full-time roles, freelance contracts, or interesting collaborations.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
