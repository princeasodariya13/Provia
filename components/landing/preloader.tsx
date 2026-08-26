"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LandingPreloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lock scroll while loading
    document.body.style.overflow = "hidden";
    
    // Simulate loading for heavy 3D assets and Spline scenes (3.5 seconds)
    const timer = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = "";
    }, 3500);

    return () => {
      clearTimeout(timer);
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-12 w-48 h-1 bg-border-light overflow-hidden rounded-full"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: "easeInOut" 
                }}
                className="w-full h-full bg-brand"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
