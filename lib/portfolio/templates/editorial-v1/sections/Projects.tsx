import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";

function getSafeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, "http://localhost");
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return parsed.href;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function Projects({ data }: { data: PortfolioDocumentDTO["projects"] }) {
  if (!data || data.length === 0) return null;

  return (
    <section>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex items-center gap-4 mb-16"
      >
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">Projects</h3>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.map((project, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group border border-[#000000] p-8 hover:bg-[#000000] hover:text-[#F5EFE8] transition-all duration-300 flex flex-col h-full"
          >
            <h4 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-white transition-colors">{project.name}</h4>
            <p className="text-lg text-[#4D4D4D] font-light group-hover:text-[#C9BEB9] leading-relaxed mb-8 transition-colors flex-grow">
              {project.description}
            </p>
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {project.technologies.slice(0, 4).map((tech, j) => (
                  <span key={j} className="text-xs font-bold uppercase tracking-widest border border-[#000000] group-hover:border-[#C9BEB9] px-3 py-1 transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {(project.url || project.repositoryUrl) && (
              <div className="mt-auto">
                <a 
                  href={getSafeUrl(project.url) || getSafeUrl(project.repositoryUrl) || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold tracking-widest uppercase pb-1 border-b-2 border-[#000000] group-hover:border-[#C9BEB9] group-hover:text-[#F5EFE8] transition-colors inline-block"
                >
                  View Project
                </a>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
