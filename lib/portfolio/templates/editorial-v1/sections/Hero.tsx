import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";
import Image from "next/image";

function getSafeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, "http://localhost"); // fallback base for relative
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return parsed.href;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function Hero({ data }: { data: PortfolioDocumentDTO["hero"] }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <motion.header 
      variants={container}
      initial="hidden"
      animate="show"
      className="pt-32 pb-16 border-b-2 border-[#000000] relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-[#CC2936] rounded-bl-full opacity-10 -z-10" aria-hidden="true" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
        <div>
          <motion.h1 variants={item} className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-6">
            {data.name}
          </motion.h1>
          <motion.h2 variants={item} className="text-2xl md:text-4xl font-medium text-[#4D4D4D] max-w-3xl leading-tight">
            {data.headline}
          </motion.h2>
        </div>
        
        {data.avatarUrl && (
          <motion.div variants={item} className="relative w-32 h-32 md:w-48 md:h-48 rounded-none border-2 border-[#000000] p-1 shrink-0 filter grayscale hover:grayscale-0 transition-all duration-700">
            <div className="relative w-full h-full">
              <Image 
                src={data.avatarUrl} 
                alt={data.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        )}
      </div>
      
      <motion.p variants={item} className="mt-8 text-lg md:text-2xl font-light text-[#4D4D4D] max-w-3xl leading-relaxed">
        {data.shortIntroduction}
      </motion.p>
      
      {data.primaryLinks?.length > 0 && (
        <motion.div variants={item} className="mt-16 flex flex-wrap gap-8">
          {data.primaryLinks.map((link, i) => (
            <a 
              key={i} 
              href={getSafeUrl(link.url) || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm md:text-base font-bold tracking-widest uppercase pb-1 border-b-2 border-transparent hover:border-[#CC2936] transition-colors"
            >
              <span>{link.title}</span>
              <span className="text-[#CC2936] opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all">↗</span>
            </a>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
}
