"use client";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

export function Contact({
  contact,
  links,
}: {
  contact: PortfolioDocumentDTO["contact"];
  links: PortfolioDocumentDTO["hero"]["primaryLinks"];
}) {
  if (!contact && (!links || links.length === 0)) return null;

  return (
    <section>
      {/* Section overline */}
      <div className="flex items-center gap-4 mb-12">
        <span className="text-[10px] font-black text-[#CC2936] tracking-[0.25em] uppercase">07</span>
        <div className="w-8 h-[2px] bg-[#CC2936]" aria-hidden />
        <h3 className="text-xs font-black tracking-[0.25em] uppercase text-[#111]">Get in Touch</h3>
      </div>

      {/* Main contact block */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[#111] text-[#F5F0EA] p-10 md:p-16 relative overflow-hidden"
      >
        {/* Geometric accent */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 bg-[#CC2936] opacity-20"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
          aria-hidden
        />
        <div className="absolute top-0 left-0 w-24 h-24 bg-[#CC2936] opacity-10" aria-hidden />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
          {/* Left */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CC2936] mb-6">
              Open to opportunities
            </p>
            <h2
              className="font-black uppercase tracking-tighter leading-[0.9] text-white mb-6"
              style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
            >
              Let&apos;s work<br />together.
            </h2>
            <p className="text-[#C9BEB9] leading-relaxed mb-10 max-w-sm text-base">
              Open to full-time roles, freelance projects, and interesting collaborations. My inbox is always open.
            </p>
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="group inline-flex items-center gap-3 px-7 py-4 bg-[#CC2936] text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-[#111] transition-all duration-300"
              >
                <Mail className="w-4 h-4" />
                Send an Email
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
            {contact?.location && (
              <div className="flex items-center gap-2 mt-6 text-sm text-[#888] font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {contact.location}
              </div>
            )}
          </div>

          {/* Right: social links */}
          {links && links.length > 0 && (
            <div className="flex flex-col gap-0 pt-4 border-t border-[#333] md:border-t-0 md:pt-0">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#666] mb-6">
                Find me online
              </p>
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-5 border-b border-[#222] hover:border-[#CC2936] transition-all duration-300"
                >
                  <span className="text-xl font-black uppercase tracking-tight text-white group-hover:text-[#CC2936] transition-colors">
                    {link.title?.trim() || link.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-[#555] group-hover:text-[#CC2936] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 duration-300" />
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer bar */}
      <div className="mt-12 pt-6 border-t border-[#D9D2C9] flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAA]">Built with Provia</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAA]">
          &copy; {new Date().getFullYear()} All rights reserved
        </p>
      </div>
    </section>
  );
}
