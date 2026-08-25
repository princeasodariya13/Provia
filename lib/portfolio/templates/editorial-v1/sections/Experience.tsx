import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";

export function Experience({ data }: { data: PortfolioDocumentDTO["experience"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex items-center gap-4 mb-16"
      >
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">Experience</h3>
      </motion.div>
      
      <div className="space-y-24 border-l-2 border-[#000000] pl-8 md:pl-12">
        {data.map((exp, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -left-[37px] md:-left-[53px] top-2 w-4 h-4 bg-[#000000] group-hover:bg-[#CC2936] transition-colors rounded-none rotate-45" aria-hidden="true" />
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
              <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{exp.title}</h4>
              <span className="text-sm font-bold text-[#4D4D4D] uppercase tracking-widest mt-2 md:mt-0">
                {exp.startDate ? new Date(exp.startDate).getFullYear() : ""} — {exp.isCurrent ? "Present" : (exp.endDate ? new Date(exp.endDate).getFullYear() : "")}
              </span>
            </div>
            <div className="text-xl font-medium text-[#CC2936] mb-6">{exp.company}</div>
            <p className="text-lg text-[#4D4D4D] font-light leading-relaxed max-w-3xl">
              {exp.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
