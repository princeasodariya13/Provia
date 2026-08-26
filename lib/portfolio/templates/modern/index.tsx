"use client";
// @ts-nocheck

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
  const isHidden = (sectionId: string) => document.configuration?.hiddenSections?.includes(sectionId);

  return (
    <div className="modern-theme bg-base min-h-screen text-ink font-sans">
      <TemplateProvider data={data}>
        <Header />
        {!isHidden("hero")       && <Hero />}
        {!isHidden("about")      && <About />}
        {!isHidden("skills")     && <Skills />}
        {!isHidden("projects")   && <Projects />}
        {!isHidden("experience") && <Experience />}
        {!isHidden("education")  && <Education />}
        {!isHidden("contact")    && <Contact />}
        <Footer />
      </TemplateProvider>
    </div>
  );
}


