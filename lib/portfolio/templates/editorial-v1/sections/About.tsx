import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function About({ data }: { data: PortfolioDocumentDTO["about"] }) {
  if (!data.summary) return null;

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">About</h3>
      </div>
      <p className="text-lg leading-relaxed text-[#4D4D4D]">
        {data.summary}
      </p>
    </section>
  );
}
