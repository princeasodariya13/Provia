// @ts-nocheck
import { useTemplateData } from "../context";

export default function Footer() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <footer className="section-pad py-10 border-t border-border">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 eyebrow">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Flutter · Spring Boot · Built with Next.js</span>
      </div>
    </footer>
  );
}
