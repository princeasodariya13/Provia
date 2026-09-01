import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  const hero = (doc.hero || {}) as any;
  const about = (doc.about || {}) as any;
  const contact = (doc.contact || {}) as any;

  return {
    profile: {
      name: hero.name || "Professional",
      headline: hero.headline || "Software Engineer",
      subhead: hero.shortIntroduction || about.summary || "",
      avatar: hero.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&fit=crop",
      availability: "Available for opportunities",
      email: contact.email || "",
      location: contact.location || "",
    },
    about: {
      heading: "About Me",
      paragraphs: about.summary
        ? about.summary.split(/\n\n+/).filter(Boolean)
        : (hero.shortIntroduction ? [hero.shortIntroduction] : ["Full-stack developer passionate about great products."]),
      stats: [
        { label: "Projects", value: `${(doc.projects || []).length}+` },
        { label: "Technologies", value: `${(doc.skills || []).flatMap((s: any) => s.skills || []).length}+` },
      ],
    },
    projects: (doc.projects || []).map(p => ({
      title: p.name,
      description: p.description || "No description provided.",
      link: p.url || p.repositoryUrl || "#",
      tags: p.technologies || []
    })),
    experience: (doc.experience || []).map(e => ({
      role: e.title,
      company: e.company,
      duration: `${e.startDate ? new Date(e.startDate).getFullYear() : ""} – ${e.isCurrent ? "Present" : (e.endDate ? new Date(e.endDate).getFullYear() : "")}`,
      description: e.description || ""
    })),
    skills: (doc.skills || []).map((s: any) => ({
      category: s.category || "Skills",
      skills: s.skills || []
    })),
    education: (doc.education || []).map(ed => ({
      institution: ed.institution,
      degree: ed.degree || "",
      fieldOfStudy: ed.fieldOfStudy || "",
      duration: `${ed.startDate ? new Date(ed.startDate).getFullYear() : ""} – ${ed.endDate ? new Date(ed.endDate).getFullYear() : "Present"}`,
    })),
    certifications: (doc.certifications || []).map(c => ({
      name: c.name,
      organization: c.organization,
      year: c.issueDate ? new Date(c.issueDate).getFullYear().toString() : "",
      url: c.credentialUrl || "#"
    })),
    social: (hero.primaryLinks || []).map((l: any) => ({ label: l.title, href: l.url })),
    contact: { email: contact.email || "", location: contact.location || "" },
    navLinks: [
      { label: "About", href: "#about" },
      { label: "Projects", href: "#projects" },
      { label: "Experience", href: "#experience" },
      { label: "Contact", href: "#contact" },
    ],
  };
}