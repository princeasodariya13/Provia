// @ts-nocheck
import { useTemplateData } from "../context";

export default function Footer() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-display font-semibold">{profile.name}</div>
          <div className="text-muted text-sm">{profile.role}</div>
        </div>
        <div className="flex gap-5">
          {profile.socials.map((s) => (
            <a key={s.label} href={s.url} className="text-sm text-muted hover:text-cyan transition-colors">
              {s.label}
            </a>
          ))}
        </div>
        <div className="text-xs text-muted font-mono">
          © {new Date().getFullYear()} {profile.name}
        </div>
      </div>
    </footer>
  );
}
