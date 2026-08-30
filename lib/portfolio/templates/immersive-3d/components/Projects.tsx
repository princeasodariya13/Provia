// @ts-nocheck
import Image from "next/image";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { ExternalLink } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { motion } from "framer-motion";
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
              <motion.div 
                whileHover={{ y: -5, scale: 1.01, boxShadow: "0 20px 40px -10px rgba(94, 247, 240, 0.15)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="group glass rounded-2xl overflow-hidden h-full flex flex-col hover:border-cyan/50 transition-colors"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={p.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&h=400&fit=crop"}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {p.featured && (
                    <span className="absolute top-4 left-4 rounded-full bg-cyan text-base text-xs font-semibold px-3 py-1">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display text-xl font-semibold mb-2">{p.title?.trim() || "Project"}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-4 flex-1">{p.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {(p.tags || []).map((t) => (
                      <span key={t} className="font-mono text-xs text-cyan bg-cyan/10 rounded-full px-2.5 py-1">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-5 text-sm">
                    {p.link && p.link !== "#" && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-ink hover:text-cyan transition-colors">
                        Live Demo <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
