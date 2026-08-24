import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  const toYear = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).getFullYear().toString();
  };

  return {
    profile: {
      name: doc.hero?.name || "Professional",
      headline: doc.hero?.headline || "",
      bio: doc.about?.summary || doc.hero?.shortIntroduction || "",
      location: doc.contact?.location || "",
      available: true,
    },
    projects: (doc.projects || []).map(p => ({
      title: p.name,
      description: p.description || "",
      client: "Personal / Open Source",
      year: "Present",
      role: p.technologies?.[0] || "Developer",
      url: p.url || p.repositoryUrl || "#",
    })),
    experience: (doc.experience || []).map(e => ({
      title: e.title,
      company: e.company,
      year: `${toYear(e.startDate) || "—"} — ${e.isCurrent ? "Present" : toYear(e.endDate) || "—"}`,
      description: e.description || "",
    })),
    services: (doc.skills || []).slice(0, 4).map((s, i) => ({
      index: String(i + 1).padStart(2, "0"),
      title: s.category || "Skill Area",
      description: s.skills?.join(", ") || "",
    })),
    education: (doc.education || []).map(e => ({
      institution: e.institution,
      degree: [e.degree, e.fieldOfStudy].filter(Boolean).join(" in "),
      year: `${toYear(e.startDate) || "—"} — ${toYear(e.endDate) || "Present"}`,
    })),
    social: (doc.hero?.primaryLinks || []).map((l: { title: string; url: string }) => ({
      label: l.title,
      href: l.url,
    })),
    contact: {
      email: doc.contact?.email || "",
      location: doc.contact?.location || "",
    },
    certifications: doc.certifications || [],
    skills: doc.skills || [],
    about: {
      summary: doc.about?.summary || "",
      themes: doc.about?.careerThemes || [],
      image: doc.hero?.avatarUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070",
    },
  };
}