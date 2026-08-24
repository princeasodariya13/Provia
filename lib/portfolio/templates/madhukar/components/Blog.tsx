// @ts-nocheck
"use client";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

// Blog posts come from actual user data (projects used as articles placeholder).
// If there are no projects, this section is hidden gracefully.
export default function Blog() {
  const templateData = useTemplateData();
  const { 
  contact = {},
  profile = {},
  marqueeItems = [],
  certifications = [],
  header = {},
  social = {},
  services = [],
  faq = [],
  milestones = [],
  globals = {},
  steps = [],
  about = {},
  experience = [],
  projects = [],
  skills = [],
  stats = [],
  stack = [],
  capabilities = [],
  education = []
 } = templateData || {};

  // Only render this section if there's something to show
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section id="work" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="My Work" title="Featured Projects" />

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {projects.slice(0, 3).map((project, i) => (
            <Reveal key={project.title + i} delay={i * 0.08}>
              <a
                href={project.url || "#"}
                target={project.url && project.url !== "#" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="glass rounded-2xl p-6 h-full flex flex-col hover:border-accent transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="eyebrow">{project.role || "Project"}</span>
                  <span className="text-xs text-muted-light dark:text-muted-dark">{project.year || ""}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 leading-snug">{project.title}</h3>
                {project.description && (
                  <p className="text-muted-light dark:text-muted-dark text-sm leading-relaxed flex-1 line-clamp-3">
                    {project.description}
                  </p>
                )}
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
