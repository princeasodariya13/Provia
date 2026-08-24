import React from "react";
import { StudioTab, ContentSection } from "../page";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { 
  Layout, Type, Palette, Settings, History, Layers, Share2, Zap
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

export function StudioSidebar({ activeTab, setActiveTab, activeSection, setActiveSection, document, handleGenerateAI, generating }: Props) {
  const tabs = [
    { id: "content", label: "Content", icon: Type },
    { id: "design", label: "Design", icon: Palette },
    { id: "sections", label: "Sections", icon: Layers },
    { id: "seo", label: "SEO", icon: Share2 },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const contentSections: { id: ContentSection; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="w-64 border-r border-border-light bg-surface shrink-0 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-6">
        
        <div className="space-y-1">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Studio</p>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold transition-all rounded-lg ${
                activeTab === tab.id 
                  ? "bg-brand/10 text-brand" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-brand" : "text-text-muted"}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "content" && (
          <div className="space-y-1 pt-4 border-t border-border-light">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Content Sections</p>
            {contentSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all rounded-lg ${
                  activeSection === section.id 
                    ? "bg-surface-muted text-text-primary shadow-sm border border-border-light" 
                    : "text-text-secondary hover:text-text-primary border border-transparent"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        )}

      </div>
      
      <div className="p-4 border-t border-border-light bg-surface-muted/30">
        <Button 
          variant="outline" 
          className="w-full text-xs font-bold shadow-sm"
          onClick={handleGenerateAI}
          disabled={generating}
        >
          <Zap className="w-3.5 h-3.5 mr-2 text-brand" />
          {generating ? "Generating..." : "Generate with AI"}
        </Button>
      </div>
    </div>
  );
}
