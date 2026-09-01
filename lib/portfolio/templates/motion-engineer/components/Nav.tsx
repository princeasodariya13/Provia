// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import MagneticButton from "./MagneticButton";

export default function Nav() {
  const templateData = useTemplateData();
  const { profile = {}, socials = [] } = (templateData as any) || {};

  const navLinks = [
    { label: "About",      href: "#about" },
    { label: "Work",       href: "#work" },
    { label: "Experience", href: "#experience" },
    { label: "Contact",    href: "#contact" },
  ];

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="section-pad flex items-center justify-between h-20">
        {/* Logo */}
        <a href="#top" className="font-display text-xl font-black tracking-tight">
          <span className="text-ink">{profile.name?.charAt(0) || "P"}</span>
          <span className="text-gradient">.</span>
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className="eyebrow text-muted hover:text-ink transition-colors relative group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-brand transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* CTA */}
        <MagneticButton
          href="#contact"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white font-semibold text-xs px-5 py-2.5 hover:shadow-[0_4px_20px_rgba(124,92,255,0.4)] transition-all hover:-translate-y-0.5"
        >
          Say hello →
        </MagneticButton>
      </div>
    </motion.header>
  );
}
