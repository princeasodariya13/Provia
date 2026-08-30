"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LandingPreloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lock scroll while loading
    document.body.style.overflow = "hidden";
    
    const loadDuration = 3000;
    const startTime = Date.now();
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.round((elapsed / loadDuration) * 100), 100);
      setProgress(currentProgress);

      if (elapsed < loadDuration) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        // Once 100% is reached, wait a brief moment then hide
        setTimeout(() => {
          setLoading(false);
          document.body.style.overflow = "";
        }, 500);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-surface border-b border-border-strong text-text-primary"
        >
          <div className="flex flex-col items-center text-center px-6">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "backOut" }}
              className="relative w-16 h-16 flex items-center justify-center mb-8"
            >
              <div className="absolute inset-0 border-2 border-brand rounded-full animate-ping opacity-20" />
              <div className="w-12 h-12 bg-brand rounded-full shadow-[0_0_30px_rgba(var(--brand),0.3)]" />
            </motion.div>

            <div className="overflow-hidden mb-4">
              <motion.h1 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary"
              >
                Welcome to Provia.
              </motion.h1>
            </div>

            <div className="overflow-hidden">
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-text-secondary text-base md:text-lg max-w-sm font-medium"
              >
                Preparing a million-dollar professional portfolio experience...
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 w-64 max-w-[80vw] flex flex-col items-center gap-3"
            >
              <div className="flex justify-between w-full text-xs font-bold text-text-muted font-mono tracking-widest uppercase">
                <span>Initializing</span>
                <span className="text-brand tabular-nums">{progress}%</span>
              </div>
              <div className="w-full h-[2px] bg-border-light overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-brand"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.1 }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
