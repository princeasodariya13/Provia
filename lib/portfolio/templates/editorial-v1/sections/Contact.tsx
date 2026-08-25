import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { motion } from "framer-motion";

export function Contact({ contact, links }: { contact: PortfolioDocumentDTO["contact"]; links: PortfolioDocumentDTO["hero"]["primaryLinks"] }) {
  if (!contact && (!links || links.length === 0)) return null;

  return (
    <section>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex items-center gap-4 mb-12"
      >
        <div className="w-8 h-1 bg-[#CC2936]" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-widest uppercase">Contact</h3>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="bg-[#000000] text-[#F5EFE8] p-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h4 className="text-3xl font-black uppercase tracking-tighter mb-4">Let's Connect</h4>
            <p className="text-[#C9BEB9] leading-relaxed max-w-sm mb-8">
              Open to new opportunities, collaborations, and conversations.
            </p>
            {contact?.email && (
              <a href={`mailto:${contact.email}`} className="text-xl font-bold border-b-2 border-[#CC2936] hover:text-[#CC2936] transition-colors inline-block pb-1">
                {contact.email}
              </a>
            )}
          </div>
          
          {links && links.length > 0 && (
            <div className="flex flex-col gap-4 justify-center">
              {links.map((link, i) => (
                <a 
                  key={i} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border-b border-[#333333] pb-4 hover:border-[#CC2936] transition-colors"
                >
                  <span className="text-lg font-bold uppercase tracking-wider group-hover:text-[#CC2936] transition-colors">{link.title}</span>
                  <span className="text-[#C9BEB9] group-hover:text-[#CC2936] transition-colors transform group-hover:translate-x-1 duration-300">→</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
