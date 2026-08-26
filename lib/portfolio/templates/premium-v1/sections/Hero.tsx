"use client";
import { motion } from "framer-motion";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

type Props = {
  hero: PortfolioDocumentDTO["hero"];
  contact?: PortfolioDocumentDTO["contact"];
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" as const, delay },
});

export function PremiumHero({ hero, contact }: Props) {
  const initials = hero.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0A0A0F]">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-32 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center gap-16">
          {/* Left: Text */}
          <div className="flex-1 space-y-8">
            {/* Status badge */}
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400/80">
                Available for work
              </span>
            </motion.div>

            {/* Name */}
            <motion.div {...fadeUp(0.1)}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                {hero.name.split(" ").map((word, i) => (
                  <span
                    key={i}
                    className={i % 2 !== 0 ? "text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400" : ""}
                  >
                    {word}{" "}
                  </span>
                ))}
              </h1>
            </motion.div>

            {/* Headline */}
            <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-white/50 max-w-xl leading-relaxed font-light">
              {hero.headline}
            </motion.p>

            {/* Short Intro */}
            {hero.shortIntroduction && (
              <motion.p {...fadeUp(0.25)} className="text-sm text-white/35 max-w-md leading-relaxed">
                {hero.shortIntroduction}
              </motion.p>
            )}

            {/* Links */}
            <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-3 pt-2">
              {hero.primaryLinks?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300 backdrop-blur-sm"
                >
                  {link.title}
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ))}
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-bold text-white hover:opacity-90 transition-all duration-300 shadow-lg shadow-violet-500/25"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Hire me
                </a>
              )}
            </motion.div>

            {/* Location */}
            {contact?.location && (
              <motion.div {...fadeUp(0.35)} className="flex items-center gap-2 text-xs text-white/30 font-medium">
                <MapPin className="w-3 h-3" />
                {contact.location}
              </motion.div>
            )}
          </div>

          {/* Right: Avatar / Monogram Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="lg:w-80 shrink-0"
          >
            <div className="relative w-64 h-64 lg:w-80 lg:h-80 mx-auto">
              {/* Outer spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-violet-500/20"
              />
              {/* Glow */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-600/30 to-cyan-500/20 blur-2xl" />
              {/* Card */}
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#16213E] border border-white/10 flex items-center justify-center shadow-2xl">
                {hero.avatarUrl ? (
                  <img
                    src={hero.avatarUrl}
                    alt={hero.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-cyan-400">
                    {initials}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-widest uppercase text-white/20">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
