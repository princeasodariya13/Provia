// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Nav() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { 
  contact = {},
  profile = {},
  socials = [],
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

  const safeNavLinks = (templateData as any)?.navLinks || globals?.navLinks || [
    { label: "Profile", href: "#profile" },
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" },
  ];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-base/80 backdrop-blur-md border-b border-border" : ""
      }`}
    >
      <div className="section-pad flex items-center justify-between h-20">
        <a
          href="#top"
          className="font-display text-xl font-bold tracking-tight text-ink"
        >
          {profile.initial}
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {safeNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="eyebrow text-ink/70 hover:text-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          {(socials || []).map((s: {label: string, href: string}) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="eyebrow text-ink/60 hover:text-accent transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className="eyebrow border border-border rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-colors"
        >
          Contact Me →
        </a>
      </div>
    </motion.header>
  );
}
