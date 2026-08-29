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

  return {
    profile: {
      name: hero.name || "Professional",
      headline: hero.headline || "Software Engineer",
      bio: hero.shortIntroduction || "",
      avatar: hero.avatarUrl || "",
      email: contact.email || "",
      location: contact.location || "",
    },
    about: {
      heading: "About Me",
      paragraphs: about.summary
        ? about.summary.split(/\n\n+/).filter(Boolean)
        : (hero.shortIntroduction ? [hero.shortIntroduction] : ["Passionate developer building great products."]),
      stats: [
        { label: "Projects", value: `${(doc.projects || []).length}+` },
        { label: "Years Exp", value: `${Math.max(0, (doc.experience || []).length * 2)}+` },
        { label: "Technologies", value: `${(doc.skills || []).flatMap((s: any) => s.skills || []).length}+` },
        { label: "Roles", value: `${(doc.experience || []).length}+` },
      ],
    },
    projects: (doc.projects || []).map((p, index) => ({
      title: p.name,
      description: p.description || "No description provided.",
      image: getProjectImage(p.url, index),
      link: p.url || p.repositoryUrl || "#",
      tags: p.technologies || []
    })),
    experience: (doc.experience || []).map(e => ({
      role: e.title,
      company: e.company,
      duration: `${e.startDate ? new Date(e.startDate).getFullYear() : ""} – ${e.isCurrent ? "Present" : (e.endDate ? new Date(e.endDate).getFullYear() : "")}`,
      description: e.description || "",
      points: e.description ? e.description.split('\n').filter(Boolean) : []
    })),
    skills: (doc.skills || []).flatMap((s: any) => (s.skills || []).map((name: string) => ({
      name,
      level: "Advanced"
    }))),
    education: doc.education || [],
    contact: { email: contact.email || "", location: contact.location || "" },
    social: (hero.primaryLinks || []).map((l: any) => ({ label: l.title, href: l.url })),
  };
}