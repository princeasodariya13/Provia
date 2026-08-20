import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function Experience({ data }: { data: PortfolioDocumentDTO["experience"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-4 mb-12">
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">Experience</h3>
      </div>
      
      <div className="space-y-16 border-l-2 border-[#000000] pl-6 md:pl-10">
        {data.map((exp, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[26px] md:-left-[42px] top-2 w-3 h-3 bg-[#000000] rounded-none rotate-45" aria-hidden="true" />
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-4">
              <h4 className="text-2xl font-bold uppercase tracking-tight">{exp.title}</h4>
              <span className="text-sm font-medium text-[#4D4D4D] uppercase tracking-wider mt-1 md:mt-0">
                {exp.startDate ? new Date(exp.startDate).getFullYear() : ""} — {exp.isCurrent ? "Present" : (exp.endDate ? new Date(exp.endDate).getFullYear() : "")}
              </span>
            </div>
            <div className="text-lg font-medium text-[#CC2936] mb-4">{exp.company}</div>
            <p className="text-[#4D4D4D] leading-relaxed max-w-2xl">
              {exp.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
