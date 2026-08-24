// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Header() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { 
  contact = {},
  profile = {},
  marqueeItems = [],
  certifications = [],
  header = {},
  social = {},
  services = [],
  faq = [],
  milestones = [],
  globals = {},
  steps = [],
  about = {},
  experience = [],
  projects = [],
  skills = [],
  stats = [],
  stack = [],
  capabilities = [],
  education = []
 } = templateData || {};

  const nav = ["Home", "About", "Experience", "Projects", "Contact"];

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-base/80 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#home" className="font-display font-semibold text-lg tracking-tight">
          {profile.initials}
          <span className="text-accent">.</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <a
          href={profile.resumeUrl}
          className="hidden md:inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent transition-colors"
        >
          Resume
        </a>

        <button
          aria-label="Toggle menu"
          className="md:hidden text-ink"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="w-6 h-4 flex flex-col justify-between">
            <span className="h-[1.5px] bg-current" />
            <span className="h-[1.5px] bg-current" />
            <span className="h-[1.5px] bg-current" />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-surface border-t border-border px-6 py-4 flex flex-col gap-4">
          {nav.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </motion.header>
  );
}
