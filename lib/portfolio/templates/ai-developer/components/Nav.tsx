// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Nav() {
  const templateData = useTemplateData();
  const { profile = {}, email = "", social = [] } = (templateData as any) || {};
  
  const navLinks = [
    { label: "Experience", href: "#milestones" },
    { label: "Projects",   href: "#projects" },
    { label: "Stack",      href: "#stack" },
    { label: "Connect",    href: "#connect" },
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
          ? "bg-base/85 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="section-pad flex items-center justify-between h-20">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
          <span className="hud-accent text-sm font-bold tracking-widest group-hover:text-accent transition-colors">
            {profile.name?.split(" ")[0]?.toUpperCase() || "AI.DEV"}
          </span>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hud text-ink-dim hover:text-accent transition-colors relative group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href={email ? `mailto:${email}` : "#connect"}
          className="hud border border-border rounded-full px-4 py-2 text-ink-dim hover:border-accent hover:text-accent hover:bg-accent-dim transition-all"
        >
          Contact →
        </a>
      </div>
    </motion.header>
  );
}
