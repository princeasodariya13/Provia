// @ts-nocheck
"use client";
import { useTemplateData } from "../context";

export default function Footer() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <footer className="border-t border-line-light dark:border-line-dark py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-light dark:text-muted-dark text-center sm:text-left">
          Building the future, one line at a time.
        </p>
        <div className="flex gap-5">
          {profile.socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              className="text-sm text-muted-light dark:text-muted-dark hover:text-accent transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
        <div className="text-xs text-muted-light dark:text-muted-dark font-mono">
          © {new Date().getFullYear()} {profile.name}
        </div>
      </div>
    </footer>
  );
}
