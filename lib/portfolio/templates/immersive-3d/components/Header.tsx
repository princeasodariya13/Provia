// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
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
      transition={{ duration: 0.6 }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors ${
        scrolled ? "glass" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#home" className="font-display font-bold text-lg tracking-tight">
          {profile.name.split(" ")[0]}
          <span className="text-cyan">.</span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((item, i) => (
            <a
              key={i}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-muted hover:text-cyan transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="hidden lg:inline-flex items-center rounded-full glow-border px-5 py-2.5 text-sm font-medium text-ink hover:text-cyan transition-colors"
        >
          Let&apos;s Talk
        </a>

        <button
          aria-label="Toggle menu"
          className="lg:hidden text-ink"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden glass px-6 py-4 flex flex-col gap-4">
          {nav.map((item, i) => (
            <a
              key={i}
              href={`#${item.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-sm text-muted hover:text-cyan transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </motion.header>
  );
}
