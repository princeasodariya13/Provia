// @ts-nocheck
"use client";
import Image from "next/image";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function About() {
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

  return (
    <section id="about" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="Get to know me" title="About & Vision" />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <blockquote className="font-display font-semibold text-2xl leading-snug mb-6">
              &ldquo;{about.quote || about.summary?.split(".")[0] || "Building with purpose."}&rdquo;
            </blockquote>
            <div className="space-y-4">
              {(about.paragraphs || (about.summary ? [about.summary] : ["Passionate developer building elegant solutions."])).map((p: string, i: number) => (
                <p key={i} className="text-muted leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden glass p-2">
              <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                <Image src={about.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070"} alt="Workstation" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
