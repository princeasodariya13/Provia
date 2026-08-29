"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TemplateLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate template rendering and asset loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 second premium loader
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="template-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white"
        >
          {/* Animated rings */}
          <div className="relative flex items-center justify-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute w-24 h-24 rounded-full border border-white/10 border-t-white/80"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute w-32 h-32 rounded-full border border-white/5 border-b-white/40"
            />
            <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-xl font-bold tracking-[0.2em] uppercase text-white/90">
              Provia Studio
            </h2>
            <p className="text-xs text-white/40 mt-2 tracking-widest uppercase font-mono">
              Initializing Template
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
