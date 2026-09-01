// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { Award, X } from "lucide-react";
import { useTemplateData } from "../context";

export default function Certifications() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 hover:shadow-lg transition-all"
          >
            {c.url && c.url !== "#" ? (
              <div 
                className="w-full h-48 rounded-xl overflow-hidden bg-surface2 cursor-pointer group relative"
                onClick={() => setSelectedImage(c.url)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                  <span className="opacity-0 group-hover:opacity-100 text-white font-medium drop-shadow-md transition-opacity">Click to view</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 rounded-xl bg-surface2 flex items-center justify-center">
                <Award className="h-10 w-10 text-border" />
              </div>
            )}
            <div>
              <p className="font-display font-bold text-lg text-deep">{c.name}</p>
              {c.organization && (
                <p className="text-muted text-sm mt-2 leading-relaxed">{c.organization}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors z-[101]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          <motion.img 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selectedImage} 
            alt="Certificate View" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
