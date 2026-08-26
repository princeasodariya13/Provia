// @ts-nocheck
"use client";

import { useTemplateData } from "../context";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { Reveal, SectionHeading } from "./Reveal";

export default function Experience() {
  const templateData = useTemplateData();
  const { experience = [] } = (templateData as any) || {};

  if (!experience || experience.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="experience" />
      </section>
    );
  }

  return (
    <section id="experience" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <SectionHeading index="04" label="Experience" title="Where I've worked." />

        <div className="space-y-0 divide-y divide-border border-t border-border">
          {experience.map((e: any, i: number) => (
            <Reveal key={e.role + i} delay={i * 0.08}>
              <div className="group grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 py-10 hover:bg-surface transition-all duration-300 px-0 hover:px-5 rounded-2xl -mx-5">
                
                {/* Date + company */}
                <div className="pt-1">
                  <div className="section-label mb-2">{e.duration}</div>
                  <div className="text-accent font-semibold text-sm">{e.org?.trim() || "Company"}</div>
                  {e.location && <div className="text-muted text-xs mt-1">{e.location}</div>}
                </div>

                {/* Role + details */}
                <div>
                  <h3 className="font-display text-xl font-bold text-ink mb-3 group-hover:text-accent transition-colors">
                    {e.role?.trim() || "Role"}
                  </h3>
                  {e.points && e.points.length > 0 && (
                    <ul className="space-y-2">
                      {e.points.map((pt: string, j: number) => (
                        <li key={j} className="flex gap-3 text-muted text-sm leading-relaxed">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
