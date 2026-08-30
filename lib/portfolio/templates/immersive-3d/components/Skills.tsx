// @ts-nocheck
import { useTemplateData } from "../context";
import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./Reveal";

const getSkillIconUrl = (skillName: string) => {
  const map: Record<string, string> = {
    // Languages
    "c#": "csharp", "c++": "cplusplus", "c": "c",
    "f#": "fsharp", "r": "r", "go": "go", "golang": "go",
    "rust": "rust", "java": "java", "python": "python",
    "ruby": "ruby", "php": "php", "swift": "swift",
    "kotlin": "kotlin", "dart": "dart", "scala": "scala",
    "typescript": "typescript", "ts": "typescript",
    "javascript": "javascript", "js": "javascript",
    
    // Frameworks & Libraries
    "react.js": "react", "react": "react", "react native": "react",
    "node.js": "nodedotjs", "nodejs": "nodedotjs", "node": "nodedotjs",
    "express.js": "express", "express": "express",
    "next.js": "nextdotjs", "nextjs": "nextdotjs", "next": "nextdotjs",
    "vue.js": "vuedotjs", "vue": "vuedotjs", "vuejs": "vuedotjs",
    "nuxt.js": "nuxtdotjs", "nuxt": "nuxtdotjs",
    "angular": "angular", "angular.js": "angular",
    "svelte": "svelte", "sveltekit": "svelte",
    "django": "django", "flask": "flask", "fastapi": "fastapi",
    "laravel": "laravel", "symfony": "symfony",
    "spring": "spring", "spring boot": "springboot",
    "ruby on rails": "rubyonrails", "rails": "rubyonrails",
    ".net": "dotnet", "asp.net": "dotnet",
    "bootstrap": "bootstrap", "tailwind": "tailwindcss", "tailwindcss": "tailwindcss",
    "material ui": "mui", "mui": "mui",
    
    // Web
    "html": "html5", "html5": "html5",
    "css": "css3", "css3": "css3",
    "sass": "sass", "less": "less",
    "graphql": "graphql", "rest": "rest", "restful apis": "nodedotjs",
    
    // Databases
    "mongodb": "mongodb", "mongo": "mongodb",
    "mysql": "mysql", "postgres": "postgresql", "postgresql": "postgresql",
    "sqlite": "sqlite", "redis": "redis",
    "cassandra": "apachecassandra", "elasticsearch": "elasticsearch",
    "sql server": "microsoftsqlserver", "mssql": "microsoftsqlserver",
    "oracle": "oracle", "supabase": "supabase", "firebase": "firebase",
    
    // DevOps & Cloud
    "git": "git", "github": "github", "gitlab": "gitlab", "bitbucket": "bitbucket",
    "docker": "docker", "kubernetes": "kubernetes", "k8s": "kubernetes",
    "aws": "amazonaws", "amazon web services": "amazonaws",
    "gcp": "googlecloud", "google cloud": "googlecloud",
    "azure": "microsoftazure", "vercel": "vercel", "netlify": "netlify",
    "heroku": "heroku", "digitalocean": "digitalocean",
    "nginx": "nginx", "apache": "apache", "linux": "linux", "ubuntu": "ubuntu",
    
    // Tools
    "vs code": "visualstudiocode", "vscode": "visualstudiocode",
    "npm": "npm", "yarn": "yarn", "pnpm": "pnpm", "webpack": "webpack",
    "vite": "vite", "figma": "figma", "jest": "jest",
    "cypress": "cypress", "postman": "postman", "jira": "jira"
  };
  
  const normalized = skillName.toLowerCase().trim();
  const cdnBase = "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons";
  
  // 1. Check exact map
  if (map[normalized]) return `${cdnBase}/${map[normalized]}.svg`;
  
  // 2. Try stripping ".js" (e.g. "three.js" -> "three")
  const noJs = normalized.replace(/\.js$/, '');
  if (map[noJs]) return `${cdnBase}/${map[noJs]}.svg`;
  
  // Return null if no mapped icon is found to prevent 404 network errors
  return null;
};


export default function Skills() {
  const templateData = useTemplateData();
  const {
    contact = {},
    profile = {},
    marqueeItems = [],
    certifications = [],
    header = {},
    social = {},
    services = [],
    faq = [],
    milestones = [],
    globals = {},
    steps = [],
    about = {},
    experience = [],
    projects = [],
    skills = [],
    stats = [],
    stack = [],
    capabilities = [],
    education = []
  } = templateData || {};

  let skillGroups: { title: string; items: string[] }[] = [];

  if (Array.isArray(skills)) {
    // If it's an array of objects (raw DB format)
    const grouped: Record<string, string[]> = {};
    skills.forEach((s: any) => {
      if (typeof s === "string") {
        if (!grouped["Skills"]) grouped["Skills"] = [];
        grouped["Skills"].push(s);
      } else if (s && typeof s === "object") {
        // If it already has items (another common template format)
        if (s.items || s.skills) {
          skillGroups.push({
            title: s.category?.trim() || s.title?.trim() || "Skills",
            items: s.items || s.skills || []
          });
        } else {
          const category = s.category?.trim() || "Skills";
          const name = s.name;
          if (name) {
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(name);
          }
        }
      }
    });
    if (Object.keys(grouped).length > 0) {
      skillGroups = [...skillGroups, ...Object.entries(grouped).map(([title, items]) => ({ title, items }))];
    }
  } else if (typeof skills === "object" && skills !== null) {
    // If it's a categorized object (normalized format)
    skillGroups = Object.entries(skills).map(([title, items]) => ({
      title,
      items: Array.isArray(items) ? items : []
    }));
  }

  const isMissing = skillGroups.length === 0 && (!stack || stack.length === 0);
  if (isMissing) {
    return (
      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">
        <EmptyState type="skills" />
      </section>
    );
  }
  return (
    <section id="skills" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="02 // Skills" title="Tools I build with." />

        <div className="flex flex-col gap-8">
          {skillGroups.map((g, i) => (
            <Reveal key={`${g.title}-${i}`} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -2, boxShadow: "0 20px 40px -10px rgba(94, 247, 240, 0.15)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="glass rounded-2xl p-6 md:p-8 w-full hover:border-cyan/50 transition-colors"
              >
                <div className="eyebrow mb-6 text-lg">{g.title}</div>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  {(g.items || []).map((s, idx) => {
                    const iconUrl = getSkillIconUrl(s);
                    return (
                      <motion.span 
                        key={s} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.03, type: "spring", stiffness: 300, damping: 20 }}
                        whileHover={{ 
                          scale: 1.1, 
                          y: -3,
                          boxShadow: "0 10px 25px -10px rgba(94, 247, 240, 0.5)",
                          borderColor: "rgba(94, 247, 240, 0.5)",
                          background: "linear-gradient(135deg, rgba(94,247,240,0.1) 0%, rgba(167,139,250,0.1) 100%)",
                          transition: { duration: 0.2, delay: 0 }
                        }}
                        className="px-4 py-2.5 bg-gradient-to-br from-[#0f0f15] to-[#151520] border border-border/40 rounded-xl text-sm md:text-base text-ink flex items-center gap-3 cursor-default shadow-inner shadow-white/5"
                      >
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          {iconUrl ? (
                            <img 
                              src={iconUrl} 
                              alt={`${s} logo`} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <span className={`${iconUrl ? 'hidden ' : ''}w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_rgba(94,247,240,0.8)]`} />
                        </div>
                        <span className="font-medium tracking-wide">{s}</span>
                      </motion.span>
                    );
                  })}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
