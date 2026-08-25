import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";

export function About({ data }: { data: PortfolioDocumentDTO["about"] }) {
  if (!data.summary) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">About</h3>
      </div>
      <p className="text-xl md:text-2xl font-medium leading-relaxed text-[#4D4D4D] tracking-tight">
        {data.summary}
      </p>
    </motion.section>
  );
}
