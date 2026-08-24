import React, { useState } from "react";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { CheckCircle2, Search, ArrowRight, Eye, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  document: PortfolioDocumentDTO;
  currentTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onClose: () => void;
}

export function TemplateGallery({ document, currentTemplateId, onSelectTemplate, onClose }: Props) {
  const templates = TemplateRegistry.getAllMetadata();
  const [search, setSearch] = useState("");
  const [previewing, setPreviewing] = useState<string | null>(null);

  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  // If we are in "Full Live Preview" mode for a specific template
  if (previewing) {
    const activeDef = TemplateRegistry.getTemplate(previewing);
    if (!activeDef) return null;
    const TemplateComponent = activeDef.component;
    return (
      <div className="absolute inset-0 bg-background z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top bar */}
        <div className="h-16 border-b border-border-light bg-surface shrink-0 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg text-text-primary">{activeDef.metadata.name}</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand/10 text-brand">Live Preview</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setPreviewing(null)} className="h-9">
              Cancel
            </Button>
            <Button 
              className="h-9 bg-brand hover:bg-brand text-white shadow-md"
              onClick={() => {
                onSelectTemplate(previewing);
                setPreviewing(null);
                onClose();
              }}
            >
              Use This Template
            </Button>
          </div>
        </div>
        
        {/* Live rendering */}
        <div className="flex-1 overflow-y-auto bg-surface-muted flex justify-center shadow-inner">
          <div className="w-full max-w-[1920px] bg-background shadow-2xl origin-top transition-all min-h-full">
            <TemplateComponent document={document} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="shrink-0 p-8 border-b border-border-light bg-surface">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">Template Gallery</h1>
            <p className="text-text-secondary text-sm max-w-xl">
              Choose a design language for your portfolio. We automatically map your canonical data perfectly into whichever template you select.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border-light bg-surface-muted focus:ring-2 focus:ring-brand focus:border-brand text-sm outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8 bg-surface-muted/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map(t => {
            const def = TemplateRegistry.getTemplate(t.id);
            const Comp = def?.component;
            const isSelected = currentTemplateId === t.id;

            return (
              <div 
                key={t.id}
                className={`group relative flex flex-col bg-surface border rounded-2xl overflow-hidden transition-all duration-300 ${isSelected ? 'border-brand shadow-lg ring-1 ring-brand' : 'border-border-light hover:border-border-strong hover:shadow-xl'}`}
              >
                {/* Scaled down Live Preview Thumbnail */}
                <div className="relative h-64 bg-surface-muted overflow-hidden border-b border-border-light">
                  <div className="absolute inset-0 pointer-events-none select-none flex justify-center">
                    <div className="w-[1280px] h-[1024px] origin-top-left transform scale-[0.25] lg:scale-[0.27] shadow-xl">
                      {Comp && <Comp document={document} />}
                    </div>
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setPreviewing(t.id)}
                      className="bg-surface text-text-primary border-border hover:bg-surface-muted shadow-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Live Preview
                    </Button>
                    {!isSelected && (
                      <Button 
                        onClick={() => {
                          onSelectTemplate(t.id);
                          onClose();
                        }}
                        className="bg-brand hover:bg-brand text-white shadow-md"
                      >
                        Use Template
                      </Button>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-4 left-4 bg-brand text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </div>
                  )}
                  {t.recommended && !isSelected && (
                    <div className="absolute top-4 right-4 bg-success/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      Recommended
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-text-primary">{t.name}</h3>
                    <span className="text-xs font-semibold text-text-secondary bg-surface-muted px-2 py-1 rounded">
                      {t.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">
                    {t.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border-light">
                    {t.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-[10px] font-medium text-text-muted bg-surface-muted/50 border border-border-light px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <LayoutTemplate className="w-12 h-12 text-border-strong mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text-primary mb-2">No templates found</h3>
            <p className="text-sm text-text-secondary">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
