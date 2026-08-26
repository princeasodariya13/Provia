import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";

export function Certifications({ data }: { data: PortfolioDocumentDTO["certifications"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-px bg-[#CC2936]" />
          <h2 className="text-xl font-bold tracking-widest uppercase">Certifications</h2>
        </div>
        
        <div className="space-y-6">
          {data.map((cert, i) => (
            <div key={i} className="group">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-1 group-hover:text-[#CC2936] transition-colors">{cert.name}</h3>
              <div className="text-sm text-[#4D4D4D]">{cert.organization}</div>
              {cert.issueDate && (
                <div className="text-xs text-[#808080] font-mono mt-1">
                  Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </div>
              )}
              {cert.credentialUrl && (
                <a 
                  href={cert.credentialUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-bold uppercase tracking-widest border-b border-[#000000] pb-0.5 hover:text-[#CC2936] hover:border-[#CC2936] transition-colors"
                >
                  View Credential ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
