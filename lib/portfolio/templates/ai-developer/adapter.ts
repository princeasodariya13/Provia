import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      name: doc.hero?.name || "Professional",
      headline: doc.hero?.headline || "",
      bio: doc.about?.summary || doc.hero?.shortIntroduction || "",
      avatar: "",
      status: "Available for opportunities"
    },
    projects: (doc.projects || []).map((p) => ({
      title: p.name,
      description: p.description,
      link: p.url || p.repositoryUrl || "#",
      metrics: p.technologies?.slice(0, 2).map(t => ({ label: "Tech", value: t })) || []
    })),
    stack: (doc.skills || []).flatMap(s => s.skills).map((name, i) => ({
      id: i,
      name: name,
      icon: "Code"
    })),
    milestones: (doc.experience || []).map(e => ({
      date: `${e.startDate ? new Date(e.startDate).getFullYear() : ""} - ${e.isCurrent ? "Present" : (e.endDate ? new Date(e.endDate).getFullYear() : "")}`,
      tag: e.company || "Experience",
      title: e.title,
      description: e.description || "No description provided.",
      link: "#"
    })),
    social: (doc.hero?.primaryLinks || []).map((l: any) => ({
      platform: l.title,
      url: l.url
    })),
    email: doc.contact?.email || "",
    education: doc.education || []
  };
}