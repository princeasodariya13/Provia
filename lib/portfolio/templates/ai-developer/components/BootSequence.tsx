// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTemplateData } from "../context";

const lines = [
  "INITIALIZING SYSTEM...",
  "LOADING PROFILE MODULE...",
  "MOUNTING PROJECT ARCHIVES...",
  "BOOT SEQUENCE COMPLETE.",
];

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (lineIndex < lines.length - 1) {
      const t = setTimeout(() => setLineIndex((i) => i + 1), 380);
      return () => clearTimeout(t);
    }
  }, [lineIndex]);

  function handleEnter() {
    setVisible(false);
    setTimeout(onDone, 700);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] bg-base flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-scan pointer-events-none" />
          <div className="absolute inset-0 bg-radial pointer-events-none" />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hud mb-6"
          >
            Dev Career FC // {profile.bootYear}
          </motion.p>

          <div className="hud text-left mb-10 h-24 space-y-1">
            {lines.slice(0, lineIndex + 1).map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={i === lineIndex ? "text-accent" : "text-muted"}
              >
                {line}
              </motion.p>
            ))}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: lineIndex >= lines.length - 1 ? 1 : 0, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl md:text-6xl font-bold tracking-tight text-glow text-center px-6"
          >
            {profile.name.toUpperCase()}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: lineIndex >= lines.length - 1 ? 1 : 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-muted text-center max-w-md mt-4 px-6"
          >
            An odyssey through generative AI, agentic systems, and modern
            interfaces — driven by curiosity and build-first design.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: lineIndex >= lines.length - 1 ? 1 : 0, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onClick={handleEnter}
            className="mt-10 group inline-flex items-center gap-3 rounded-full border border-accent/40 px-6 py-3 hud text-accent hover:bg-accent hover:text-base transition-colors"
          >
            Begin the Experience
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </motion.button>

          <div className="absolute bottom-6 hud opacity-60">
            © {profile.bootYear} {profile.firstName.toUpperCase()} — ENGINEERED FOR THE FUTURE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
