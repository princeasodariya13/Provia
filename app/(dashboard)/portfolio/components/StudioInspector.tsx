/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { StudioTab, ContentSection } from "../page";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Globe, Copy, ExternalLink, RefreshCw, Clock,
  CheckCircle2, AlertTriangle, Zap, Eye
} from "lucide-react";

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
  onPublish: () => void;
  publishing: boolean;
  isPublished: boolean;
  publicUrl: string | null;
  onCopyLink: () => void;
  onRegenerateLink: () => void;
  regeneratingLink: boolean;
  onGenerate: () => void;
  generating: boolean;
}

export function StudioInspector({
  activeTab, activeSection, document, onChange,
  templateId, setTemplateId,
  publication, versions, onRestore, onUnpublish,
  onPublish, publishing, isPublished, publicUrl,
  onCopyLink, onRegenerateLink, regeneratingLink,
  onGenerate, generating
}: Props) {

  const panelTitle = () => {
    if (activeTab === "content") return `${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}`;
    if (activeTab === "design") return "Templates";
    if (activeTab === "sections") return "Visibility";
    if (activeTab === "seo") return "SEO";
    if (activeTab === "history") return "History";
    if (activeTab === "publish") return "Publish";
    if (activeTab === "settings") return "Settings";
    return "";
  };

  const renderContentEditor = () => {
    if (!document) {
      return (
        <div className="py-12 text-center">
          <Zap className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-semibold text-text-secondary mb-1">No portfolio yet</p>
          <p className="text-xs text-text-muted mb-4">Generate your portfolio to start editing content.</p>
          <Button size="sm" onClick={onGenerate} disabled={generating} className="bg-brand hover:bg-brand-hover text-white font-bold">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            {generating ? "Generating…" : "Generate Portfolio"}
          </Button>
        </div>
      );
    }

    switch (activeSection) {
      case "hero":
        return (
          <div className="space-y-4">
            <Field label="Full Name">
              <Input
                value={document.hero.name}
                onChange={(e) => onChange(doc => ({ ...doc, hero: { ...doc.hero, name: e.target.value } }))}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Professional Headline">
              <Input
                value={document.hero.headline}
                onChange={(e) => onChange(doc => ({ ...doc, hero: { ...doc.hero, headline: e.target.value } }))}
                placeholder="e.g. Senior Software Engineer"
              />
            </Field>
            <Field label="Profile Image URL">
              <Input
                value={document.hero.avatarUrl || ""}
                onChange={(e) => onChange(doc => ({ ...doc, hero: { ...doc.hero, avatarUrl: e.target.value } }))}
                placeholder="https://..."
              />
            </Field>
            <Field label="Short Introduction">
              <Textarea
                value={document.hero.shortIntroduction}
                onChange={(e) => onChange(doc => ({ ...doc, hero: { ...doc.hero, shortIntroduction: e.target.value } }))}
                rows={4}
                placeholder="A brief introduction visible at the top of your portfolio"
                className="resize-none"
              />
            </Field>
            <Field label="Links">
              {document.hero.primaryLinks.map((link, i) => (
                <div key={i} className="flex gap-2 mt-2">
                  <Input
                    value={link.title}
                    onChange={(e) => {
                      const arr = [...document.hero.primaryLinks];
                      arr[i] = { ...arr[i], title: e.target.value };
                      onChange(doc => ({ ...doc, hero: { ...doc.hero, primaryLinks: arr } }));
                    }}
                    placeholder="Label"
                    className="w-24 text-xs"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const arr = [...document.hero.primaryLinks];
                      arr[i] = { ...arr[i], url: e.target.value };
                      onChange(doc => ({ ...doc, hero: { ...doc.hero, primaryLinks: arr } }));
                    }}
                    placeholder="https://..."
                    className="flex-1 text-xs"
                  />
                </div>
              ))}
            </Field>
          </div>
        );

      case "about":
        return (
          <div className="space-y-4">
            <Field label="Professional Summary">
              <Textarea
                value={document.about.summary}
                onChange={(e) => onChange(doc => ({ ...doc, about: { ...doc.about, summary: e.target.value } }))}
                rows={8}
                placeholder="A detailed description of your professional background and strengths"
                className="resize-none"
              />
            </Field>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">
              Editing here updates the portfolio document. To update your canonical work history, go to{" "}
              <a href="/profile" className="text-brand underline">Profile</a>.
            </p>
            {document.experience.length === 0 ? (
              <EmptyState
                message="No experience entries"
                hint="Add work experience in your Profile to populate this section."
              />
            ) : (
              document.experience.map((exp, idx) => (
                <div key={idx} className="p-3 border border-border-light rounded-lg bg-surface-muted/30 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Job {idx + 1}</label>
                  <Input
                    value={exp.title}
                    onChange={(e) => {
                      const arr = [...document.experience];
                      arr[idx] = { ...arr[idx], title: e.target.value };
                      onChange(doc => ({ ...doc, experience: arr }));
                    }}
                    placeholder="Job Title"
                    className="font-semibold"
                  />
                  <Input
                    value={exp.company}
                    onChange={(e) => {
                      const arr = [...document.experience];
                      arr[idx] = { ...arr[idx], company: e.target.value };
                      onChange(doc => ({ ...doc, experience: arr }));
                    }}
                    placeholder="Company Name"
                  />
                  <Textarea
                    value={exp.description || ""}
                    onChange={(e) => {
                      const arr = [...document.experience];
                      arr[idx] = { ...arr[idx], description: e.target.value };
                      onChange(doc => ({ ...doc, experience: arr }));
                    }}
                    rows={3}
                    placeholder="Description of your role and achievements"
                    className="resize-none text-xs"
                  />
                </div>
              ))
            )}
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            {document.education.length === 0 ? (
              <EmptyState
                message="No education entries"
                hint="Add your education history in your Profile."
              />
            ) : (
              document.education.map((edu, idx) => (
                <div key={idx} className="p-3 border border-border-light rounded-lg bg-surface-muted/30 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Education {idx + 1}</label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => {
                      const arr = [...document.education];
                      arr[idx] = { ...arr[idx], institution: e.target.value };
                      onChange(doc => ({ ...doc, education: arr }));
                    }}
                    placeholder="Institution Name"
                    className="font-semibold"
                  />
                  <Input
                    value={edu.degree || ""}
                    onChange={(e) => {
                      const arr = [...document.education];
                      arr[idx] = { ...arr[idx], degree: e.target.value };
                      onChange(doc => ({ ...doc, education: arr }));
                    }}
                    placeholder="Degree (e.g. B.Sc.)"
                  />
                  <Input
                    value={edu.fieldOfStudy || ""}
                    onChange={(e) => {
                      const arr = [...document.education];
                      arr[idx] = { ...arr[idx], fieldOfStudy: e.target.value };
                      onChange(doc => ({ ...doc, education: arr }));
                    }}
                    placeholder="Field of Study"
                  />
                </div>
              ))
            )}
          </div>
        );

      case "skills":
        return (
          <div className="space-y-4">
            {document.skills.length === 0 ? (
              <EmptyState
                message="No skills added yet"
                hint="Add your technical skills in your Profile."
              />
            ) : (
              document.skills.map((group, idx) => (
                <div key={idx} className="p-3 border border-border-light rounded-lg bg-surface-muted/30 space-y-2">
                  <Input
                    value={group.category}
                    onChange={(e) => {
                      const arr = [...document.skills];
                      arr[idx] = { ...arr[idx], category: e.target.value };
                      onChange(doc => ({ ...doc, skills: arr }));
                    }}
                    placeholder="Category (e.g. Frontend)"
                    className="font-semibold text-xs"
                  />
                  <Textarea
                    value={group.skills.join(", ")}
                    onChange={(e) => {
                      const arr = [...document.skills];
                      arr[idx] = { ...arr[idx], skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) };
                      onChange(doc => ({ ...doc, skills: arr }));
                    }}
                    rows={2}
                    placeholder="React, TypeScript, Node.js"
                    className="resize-none text-xs"
                  />
                </div>
              ))
            )}
          </div>
        );

      case "projects":
        return (
          <div className="space-y-4">
            {document.projects.length === 0 ? (
              <EmptyState
                message="No projects yet"
                hint="Add projects to your Profile or connect GitHub to auto-import repositories."
              />
            ) : (
              document.projects.map((proj, idx) => (
                <div key={idx} className="p-3 border border-border-light rounded-lg bg-surface-muted/30 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Project {idx + 1}</label>
                  <Input
                    value={proj.name}
                    onChange={(e) => {
                      const arr = [...document.projects];
                      arr[idx] = { ...arr[idx], name: e.target.value };
                      onChange(doc => ({ ...doc, projects: arr }));
                    }}
                    placeholder="Project Name"
                    className="font-semibold"
                  />
                  <Textarea
                    value={proj.description || ""}
                    onChange={(e) => {
                      const arr = [...document.projects];
                      arr[idx] = { ...arr[idx], description: e.target.value };
                      onChange(doc => ({ ...doc, projects: arr }));
                    }}
                    rows={3}
                    placeholder="What does this project do?"
                    className="resize-none text-xs"
                  />
                  <Input
                    value={proj.url || ""}
                    onChange={(e) => {
                      const arr = [...document.projects];
                      arr[idx] = { ...arr[idx], url: e.target.value };
                      onChange(doc => ({ ...doc, projects: arr }));
                    }}
                    placeholder="Live URL (https://...)"
                    className="text-xs"
                  />
                  <Input
                    value={proj.repositoryUrl || ""}
                    onChange={(e) => {
                      const arr = [...document.projects];
                      arr[idx] = { ...arr[idx], repositoryUrl: e.target.value };
                      onChange(doc => ({ ...doc, projects: arr }));
                    }}
                    placeholder="Repository URL"
                    className="text-xs"
                  />
                  <Textarea
                    value={proj.technologies.join(", ")}
                    onChange={(e) => {
                      const arr = [...document.projects];
                      arr[idx] = { ...arr[idx], technologies: e.target.value.split(",").map(s => s.trim()).filter(Boolean) };
                      onChange(doc => ({ ...doc, projects: arr }));
                    }}
                    rows={1}
                    placeholder="React, TypeScript, PostgreSQL"
                    className="resize-none text-xs"
                  />
                </div>
              ))
            )}
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-4">
            {document.certifications.length === 0 ? (
              <EmptyState
                message="No certifications"
                hint="Add certifications to your Profile."
              />
            ) : (
              document.certifications.map((cert, idx) => (
                <div key={idx} className="p-3 border border-border-light rounded-lg bg-surface-muted/30 space-y-2">
                  <Input
                    value={cert.name}
                    onChange={(e) => {
                      const arr = [...document.certifications];
                      arr[idx] = { ...arr[idx], name: e.target.value };
                      onChange(doc => ({ ...doc, certifications: arr }));
                    }}
                    placeholder="Certification Name"
                    className="font-semibold text-xs"
                  />
                  <Input
                    value={cert.organization}
                    onChange={(e) => {
                      const arr = [...document.certifications];
                      arr[idx] = { ...arr[idx], organization: e.target.value };
                      onChange(doc => ({ ...doc, certifications: arr }));
                    }}
                    placeholder="Issuing Organization"
                    className="text-xs"
                  />
                </div>
              ))
            )}
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4">
            <Field label="Email">
              <Input
                value={document.contact.email || ""}
                onChange={(e) => onChange(doc => ({ ...doc, contact: { ...doc.contact, email: e.target.value } }))}
                placeholder="your@email.com"
                type="email"
              />
            </Field>
            <Field label="Location">
              <Input
                value={document.contact.location || ""}
                onChange={(e) => onChange(doc => ({ ...doc, contact: { ...doc.contact, location: e.target.value } }))}
                placeholder="City, Country"
              />
            </Field>
          </div>
        );

      default:
        return null;
    }
  };

  const renderDesignEditor = () => {
    const templates = TemplateRegistry.getAllMetadata();
    return (
      <div className="space-y-3">
        {templates.map((t: any) => (
          <div
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={`relative p-4 border rounded-xl cursor-pointer transition-all bg-surface ${templateId === t.id ? 'border-brand ring-1 ring-brand shadow-sm' : 'border-border-light hover:border-border-strong'}`}
          >
            {t.recommended && (
              <span className="absolute top-3 right-3 bg-success/10 text-success text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                Popular
              </span>
            )}
            <div className="font-bold text-sm text-text-primary mb-0.5">{t.name}</div>
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">{t.category}</div>
            <div className="text-xs text-text-secondary leading-snug">{t.description}</div>
            {templateId === t.id && (
              <div className="mt-2 flex items-center gap-1.5 text-brand text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Template
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSectionsEditor = () => {
    if (!document) return <EmptyState message="Generate portfolio first" hint="" />;
    const defaultSections = ["hero", "about", "experience", "projects", "skills", "education", "certifications", "contact"];
    const sections = document.configuration?.sectionOrder?.length ? document.configuration.sectionOrder : defaultSections;
    const hidden = document.configuration?.hiddenSections || [];

    return (
      <div className="space-y-2">
        <p className="text-xs text-text-secondary mb-3">Toggle section visibility on your published portfolio.</p>
        {sections.map(s => {
          const isHidden = hidden.includes(s);
          return (
            <div key={s} className="flex items-center justify-between p-3 border border-border-light rounded-lg">
              <span className="text-sm font-semibold capitalize text-text-primary">{s}</span>
              <button
                onClick={() => {
                  const newHidden = isHidden ? hidden.filter(x => x !== s) : [...hidden, s];
                  onChange(doc => ({
                    ...doc,
                    configuration: { ...doc.configuration, hiddenSections: newHidden } as any
                  }));
                }}
                className={`w-10 h-5 rounded-full transition-colors relative ${isHidden ? 'bg-border-light' : 'bg-success'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isHidden ? 'left-0.5' : 'left-5'}`} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSeoEditor = () => {
    if (!document) return <EmptyState message="Generate portfolio first" hint="" />;
    return (
      <div className="space-y-4">
        <Field label="Page Title">
          <Input
            value={document.seo?.title || ""}
            onChange={(e) => onChange(doc => ({ ...doc, seo: { ...doc.seo, title: e.target.value } }))}
            placeholder="Your Name | Portfolio"
          />
        </Field>
        <Field label="Meta Description">
          <Textarea
            value={document.seo?.description || ""}
            onChange={(e) => onChange(doc => ({ ...doc, seo: { ...doc.seo, description: e.target.value } }))}
            rows={4}
            placeholder="Brief description shown in search results (≤160 characters)"
            className="resize-none"
          />
          <p className="text-[10px] text-text-muted mt-1">
            {(document.seo?.description || "").length}/160 chars
          </p>
        </Field>
      </div>
    );
  };

  const renderHistory = () => {
    if (versions.length === 0) {
      return <EmptyState message="No versions yet" hint="Generate your portfolio to create the first version." />;
    }
    return (
      <div className="space-y-3">
        {versions.map(v => {
          const isLive = publication?.portfolioDocumentId === v.id && publication?.isActive;
          return (
            <div key={v.id} className="p-4 border border-border-light rounded-xl space-y-2.5 relative">
              {isLive && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-success">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  Live
                </div>
              )}
              <div>
                <span className="font-bold text-sm text-text-primary">Version {v.version}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-medium text-text-muted">
                    {new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    v.status === 'PUBLISHED' ? 'bg-success/10 text-success' :
                    v.status === 'ARCHIVED' ? 'bg-surface-muted text-text-muted' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {v.status}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(v.id)}
                className="w-full text-xs font-bold h-8"
              >
                Restore this version
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPublish = () => {
    return (
      <div className="space-y-5">
        {/* Status */}
        <div className={`p-4 rounded-xl border ${isPublished ? 'border-success/30 bg-success-muted' : 'border-border-light bg-surface-muted/30'}`}>
          <div className="flex items-center gap-2 mb-1">
            {isPublished ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-text-muted" />
            )}
            <span className="font-bold text-sm text-text-primary">
              {isPublished ? "Portfolio is live" : "Not published"}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            {isPublished
              ? "Your portfolio is publicly accessible via the link below."
              : "Publish your portfolio to make it publicly accessible."
            }
          </p>
        </div>

        {/* Public URL */}
        {publicUrl && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Public URL</label>
            <div className="p-3 border border-border-light rounded-lg bg-surface-muted/30">
              <p className="text-xs text-text-secondary break-all font-mono">{publicUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onCopyLink} className="flex-1 text-xs font-bold h-8">
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1 text-xs font-bold h-8">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open
                </a>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateLink}
              disabled={regeneratingLink}
              className="w-full text-xs text-text-muted h-8"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 ${regeneratingLink ? 'animate-spin' : ''}`} />
              {regeneratingLink ? "Regenerating…" : "Regenerate Link"}
            </Button>
          </div>
        )}

        {/* Publish / Unpublish actions */}
        <div className="space-y-2 pt-2 border-t border-border-light">
          <Button
            onClick={onPublish}
            disabled={publishing || !document}
            className="w-full font-bold h-10 bg-success hover:bg-success text-white"
          >
            <Globe className="w-4 h-4 mr-2" />
            {publishing ? "Publishing…" : isPublished ? "Republish (Update)" : "Publish Portfolio"}
          </Button>

          {isPublished && (
            <Button
              variant="outline"
              onClick={onUnpublish}
              disabled={publishing}
              className="w-full text-xs font-bold h-8 text-error border-error/30 hover:bg-error-muted"
            >
              {publishing ? "Processing…" : "Unpublish"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    if (!document) return <EmptyState message="Generate portfolio first" hint="" />;
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Theme</label>
          <div className="flex gap-2">
            {["light", "dark"].map(theme => (
              <button
                key={theme}
                onClick={() => onChange(doc => ({
                  ...doc,
                  configuration: { ...doc.configuration, theme } as any
                }))}
                className={`flex-1 p-3 rounded-lg border text-xs font-bold capitalize transition-all ${
                  (document.configuration?.theme || "light") === theme
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-border-light text-text-secondary hover:border-border-strong'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-border-light">
          <p className="text-[10px] font-bold uppercase tracking-widest text-error">Danger Zone</p>
          <p className="text-xs text-text-secondary">Unpublishing removes your portfolio from the web without deleting any data.</p>
          <Button
            variant="outline"
            onClick={onUnpublish}
            disabled={!isPublished || publishing}
            className="w-full text-error border-error/30 hover:bg-error-muted text-xs font-bold"
          >
            {publishing ? "Processing…" : "Unpublish Portfolio"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-72 border-l border-border-light bg-surface shrink-0 flex flex-col h-full overflow-hidden shadow-[-2px_0_12px_rgba(0,0,0,0.03)]">
      {/* Panel header */}
      <div className="h-12 border-b border-border-light flex items-center px-4 shrink-0 bg-surface-muted/30">
        <h3 className="font-bold text-xs tracking-tight text-text-primary capitalize">{panelTitle()}</h3>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4" data-lenis-prevent>
        {activeTab === "content" && renderContentEditor()}
        {activeTab === "design" && renderDesignEditor()}
        {activeTab === "sections" && renderSectionsEditor()}
        {activeTab === "seo" && renderSeoEditor()}
        {activeTab === "history" && renderHistory()}
        {activeTab === "publish" && renderPublish()}
        {activeTab === "settings" && renderSettings()}
      </div>
    </div>
  );
}

// Helper components
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm font-semibold text-text-secondary">{message}</p>
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}
