"use client";
import React from "react";
import { StickyScroll } from "../ui/sticky-scroll-reveal";
import { IconBrandGithub, IconBrandLinkedin, IconWand, IconLayout, IconWorld } from "@tabler/icons-react";

const content = [
  {
    title: "1. Connect Identity",
    description:
      "Link your GitHub and LinkedIn profiles securely. Provia aggregates your commits, professional history, and repositories automatically. We pull your entire digital footprint into one unified data layer without any manual data entry.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-brand-muted text-brand relative overflow-hidden">
        <div className="flex gap-8 items-center z-10">
          <IconBrandGithub size={80} stroke={1.5} />
          <div className="w-16 h-[2px] bg-brand opacity-30" />
          <IconBrandLinkedin size={80} stroke={1.5} />
        </div>
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-[size:20px_20px]" />
      </div>
    ),
  },
  {
    title: "2. AI Extraction",
    description:
      "Upload your outdated PDF resume. Our proprietary AI intelligence parses your unstructured career data, identifies key achievements, and maps them to standard industry metrics. It turns raw text into a structured professional narrative.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-surface-muted text-text-primary relative overflow-hidden border-border-light border">
        <IconWand size={100} stroke={1} className="text-brand absolute" />
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:20px_20px]" />
      </div>
    ),
  },
  {
    title: "3. Editorial Layouts",
    description:
      "Choose from premium, typography-first editorial templates designed by top-tier UI architects. Your data is dynamically flowed into beautiful, responsive components with perfect spacing, color harmony, and micro-interactions.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-brand text-white relative overflow-hidden">
        <IconLayout size={100} stroke={1} className="z-10" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
      </div>
    ),
  },
  {
    title: "4. Global Reach",
    description:
      "Publish your portfolio to a custom Provia domain with a single click. Your site is instantly optimized for SEO, accessibility, and high performance across the globe. Stand out to recruiters anywhere in the world instantly.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-text-primary text-white relative overflow-hidden">
        <IconWorld size={120} stroke={0.5} className="z-10 text-brand" />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="w-full relative z-10 py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary">
            How it works
          </h2>
          <p className="text-lg text-text-secondary mt-4 max-w-xl">
            From fragmented profiles to a cohesive professional identity in four seamless steps.
          </p>
        </div>
        <StickyScroll content={content} />
      </div>
    </section>
  );
}
