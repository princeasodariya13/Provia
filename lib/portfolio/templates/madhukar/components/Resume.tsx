// @ts-nocheck
"use client";
import { Download } from "lucide-react";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Resume() {
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
    <section id="resume" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="Curriculum vitae" title="Download Resume" />

        <Reveal className="glass rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-3xl">
          <div>
            <h3 className="font-display font-semibold text-xl mb-1">{profile.name} — Resume</h3>
            <p className="text-muted text-sm">
              A comprehensive overview of skills, education, and project experience.
            </p>
          </div>
          <a
            href={profile.resumeUrl}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            Download PDF
            <Download size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
