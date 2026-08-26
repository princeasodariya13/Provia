"use client";
// @ts-nocheck

import React from "react";
import { TemplateProps } from "../types";
import { TemplateProvider } from "./context";
import { mapProviaToTemplate } from "./adapter";
import "./style.css";

import ThemeProvider from "./components/ThemeProvider";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Resume from "./components/Resume";
import Services from "./components/Services";
import Skills from "./components/Skills";
import Education from "./components/Education";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export function madhukarTemplate({ document }: TemplateProps) {
  const data = mapProviaToTemplate(document);
  return (
    <div className="madhukar-theme bg-background min-h-screen text-foreground font-sans">
      <TemplateProvider data={data}>
        <ThemeProvider>
          <Header />
          <Hero />
          <About />
          <Experience />
          <Resume />
          <Services />
          <Skills />
          <Education />
          <Projects />
          <Contact />
          <Footer />
        </ThemeProvider>
      </TemplateProvider>
    </div>
  );
}
