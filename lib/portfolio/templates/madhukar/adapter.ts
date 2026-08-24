import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      name: doc.hero?.name || "Professional",
      headline: doc.hero?.headline || "",
      bio: doc.about?.summary || doc.hero?.shortIntroduction || "",
      location: doc.contact?.location || ""
    },
    projects: (doc.projects || []).map(p => ({
      title: p.name,
      client: "Personal/Open Source",
      year: "Present",
      role: p.technologies?.[0] || "Developer",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072",
      url: p.url || p.repositoryUrl || "#"
    })),
    experience: (doc.experience || []).map(e => ({
      title: e.title,
      company: e.company,
      year: `${e.startDate} - ${e.endDate || 'Present'}`
    })),
    services: (doc.skills || []).slice(0, 4).map((s, i) => ({
      index: String(i + 1).padStart(2, '0'),
      title: s.category || "Skill Area"
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