import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      name: doc.hero?.name || "Professional",
      title: doc.hero?.headline || "",
      bio: doc.about?.summary || doc.hero?.shortIntroduction || "",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&fit=crop",
      email: doc.contact?.email || ""
    },
    projects: (doc.projects || []).map(p => ({
      title: p.name,
      description: p.description,
      tag: p.technologies?.[0] || "Project",
      url: p.url || "#",
      repositoryUrl: p.repositoryUrl || "#"
    })),
    experience: (doc.experience || []).map(e => ({
      role: e.title,
      company: e.company,
      duration: `${e.startDate} - ${e.endDate || 'Present'}`,
      description: e.description
    })),
    skills: (doc.skills || []).flatMap(s => s.skills),
    socials: (doc.hero?.primaryLinks || []).map((l: any) => ({
      platform: l.title,
      url: l.url
    }))
  };
}