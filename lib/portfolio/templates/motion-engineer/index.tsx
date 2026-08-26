// @ts-nocheck
"use client";

import React from "react";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

import CursorGlow from "./components/CursorGlow";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Education from "./components/Education";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export function motionengineerTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  const isHidden = (sectionId: string) => document.configuration?.hiddenSections?.includes(sectionId);

  return (
    <div className="motion-engineer-theme bg-base min-h-screen text-ink font-sans">
      <TemplateProvider data={data}>
        <CursorGlow />
        <Nav />
        {!isHidden("hero")       && <Hero />}
        {!isHidden("about")      && <About />}
        {!isHidden("projects")   && <Projects />}
        {!isHidden("experience") && <Experience />}
        {!isHidden("education")  && <Education />}
        {!isHidden("contact")    && <Contact />}
        <Footer />
      </TemplateProvider>
    </div>
  );
}

export const motionengineerMetadata = {
  id: "motion-creative",
  name: "Motion Creative",
  version: "2.0.0",
  description: "A dynamic, expressive portfolio with bold purple-pink gradients, magnetic buttons, and smooth motion. Perfect for creative developers and frontend engineers.",
  category: "Creative",
  tags: ["Creative", "Interactive", "Developer", "Gradient", "Dark"],
  audience: ["Creative Developers", "Frontend Engineers", "Designers"],
  style: "Dynamic",
  recommended: true,
  supportedSections: ["hero", "about", "experience", "education", "projects", "skills", "contact"],
};
