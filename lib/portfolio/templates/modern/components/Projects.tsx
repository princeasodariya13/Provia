// @ts-nocheck
"use client";

import { ExternalLink } from "lucide-react";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Projects() {
  const templateData = useTemplateData();
  const { projects = [] } = (templateData as any) || {};

  if (!projects || projects.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="projects" />
      </section>
    );
  }

  return (
    <section id="projects" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <SectionHeading index="03" label="Projects" title="Selected work." />

        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((p: any, i: number) => (
            <Reveal key={p.title || i} delay={i * 0.08}>
              <div className="mn-card group p-8 h-full flex flex-col cursor-default">

                {/* Top row: index + link */}
                <div className="flex items-center justify-between mb-4">
                  <span className="section-label">{String(i + 1).padStart(2, "0")}</span>
                  {(p.url && p.url !== "#") && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-full text-muted hover:text-accent hover:bg-accent-light transition-all"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>

                <h3 className={`font-display font-bold text-ink mb-3 group-hover:text-accent transition-colors tracking-tight break-words ${(p.title?.length || 0) > 40 ? 'text-sm md:text-base' : (p.title?.length || 0) > 30 ? 'text-base md:text-lg' : (p.title?.length || 0) > 20 ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}>
                  {p.title?.trim() || "Project"}
                </h3>
                <p className="text-muted text-sm leading-relaxed flex-1 mb-4">
                  {p.description}
                </p>

                {/* Tag + repo link */}
                <div className="flex items-center justify-between gap-4 mt-auto pt-4 border-t border-border">
                  {p.tag && (
                    <span className="mn-tag mn-tag-accent">{p.tag}</span>
                  )}
                  <div className="flex items-center gap-3 ml-auto text-xs">
                    {p.repositoryUrl && p.repositoryUrl !== "#" && (
                      <a
                        href={p.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted hover:text-accent transition-colors font-mono"
                        onClick={e => e.stopPropagation()}
                      >
                        Source ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
