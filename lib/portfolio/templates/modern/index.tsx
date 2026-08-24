// @ts-nocheck
"use client";

import React from "react";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Education from "./components/Education";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export function modernTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  return (
    <div className="modern-theme bg-white min-h-screen text-gray-900 font-sans">
      <TemplateProvider data={data}>
        <Header />
        <Hero />
        <About />
        <Experience />
        <Education />
        <Projects />
        <Skills />
        <Contact />
        <Footer />
      </TemplateProvider>
    </div>
  );
}

export const modernMetadata = {
  id: "modern-minimal",
  name: "Modern Minimal",
  version: "1.0.0",
  description: "A refined minimalist portfolio focused on typography, whitespace, clear content hierarchy, and professional presentation.",
  category: "Minimal",
  tags: ["Minimal","Elegant","Developer"],
  audience: ["Developers","Students","Freelancers"],
  style: "Minimal",
  recommended: false,
  supportedSections: ["hero", "about", "experience", "projects", "skills", "contact"],
};