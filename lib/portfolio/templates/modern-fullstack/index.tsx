"use client";
// @ts-nocheck

import React from "react";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export function modernfullstackTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  const hidden = document.configuration?.hiddenSections || [];
  const isHidden = (id: string) => hidden.includes(id);

  return (
    <div className="modern-fullstack-theme relative min-h-screen bg-[#f7f5ef] text-[#1e2419] font-sans selection:bg-[#3f7d58] selection:text-[#ffffff]">
      <TemplateProvider data={data}>
        <Nav />
        {!isHidden("hero") && <Hero />}
        {!isHidden("about") && <About />}
        {!isHidden("experience") && <Experience />}
        {!isHidden("projects") && <Projects />}
        {!isHidden("skills") && <Skills />}
        {!isHidden("certifications") && <Certifications />}
        {!isHidden("contact") && <Contact />}
        <Footer />
      </TemplateProvider>
    </div>
  );
}


