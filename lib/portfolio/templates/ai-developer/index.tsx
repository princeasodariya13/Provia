// @ts-nocheck
"use client";

import React from "react";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

import BootSequence from "./components/BootSequence";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Milestones from "./components/Milestones";
import Projects from "./components/Projects";
import Stack from "./components/Stack";
import Education from "./components/Education";
import Connect from "./components/Connect";
import Footer from "./components/Footer";

export function aideveloperTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  return (
    <div className="ai-developer-theme bg-background min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
      <TemplateProvider data={data}>
        <BootSequence />
        <Nav />
        <Hero />
        <Milestones />
        <Projects />
        <Stack />
        <Education />
        <Connect />
        <Footer />
      </TemplateProvider>
    </div>
  );
}

export const aideveloperMetadata = {
  id: "ai-technology",
  name: "AI & Technology",
  version: "1.0.0",
  description: "A modern technology-focused portfolio designed for AI engineers, ML developers, software engineers, and technical innovators.",
  category: "Technology",
  tags: ["Technical","Modern","AI"],
  audience: ["AI Engineers","ML Engineers","Technical Researchers"],
  style: "Modern",
  recommended: true,
  supportedSections: ["hero", "about", "experience", "education", "projects", "skills", "contact"],
};