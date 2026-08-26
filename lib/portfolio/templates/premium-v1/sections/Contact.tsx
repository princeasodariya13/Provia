"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Mail, MapPin, ArrowUpRight, GitFork, Link2, Globe } from "lucide-react";

type Props = {
  contact: PortfolioDocumentDTO["contact"];
  links?: PortfolioDocumentDTO["hero"]["primaryLinks"];
};

function getLinkIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("github")) return <GitFork className="w-4 h-4" />;
  if (t.includes("linkedin")) return <Link2 className="w-4 h-4" />;
  return <Globe className="w-4 h-4" />;
}

export function ContactFooter({ contact, links }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0A0A0F]">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/25">
            Get in touch
          </span>
          <h2 className="mt-4 text-4xl md:text-6xl font-black tracking-tighter text-white">
            Let&apos;s build something{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              amazing
            </span>
          </h2>
          <p className="mt-4 text-base text-white/40 max-w-md mx-auto">
            Open to new opportunities, collaborations, and interesting conversations.
          </p>

          {contact?.email && (
            <motion.a
              href={`mailto:${contact.email}`}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" as const }}
              className="group mt-10 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-base font-bold text-white hover:opacity-90 transition-all duration-300 shadow-2xl shadow-violet-500/30"
            >
              <Mail className="w-5 h-5" />
              {contact.email}
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </motion.a>
          )}

          {contact?.location && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-4 flex items-center justify-center gap-2 text-sm text-white/25"
            >
              <MapPin className="w-3.5 h-3.5" />
              {contact.location}
            </motion.div>
          )}

          {links && links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 flex items-center justify-center gap-3 flex-wrap"
            >
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/50 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-300"
                >
                  {getLinkIcon(link.title)}
                  {link.title}
                </a>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Footer bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <span className="text-xs text-white/15 font-mono">Built with Provia</span>
          <span className="text-xs text-white/15 font-mono">
            © {new Date().getFullYear()} — All rights reserved
          </span>
        </motion.div>
      </div>
    </section>
  );
}
