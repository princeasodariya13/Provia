import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      name: doc.hero?.name || "Professional",
      role: doc.hero?.headline || "",
      tagline: doc.hero?.shortIntroduction || "",
      location: doc.contact?.location || ""
    },
    about: {
      description: doc.about?.summary || doc.hero?.shortIntroduction || ""
    },
    projects: (doc.projects || []).map((p) => ({
      title: p.name,
      category: p.technologies?.[0] || "Project",
      year: "Present",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070",
      link: p.url || p.repositoryUrl || "#"
    })),
    experience: (doc.experience || []).map(e => ({
      role: e.title,
      company: e.company,
      period: `${e.startDate} - ${e.endDate || 'Present'}`
    })),
    social: (doc.hero?.primaryLinks || []).map((l: any) => ({
      label: l.title,
      href: l.url
    })),
    contact: {
      email: doc.contact?.email || ""
    }
  };
}