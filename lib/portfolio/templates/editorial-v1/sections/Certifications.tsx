"use client";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";
import { SectionLabel } from "./About";
import { CheckCircle2, ExternalLink, CalendarDays } from "lucide-react";

type Cert = PortfolioDocumentDTO["certifications"][number];

export function Certifications({ data }: { data: PortfolioDocumentDTO["certifications"] }) {
  if (!data || data.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <SectionLabel label="Certifications" index="06" />

      <div className="space-y-4">
        {data.map((cert, i) => {
          const isExpired = cert.expirationDate
            ? new Date(cert.expirationDate) < new Date()
            : false;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
              className="group border-[2px] border-[#111] p-5 hover:bg-[#111] transition-all duration-400"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#111] group-hover:text-white mb-1 transition-colors leading-tight">
                    {cert.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#CC2936] group-hover:text-[#FF7070] transition-colors">
                    {cert.organization}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isExpired ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white bg-[#111] group-hover:bg-[#CC2936] px-2 py-1 transition-colors">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Valid
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#888] group-hover:text-[#CCC] border border-[#CCC] group-hover:border-[#777] px-2 py-1 transition-colors">
                      Expired
                    </span>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 h-7 border border-[#111] group-hover:border-[#555] flex items-center justify-center hover:bg-[#CC2936] hover:border-[#CC2936] transition-all duration-200 text-[#111] group-hover:text-white hover:text-white"
                      title="View credential"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
              {/* Date */}
              {cert.issueDate && (
                <div className="flex items-center gap-1.5 mt-3 text-[10px] font-mono text-[#888] group-hover:text-[#AAAAAA] transition-colors">
                  <CalendarDays className="w-3 h-3" />
                  Issued{" "}
                  {new Date(cert.issueDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                  {cert.expirationDate && (
                    <span className={isExpired ? "text-red-500" : ""}>
                      &nbsp;&middot; Expires{" "}
                      {new Date(cert.expirationDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
