"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { ExternalLink, GitFork } from "lucide-react";
import { SectionLabel } from "./Experience";

type Project = PortfolioDocumentDTO["projects"][number];

const CARD_COLORS = [
  "from-violet-600/20 to-purple-600/10",
  "from-cyan-600/20 to-blue-600/10",
  "from-emerald-600/20 to-teal-600/10",
  "from-rose-600/20 to-pink-600/10",
  "from-amber-600/20 to-orange-600/10",
  "from-indigo-600/20 to-violet-600/10",
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const color = CARD_COLORS[index % CARD_COLORS.length];

  const isWide = index === 0 || (index % 5 === 3);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" as const, delay: (index % 3) * 0.08 }}
      className={`group relative ${isWide ? "md:col-span-2" : "md:col-span-1"}`}
    >
      <div className={`relative h-full rounded-2xl bg-gradient-to-br ${color} border border-white/8 p-6 overflow-hidden hover:border-white/20 transition-all duration-500 hover:scale-[1.02] cursor-default`}>
        {/* Background glow on hover */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10`} />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg font-black text-white/60">
              {project.name.slice(0, 1)}
            </div>
            <div className="flex items-center gap-2">
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <GitFork className="w-3.5 h-3.5 text-white/60" />
                </a>
              )}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white/60" />
                </a>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 leading-tight">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-white/50 leading-relaxed flex-1 line-clamp-3">
              {project.description}
            </p>
          )}

          {/* Tech stack */}
          {project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/8">
              {project.technologies.slice(0, 5).map((tech, ti) => (
                <span
                  key={ti}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/8 text-white/50 border border-white/5"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 5 && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white/30">
                  +{project.technologies.length - 5}
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

  return (
    <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <SectionLabel label="Projects" />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">
        {data.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
