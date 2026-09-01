"use client";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";
import { SectionLabel } from "./About";

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
                <div className="w-full h-40 border-b-[2px] border-[#111] overflow-hidden bg-[#F5F0EA]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cert.credentialUrl} alt={cert.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#111] group-hover:text-white mb-2 transition-colors leading-tight">
                  {cert.name}
                </h3>
                {cert.organization && (
                  <p className="text-xs font-medium text-[#555] group-hover:text-[#CCC] transition-colors leading-relaxed">
                    {cert.organization}
                  </p>
                )}
              </div>
            </motion.div>
          ))
        }
      </div>
    </motion.section>
  );
}



