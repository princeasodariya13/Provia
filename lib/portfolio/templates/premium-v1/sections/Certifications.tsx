"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Award, ExternalLink, CalendarDays, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

type Cert = PortfolioDocumentDTO["certifications"][number];

function CertCard({ cert, index }: { cert: Cert; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const isExpired = cert.expirationDate
    ? new Date(cert.expirationDate) < new Date()
    : false;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay: (index % 3) * 0.09 }}
      className="group relative overflow-hidden rounded-2xl border transition-all duration-400 p-6 bg-gradient-to-br from-amber-500/[0.08] via-transparent to-orange-500/[0.05] border-amber-500/15 hover:border-amber-400/35 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
    >
      {/* Top shine */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      <div className="flex items-start justify-between gap-4 mb-5">
        {/* Icon */}
        <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5 text-amber-400" />
        </div>

        {/* Status + Link */}
        <div className="flex items-center gap-2 shrink-0">
          {!isExpired && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
              <CheckCircle2 className="w-3 h-3" />
              Valid
            </span>
          )}
          {isExpired && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white/25 bg-white/5 border border-white/10">
              Expired
            </span>
          )}
          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-amber-500/20 border border-white/8 hover:border-amber-400/30 flex items-center justify-center transition-all duration-200"
              title="View credential"
            >
              <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-amber-400" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-white/95">
        {cert.name}
      </h3>
      <p className="text-sm font-semibold text-amber-400/70 mb-4">{cert.organization}</p>

      {/* Dates */}
      <div className="flex flex-wrap gap-3 text-[11px] text-white/30 font-mono">
        {cert.issueDate && (
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" />
            Issued {formatDate(cert.issueDate)}
          </span>
        )}
        {cert.expirationDate && (
          <span className={`flex items-center gap-1.5 ${isExpired ? "text-red-400/50" : ""}`}>
            Expires {formatDate(cert.expirationDate)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function CertificationsSection({ data }: { data: PortfolioDocumentDTO["certifications"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section className="py-28 md:py-36 px-6 sm:px-10 md:px-16 max-w-7xl mx-auto">
      <SectionHeader index="06" label="Certifications" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {data.map((cert, i) => (
          <CertCard key={i} cert={cert} index={i} />
        ))}
      </div>
    </section>
  );
}
