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
        scrolled ? "bg-base/85 backdrop-blur-md border-b border-border" : ""
      }`}
    >
      <div className="section-pad flex items-center justify-between h-20">
        <a href="#top" className="hud text-accent">
          SYS.ROOT
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hud text-ink/70 hover:text-accent transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href={`mailto:${email}`}
          className="hud border border-border rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-colors"
        >
          Resume ↓
        </a>
      </div>
    </motion.header>
  );
}
