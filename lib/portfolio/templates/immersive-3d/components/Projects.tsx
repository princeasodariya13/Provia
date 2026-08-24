// @ts-nocheck
import Image from "next/image";
import { ExternalLink } from "lucide-react";
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
    <section id="projects" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="03 // Projects" title="Selected work." />

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} className={p.featured ? "md:col-span-2" : ""}>
              <div className="group glass rounded-2xl overflow-hidden h-full flex flex-col hover:border-cyan transition-colors">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {p.featured && (
                    <span className="absolute top-4 left-4 rounded-full bg-cyan text-base text-xs font-semibold px-3 py-1">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display text-xl font-semibold mb-2">{p.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-4 flex-1">{p.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {p.tags.map((t) => (
                      <span key={t} className="font-mono text-xs text-cyan bg-cyan/10 rounded-full px-2.5 py-1">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-5 text-sm">
                    <a href={p.liveUrl} className="inline-flex items-center gap-1.5 text-ink hover:text-cyan transition-colors">
                      Live Demo <ExternalLink size={14} />
                    </a>
                    <a href={p.codeUrl} className="inline-flex items-center gap-1.5 text-muted hover:text-cyan transition-colors">
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
