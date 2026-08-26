// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Header() {
  const templateData = useTemplateData();
  const { profile = {}, socials = [] } = (templateData as any) || {};

  const nav = [
    { label: "About",      href: "#about" },
    { label: "Skills",     href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "Projects",   href: "#projects" },
    { label: "Contact",    href: "#contact" },
  ];

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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base/90 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-12 h-18 py-4">
        {/* Logo */}
        <a href="#home" className="font-display font-black text-xl tracking-tight text-ink">
          {profile.name?.charAt(0) || "P"}
          <span className="text-accent">.</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted hover:text-accent transition-colors relative group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          {socials.slice(0, 1).map((s: any) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer"
              className="section-label text-muted hover:text-accent transition-colors"
            >
              {s.platform?.trim() || s.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"}
            </a>
          ))}
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white font-semibold text-xs px-5 py-2.5 hover:bg-accent/90 transition-all hover:shadow-md"
          >
            Contact
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label="Toggle menu"
          className="md:hidden text-ink p-1"
          onClick={() => setOpen(v => !v)}
        >
          <div className="w-6 h-4 flex flex-col justify-between">
            <span className={`h-[1.5px] bg-current transition-all ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`h-[1.5px] bg-current transition-all ${open ? "opacity-0" : ""}`} />
            <span className={`h-[1.5px] bg-current transition-all ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-base border-t border-border px-6 py-5 flex flex-col gap-4 shadow-lg"
        >
          {nav.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted hover:text-accent transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)}
            className="inline-flex justify-center items-center rounded-full bg-accent text-white font-semibold text-xs px-5 py-2.5 mt-2"
          >
            Contact
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}
