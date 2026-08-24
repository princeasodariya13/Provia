// @ts-nocheck
"use client";

import React from "react";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

import About from "./components/About";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Hero3D from "./components/Hero3D";
import Projects from "./components/Projects";
import Skills from "./components/Skills";

export function immersive3dTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  return (
    <div className="immersive-3d-theme relative min-h-screen bg-[#050508] text-[#f1f1fa] font-sans selection:bg-[#5ef7f0] selection:text-[#050508]">
      <TemplateProvider data={data}>
        <About />
        <Contact />
        <Experience />
        <Footer />
        <Header />
        <Hero />
        <Hero3D />
        <Projects />
        <Skills />
      </TemplateProvider>
    </div>
  );
}

export const immersive3dMetadata = {
  id: "immersive-3d",
  name: "Immersive 3D",
  version: "1.0.0",
  description: "A visually rich interactive portfolio designed for developers, creative technologists and digital creators.",
  category: "Creative",
  tags: ["3D", "Interactive", "Creative"],
  audience: ["Creative Technologists", "Digital Creators", "Developers"],
  style: "Interactive",
  recommended: true,
  supportedSections: ["hero", "about", "experience", "projects", "skills", "contact"],
};
