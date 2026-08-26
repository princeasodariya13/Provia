// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Nav() {
  const templateData = useTemplateData();
  const { profile = {}, socials = [] } = (templateData as any) || {};

  const navLinks = (templateData as any)?.navLinks || [
    { label: "Profile",     href: "#profile" },
    { label: "Work",        href: "#work" },
    { label: "Experience",  href: "#experience" },
    { label: "Contact",     href: "#contact" },
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
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base/75 backdrop-blur-xl border-b border-border shadow-[0_1px_0_rgba(255,255,255,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="section-pad flex items-center justify-between h-20">

        {/* Logo */}
        <a
          href="#top"
          className="font-display text-2xl font-black tracking-tighter text-ink hover:text-accent transition-colors"
        >
          {profile.initial || "P"}
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link: any) => (
            <a
              key={link.href}
              href={link.href}
              className="eyebrow text-muted hover:text-accent transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right: socials + CTA */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-5">
            {(socials || []).slice(0, 2).map((s: any) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="eyebrow text-muted hover:text-accent transition-colors"
              >
                {s.label?.trim() || s.href?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="eyebrow border border-border rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-all hover:bg-accent-dim"
          >
            Contact →
          </a>
        </div>
      </div>
    </motion.header>
  );
}
