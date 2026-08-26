"use client";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";
import { SectionLabel } from "./About";
import { ExternalLink, GitFork } from "lucide-react";

function getSafeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, "http://localhost");
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) return parsed.href;
    return undefined;
  } catch { return undefined; }
}

type Project = PortfolioDocumentDTO["projects"][number];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const isWide = index % 3 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: (index % 3) * 0.1, duration: 0.6, ease: "easeOut" }}
      className={isWide ? "col-span-1 md:col-span-2" : "col-span-1"}
    >
      <div className="group border-[2px] border-[#111] p-7 md:p-9 flex flex-col h-full hover:bg-[#111] hover:text-[#F5F0EA] transition-all duration-400 min-h-[280px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#888] group-hover:text-[#C9BEB9] mb-2 transition-colors">
              Project {String(index + 1).padStart(2, "0")}
            </p>
            <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#111] group-hover:text-white transition-colors leading-tight">
              {project.name}
            </h4>
          </div>
          {/* Links */}
          <div className="flex items-center gap-2 shrink-0">
            {project.repositoryUrl && (
              <a
                href={getSafeUrl(project.repositoryUrl) || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 border border-[#111] group-hover:border-[#444] flex items-center justify-center hover:bg-[#CC2936] hover:border-[#CC2936] transition-all duration-200"
                title="Repository"
              >
                <GitFork className="w-4 h-4 text-[#111] group-hover:text-white" />
              </a>
            )}
            {project.url && (
              <a
                href={getSafeUrl(project.url) || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 border border-[#111] group-hover:border-[#444] flex items-center justify-center hover:bg-[#CC2936] hover:border-[#CC2936] transition-all duration-200"
                title="Live site"
              >
                <ExternalLink className="w-4 h-4 text-[#111] group-hover:text-white" />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-base md:text-lg text-[#555] group-hover:text-[#CCCBC9] font-light leading-relaxed flex-1 mb-6 transition-colors">
            {project.description}
          </p>
        )}

        {/* Tech tags */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-5 border-t border-[#D9D2C9] group-hover:border-[#333] transition-colors">
            {project.technologies.slice(0, isWide ? 8 : 5).map((tech, j) => (
              <span
                key={j}
                className="text-[10px] font-black uppercase tracking-widest border border-[#111] group-hover:border-[#555] px-3 py-1.5 text-[#111] group-hover:text-[#EEE] transition-all duration-200"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > (isWide ? 8 : 5) && (
              <span className="text-[10px] font-black uppercase tracking-widest text-[#888] group-hover:text-[#AAAAAA] px-2 py-1.5 transition-colors">
                +{project.technologies.length - (isWide ? 8 : 5)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Projects({ data }: { data: PortfolioDocumentDTO["projects"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section>
      <SectionLabel label="Projects" index="03" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {data.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
