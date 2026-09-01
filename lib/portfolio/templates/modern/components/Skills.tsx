// @ts-nocheck
"use client";

import { useTemplateData } from "../context";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { Reveal, SectionHeading } from "./Reveal";

export default function Skills() {
  const templateData = useTemplateData();
  const { skills = {} } = (templateData as any) || {};

  const groups = Object.entries(skills as Record<string, string[]>);

  if (groups.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="skills" />
      </section>
    );
  }

  return (
    <section id="skills" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <SectionHeading index="02" label="Skills" title="Tools I build with." />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map(([group, items]: [string, string[]], i: number) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="mn-card p-7 h-full group">
                {/* Category header */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-5 rounded-full bg-accent" />
                  <div className="font-semibold text-sm text-ink">{group}</div>
                </div>
                {/* Skill chips */}
                <div className="flex flex-wrap gap-2">
                  {items.map((s: string, si: number) => (
                    <span key={si} className="mn-tag hover:mn-tag-accent hover:text-accent transition-colors">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
