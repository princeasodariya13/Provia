import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  const allSkillNames = (doc.skills || []).flatMap(s => s.skills || []);

  return {
    profile: {
      name:         doc.hero?.name || "Developer",
      headline:     doc.hero?.headline || "",
      role:         doc.hero?.headline || "AI & Software Engineer",
      bio:          doc.about?.summary || "",
      tagline:      doc.hero?.shortIntroduction || doc.about?.summary || "",
      status:       "Available for opportunities",
    },
    // Stats derived from data
    stats: [
      { label: "Experience",   value: (doc.experience || []).length, suffix: "+" },
      { label: "Projects",     value: (doc.projects || []).length,   suffix: "+" },
      { label: "Technologies", value: allSkillNames.length,          suffix: "+" },
    ],
    // Scrolling marquee band — pull from skills
    marqueeItems: allSkillNames.slice(0, 20),
    // Projects
    projects: (doc.projects || []).map((p) => ({
      title:       p.name,
      description: p.description || "",
      link:        p.url || p.repositoryUrl || "#",
      metrics:     (p.technologies || []).slice(0, 4).map(t => ({ label: "Tech", value: t })),
    })),
    // Skills grouped by category
    skills: (doc.skills || []).map(s => ({
      category: s.category || "Skills",
      skills:   s.skills || [],
    })),
    // Tech stack flat list (used as fallback)
    stack: allSkillNames.map((name, i) => ({ id: i, name })),
    // Experience as milestones
    milestones: (doc.experience || []).map(e => ({
      date:        `${e.startDate ? new Date(e.startDate).getFullYear() : ""} — ${e.isCurrent ? "Present" : (e.endDate ? new Date(e.endDate).getFullYear() : "")}`,
      tag:         e.company || "Experience",
      title:       e.title,
      description: e.description || "",
      link:        "#",
    })),
    // Social links
    social: (doc.hero?.primaryLinks || []).map((l: any) => ({
      platform: l.title,
      url:      l.url,
    })),
    email:     doc.contact?.email || "",
    education: doc.education || [],
  };
}