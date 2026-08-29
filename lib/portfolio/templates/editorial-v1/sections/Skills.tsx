"use client";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";
import { SectionLabel } from "./About";

export function Skills({ data }: { data: PortfolioDocumentDTO["skills"] }) {
  if (!data || data.length === 0) return null;
  const totalSkills = data.reduce((acc, g) => acc + g.skills.length, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <SectionLabel label="Skills" index="04" />

      <div className="space-y-8">
        {data.map((group, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
          >
            {group.category && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-[#CC2936] shrink-0" aria-hidden />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#111] ">
                  {group.category}
                </h4>
                <span className="text-[10px] font-bold text-[#AAA] tabular-nums ml-auto">
                  {group.skills.length}
                </span>
              </div>
            )}
            <ul className="flex flex-col divide-y divide-[#E5DDD6]">
              {group.skills.map((skill, j) => (
                <li
                  key={j}
                  className="group flex items-center justify-between py-2.5 px-3 -mx-3 cursor-default hover:bg-[#111]  transition-all duration-200"
                >
                  <span className="text-sm font-semibold text-[#333] group-hover:text-[#F5F0EA] uppercase tracking-wider transition-colors">
                    {skill}
                  </span>
                  <div className="w-1.5 h-1.5 bg-transparent group-hover:bg-[#CC2936] transition-colors shrink-0" />
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Total count footer */}
      <div className="mt-8 pt-6 border-t border-[#D9D2C9]  flex items-center gap-2">
        <div className="w-4 h-[2px] bg-[#CC2936]" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888] ">
          {totalSkills} skills across {data.length} categories
        </p>
      </div>
    </motion.section>
  );
}



