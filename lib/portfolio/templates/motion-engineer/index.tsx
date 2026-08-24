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
import Capabilities from "./components/Capabilities";
import Process from "./components/Process";
import Stats from "./components/Stats";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export function motionengineerTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  return (
    <div className="motion-engineer-theme bg-black min-h-screen text-white font-sans">
      <TemplateProvider data={data}>
        <CursorGlow />
        <Nav />
        <Hero />
        <About />
        <Projects />
        <Capabilities />
        <Process />
        <Stats />
        <Contact />
        <Footer />
      </TemplateProvider>
    </div>
  );
}

export const motionengineerMetadata = {
  id: "motion-creative",
  name: "Motion Creative",
  version: "1.0.0",
  description: "A dynamic portfolio with expressive motion, interactive transitions, and a strong creative-engineering personality.",
  category: "Creative",
  tags: ["Creative","Interactive","Developer"],
  audience: ["Creative Developers","Frontend Engineers","Designers"],
  style: "Dynamic",
  recommended: false,
  supportedSections: ["hero", "about", "experience", "projects", "skills", "contact"],
};