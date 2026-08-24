// @ts-nocheck
"use client";
import Image from "next/image";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { ExternalLink, FileText } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Projects() {
  const templateData = useTemplateData();
  // @ts-ignore
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

  if (true) {
  const isMissing = (!projects || projects.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="projects" />
      </section>
    );
  }
}
  return (
    <section id="projects" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="My recent works" title="Featured Projects" />

        <div className="space-y-8">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="glass rounded-3xl overflow-hidden grid md:grid-cols-2">
                <div className="relative aspect-[16/10] md:aspect-auto">
                  <Image src={p.image} alt={p.title} fill className="object-cover" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="eyebrow mb-2">{p.period}</div>
                  <h3 className="font-display font-bold text-2xl mb-1">{p.title}</h3>
                  <div className="text-accent text-sm mb-4">{p.subtitle}</div>
                  <p className="text-muted-light dark:text-muted-dark text-sm leading-relaxed mb-5">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-xs text-accent bg-accent/10 rounded-full px-2.5 py-1"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-5 text-sm">
                    {p.caseStudyUrl && (
                      <a
                        href={p.caseStudyUrl}
                        className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
                      >
                        Case Study <FileText size={14} />
                      </a>
                    )}
                    <a
                      href={p.liveUrl}
                      className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
                    >
                      Live Demo <ExternalLink size={14} />
                    </a>
                    <a
                      href={p.codeUrl}
                      className="inline-flex items-center gap-1.5 text-muted-light dark:text-muted-dark hover:text-accent transition-colors"
                    >
                      Code <Github size={14} />
                    </a>
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
