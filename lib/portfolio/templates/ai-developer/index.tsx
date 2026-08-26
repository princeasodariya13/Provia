"use client";
// @ts-nocheck

import React from "react";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Milestones from "./components/Milestones";
import Projects from "./components/Projects";
import Stack from "./components/Stack";
import Education from "./components/Education";
import Connect from "./components/Connect";
import Footer from "./components/Footer";

export function aideveloperTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  const isHidden = (sectionId: string) => document.configuration?.hiddenSections?.includes(sectionId);

  return (
    <div className={`ai-developer-theme bg-base min-h-screen text-ink font-sans`}>
      <TemplateProvider data={data}>
        <Nav />
        {!isHidden("hero")       && <Hero />}
        {!isHidden("experience") && <Milestones />}
        {!isHidden("projects")   && <Projects />}
        {!isHidden("skills")     && <Stack />}
        {!isHidden("education")  && <Education />}
        {!isHidden("contact")    && <Connect />}
        <Footer />
      </TemplateProvider>
    </div>
  );
}


