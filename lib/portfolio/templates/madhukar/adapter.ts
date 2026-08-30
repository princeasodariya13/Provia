import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1974",
  "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=2088",
];

function getProjectImage(url: string | null | undefined, index: number) {
  if (url && url.startsWith("http")) {
    return `https://image.thum.io/get/width/600/crop/800/${url}`;
  }
  return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
}

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  const hero = (doc.hero || {}) as any;
  const about = (doc.about || {}) as any;
  const contact = (doc.contact || {}) as any;

  const toYear = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).getFullYear().toString();
  };

  return {
    profile: {
      name: hero.name || "Professional",
      headline: hero.headline || "Creative Developer & Engineer",
      bio: about.summary || hero.shortIntroduction || "",
      location: contact.location || "",
      available: true,
      stats: [
        { label: "Projects", value: `${(doc.projects || []).length}` },
        { label: "Roles", value: `${(doc.experience || []).length}` }
      ]
    },
    about: {
      summary: about.summary || hero.shortIntroduction || "",
      quote: about.summary?.split(".")[0] || "Building with purpose.",
      paragraphs: about.summary
        ? about.summary.split(/\n\n+/).filter(Boolean)
        : (hero.shortIntroduction ? [hero.shortIntroduction] : ["Passionate developer building elegant solutions."]),
      themes: about.careerThemes || [],
      image: hero.avatarUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070",
    },
    projects: (doc.projects || []).map((p, index) => ({
      title: p.name,
      description: p.description || "",
      subtitle: p.technologies?.[0] || "Project",
      period: "Present",
      image: getProjectImage(p.url, index),
      tags: p.technologies?.slice(0, 3) || [],
      liveUrl: p.url || "#",
      codeUrl: p.repositoryUrl || "#",
    })),
    experience: (doc.experience || []).map(e => ({
      title: e.title,
      company: e.company,
      year: `${toYear(e.startDate) || "—"} — ${e.isCurrent ? "Present" : toYear(e.endDate) || "—"}`,
      description: e.description || "",
    })),
    services: (doc.skills || []).slice(0, 4).map((s: any, i: number) => ({
      index: String(i + 1).padStart(2, "0"),
      title: s.category || "Skill Area",
      description: (s.skills || []).join(", "),
    })),
    education: (doc.education || []).map(e => ({
      institution: e.institution,
      degree: [e.degree, e.fieldOfStudy].filter(Boolean).join(" in "),
      year: `${toYear(e.startDate) || "—"} — ${toYear(e.endDate) || "Present"}`,
    })),
    social: (hero.primaryLinks || []).map((l: { title: string; url: string }) => ({
      label: l.title,
      href: l.url,
    })),
    contact: {
      email: contact.email || "",
      location: contact.location || "",
    },
    hiddenSections: doc.configuration?.hiddenSections || [],
    certifications: doc.certifications || [],
    skills: doc.skills || [],
  };
}