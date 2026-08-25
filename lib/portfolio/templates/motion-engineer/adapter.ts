import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  const hero = (doc.hero || {}) as any;
  const about = (doc.about || {}) as any;
  const contact = (doc.contact || {}) as any;

  return {
    profile: {
      name: hero.name || "Professional",
      role: hero.headline || "Software Engineer",
      tagline: hero.shortIntroduction || about.summary || "",
      location: contact.location || "",
    },
    about: {
      description: about.summary || hero.shortIntroduction || "Passionate developer building innovative solutions.",
    },
    projects: (doc.projects || []).map(p => ({
      title: p.name,
      category: p.technologies?.[0] || "Project",
      description: p.description || "No description provided.",
      year: "Present",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070",
      link: p.url || p.repositoryUrl || "#"
    })),
    experience: (doc.experience || []).map(e => ({
      role: e.title,
      company: e.company,
      description: e.description || "No description provided.",
      period: `${e.startDate ? new Date(e.startDate).getFullYear() : ""} – ${e.isCurrent ? "Present" : (e.endDate ? new Date(e.endDate).getFullYear() : "")}`
    })),
    steps: (doc.skills || []).slice(0, 4).map((s: any, i: number) => ({
      step: String(i + 1).padStart(2, "0"),
      title: s.category || "Skill Area",
      description: (s.skills || []).join(", "),
      tags: (s.skills || []).slice(0, 3),
    })),
    stats: [
      { label: "Projects", value: `${(doc.projects || []).length}` },
      { label: "Roles", value: `${(doc.experience || []).length}` },
      { label: "Technologies", value: `${(doc.skills || []).flatMap((s: any) => s.skills || []).length}` },
    ],
    capabilities: (doc.skills || []).slice(0, 3).map((s: any, i: number) => ({
      index: String(i + 1).padStart(2, "0"),
      title: s.category || "Skill",
      description: (s.skills || []).join(", "),
    })),
    social: (hero.primaryLinks || []).map((l: any) => ({ label: l.title, href: l.url })),
    socials: (hero.primaryLinks || []).map((l: any) => ({ label: l.title, href: l.url })),
    contact: { email: contact.email || "" },
    education: doc.education || [],
    marqueeItems: (doc.skills || []).flatMap((s: any) => s.skills || []).slice(0, 10),
  };
}