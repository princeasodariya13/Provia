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
    <div className="w-52 border-r border-border-light bg-surface shrink-0 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1" data-lenis-prevent>
        <p className="px-3 pt-1 pb-2 text-[9px] font-bold uppercase tracking-widest text-text-muted">Studio</p>

        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all rounded-lg ${
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand" : "text-text-muted"}`} />
              {tab.label}
              {tab.id === "publish" && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-success" aria-label="Publish" />
              )}
            </button>
          );
        })}

        {/* Content sections sub-nav */}
        {activeTab === "content" && (
          <div className="pt-3 mt-3 border-t border-border-light space-y-0.5">
            <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-text-muted">Sections</p>
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
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold transition-all rounded-lg ${
                    isActive
                      ? "bg-surface-muted text-text-primary shadow-sm border border-border-light"
                      : "text-text-secondary hover:text-text-primary border border-transparent"
                  }`}
                >
                  <span>{section.label}</span>
                  {hasContent && (
                    <span className="w-1 h-1 rounded-full bg-success" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate button */}
      <div className="p-3 border-t border-border-light bg-surface-muted/30">
        <Button
          variant="outline"
          className="w-full text-xs font-bold"
          onClick={handleGenerateAI}
          disabled={generating}
        >
          <Zap className="w-3.5 h-3.5 mr-1.5 text-brand" />
          {generating ? "Generating…" : "Generate with AI"}
        </Button>
      </div>
    </div>
  );
}
