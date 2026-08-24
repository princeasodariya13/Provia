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
import Projects from "./components/Projects";
import Capabilities from "./components/Capabilities";
import Process from "./components/Process";
import Stats from "./components/Stats";
import Stack from "./components/Stack";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export function engineerTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  return (
    <div className="engineer-theme bg-base min-h-screen text-ink selection:bg-accent selection:text-base font-sans">
      <TemplateProvider data={data}>
        <Nav />
        <Hero />
        <About />
        <Projects />
        <Capabilities />
        <Process />
        <Stats />
        <Stack />
        <FAQ />
        <Contact />
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
  supportedSections: ["hero", "about", "experience", "projects", "skills", "contact"],
};