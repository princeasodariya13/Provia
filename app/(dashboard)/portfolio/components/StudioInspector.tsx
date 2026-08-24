/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React from "react";
import { StudioTab, ContentSection } from "../page";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  activeTab: StudioTab;
  activeSection: ContentSection;
  document: PortfolioDocumentDTO | null;
  onChange: (updater: (doc: PortfolioDocumentDTO) => PortfolioDocumentDTO) => void;
  templateId: string;
  setTemplateId: (id: string) => void;
  publication: any;
  versions: any[];
  onRestore: (versionId: string) => void;
  onUnpublish: () => void;
}

export function StudioInspector({ 
  activeTab, activeSection, document, onChange, templateId, setTemplateId, 
  publication, versions, onRestore, onUnpublish 
}: Props) {
  
  if (!document) {
    return <div className="w-80 border-l border-border-light bg-surface shrink-0" />;
  }

  const handleHeroChange = (field: string, value: string) => {
    onChange(doc => ({
      ...doc,
      hero: { ...doc.hero, [field]: value }
    }));
  };

  const renderContentEditor = () => {
    switch (activeSection) {
      case "hero":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Name</label>
              <Input 
                value={document.hero.name} 
                onChange={(e) => handleHeroChange("name", e.target.value)} 
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Headline</label>
              <Input 
                value={document.hero.headline} 
                onChange={(e) => handleHeroChange("headline", e.target.value)} 
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Short Intro</label>
              <Textarea 
                value={document.hero.shortIntroduction} 
                onChange={(e) => handleHeroChange("shortIntroduction", e.target.value)} 
                rows={4}
                className="text-sm resize-none"
              />
            </div>
          </div>
        );
      case "about":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Summary</label>
              <Textarea 
                value={document.about.summary} 
                onChange={(e) => onChange(doc => ({ ...doc, about: { ...doc.about, summary: e.target.value } }))}
                rows={8}
                className="text-sm resize-none"
              />
            </div>
          </div>
        );
      case "experience":
        return (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">Experiences are synced from your canonical profile. Edits here affect presentation only.</p>
            {document.experience.map((exp, idx) => (
              <div key={idx} className="p-3 border border-border-light rounded-lg bg-surface-muted/30 space-y-3">
                <Input 
                  value={exp.title} 
                  onChange={(e) => {
                    const arr = [...document.experience];
                    arr[idx] = { ...arr[idx], title: e.target.value };
                    onChange(doc => ({ ...doc, experience: arr }));
                  }}
                  className="text-sm font-bold"
                />
                <Input 
                  value={exp.company} 
                  onChange={(e) => {
                    const arr = [...document.experience];
                    arr[idx] = { ...arr[idx], company: e.target.value };
                    onChange(doc => ({ ...doc, experience: arr }));
                  }}
                  className="text-sm"
                />
                <Textarea 
                  value={exp.description || ""} 
                  onChange={(e) => {
                    const arr = [...document.experience];
                    arr[idx] = { ...arr[idx], description: e.target.value };
                    onChange(doc => ({ ...doc, experience: arr }));
                  }}
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>
            ))}
          </div>
        );
      case "projects":
        return (
          <div className="space-y-4">
            {document.projects.map((proj, idx) => (
              <div key={idx} className="p-3 border border-border-light rounded-lg bg-surface-muted/30 space-y-3">
                <Input 
                  value={proj.name} 
                  onChange={(e) => {
                    const arr = [...document.projects];
                    arr[idx] = { ...arr[idx], name: e.target.value };
                    onChange(doc => ({ ...doc, projects: arr }));
                  }}
                  className="text-sm font-bold"
                />
                <Textarea 
                  value={proj.description || ""} 
                  onChange={(e) => {
                    const arr = [...document.projects];
                    arr[idx] = { ...arr[idx], description: e.target.value };
                    onChange(doc => ({ ...doc, projects: arr }));
                  }}
                  rows={3}
                  className="text-xs resize-none"
                />
                <Input 
                  value={proj.url || ""} 
                  placeholder="https://..."
                  onChange={(e) => {
                    const arr = [...document.projects];
                    arr[idx] = { ...arr[idx], url: e.target.value };
                    onChange(doc => ({ ...doc, projects: arr }));
                  }}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="text-sm text-text-secondary text-center py-8">
            Editor for {activeSection} not fully implemented in this demo.
          </div>
        );
    }
  };

  const renderDesignEditor = () => {
    const templates = TemplateRegistry.getAllMetadata();
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Template</label>
          <div className="grid grid-cols-1 gap-3">
            {templates.map((t: any) => (
              <div 
                key={t.id} 
                onClick={() => setTemplateId(t.id)}
                className={`relative p-4 border rounded-xl cursor-pointer transition-all bg-surface ${templateId === t.id ? 'border-brand ring-1 ring-brand shadow-[0_4px_12px_rgba(204,41,54,0.1)]' : 'border-border-light hover:border-border-strong hover:shadow-sm'}`}
              >
                {t.recommended && (
                  <span className="absolute top-4 right-4 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                    Recommended
                  </span>
                )}
                
                <div className="font-bold text-base text-text-primary mb-1">{t.name}</div>
                
                {t.tags && t.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {t.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] font-medium text-text-secondary bg-surface-muted px-1.5 py-0.5 rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-text-secondary leading-relaxed mb-3">{t.description}</div>
                
                {t.audience && t.audience.length > 0 && (
                  <div className="pt-2 border-t border-border-light/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Best For</span>
                    <span className="text-[11px] text-text-secondary">{t.audience.join(" · ")}</span>
                  </div>
                )}

                {templateId === t.id && (
                  <div className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand/10 text-brand px-3 py-1.5 text-xs font-bold">
                    Currently Previewing
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Theme / Colors</label>
          <div className="flex items-center justify-between p-3 border border-border-light rounded-lg">
            <span className="text-sm font-medium">Dark Mode Default</span>
            <input type="checkbox"
              checked={document.configuration?.theme === "dark"}
              onChange={(e) => onChange(doc => ({ 
                ...doc, 
                configuration: { ...doc.configuration, theme: e.target.checked ? "dark" : "light" } as any 
              }))}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderSectionsEditor = () => {
    const defaultSections = ["hero", "about", "experience", "projects", "skills", "education", "certifications", "contact"];
    const sections = document.configuration?.sectionOrder?.length ? document.configuration.sectionOrder : defaultSections;
    const hidden = document.configuration?.hiddenSections || [];

    const toggleHide = (s: string) => {
      const isHidden = hidden.includes(s);
      const newHidden = isHidden ? hidden.filter(x => x !== s) : [...hidden, s];
      onChange(doc => ({
        ...doc,
        configuration: { ...doc.configuration, hiddenSections: newHidden } as any
      }));
    };

    return (
      <div className="space-y-2">
        <p className="text-xs text-text-secondary mb-4">Toggle section visibility on your public portfolio.</p>
        {sections.map(s => (
          <div key={s} className="flex items-center justify-between p-3 border border-border-light rounded-lg bg-surface-muted/30">
            <span className="text-sm font-semibold capitalize">{s}</span>
            <input type="checkbox"
              checked={!hidden.includes(s)}
              onChange={() => toggleHide(s)}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderSeoEditor = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Meta Title</label>
          <Input 
            value={document.seo?.title || ""} 
            onChange={(e) => onChange(doc => ({ ...doc, seo: { ...doc.seo, title: e.target.value } }))}
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Meta Description</label>
          <Textarea 
            value={document.seo?.description || ""} 
            onChange={(e) => onChange(doc => ({ ...doc, seo: { ...doc.seo, description: e.target.value } }))}
            rows={4}
            className="text-sm resize-none"
          />
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    return (
      <div className="space-y-4">
        {versions.map(v => {
          const isLive = publication?.portfolioDocumentId === v.id;
          return (
            <div key={v.id} className="p-4 border border-border-light rounded-xl space-y-3 relative">
              {isLive && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-success"></div>}
              <div>
                <span className="font-bold text-sm">Version {v.version}</span>
                <span className="text-xs text-text-secondary block mt-1">{new Date(v.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onRestore(v.id)} className="w-full text-xs font-bold h-8">
                  Restore
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="font-bold text-error text-sm">Danger Zone</h4>
          <p className="text-xs text-text-secondary">Unpublishing will immediately remove your portfolio from the web. It will not delete your data.</p>
        </div>
        <Button variant="outline" onClick={onUnpublish} disabled={!publication?.isActive} className="w-full text-error border-error hover:bg-error-muted">
          Unpublish Portfolio
        </Button>
      </div>
    );
  };

  return (
    <div className="w-80 border-l border-border-light bg-surface shrink-0 flex flex-col h-full overflow-hidden z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="h-14 border-b border-border-light flex items-center px-5 shrink-0 bg-surface-muted/30">
        <h3 className="font-bold text-sm tracking-tight text-text-primary capitalize">
          {activeTab === "content" ? `${activeSection} Content` : activeTab}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar p-5">
        {activeTab === "content" && renderContentEditor()}
        {activeTab === "design" && renderDesignEditor()}
        {activeTab === "sections" && renderSectionsEditor()}
        {activeTab === "seo" && renderSeoEditor()}
        {activeTab === "history" && renderHistory()}
        {activeTab === "settings" && renderSettings()}
      </div>
    </div>
  );
}
