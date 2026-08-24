import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      name: doc.hero.name || "Professional",
      headline: doc.hero.headline || "",
      bio: doc.hero.shortIntroduction || "",
      avatar: "", // Avatar not in standard DTO hero section
    },
    projects: (doc.projects || []).map(p => ({
      title: p.name,
      description: p.description,
      image: "", // Image not in standard DTO
      link: p.url,
      tags: p.technologies || []
    })),
    experience: (doc.experience || []).map(e => ({
      role: e.title,
      company: e.company,
      duration: `${e.startDate} - ${e.endDate || 'Present'}`,
      description: e.description
    })),
    skills: (doc.skills || []).flatMap(s => s.skills.map(name => ({
      name: name,
      level: "Advanced"
    })))
  };
}