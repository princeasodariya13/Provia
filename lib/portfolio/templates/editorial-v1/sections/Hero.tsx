"use client";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import Image from "next/image";

function getSafeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, "http://localhost");
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      return parsed.href;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

export function Hero({
  data,
  contact,
  stats,
}: {
  data: PortfolioDocumentDTO["hero"];
  contact?: PortfolioDocumentDTO["contact"];
  stats?: { label: string; value: string }[];
}) {
  return (
    <motion.header
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative pt-28 pb-20 border-b-[3px] border-[#111] "
    >
      {/* Geometric accent — top-right corner block */}
      <div
        className="absolute top-0 right-0 w-48 h-48 md:w-72 md:h-72 bg-[#CC2936] -z-10"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
        aria-hidden
      />
      {/* Second accent — bottom-left */}
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#CC2936] opacity-15 -z-10" aria-hidden />

      {/* ── Top row: Name + Avatar ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-10">
        <motion.div variants={fadeUp} className="flex-1 min-w-0">
          {/* Overline */}
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#CC2936] mb-6">
            Portfolio — {new Date().getFullYear()}
          </p>
          <h1
            className="font-black tracking-tighter uppercase leading-[0.85] text-[#111] "
            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}
          >
            {data.name.split(" ").map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h1>
        </motion.div>

        {/* Avatar */}
        {data.avatarUrl && (
          <motion.div
            variants={fadeUp}
            className="relative w-36 h-36 md:w-52 md:h-52 shrink-0 border-[3px] border-[#111]  overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 group"
          >
            <Image
              src={data.avatarUrl}
              alt={data.name}
              fill
              sizes="(max-width: 768px) 150px, 200px"
              className="object-cover"
              priority
              unoptimized
            />
            {/* Red overlay on hover */}
            <div className="absolute inset-0 bg-[#CC2936] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
          </motion.div>
        )}
      </div>

      {/* ── Headline / Role ── */}
      <motion.div variants={fadeUp} className="flex items-center gap-5 mb-8">
        <div className="w-10 h-[3px] bg-[#CC2936] shrink-0" aria-hidden />
        <h2 className="text-xl md:text-3xl font-semibold text-[#444]  tracking-tight leading-tight">
          {data.headline}
        </h2>
      </motion.div>

      {/* ── Introduction ── */}
      {data.shortIntroduction && (
        <motion.p
          variants={fadeUp}
          className="text-base md:text-xl font-light text-[#555]  leading-relaxed max-w-3xl mb-10"
        >
          {data.shortIntroduction}
        </motion.p>
      )}

      {/* ── Stats row ── */}
      {stats && stats.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap gap-0 mb-10 border border-[#111]  divide-x divide-[#111]  w-fit"
        >
          {stats.map((s, i) => (
            <div key={i} className="px-6 py-4">
              <p className="text-2xl md:text-3xl font-black text-[#111]  tabular-nums">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888]  mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── CTA Links ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-5 items-center">
        {contact?.email && (
          <a
            href={`mailto:${contact.email}`}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#111]  text-[#F5F0EA]  text-sm font-bold uppercase tracking-widest hover:bg-[#CC2936]   transition-colors duration-300"
          >
            <Mail className="w-4 h-4" />
            Hire Me
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        )}
        {data.primaryLinks?.map((link, i) => (
          <a
            key={i}
            href={getSafeUrl(link.url) || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b-2 border-[#111]  pb-0.5 hover:border-[#CC2936] hover:text-[#CC2936] transition-all duration-300"
          >
            {link.title?.trim() || link.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"}
            <span className="transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#CC2936]">
              ↗
            </span>
          </a>
        ))}
        {contact?.location && (
          <span className="flex items-center gap-1.5 text-sm text-[#888]  font-medium ml-auto">
            <MapPin className="w-3.5 h-3.5" />
            {contact.location}
          </span>
        )}
      </motion.div>
    </motion.header>
  );
}



