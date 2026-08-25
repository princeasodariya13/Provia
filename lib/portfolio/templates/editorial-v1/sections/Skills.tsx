import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";

export function Skills({ data }: { data: PortfolioDocumentDTO["skills"] }) {
  if (!data || data.length === 0 || !data[0].skills?.length) return null;

  return (
    <section>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">Skills & Expertise</h3>
      </motion.div>
      <div className="flex flex-col gap-10">
        {data.map((group, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            {group.category && (
              <h4 className="text-lg font-black uppercase tracking-tight mb-4">{group.category}</h4>
            )}
            <ul className="flex flex-col gap-3 text-sm font-bold uppercase tracking-widest text-[#4D4D4D]">
              {group.skills.map((skill, j) => (
                <li key={j} className="flex items-center gap-4 border-b border-[#C9BEB9] pb-3 hover:text-[#CC2936] hover:border-[#000000] transition-colors">
                  <div className="w-2 h-2 bg-[#000000] rounded-none" aria-hidden="true" />
                  {skill}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
