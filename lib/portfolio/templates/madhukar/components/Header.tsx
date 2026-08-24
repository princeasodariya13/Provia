// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";
import { Moon, Sun, Menu, X } from "lucide-react";
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

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);
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
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto px-6 flex items-center justify-between rounded-2xl transition-all ${
          scrolled ? "glass px-5 py-3" : ""
        }`}
      >
        <a href="#home" className="font-display font-bold text-lg">
          {profile.name}
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-muted-light dark:text-muted-dark hover:text-accent transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {mounted && (
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-full glass flex items-center justify-center hover:border-accent transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center rounded-full bg-accent text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Let&apos;s Talk
          </a>
          <button
            aria-label="Toggle menu"
            className="lg:hidden w-9 h-9 rounded-full glass flex items-center justify-center"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden mx-6 mt-2 glass rounded-2xl px-6 py-4 flex flex-col gap-4">
          {nav.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-light dark:text-muted-dark hover:text-accent transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </motion.header>
  );
}
