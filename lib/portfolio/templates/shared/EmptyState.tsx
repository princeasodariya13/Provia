import React from "react";
import { LayoutTemplate, FolderOpen, Briefcase, GraduationCap, Code2, Award } from "lucide-react";

interface EmptyStateProps {
  type: "projects" | "experience" | "education" | "skills" | "certifications" | "general";
  title?: string;
  description?: string;
  className?: string;
}

const config = {
  projects: {
    icon: FolderOpen,
    title: "No projects yet",
    description: "Your projects will appear here once you add them to your Provia profile or connect GitHub.",
  },
  experience: {
    icon: Briefcase,
    title: "Experience coming soon",
    description: "Your professional experience will appear here once you add your work history.",
  },
  education: {
    icon: GraduationCap,
    title: "Education details coming soon",
    description: "Add your education history to help visitors understand your academic background.",
  },
  skills: {
    icon: Code2,
    title: "Skills are being built",
    description: "Your skills will appear here as you add them to your profile or connect your professional sources.",
  },
  certifications: {
    icon: Award,
    title: "Certifications coming soon",
    description: "Certifications and professional credentials will appear here when you add them.",
  },
  general: {
    icon: LayoutTemplate,
    title: "Content coming soon",
    description: "This section will populate as you complete your Provia profile.",
  }
};

export function EmptyState({ type, title, description, className = "" }: EmptyStateProps) {
  const { icon: Icon, title: defaultTitle, description: defaultDesc } = config[type] || config.general;
  
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-border-light/50 rounded-2xl bg-surface-muted/20 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-text-muted" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title || defaultTitle}</h3>
      <p className="text-sm text-text-secondary max-w-md">{description || defaultDesc}</p>
    </div>
  );
}
