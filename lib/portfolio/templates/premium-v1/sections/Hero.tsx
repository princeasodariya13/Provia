"use client";
import { motion } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { ArrowUpRight, Mail, MapPin, Download } from "lucide-react";

type Props = {
  hero: PortfolioDocumentDTO["hero"];
  contact?: PortfolioDocumentDTO["contact"];
  stats?: { label: string; value: string }[];
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0, delay: 0 }
});

export function PremiumHero({ hero, contact, stats }: Props) {
  const initials = hero.name
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const words = hero.name.split(" ");

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
      {/* ── Ambient background mesh ───────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-56 -left-56 w-[700px] h-[700px] rounded-full bg-violet-600/[0.12] blur-[130px]" />
        <div className="absolute top-1/3 -right-72 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.07] blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] rounded-full bg-purple-500/[0.06] blur-[100px]" />
      </div>

      {/* ── Noise grain texture ───────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
        aria-hidden
      />

      {/* ── Grid overlay ──────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
        aria-hidden
      />

      {/* ── Main content ──────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 md:px-16 w-full pt-32 pb-24">
        <div className="flex flex-col xl:flex-row xl:items-center gap-16 xl:gap-24">

          {/* ── Left: Text block ──────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Available badge */}
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-emerald-400/80">
                Available for opportunities
              </span>
            </motion.div>

            {/* Name — cinematic display type */}
            <motion.div {...fadeUp(0.1)}>
              <h1 className="font-black tracking-tighter leading-[0.88]">
                {words.map((word, i) => (
                  <span key={i} className="block">
                    <span
                      className={
                        i === words.length - 1 && words.length > 1
                          ? "text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400"
                          : "text-white"
                      }
                      style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </h1>
            </motion.div>

            {/* Role / Headline */}
            <motion.div {...fadeUp(0.2)} className="flex items-center gap-4">
              <div className="h-px w-10 bg-gradient-to-r from-violet-400 to-cyan-400" />
              <p className="text-lg md:text-xl text-white/80 font-light tracking-wide">
                {hero.headline}
              </p>
            </motion.div>

            {/* Short intro */}
            {hero.shortIntroduction && (
              <motion.p {...fadeUp(0.28)} className="text-base text-white/70 max-w-lg leading-relaxed">
                {hero.shortIntroduction}
              </motion.p>
            )}

            {/* CTA Links */}
            <motion.div {...fadeUp(0.35)} className="flex flex-wrap gap-3">
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-bold text-white hover:opacity-90 transition-all duration-300 shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
                >
                  <Mail className="w-4 h-4" />
                  Hire me
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              )}
              {hero.primaryLinks?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/12 bg-white/[0.04] text-sm font-semibold text-white/80 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300 backdrop-blur-sm"
                >
                  {link.title?.trim() || link.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"}
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </motion.div>

            {/* Location */}
            {contact?.location && (
              <motion.div {...fadeUp(0.42)} className="flex items-center gap-2 text-xs text-white/50 font-medium tracking-wide">
                <MapPin className="w-3.5 h-3.5" />
                {contact.location}
              </motion.div>
            )}
          </div>

          {/* ── Right: Avatar / Card ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.25 }}
            className="xl:w-[380px] shrink-0"
          >
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 xl:w-[380px] xl:h-[380px] mx-auto">
              {/* Outer spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, transparent 70%, rgba(139,92,246,0.4) 85%, transparent 100%)",
                }}
              />
              {/* Second ring counter-rotating */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-3 rounded-full border border-dashed border-cyan-500/20"
              />
              {/* Glow sphere */}
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-violet-600/25 to-cyan-500/15 blur-2xl" />
              {/* Avatar card */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#1A1230] via-[#120E2A] to-[#0D1A2A] border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
                {hero.avatarUrl ? (
                  <img
                    src={hero.avatarUrl}
                    alt={hero.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-400">
                      {initials}
                    </span>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
                  </div>
                )}
              </div>

              {/* Floating stat pill */}
              {stats && stats[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/12 backdrop-blur-xl shadow-xl flex items-center gap-3"
                >
                  {stats.map((s, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white">{s.value}</span>
                      <span className="text-[10px] text-white/60 uppercase tracking-wider">{s.label}</span>
                      {i < stats.length - 1 && <span className="w-px h-3 bg-white/15 ml-1.5" />}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Scroll indicator ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden xl:flex flex-col items-center gap-2"
        >
          <span className="text-[9px] tracking-[0.3em] uppercase text-white/50 font-bold">scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-violet-400/40 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
