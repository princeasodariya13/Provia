"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { ExternalLink, GitFork, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

type Project = PortfolioDocumentDTO["projects"][number];

const ACCENT_PALETTES = [
  {
    gradient: "from-violet-600/[0.18] to-purple-900/[0.12]",
    border: "border-violet-500/[0.18]",
    hoverBorder: "hover:border-violet-400/40",
    tag: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    dot: "bg-violet-400",
    glow: "shadow-violet-500/20",
  },
  {
    gradient: "from-cyan-600/[0.18] to-blue-900/[0.12]",
    border: "border-cyan-500/[0.18]",
    hoverBorder: "hover:border-cyan-400/40",
    tag: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
    dot: "bg-cyan-400",
    glow: "shadow-cyan-500/20",
  },
  {
    gradient: "from-emerald-600/[0.18] to-teal-900/[0.12]",
    border: "border-emerald-500/[0.18]",
    hoverBorder: "hover:border-emerald-400/40",
    tag: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  {
    gradient: "from-rose-600/[0.18] to-pink-900/[0.12]",
    border: "border-rose-500/[0.18]",
    hoverBorder: "hover:border-rose-400/40",
    tag: "bg-rose-500/15 text-rose-300 border-rose-500/20",
    dot: "bg-rose-400",
    glow: "shadow-rose-500/20",
  },
  {
    gradient: "from-amber-600/[0.18] to-orange-900/[0.12]",
    border: "border-amber-500/[0.18]",
    hoverBorder: "hover:border-amber-400/40",
    tag: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
  },
  {
    gradient: "from-indigo-600/[0.18] to-violet-900/[0.12]",
    border: "border-indigo-500/[0.18]",
    hoverBorder: "hover:border-indigo-400/40",
    tag: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
    dot: "bg-indigo-400",
    glow: "shadow-indigo-500/20",
  },
];

// Bento layout: 0 = full-width, 1&2 = 2-col, 3 = full-width, 4&5 = 2-col, etc.
function getBentoClass(index: number): string {
  const pos = index % 3;
  if (pos === 0) return "md:col-span-3"; // wide card
  return "md:col-span-1"; // narrow cards come in pairs (index 1,2 then 4,5…)
}
// But for groups of 3, we want: wide, narrow, narrow
// Let's use a more intentional bento pattern
function getBentoSpan(index: number, total: number): string {
  // Pattern: [wide], [narrow, narrow], [wide], [narrow, narrow]…
  const group = Math.floor(index / 3);
  const posInGroup = index % 3;

  if (posInGroup === 0) return "md:col-span-3"; // always full width
  return "md:col-span-1 md:col-span-[1.5]"; // won't work — use explicit
}

// Simpler: use the visual pattern index
function getColSpan(i: number): string {
  // Pattern: wide (3), narrow (1), narrow (2), wide (3), narrow (1), narrow (2)
  const mod = i % 3;
  if (mod === 0) return "md:col-span-2 lg:col-span-2"; // first in group: wide
  return "md:col-span-1 lg:col-span-1"; // next two: narrow
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const palette = ACCENT_PALETTES[index % ACCENT_PALETTES.length];
  const isWide = index % 3 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut", delay: (index % 3) * 0.1 }}
      className={isWide ? "md:col-span-2" : "md:col-span-1"}
    >
      <div
        className={`group relative h-full min-h-[240px] md:min-h-[280px] rounded-2xl bg-gradient-to-br ${palette.gradient} border ${palette.border} ${palette.hoverBorder} p-7 md:p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:${palette.glow} hover:-translate-y-1`}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Corner glow on hover */}
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br ${palette.gradient} opacity-0 group-hover:opacity-60 blur-3xl transition-opacity duration-700`} />

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white bg-white/10 shrink-0`}>
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                  {project.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105 text-white/60 hover:text-white"
                  title="Repository"
                >
                  <GitFork className="w-4 h-4" />
                </a>
              )}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-105 text-white/60 hover:text-white"
                  title="Live site"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {project.description ? (
            <p className="text-sm md:text-base text-white/80 leading-relaxed flex-1 mb-6">
              {project.description}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          {/* Tech tags */}
          {project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-5 border-t border-white/[0.07]">
              {project.technologies.slice(0, isWide ? 8 : 5).map((tech, ti) => (
                <span
                  key={ti}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${palette.tag}`}
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > (isWide ? 8 : 5) && (
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold text-white/60 bg-white/[0.04] border border-white/8">
                  +{project.technologies.length - (isWide ? 8 : 5)} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function BentoProjects({ data }: { data: PortfolioDocumentDTO["projects"] }) {
  if (!data || data.length === 0) return null;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 md:py-36 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
      <div ref={ref}>
        <SectionHeader
          index="03"
          label="Projects"
          subtitle={`${data.length} projects — from side-experiments to production apps.`}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 auto-rows-fr">
          {data.map((project, i) => (
            <ProjectCard key={i} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
