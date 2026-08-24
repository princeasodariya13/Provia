// @ts-nocheck
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

// Dynamically import heavy 3D component
const Hero3DBackground = dynamic(() => import("./components/Hero3D"), { ssr: false });

import About from "./components/About";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Skills from "./components/Skills";

export function immersive3dTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  return (
    <div className="immersive-3d-theme relative min-h-screen bg-[#050508] text-[#f1f1fa] font-sans selection:bg-[#5ef7f0] selection:text-[#050508]">
      <TemplateProvider data={data}>
        <Header />
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
        <Footer />
      </TemplateProvider>
    </div>
  );
}

export const immersive3dMetadata = {
  id: "immersive-3d",
  name: "Immersive 3D",
  version: "1.0.0",
  description: "A visually rich interactive 3D portfolio for developers, creative technologists and digital creators who want an unforgettable presence.",
  category: "Creative",
  tags: ["3D", "Interactive", "Creative"],
  audience: ["Creative Technologists", "Digital Creators", "Developers"],
  style: "Interactive",
  recommended: true,
  supportedSections: ["hero", "about", "experience", "projects", "skills", "contact"],
};
