// @ts-nocheck
"use client";

import React from "react";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Education from "./components/Education";
import Projects from "./components/Projects";
import Capabilities from "./components/Capabilities";
import Stats from "./components/Stats";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export function engineerTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  const isHidden = (sectionId: string) => document.configuration?.hiddenSections?.includes(sectionId);

  return (
    <div className="engineer-theme bg-base min-h-screen text-ink selection:bg-accent selection:text-base font-sans">
      <TemplateProvider data={data}>
        <Nav />
        {!isHidden("hero") && <Hero />}
        {!isHidden("about") && <About />}
        {!isHidden("experience") && <Experience />}
        {!isHidden("projects") && <Projects />}
        {!isHidden("skills") && <Capabilities />}
        {!isHidden("stats") && <Stats />}
        {!isHidden("skills") && <Stack />}
        {!isHidden("education") && <Education />}
        {!isHidden("contact") && <Contact />}
        <Footer />
      </TemplateProvider>
    </div>
  );
}

export const engineerMetadata = {
  id: "classic-professional",
  name: "Classic Professional",
  version: "1.0.0",
  description: "A clean and timeless portfolio designed for engineers, software developers, and professionals who want a polished professional presence.",
  category: "Professional",
  tags: ["Professional","Developer","Clean"],
  audience: ["Software Engineers","Developers","Professionals"],
  style: "Classic",
  recommended: true,
  supportedSections: ["hero", "about", "experience", "education", "projects", "skills", "contact"],
};
