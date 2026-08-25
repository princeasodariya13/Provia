import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  const hero = (doc.hero || {}) as any;
  const about = (doc.about || {}) as any;
  const contact = (doc.contact || {}) as any;

  return {
    profile: {
      name: hero.name || "Professional",
      title: hero.headline || "Software Engineer",
      bio: about.summary || hero.shortIntroduction || "",
      avatar: hero.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&fit=crop",
      email: contact.email || "",
      resumeUrl: hero.resumeUrl || "#",
    },
    about: {
      heading: "About Me",
      paragraphs: about.summary
        ? about.summary.split(/\n\n+/).filter(Boolean)
        : (hero.shortIntroduction ? [hero.shortIntroduction] : ["Experienced developer crafting scalable solutions."]),
      stats: [
        { label: "Projects", value: `${(doc.projects || []).length}+` },
        { label: "Technologies", value: `${(doc.skills || []).flatMap((s: any) => s.skills || []).length}+` },
      ],
    },
    projects: (doc.projects || []).map(p => ({
      title: p.name,
      description: p.description || "No description provided.",
      tag: p.technologies?.[0] || "Project",
      url: p.url || "#",
      repositoryUrl: p.repositoryUrl || "#",
    })),
    experience: (doc.experience || []).map(e => ({
      role: e.title,
      org: e.company,
      location: e.location || "",
      duration: `${e.startDate ? new Date(e.startDate).getFullYear() : ""} – ${e.isCurrent ? "Present" : (e.endDate ? new Date(e.endDate).getFullYear() : "")}`,
      points: e.description ? e.description.split("\n").filter((p: string) => p.trim() !== "") : [],
    })),
    skills: (doc.skills || []).reduce((acc: any, s: any) => {
      if (s.category) acc[s.category] = s.skills || [];
      return acc;
    }, {}),
    socials: (hero.primaryLinks || []).map((l: any) => ({
      platform: l.title,
      url: l.url
    })),
    education: (doc.education || []).map(e => ({
      degree: e.degree || "",
      school: e.institution,
      years: `${e.startDate ? new Date(e.startDate).getFullYear() : ""} – ${e.endDate ? new Date(e.endDate).getFullYear() : "Present"}`,
      note: e.fieldOfStudy ? `Field of Study: ${e.fieldOfStudy}` : "",
    })),
    marqueeItems: (doc.skills || []).flatMap((s: any) => s.skills || []).slice(0, 8),
  };
}