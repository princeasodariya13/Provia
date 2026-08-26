"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Mail, MapPin, ArrowUpRight, Globe, GitFork, Link2 } from "lucide-react";

type Props = {
  contact: PortfolioDocumentDTO["contact"];
  links?: PortfolioDocumentDTO["hero"]["primaryLinks"];
};

function getLinkIcon(title?: string) {
  const t = (title || "").toLowerCase();
  if (t.includes("github")) return <GitFork className="w-4 h-4" />;
  if (t.includes("linkedin")) return <Link2 className="w-4 h-4" />;
  return <Globe className="w-4 h-4" />;
}

export function ContactFooter({ contact, links }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-black py-36 md:py-48">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-t from-violet-950/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/[0.08] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-cyan-500/[0.06] blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 md:px-16 text-center">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 mb-6"
        >
          07 · Let's Connect
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="font-black tracking-tighter text-white leading-[0.9] mb-8"
          style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
        >
          Let&apos;s build<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
            something great.
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
          className="text-base md:text-lg text-white/70 max-w-lg mx-auto mb-12 leading-relaxed"
        >
          Open to full-time roles, freelance projects, and interesting conversations.
          My inbox is always open.
        </motion.p>

        {/* Primary CTA */}
        {contact?.email && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
            className="mb-10"
          >
            <a
              href={`mailto:${contact.email}`}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-base font-bold text-white hover:opacity-90 transition-all duration-300 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
            >
              <Mail className="w-5 h-5" />
              {contact.email}
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        )}

        {/* Location */}
        {contact?.location && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center justify-center gap-2 text-sm text-white/50 mb-10 font-medium"
          >
            <MapPin className="w-4 h-4" />
            {contact.location}
          </motion.div>
        )}

        {/* Social Links */}
        {links && links.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-16"
          >
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] text-sm text-white/80 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10 backdrop-blur-sm transition-all duration-300"
              >
                {getLinkIcon(link.title)}
                {link.title?.trim() || link.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"}
              </a>
            ))}
          </motion.div>
        )}

        {/* Footer bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="border-t border-white/[0.06] pt-10 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <span className="text-xs text-white/40 font-mono">Built with Provia</span>
          <span className="text-xs text-white/40 font-mono">
            &copy; {new Date().getFullYear()} {contact?.email ? "" : "All rights reserved"}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
