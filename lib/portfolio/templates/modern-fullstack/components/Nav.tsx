// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Nav() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile = {}, email = "" } = templateData || {};
  const navLinks = [
    { label: "Profile", href: "#profile" },
    { label: "Work", href: "#work" },
    { label: "Experience", href: "#experience" }
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
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-base/90 backdrop-blur-md border-b border-border" : ""
      }`}
    >
      <div className="section-pad flex items-center justify-between h-20">
        <a href="#top" className="font-display text-lg font-bold tracking-tight text-deep">
          AS<span className="text-accent">.</span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="eyebrow text-ink/70 hover:text-accent transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href={`mailto:${email}`}
          className="eyebrow rounded-full bg-accent text-white px-4 py-2.5 hover:bg-deep transition-colors"
        >
          Resume ↓
        </a>
      </div>
    </motion.header>
  );
}
