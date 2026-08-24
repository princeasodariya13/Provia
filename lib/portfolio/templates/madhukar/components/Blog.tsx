// @ts-nocheck
"use client";
import { ArrowUpRight } from "lucide-react";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Blog() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <section id="blog" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="My engineering articles" title="Latest Articles" />

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {blogPosts.map((post, i) => (
            <Reveal key={post.title} delay={i * 0.08}>
              <a
                href={post.url}
                className="glass rounded-2xl p-6 h-full flex flex-col hover:border-accent transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="eyebrow">{post.category}</span>
                  <span className="text-xs text-muted-light dark:text-muted-dark">{post.readTime}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 leading-snug">{post.title}</h3>
                <p className="text-muted-light dark:text-muted-dark text-sm leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
                  Read Article
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium hover:border-accent transition-colors"
          >
            View All Articles
          </a>
        </Reveal>
      </div>
    </section>
  );
}
