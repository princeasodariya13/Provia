import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function Projects({ data }: { data: PortfolioDocumentDTO["projects"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-4 mb-12">
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">Projects</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.map((project, i) => (
          <div key={i} className="group border border-[#000000] p-8 hover:bg-[#000000] hover:text-[#F5EFE8] transition-colors">
            <h4 className="text-xl font-bold uppercase tracking-tight mb-4 group-hover:text-white transition-colors">{project.name}</h4>
            <p className="text-[#4D4D4D] group-hover:text-[#C9BEB9] leading-relaxed mb-6 transition-colors">
              {project.description}
            </p>
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.slice(0, 4).map((tech, j) => (
                  <span key={j} className="text-xs font-bold uppercase tracking-wider border border-[#000000] group-hover:border-[#C9BEB9] px-2 py-1 transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {(project.url || project.repositoryUrl) && (
              <a 
                href={project.url || project.repositoryUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold tracking-widest uppercase pb-1 border-b-2 border-[#000000] group-hover:border-[#C9BEB9] group-hover:text-[#F5EFE8] transition-colors inline-block"
              >
                View Project
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
