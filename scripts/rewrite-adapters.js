const fs = require('fs');
const path = require('path');

const adapters = {
  'classic-professional': `
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
    socials: doc.contact?.primaryLinks?.map(l => ({ label: l.title, href: l.url })) || [],
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
      phone: doc.contact?.phone || "",
      base: doc.contact?.location || "",
      reply: "Reach out via email or LinkedIn"
    },
    experience: doc.experience || [],
    education: doc.education || []
  };
}
`,
  'ai-technology': `
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      name: doc.hero?.name || "Professional",
      headline: doc.hero?.headline || "",
      bio: doc.about?.summary || doc.hero?.shortIntroduction || "",
      avatar: doc.hero?.avatarUrl || "",
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
      year: e.startDate?.split(' ')?.[1] || e.startDate || "Past",
      title: e.title,
      description: e.company,
      link: "#"
    })),
    social: (doc.contact?.primaryLinks || []).map(l => ({
      platform: l.title,
      url: l.url
    })),
    email: doc.contact?.email || ""
  };
}
`,
  'motion-creative': `
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      name: doc.hero?.name || "Professional",
      role: doc.hero?.headline || "",
      tagline: doc.hero?.shortIntroduction || "",
      location: doc.contact?.location || ""
    },
    about: {
      description: doc.about?.summary || doc.hero?.shortIntroduction || ""
    },
    projects: (doc.projects || []).map((p) => ({
      title: p.name,
      category: p.technologies?.[0] || "Project",
      year: "Present",
      image: p.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070",
      link: p.url || p.repositoryUrl || "#"
    })),
    experience: (doc.experience || []).map(e => ({
      role: e.title,
      company: e.company,
      period: \`\${e.startDate} - \${e.endDate || 'Present'}\`
    })),
    social: (doc.contact?.primaryLinks || []).map(l => ({
      label: l.title,
      href: l.url
    })),
    contact: {
      email: doc.contact?.email || ""
    }
  };
}
`,
  'modern-minimal': `
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export function mapProviaToTemplate(doc: PortfolioDocumentDTO) {
  return {
    profile: {
      name: doc.hero?.name || "Professional",
      title: doc.hero?.headline || "",
      bio: doc.about?.summary || doc.hero?.shortIntroduction || "",
      avatar: doc.hero?.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&fit=crop",
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
      duration: \`\${e.startDate} - \${e.endDate || 'Present'}\`,
      description: e.description
    })),
    skills: (doc.skills || []).flatMap(s => s.skills),
    socials: (doc.contact?.primaryLinks || []).map(l => ({
      platform: l.title,
      url: l.url
    }))
  };
}
`,
  'creative-editorial': `
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
      image: p.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072",
      url: p.url || p.repositoryUrl || "#"
    })),
    experience: (doc.experience || []).map(e => ({
      title: e.title,
      company: e.company,
      year: \`\${e.startDate} - \${e.endDate || 'Present'}\`
    })),
    services: (doc.skills || []).slice(0, 4).map((s, i) => ({
      index: String(i + 1).padStart(2, '0'),
      title: s.category || "Skill Area"
    })),
    social: (doc.contact?.primaryLinks || []).map(l => ({
      label: l.title,
      href: l.url
    })),
    contact: {
      email: doc.contact?.email || ""
    }
  };
}
`
};

const templatesMap = {
  'classic-professional': 'engineer',
  'ai-technology': 'ai-developer',
  'motion-creative': 'motion-engineer',
  'modern-minimal': 'modern',
  'creative-editorial': 'madhukar'
};

const baseDir = path.join(__dirname, '..', 'lib', 'portfolio', 'templates');

for (const [newId, oldFolder] of Object.entries(templatesMap)) {
  const adapterPath = path.join(baseDir, oldFolder, 'adapter.ts');
  if (fs.existsSync(adapterPath)) {
    fs.writeFileSync(adapterPath, adapters[newId].trim());
    console.log("Updated adapter for " + oldFolder);
  }
}
console.log('Adapter updates complete.');
