// @ts-nocheck
"use client";
import { useTemplateData } from "../context";

export default function Footer() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { 
  contact = {},
  profile = {},
  socials = [],
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

  return (
    <footer className="section-pad py-16 border-t border-border">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        <div>
          <div className="font-display text-2xl font-bold mb-4">
            {profile.initial}
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-semibold max-w-sm">
            Software & systems, built to last.
          </h3>
        </div>

        <div className="flex gap-16">
          <div>
            <p className="eyebrow mb-4">Base</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>{profile.base}</li>
              <li>Remote friendly</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Social</p>
            <ul className="space-y-2 text-sm text-muted">
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="hover:text-accent transition-colors">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col-reverse md:flex-row items-center justify-between gap-4 eyebrow">
        <span>© {new Date().getFullYear()} {profile.name.toUpperCase()}</span>
        <span>BUILT WITH NEXT.JS + TYPESCRIPT</span>
      </div>
    </footer>
  );
}
