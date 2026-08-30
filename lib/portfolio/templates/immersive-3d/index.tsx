"use client";
// @ts-nocheck
import React from "react";
import dynamic from "next/dynamic";
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
import Projects from "./components/Projects";
import Skills from "./components/Skills";

export function immersive3dTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  const hidden = document.configuration?.hiddenSections || [];
  const isHidden = (id: string) => hidden.includes(id);

  return (
    <div className="immersive-3d-theme relative min-h-screen bg-[#050508] text-[#f1f1fa] font-sans selection:bg-[#5ef7f0] selection:text-[#050508]">
      <TemplateProvider data={data}>
        <Header />
        {!isHidden("hero") && <Hero />}
        {!isHidden("about") && <About />}
        {!isHidden("experience") && <Experience />}
        {!isHidden("projects") && <Projects />}
        {!isHidden("skills") && <Skills />}
        {!isHidden("contact") && <Contact />}
        <Footer />
      </TemplateProvider>
    </div>
  );
}


