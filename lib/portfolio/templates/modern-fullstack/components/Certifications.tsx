// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { Award, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTemplateData } from "../context";

export default function Certifications() {
  const [selectedGallery, setSelectedGallery] = useState<{ urls: string[], currentIndex: number } | null>(null);
  const templateData = useTemplateData();
  // @ts-ignore
  const { 
  contact = {},
  profile = {},
  marqueeItems = [],
  certifications = [],
  header = {},
  social = {},
  services = [],
  faq = [],
  milestones = [],
  globals = {},
  steps = [],
  about = {},
  experience = [],
  projects = [],
  skills = [],
  stats = [],
  stack = [],
  capabilities = [],
  education = []
 } = templateData || {};

  if (true) {
  const isMissing = (!certifications || certifications.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="certifications" />
      </section>
    );
  }
}
  return (
    <section id="certifications" className="section-pad py-24 border-b border-border">
      <p className="eyebrow mb-4">Milestones</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-deep mb-14">
        Certifications.
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {certifications.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 hover:shadow-lg transition-all group"
          >
            {c.credentialUrl && c.credentialUrl !== "#" ? (
              <div className="w-full relative bg-surface2 border-b border-border overflow-hidden rounded-xl">
                <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                  {c.credentialUrl.split(",").filter(Boolean).map((url: string, imgIdx: number) => (
                    <div 
                      key={imgIdx}
                      className="w-full h-48 shrink-0 snap-center cursor-pointer relative"
                      onClick={() => setSelectedGallery({ urls: c.credentialUrl.split(",").filter(Boolean), currentIndex: imgIdx })}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${c.name} page ${imgIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none">
                        <span className="opacity-0 group-hover:opacity-100 text-white font-medium drop-shadow-md transition-opacity">View</span>
                      </div>
                    </div>
                  ))}
                </div>
                {c.credentialUrl.split(",").filter(Boolean).length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm pointer-events-none">
                    {c.credentialUrl.split(",").filter(Boolean).length} Pages
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-48 rounded-xl bg-surface2 flex items-center justify-center">
                <Award className="h-10 w-10 text-border" />
              </div>
            )}
            <div>
              <p className="font-display font-bold text-lg text-deep">{c.name}</p>
              {c.organization && (
                <p className="text-muted text-sm mt-2 leading-relaxed whitespace-pre-wrap break-words">{c.organization}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedGallery && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
          onClick={() => setSelectedGallery(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors z-[101]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedGallery(null);
            }}
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          {selectedGallery.urls.length > 1 && (
            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors z-[101]"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGallery(prev => prev ? { ...prev, currentIndex: (prev.currentIndex - 1 + prev.urls.length) % prev.urls.length } : null);
              }}
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          )}

          <motion.img 
            key={selectedGallery.currentIndex}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            src={selectedGallery.urls[selectedGallery.currentIndex]} 
            alt={`Certificate View ${selectedGallery.currentIndex + 1}`} 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {selectedGallery.urls.length > 1 && (
            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors z-[101]"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGallery(prev => prev ? { ...prev, currentIndex: (prev.currentIndex + 1) % prev.urls.length } : null);
              }}
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          )}
          
          {selectedGallery.urls.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full z-[101]">
              {selectedGallery.currentIndex + 1} / {selectedGallery.urls.length}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
