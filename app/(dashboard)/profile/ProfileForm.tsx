/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GitBranch, Briefcase, FileText, CheckCircle2, User } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function ProfileForm() {
  const { user, isLoading: authLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await apiClient.get<any>("/api/v1/profile");
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load profile");
      }
      setLoading(false);
    }
    if (!authLoading) fetchProfile();
  }, [user, authLoading]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);
    
    const res = await apiClient.put("/api/v1/profile", data);
    
    if (res.success) {
      setSuccess(true);
      setIsDirty(false);
      toast.success("Profile saved successfully!");
    } else {
      setError(res.error || "Failed to save profile");
      toast.error(res.error || "Failed to save profile");
    }
    setSaving(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: string, value: any) => {
    setIsDirty(true);
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateArrayItem = (arrayField: string, index: number, itemField: string, value: any) => {
    setIsDirty(true);
    setData((prev: any) => {
      const arr = [...prev[arrayField]];
      arr[index] = { ...arr[index], [itemField]: value };
      return { ...prev, [arrayField]: arr };
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addArrayItem = (arrayField: string, defaultItem: any) => {
    setIsDirty(true);
    setData((prev: any) => ({
      ...prev,
      [arrayField]: [...(prev[arrayField] || []), defaultItem]
    }));
  };

  const removeArrayItem = (arrayField: string, index: number) => {
    setIsDirty(true);
    setData((prev: any) => {
      const arr = [...prev[arrayField]];
      arr.splice(index, 1);
      return { ...prev, [arrayField]: arr };
    });
  };

  if (authLoading || loading) return (
    <div className="animate-pulse space-y-12">
      <div className="h-40 bg-surface-muted rounded-xl"></div>
      <div className="h-40 bg-surface-muted rounded-xl"></div>
    </div>
  );
  if (error && !data) return <div className="text-error border border-error p-4 bg-error/10 rounded-xl">{error}</div>;

  return (
    <div className="space-y-10 pb-24">
      {/* Basic Information */}
      <section className="relative bg-surface/60 backdrop-blur-xl border border-border-light rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-500 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="border-b border-border-light/50 p-6 sm:p-8 bg-surface-muted/20 relative z-10">
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Profile Identity</h2>
          <p className="text-sm text-text-secondary mt-1 font-medium">Your core professional information.</p>
        </div>
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Full Name</label>
            <Input value={data.fullName || ""} onChange={e => updateField("fullName", e.target.value)} placeholder="Jane Doe" className="bg-surface/50 border-border-light hover:border-border transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Location</label>
            <Input value={data.location || ""} onChange={e => updateField("location", e.target.value)} placeholder="San Francisco, CA" className="bg-surface/50 border-border-light hover:border-border transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Headline</label>
            <Input value={data.headline || ""} onChange={e => updateField("headline", e.target.value)} placeholder="Senior Software Engineer" className="bg-surface/50 border-border-light hover:border-border transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Website</label>
            <Input value={data.website || ""} onChange={e => updateField("website", e.target.value)} placeholder="https://..." type="url" className="bg-surface/50 border-border-light hover:border-border transition-colors" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Professional Summary</label>
            <Textarea value={data.bio || ""} onChange={e => updateField("bio", e.target.value)} placeholder="Write a professional summary..." className="min-h-[120px] bg-surface/50 border-border-light hover:border-border transition-colors" />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="relative bg-surface/60 backdrop-blur-xl border border-border-light rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-500 group">
        <div className="border-b border-border-light/50 p-6 sm:p-8 bg-surface-muted/20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Experience</h2>
            <p className="text-sm text-text-secondary mt-1 font-medium">Your career history.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => addArrayItem("experiences", { title: "", company: "", isCurrent: false })} className="rounded-full bg-surface shadow-sm hover:border-brand hover:text-brand transition-all">
            <Plus className="w-4 h-4 mr-1.5" /> Add Role
          </Button>
        </div>
        
        <div className="p-6 space-y-8">
          {(!data.experiences || data.experiences.length === 0) && (
            <div className="text-center py-8 text-text-secondary text-sm">No experience entries yet. Add your first role.</div>
          )}

          {data.experiences?.map((exp: any, i: number) => (
            <div key={exp.id || i} className="relative group border border-border-light rounded-xl p-5 hover:border-border-strong transition-colors">
              <SourceBadge source={exp.source} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Job Title</label>
                  <Input value={exp.title || ""} onChange={e => updateArrayItem("experiences", i, "title", e.target.value)} placeholder="Product Designer" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Company</label>
                  <Input value={exp.company || ""} onChange={e => updateArrayItem("experiences", i, "company", e.target.value)} placeholder="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary">Start Date</label>
                  <Input type="date" value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ""} onChange={e => updateArrayItem("experiences", i, "startDate", e.target.value ? new Date(e.target.value).toISOString() : null)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary flex justify-between">
                    End Date
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] uppercase text-brand">
                      <input type="checkbox" checked={exp.isCurrent} onChange={e => updateArrayItem("experiences", i, "isCurrent", e.target.checked)} className="accent-brand" />
                      Present
                    </label>
                  </label>
                  <Input type="date" disabled={exp.isCurrent} value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ""} onChange={e => updateArrayItem("experiences", i, "endDate", e.target.value ? new Date(e.target.value).toISOString() : null)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-text-secondary">Description</label>
                  <Textarea value={exp.description || ""} onChange={e => updateArrayItem("experiences", i, "description", e.target.value)} className="min-h-[100px]" placeholder="Key achievements and responsibilities..." />
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-border-light transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => removeArrayItem("experiences", i)} className="text-error hover:bg-error-muted hover:text-error">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="relative bg-surface/60 backdrop-blur-xl border border-border-light rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-500 group">
        <div className="absolute top-0 left-0 w-64 h-64 bg-success/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="border-b border-border-light/50 p-6 sm:p-8 bg-surface-muted/20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Projects</h2>
            <p className="text-sm text-text-secondary mt-1 font-medium">Showcase your best work.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => addArrayItem("projects", { name: "" })} className="rounded-full bg-surface shadow-sm hover:border-brand hover:text-brand transition-all">
            <Plus className="w-4 h-4 mr-1.5" /> Add Project
          </Button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6 relative z-10">
          {(!data.projects || data.projects.length === 0) && (
            <div className="text-center py-8 text-text-secondary text-sm">No projects added yet.</div>
          )}

          {data.projects?.map((proj: any, i: number) => (
            <div key={proj.id || i} className="relative group/item border border-border-light rounded-xl p-5 hover:border-border-strong transition-colors bg-surface/50">
              <SourceBadge source={proj.source} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-text-secondary">Project Name</label>
                  <Input value={proj.name || ""} onChange={e => updateArrayItem("projects", i, "name", e.target.value)} className="bg-surface/50 border-border-light hover:border-border transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-text-secondary">Technologies (comma separated)</label>
                  <Input value={proj.technologies || ""} onChange={e => updateArrayItem("projects", i, "technologies", e.target.value)} placeholder="React, Next.js, Tailwind" className="bg-surface/50 border-border-light hover:border-border transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-text-secondary">Live URL</label>
                  <Input value={proj.url || ""} onChange={e => updateArrayItem("projects", i, "url", e.target.value)} type="url" placeholder="https://..." className="bg-surface/50 border-border-light hover:border-border transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-text-secondary">Repository URL</label>
                  <Input value={proj.repositoryUrl || ""} onChange={e => updateArrayItem("projects", i, "repositoryUrl", e.target.value)} type="url" placeholder="https://github.com/..." className="bg-surface/50 border-border-light hover:border-border transition-colors" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-text-secondary">Description</label>
                  <Textarea value={proj.description || ""} onChange={e => updateArrayItem("projects", i, "description", e.target.value)} className="bg-surface/50 border-border-light hover:border-border transition-colors" />
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-border-light transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => removeArrayItem("projects", i)} className="text-error hover:bg-error-muted hover:text-error">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Education & Skills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Education */}
        <section className="relative bg-surface/60 backdrop-blur-xl border border-border-light rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-500 group">
          <div className="border-b border-border-light/50 p-6 bg-surface-muted/20 flex justify-between items-center relative z-10">
            <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Education</h2>
            <Button variant="outline" size="sm" onClick={() => addArrayItem("education", { institution: "" })} className="rounded-full bg-surface shadow-sm hover:border-brand hover:text-brand transition-all h-8 px-3">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
          <div className="p-6 space-y-4 relative z-10">
            {(!data.education || data.education.length === 0) && (
              <div className="text-center py-4 text-text-secondary text-sm">No education entries.</div>
            )}
            {data.education?.map((edu: any, i: number) => (
              <div key={edu.id || i} className="group/item border border-border-light rounded-xl p-5 relative bg-surface/50 hover:border-border-strong transition-colors">
                <SourceBadge source={edu.source} />
                <div className="space-y-3 mt-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Institution</label>
                    <Input className="h-9 text-sm mt-1 bg-surface/50 border-border-light hover:border-border" value={edu.institution || ""} onChange={e => updateArrayItem("education", i, "institution", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Degree</label>
                      <Input className="h-9 text-sm mt-1 bg-surface/50 border-border-light hover:border-border" value={edu.degree || ""} onChange={e => updateArrayItem("education", i, "degree", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Field</label>
                      <Input className="h-9 text-sm mt-1 bg-surface/50 border-border-light hover:border-border" value={edu.fieldOfStudy || ""} onChange={e => updateArrayItem("education", i, "fieldOfStudy", e.target.value)} />
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeArrayItem("education", i)} className="absolute top-2 right-2 text-error hover:bg-error-muted h-7 w-7 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="relative bg-surface/60 backdrop-blur-xl border border-border-light rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-500 group">
          <div className="border-b border-border-light/50 p-6 bg-surface-muted/20 flex justify-between items-center relative z-10">
            <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Skills</h2>
            <Button variant="outline" size="sm" onClick={() => addArrayItem("skills", { name: "" })} className="rounded-full bg-surface shadow-sm hover:border-brand hover:text-brand transition-all h-8 px-3">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
          <div className="p-5">
            {(!data.skills || data.skills.length === 0) && (
              <div className="text-center py-4 text-text-secondary text-sm">No skills added.</div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.skills?.map((skill: any, i: number) => (
                <div key={skill.id || i} className="flex items-center bg-surface-muted border border-border-light rounded-full overflow-hidden focus-within:border-brand">
                  <input
                    className="bg-transparent text-sm font-medium px-3 py-1.5 outline-none w-28 placeholder-text-muted"
                    value={skill.name || ""}
                    onChange={e => updateArrayItem("skills", i, "name", e.target.value)}
                    placeholder="e.g. React"
                  />
                  <button onClick={() => removeArrayItem("skills", i)} className="p-1.5 text-text-muted hover:text-error hover:bg-error-muted transition-colors border-l border-border-light">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.04)] md:left-60 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-brand-muted text-brand shrink-0">
              {!isDirty ? <CheckCircle2 className="w-4 h-4 text-success" /> : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">
                {!isDirty ? "Saved changes" : "Unsaved changes"}
              </p>
              {error && <p className="text-xs text-error font-medium truncate">{error}</p>}
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || !isDirty} size="lg" className="rounded-full shadow-sm px-6 sm:px-8 shrink-0">
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  if (!source || source === "MANUAL") return null;
  
  const getSourceIcon = () => {
    if (source === "GITHUB") return <GitBranch className="w-3 h-3" />;
    if (source === "LINKEDIN") return <Briefcase className="w-3 h-3" />;
    if (source === "RESUME") return <FileText className="w-3 h-3" />;
    return <Briefcase className="w-3 h-3" />;
  };

  return (
    <div className="absolute -top-3 left-4 flex items-center gap-1.5 text-[10px] uppercase font-bold text-text-primary bg-surface-muted px-2.5 py-1 border border-border-light rounded-full shadow-sm">
      {getSourceIcon()}
      {source}
    </div>
  );
}
