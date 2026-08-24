import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      name: doc.hero.name || "Professional",
      headline: doc.hero.headline || "",
      subhead: doc.hero.shortIntroduction || "",
      availability: "Available for opportunities",
    },
    projects: doc.projects.map(p => ({
      title: p.name,
      description: p.description,
      link: p.url,
      tags: p.technologies || []
    })),
    experience: doc.experience.map(e => ({
      role: e.title,
      company: e.company,
      duration: `${e.startDate} - ${e.endDate || 'Present'}`,
      description: e.description
    })),
    skills: doc.skills.flatMap(s => s.skills.map(name => ({
      name: name,
      level: s.category
    }))),
    education: doc.education.map(ed => ({
      institution: ed.institution,
      degree: ed.degree,
      duration: `${ed.startDate} - ${ed.endDate || 'Present'}`,
    }))
  };
}