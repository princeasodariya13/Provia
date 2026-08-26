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
  const [isBooting, setIsBooting] = React.useState(true);
  const data = mapProviaToTemplate(document);
  const isHidden = (sectionId: string) => document.configuration?.hiddenSections?.includes(sectionId);

  return (
    <div className={`ai-developer-theme bg-base min-h-screen text-ink font-sans ${isBooting ? "h-[100svh] overflow-hidden" : ""}`}>
      <TemplateProvider data={data}>
        <BootSequence onDone={() => setIsBooting(false)} />
        <Nav />
        {!isHidden("hero")       && <Hero />}
        {!isHidden("experience") && <Milestones />}
        {!isHidden("projects")   && <Projects />}
        {!isHidden("skills")     && <Stack />}
        {!isHidden("education")  && <Education />}
        {!isHidden("contact")    && <Connect />}
        <Footer />
      </TemplateProvider>
    </div>
  );
}

export const aideveloperMetadata = {
  id: "ai-technology",
  name: "AI & Technology",
  version: "2.0.0",
  description: "A modern, futuristic HUD-style portfolio for AI engineers, ML developers, and technical innovators.",
  category: "Technology",
  tags: ["Technical", "Modern", "AI", "Futuristic", "Dark"],
  audience: ["AI Engineers", "ML Engineers", "Technical Researchers"],
  style: "Futuristic",
  recommended: true,
  supportedSections: ["hero", "about", "experience", "education", "projects", "skills", "contact"],
};
