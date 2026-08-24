import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      initial: doc.hero?.name?.[0] || "P",
      name: doc.hero?.name || "Professional",
      role: doc.hero?.headline || "",
      location: doc.contact?.location || "",
      tagline: doc.hero?.shortIntroduction || "",
      subhead: doc.about?.summary || "",
      age: "N/A",
      commute: "Remote",
      base: doc.contact?.location || "Global",
      badge: "Available for opportunities",
    },
    socials: (doc.hero?.primaryLinks || []).map((l: any) => ({ label: l.title, href: l.url })),
    navLinks: [
      { label: "Profile", href: "#profile" },
      { label: "Work", href: "#work" },
      { label: "Process", href: "#process" },
      { label: "Contact", href: "#contact" },
    ],
    stats: [
      { value: doc.experience?.length || 0, suffix: "+", label: "Roles" },
      { value: doc.projects?.length || 0, suffix: "+", label: "Projects" },
    ],
    projects: (doc.projects || []).map((p, i) => ({
      index: String(i + 1).padStart(2, '0'),
      title: p.name,
      tag: p.technologies?.[0] || "Project",
      period: "Present",
      url: p.url || p.repositoryUrl || "#"
    })),
    capabilities: (doc.skills || []).slice(0, 3).map((s, i) => ({
      index: String(i + 1).padStart(2, '0'),
      title: s.category || "Skill",
      description: s.skills?.join(", ") || "",
    })),
    process: [],
    faqs: [],
    stack: (doc.skills || []).slice(0, 4).map(s => ({
      name: s.category || "Skill",
      description: s.skills?.join(", ") || "",
    })),
    contact: {
      email: doc.contact?.email || "No email provided",
      phone: "",
      base: doc.contact?.location || "",
      reply: "Reach out via email or LinkedIn"
    },
    experience: doc.experience || [],
    education: doc.education || []
  };
}