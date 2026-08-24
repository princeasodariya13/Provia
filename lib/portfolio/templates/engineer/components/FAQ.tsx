// @ts-nocheck
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTemplateData } from "../context";
import { Plus } from "lucide-react";

export default function FAQ() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  const faqs = templateData?.faqs || [];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section-pad py-24 border-t border-border">
      <p className="eyebrow mb-4">[FAQ] Frequently Asked</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3">
        Answers up front.
      </h2>
      <p className="text-muted max-w-lg mb-12">
        A handful of answers that make the first call shorter.
      </p>

      <div className="border-t border-border">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-b border-border">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left gap-6"
              >
                <span className="flex items-baseline gap-5">
                  <span className="eyebrow text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-lg md:text-xl font-medium">
                    {item.q}
                  </span>
                </span>
                <Plus
                  className={`shrink-0 h-5 w-5 text-muted transition-transform duration-300 ${
                    isOpen ? "rotate-45 text-accent" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-muted leading-relaxed pb-6 pl-[3.1rem] max-w-xl">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
