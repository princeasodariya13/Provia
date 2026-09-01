"use client";
import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

type Cert = PortfolioDocumentDTO["certifications"][number];

export function CertificationsSection({ data }: { data: PortfolioDocumentDTO["certifications"] }) {
  const [selectedGallery, setSelectedGallery] = useState<{ urls: string[], currentIndex: number } | null>(null);

  if (!data || data.length === 0) return null;

  return (
    <>
      <section className="py-28 md:py-36 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
        <SectionHeader index="06" label="Certifications" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {data.map((cert, i) => (
            <CertCard key={i} cert={cert} index={i} onSelect={(gallery) => setSelectedGallery(gallery)} />
          ))}
        </div>
      </section>

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
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
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
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full z-[10000] border border-amber-400/20">
                {selectedGallery.currentIndex + 1} / {selectedGallery.urls.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CertCard({ cert, index, onSelect }: { cert: Cert; index: number; onSelect: (gallery: { urls: string[], currentIndex: number }) => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: (index % 3) * 0.09 }}
      className="group relative overflow-hidden rounded-2xl border transition-all duration-400 bg-gradient-to-br from-amber-500/[0.08] via-transparent to-orange-500/[0.05] border-amber-500/15 hover:border-amber-400/35 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col h-full"
    >
      {/* Top shine */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      {cert.credentialUrl && cert.credentialUrl !== "#" && (
        <div className="w-full relative border-b border-amber-500/20 overflow-hidden shrink-0 bg-black/20">
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
            {cert.credentialUrl.split(",").filter(Boolean).map((url: string, imgIdx: number) => (
              <div 
                key={imgIdx}
                className="w-full h-48 shrink-0 snap-center cursor-pointer relative"
                onClick={() => onSelect({ urls: cert.credentialUrl!.split(",").filter(Boolean), currentIndex: imgIdx })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`${cert.name} page ${imgIdx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors pointer-events-none">
                  <span className="opacity-0 group-hover:opacity-100 text-white font-bold tracking-wider text-sm uppercase drop-shadow-lg transition-opacity">View</span>
                </div>
              </div>
            ))}
          </div>
          {cert.credentialUrl.split(",").filter(Boolean).length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-amber-400 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm pointer-events-none border border-amber-400/20">
              {cert.credentialUrl.split(",").filter(Boolean).length} Pages
            </div>
          )}
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-amber-100 transition-colors">
          {cert.name}
        </h3>
        {cert.organization && (
          <p className="text-sm font-medium text-amber-400/70 leading-relaxed flex-1 whitespace-pre-wrap break-words">
            {cert.organization}
          </p>
        )}
      </div>
    </motion.div>
  );
}
