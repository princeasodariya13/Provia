import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function Skills({ data }: { data: PortfolioDocumentDTO["skills"] }) {
  if (!data || data.length === 0 || !data[0].skills?.length) return null;

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">Skills & Expertise</h3>
      </div>
      <div className="flex flex-col gap-6">
        {data.map((group, i) => (
          <div key={i}>
            <ul className="flex flex-col gap-2 text-sm font-medium uppercase tracking-wider text-[#000000]">
              {group.skills.map((skill, j) => (
                <li key={j} className="flex items-center gap-3 border-b border-[#C9BEB9] pb-2">
                  <div className="w-1.5 h-1.5 bg-[#000000] rounded-none" aria-hidden="true" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
