import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";

export function Education({ data }: { data: PortfolioDocumentDTO["education"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex items-center gap-4 mb-12"
      >
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">Education</h3>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.map((edu, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1 }}
            className="group border border-[#000000] p-8 hover:border-[#CC2936] transition-colors"
          >
            <h4 className="text-xl font-bold uppercase tracking-tight mb-2 group-hover:text-[#CC2936] transition-colors">{edu.institution}</h4>
            <div className="text-sm font-bold text-[#4D4D4D] uppercase tracking-wider mb-4">
              {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
            </div>
            <div className="text-sm font-medium text-[#4D4D4D] uppercase tracking-wider">
              {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} — {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
