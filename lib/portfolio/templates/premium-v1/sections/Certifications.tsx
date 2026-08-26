"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Award, ExternalLink } from "lucide-react";
import { SectionLabel } from "./Experience";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" }); }
  catch { return iso; }
}

export function CertificationsSection({ data }: { data: PortfolioDocumentDTO["certifications"] }) {
  if (!data || data.length === 0) return null;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <SectionLabel label="Certifications" />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((cert, i) => (
          <motion.div
            ref={i === 0 ? ref : undefined}
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" as const, delay: i * 0.07 }}
            className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-600/10 to-orange-600/5 border border-amber-500/15 hover:border-amber-500/30 transition-all duration-300"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-amber-400/80" />
              </div>
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/8 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </a>
              )}
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">{cert.name}</h3>
            <p className="text-xs text-amber-400/60 mt-1 font-semibold">{cert.organization}</p>
            {cert.issueDate && (
              <p className="text-[11px] text-white/25 mt-2 font-mono">{formatDate(cert.issueDate)}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
