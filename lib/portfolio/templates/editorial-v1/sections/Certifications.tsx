"use client";
import { useState } from "react";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion, AnimatePresence } from "framer-motion";
import { SectionLabel } from "./About";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Cert = PortfolioDocumentDTO["certifications"][number];

export function Certifications({ data }: { data: PortfolioDocumentDTO["certifications"] }) {
  const [selectedGallery, setSelectedGallery] = useState<{ urls: string[], currentIndex: number } | null>(null);

  if (!data || data.length === 0) return null;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <SectionLabel label="Certifications" index="06" />

        <div className="space-y-4">
          {data.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
                className="group border-[2px] border-[#111] bg-white p-0 hover:bg-[#111] transition-all duration-400 overflow-hidden"
              >
                {cert.credentialUrl && cert.credentialUrl !== "#" && (
                  <div className="w-full relative bg-[#F5F0EA] border-b-[2px] border-[#111] overflow-hidden">
                    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                      {cert.credentialUrl.split(",").filter(Boolean).map((url: string, imgIdx: number) => (
                        <div 
                          key={imgIdx}
                          className="w-full h-40 shrink-0 snap-center cursor-pointer relative"
                          onClick={() => setSelectedGallery({ urls: cert.credentialUrl!.split(",").filter(Boolean), currentIndex: imgIdx })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`${cert.name} page ${imgIdx + 1}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none">
                            <span className="opacity-0 group-hover:opacity-100 text-white font-bold tracking-wider text-sm uppercase drop-shadow-md transition-opacity">View</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {cert.credentialUrl.split(",").filter(Boolean).length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm pointer-events-none">
                        {cert.credentialUrl.split(",").filter(Boolean).length} Pages
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#111] group-hover:text-white mb-2 transition-colors leading-tight">
                    {cert.name}
                  </h3>
                  {cert.organization && (
                    <p className="text-xs font-medium text-[#555] group-hover:text-[#CCC] transition-colors leading-relaxed whitespace-pre-wrap break-words">
                      {cert.organization}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          }
        </div>
      </motion.section>

      <AnimatePresence>
        {selectedGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8"
            onClick={() => setSelectedGallery(null)}
          >
            <button 
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors z-[10000]"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGallery(null);
              }}
            >
              <X className="w-8 h-8" />
            </button>

            {selectedGallery.urls.length > 1 && (
              <button
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors z-[10000]"
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
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedGallery.urls[selectedGallery.currentIndex]} 
              alt={`Certificate View ${selectedGallery.currentIndex + 1}`} 
              className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />

            {selectedGallery.urls.length > 1 && (
              <button
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors z-[10000]"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGallery(prev => prev ? { ...prev, currentIndex: (prev.currentIndex + 1) % prev.urls.length } : null);
                }}
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            )}
            
            {selectedGallery.urls.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full z-[10000]">
                {selectedGallery.currentIndex + 1} / {selectedGallery.urls.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



