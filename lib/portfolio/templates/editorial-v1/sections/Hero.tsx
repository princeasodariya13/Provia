import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function Hero({ data }: { data: PortfolioDocumentDTO["hero"] }) {
  return (
    <header className="pt-32 pb-16 border-b-2 border-[#000000] relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#CC2936] rounded-bl-full opacity-10 -z-10" aria-hidden="true" />
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-6">
        {data.name}
      </h1>
      <h2 className="text-2xl md:text-3xl font-medium text-[#4D4D4D] max-w-2xl leading-tight">
        {data.headline}
      </h2>
      <p className="mt-8 text-lg md:text-xl font-light text-[#4D4D4D] max-w-3xl leading-relaxed">
        {data.shortIntroduction}
      </p>
      
      {data.primaryLinks?.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-6">
          {data.primaryLinks.map((link, i) => (
            <a 
              key={i} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-bold tracking-widest uppercase pb-1 border-b-2 border-transparent hover:border-[#CC2936] transition-colors"
            >
              {link.title}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
