// @ts-nocheck
"use client";

import React from "react";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

import About from "./components/About";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Projects from "./components/Projects";
import Skills from "./components/Skills";

export function modernfullstackTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  return (
    <div className="modern-fullstack-theme relative min-h-screen bg-[#f7f5ef] text-[#1e2419] font-sans selection:bg-[#3f7d58] selection:text-[#ffffff]">
      <TemplateProvider data={data}>
        <About />
        <Certifications />
        <Contact />
        <Experience />
        <Footer />
        <Hero />
        <Nav />
        <Projects />
        <Skills />
      </TemplateProvider>
    </div>
  );
}

export const modernfullstackMetadata = {
  id: "modern-fullstack",
  name: "Modern Fullstack",
  version: "1.0.0",
  description: "A polished full-stack developer portfolio with a modern technical presentation and structured project showcase.",
  category: "Technical",
  tags: ["Fullstack", "Technical", "Modern"],
  audience: ["Fullstack Developers", "Software Engineers", "Backend Developers"],
  style: "Modern",
  recommended: false,
  supportedSections: ["hero", "about", "experience", "education", "projects", "skills", "contact"],
};
