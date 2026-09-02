"use client";

import React from "react";
import { StudioTab, ContentSection } from "../page";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import {
  Type, Palette, Settings, History, Layers, Share2, Zap, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  activeSection: ContentSection;
  setActiveSection: (section: ContentSection) => void;
  document: PortfolioDocumentDTO | null;
  handleGenerateAI: () => void;
  generating: boolean;
}

const TABS = [
  { id: "content" as StudioTab, label: "Content", icon: Type },
  { id: "design" as StudioTab, label: "Design", icon: Palette },
  { id: "sections" as StudioTab, label: "Sections", icon: Layers },
  { id: "seo" as StudioTab, label: "SEO", icon: Share2 },
  { id: "history" as StudioTab, label: "History", icon: History },
  { id: "publish" as StudioTab, label: "Publish", icon: Globe },
  { id: "settings" as StudioTab, label: "Settings", icon: Settings },
] as const;

const CONTENT_SECTIONS: { id: ContentSection; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

export function StudioSidebar({
  activeTab, setActiveTab,
  activeSection, setActiveSection,
  document, handleGenerateAI, generating
}: Props) {
  return (
    <div className="w-12 sm:w-44 md:w-56 bg-surface/80 backdrop-blur-xl border-r border-border-light shrink-0 flex flex-col h-full overflow-hidden z-20">
      <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 sm:p-3 space-y-1" data-lenis-prevent>
        <p className="hidden sm:block px-3 pt-2 pb-3 text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Studio Options</p>
        <div className="sm:hidden h-2" />

        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className={`w-full flex items-center justify-center sm:justify-start gap-3 px-2 sm:px-3 py-2.5 text-sm font-semibold transition-all duration-300 rounded-xl relative overflow-hidden group ${
                isActive
                  ? "bg-brand/10 text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-brand/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted/50 border border-transparent"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-brand rounded-r-full shadow-[0_0_8px_rgba(204,41,54,0.6)]" />
              )}
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isActive ? "text-brand scale-110" : "text-text-muted group-hover:text-text-primary"}`} />
              <span className="hidden sm:block">{tab.label}</span>
              {tab.id === "publish" && (
                <span className="sm:ml-auto w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_4px_rgba(0,255,0,0.5)]" aria-label="Publish" />
              )}
            </button>
          );
        })}

        {/* Content sections sub-nav */}
        {activeTab === "content" && (
          <div className="pt-4 mt-4 border-t border-border-light/50 space-y-1 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />
            <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Content Sections</p>
            {CONTENT_SECTIONS.map(section => {
              const isActive = activeSection === section.id;
              const hasContent = document ? (() => {
                if (section.id === "hero") return !!(document.hero?.name);
                if (section.id === "about") return !!(document.about?.summary);
                if (section.id === "experience") return (document.experience?.length ?? 0) > 0;
                if (section.id === "education") return (document.education?.length ?? 0) > 0;
                if (section.id === "skills") return (document.skills?.length ?? 0) > 0;
                if (section.id === "projects") return (document.projects?.length ?? 0) > 0;
                if (section.id === "certifications") return (document.certifications?.length ?? 0) > 0;
                if (section.id === "contact") return !!(document.contact?.email || document.contact?.location);
                return false;
              })() : false;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all duration-300 rounded-lg group ${
                    isActive
                      ? "bg-surface text-text-primary shadow-sm border border-border-light/80"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-muted/30 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-brand' : 'bg-transparent group-hover:bg-border-strong'}`} />
                    {section.label}
                  </span>
                  {hasContent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-success/80 shadow-[0_0_4px_rgba(0,255,0,0.3)]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate button */}
      <div className="p-2 sm:p-4 border-t border-border-light/50 bg-surface/50 backdrop-blur-md">
        <Button
          variant="outline"
          className="w-full text-sm font-bold shadow-sm hover:shadow-brand/10 hover:border-brand/30 transition-all rounded-xl h-10"
          onClick={handleGenerateAI}
          disabled={generating}
          title="Generate with AI"
        >
          <Zap className={`w-4 h-4 shrink-0 ${generating ? 'text-text-muted animate-pulse' : 'text-brand'}`} />
          <span className="hidden sm:block ml-2">{generating ? "Generating…" : "Generate with AI"}</span>
        </Button>
      </div>
    </div>
  );
}
