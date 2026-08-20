"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Globe } from "lucide-react";

export function ProfileForm() {
  const { user, isLoading: authLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
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
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || "Failed to save profile");
    }
    setSaving(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateArrayItem = (arrayField: string, index: number, itemField: string, value: any) => {
    setData((prev: any) => {
      const arr = [...prev[arrayField]];
      arr[index] = { ...arr[index], [itemField]: value };
      return { ...prev, [arrayField]: arr };
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addArrayItem = (arrayField: string, defaultItem: any) => {
    setData((prev: any) => ({
      ...prev,
      [arrayField]: [...(prev[arrayField] || []), defaultItem]
    }));
  };

  const removeArrayItem = (arrayField: string, index: number) => {
    setData((prev: any) => {
      const arr = [...prev[arrayField]];
      arr.splice(index, 1);
      return { ...prev, [arrayField]: arr };
    });
  };

  const calcCompleteness = () => {
    if (!data) return 0;
    let score = 0;
    if (data.fullName) score += 15;
    if (data.headline) score += 15;
    if (data.bio) score += 20;
    if (data.location) score += 5;
    if (data.experiences?.length > 0) score += 20;
    if (data.education?.length > 0) score += 10;
    if (data.skills?.length > 0) score += 10;
    if (data.projects?.length > 0) score += 5;
    return score;
  };

  if (authLoading || loading) return <div className="animate-pulse space-y-4"><div className="h-40 bg-surface border border-border-strong rounded-none"></div></div>;
  if (error && !data) return <div className="text-error border border-error p-4 bg-error/10">{error}</div>;

  return (
    <div className="space-y-12">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md py-4 border-b border-border-strong flex justify-between items-center mb-8">
        <div>
          <span className="font-semibold text-lg">Profile Completeness: </span>
          <span className="text-accent font-bold">{calcCompleteness()}%</span>
        </div>
        <div className="flex gap-4 items-center">
          {success && <span className="text-success text-sm font-medium">Saved successfully!</span>}
          {error && <span className="text-error text-sm font-medium">Failed to save.</span>}
          <Button onClick={handleSave} disabled={saving} className="rounded-none font-bold">
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4 border-b border-border-strong pb-2">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input value={data.fullName || ""} onChange={e => updateField("fullName", e.target.value)} placeholder="Jane Doe" className="rounded-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input value={data.location || ""} onChange={e => updateField("location", e.target.value)} placeholder="San Francisco, CA" className="rounded-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Headline</label>
            <Input value={data.headline || ""} onChange={e => updateField("headline", e.target.value)} placeholder="Full Stack Developer" className="rounded-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input value={data.website || ""} onChange={e => updateField("website", e.target.value)} placeholder="https://..." type="url" className="rounded-none" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">About / Bio</label>
            <Textarea value={data.bio || ""} onChange={e => updateField("bio", e.target.value)} placeholder="Write a short professional summary..." className="min-h-[120px] rounded-none" />
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center border-b border-border-strong pb-2 mb-4">
          <h2 className="text-2xl font-bold">Experience</h2>
          <Button variant="outline" size="sm" onClick={() => addArrayItem("experiences", { title: "", company: "", isCurrent: false })} className="rounded-none">
            <Plus className="w-4 h-4 mr-2" /> Add Experience
          </Button>
        </div>
        
        {(!data.experiences || data.experiences.length === 0) && (
          <div className="text-text-secondary text-sm italic py-4">No experience added yet.</div>
        )}

        <div className="space-y-6">
          {data.experiences?.map((exp: any, i: number) => (
            <Card key={exp.id || i} className="border-border-strong relative rounded-none">
              <SourceIndicator source={exp.source} />
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Job Title *</label>
                    <Input className="rounded-none" value={exp.title || ""} onChange={e => updateArrayItem("experiences", i, "title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Company *</label>
                    <Input className="rounded-none" value={exp.company || ""} onChange={e => updateArrayItem("experiences", i, "company", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Start Date</label>
                    <Input className="rounded-none" type="date" value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ""} onChange={e => updateArrayItem("experiences", i, "startDate", e.target.value ? new Date(e.target.value).toISOString() : null)} />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-xs font-medium">End Date</label>
                    <div className="flex items-center gap-4">
                      <Input className="rounded-none flex-1" type="date" disabled={exp.isCurrent} value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ""} onChange={e => updateArrayItem("experiences", i, "endDate", e.target.value ? new Date(e.target.value).toISOString() : null)} />
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={exp.isCurrent} onChange={e => updateArrayItem("experiences", i, "isCurrent", e.target.checked)} />
                        Current
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium">Description</label>
                    <Textarea className="rounded-none" value={exp.description || ""} onChange={e => updateArrayItem("experiences", i, "description", e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => removeArrayItem("experiences", i)} className="text-error hover:text-error hover:bg-error/10 rounded-none">
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center border-b border-border-strong pb-2 mb-4">
          <h2 className="text-2xl font-bold">Education</h2>
          <Button variant="outline" size="sm" onClick={() => addArrayItem("education", { institution: "" })} className="rounded-none">
            <Plus className="w-4 h-4 mr-2" /> Add Education
          </Button>
        </div>
        
        {(!data.education || data.education.length === 0) && (
          <div className="text-text-secondary text-sm italic py-4">No education added yet.</div>
        )}

        <div className="space-y-6">
          {data.education?.map((edu: any, i: number) => (
            <Card key={edu.id || i} className="border-border-strong relative rounded-none">
              <SourceIndicator source={edu.source} />
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Institution *</label>
                    <Input className="rounded-none" value={edu.institution || ""} onChange={e => updateArrayItem("education", i, "institution", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Degree</label>
                    <Input className="rounded-none" value={edu.degree || ""} onChange={e => updateArrayItem("education", i, "degree", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Field of Study</label>
                    <Input className="rounded-none" value={edu.fieldOfStudy || ""} onChange={e => updateArrayItem("education", i, "fieldOfStudy", e.target.value)} />
                  </div>
                  <div className="space-y-2 flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-medium">Start Date</label>
                      <Input className="rounded-none" type="date" value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ""} onChange={e => updateArrayItem("education", i, "startDate", e.target.value ? new Date(e.target.value).toISOString() : null)} />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-medium">End Date</label>
                      <Input className="rounded-none" type="date" value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ""} onChange={e => updateArrayItem("education", i, "endDate", e.target.value ? new Date(e.target.value).toISOString() : null)} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => removeArrayItem("education", i)} className="text-error hover:text-error hover:bg-error/10 rounded-none">
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center border-b border-border-strong pb-2 mb-4">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Button variant="outline" size="sm" onClick={() => addArrayItem("projects", { name: "" })} className="rounded-none">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
        
        {(!data.projects || data.projects.length === 0) && (
          <div className="text-text-secondary text-sm italic py-4">No projects added yet.</div>
        )}

        <div className="space-y-6">
          {data.projects?.map((proj: any, i: number) => (
            <Card key={proj.id || i} className="border-border-strong relative rounded-none">
              <SourceIndicator source={proj.source} />
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Project Name *</label>
                    <Input className="rounded-none" value={proj.name || ""} onChange={e => updateArrayItem("projects", i, "name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Technologies</label>
                    <Input className="rounded-none" value={proj.technologies || ""} onChange={e => updateArrayItem("projects", i, "technologies", e.target.value)} placeholder="React, Node.js" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Project URL</label>
                    <Input className="rounded-none" value={proj.url || ""} onChange={e => updateArrayItem("projects", i, "url", e.target.value)} type="url" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Repository URL</label>
                    <Input className="rounded-none" value={proj.repositoryUrl || ""} onChange={e => updateArrayItem("projects", i, "repositoryUrl", e.target.value)} type="url" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium">Description</label>
                    <Textarea className="rounded-none" value={proj.description || ""} onChange={e => updateArrayItem("projects", i, "description", e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => removeArrayItem("projects", i)} className="text-error hover:text-error hover:bg-error/10 rounded-none">
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <div className="flex justify-between items-center border-b border-border-strong pb-2 mb-4">
            <h2 className="text-2xl font-bold">Skills</h2>
            <Button variant="outline" size="sm" onClick={() => addArrayItem("skills", { name: "" })} className="rounded-none">
              <Plus className="w-4 h-4 mr-2" /> Add Skill
            </Button>
          </div>
          
          {(!data.skills || data.skills.length === 0) && (
            <div className="text-text-secondary text-sm italic py-4">No skills added yet.</div>
          )}

          <div className="space-y-3">
            {data.skills?.map((skill: any, i: number) => (
              <div key={skill.id || i} className="flex gap-2 items-center">
                <Input className="rounded-none" value={skill.name || ""} onChange={e => updateArrayItem("skills", i, "name", e.target.value)} placeholder="e.g. React.js" />
                <Button variant="ghost" size="icon" onClick={() => removeArrayItem("skills", i)} className="text-error rounded-none">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center border-b border-border-strong pb-2 mb-4">
            <h2 className="text-2xl font-bold">Links</h2>
            <Button variant="outline" size="sm" onClick={() => addArrayItem("links", { title: "", url: "" })} className="rounded-none">
              <Plus className="w-4 h-4 mr-2" /> Add Link
            </Button>
          </div>
          
          {(!data.links || data.links.length === 0) && (
            <div className="text-text-secondary text-sm italic py-4">No links added yet.</div>
          )}

          <div className="space-y-4">
            {data.links?.map((link: any, i: number) => (
              <Card key={link.id || i} className="rounded-none border-border-strong p-4 relative">
                 <div className="flex gap-4">
                   <div className="flex-1 space-y-2">
                     <Input className="rounded-none text-sm h-8" value={link.title || ""} onChange={e => updateArrayItem("links", i, "title", e.target.value)} placeholder="Label (e.g. GitHub)" />
                     <Input className="rounded-none text-sm h-8" value={link.url || ""} onChange={e => updateArrayItem("links", i, "url", e.target.value)} placeholder="https://..." type="url" />
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => removeArrayItem("links", i)} className="text-error mt-4 rounded-none">
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SourceIndicator({ source }: { source: string }) {
  if (!source || source === "MANUAL") return null;
  return (
    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase font-bold text-text-secondary bg-surface px-2 py-1 border border-border-strong">
      <Globe className="w-3 h-3" />
      {source}
    </div>
  );
}
