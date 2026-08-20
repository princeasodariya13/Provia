/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, use } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save, Clock, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function PortfolioEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const resolvedParams = use(params);

  useEffect(() => {
    async function fetchDoc() {
      if (!user) return;
      const res = await apiClient.get<any>(`/api/v1/portfolio/${resolvedParams.id}`);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load document.");
      }
      setLoading(false);
    }
    if (!authLoading) fetchDoc();
  }, [user, authLoading, resolvedParams.id]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    
    // We send back the mutated data.content
    const payload = { content: data.content };
    const res = await apiClient.post<any>(`/api/v1/portfolio/${data.id}/versions`, payload);
    
    if (res.success) {
      // Redirect to the new version
      router.push(`/portfolio/${res.data.id}/edit`);
    } else {
      setError(res.error || "Failed to save new version.");
      setSaving(false);
    }
  };

  if (authLoading || loading) return <div className="animate-pulse h-40 bg-surface"></div>;
  if (!data) return <div className="text-error">Document not found.</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-32">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/portfolio" className="text-text-secondary hover:text-accent flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Portfolio Editor</h1>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="font-mono bg-surface px-2 py-1 border border-border-strong">
              Version {data.version}
            </span>
            {data.isPublished && (
              <span className="text-success font-bold tracking-widest uppercase">
                Currently Published
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-4">
          <Link href={`/portfolio/${data.id}/preview`}>
            <Button variant="outline" className="rounded-none font-bold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving} className="rounded-none font-bold flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save as New Version"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-error border border-error p-4 bg-error/10 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="border border-border-strong p-8 bg-surface space-y-12">
        {/* HERO SECTION EDITING */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-widest border-b-2 border-border-strong pb-2">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-text-secondary uppercase mb-1">Headline</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border-strong p-3 outline-none focus:border-accent transition-colors"
                value={data.content.hero.headline}
                onChange={(e) => setData({ ...data, content: { ...data.content, hero: { ...data.content.hero, headline: e.target.value } } })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-secondary uppercase mb-1">Short Introduction</label>
              <textarea 
                className="w-full h-24 bg-background border border-border-strong p-3 outline-none focus:border-accent transition-colors resize-none"
                value={data.content.hero.shortIntroduction}
                onChange={(e) => setData({ ...data, content: { ...data.content, hero: { ...data.content.hero, shortIntroduction: e.target.value } } })}
              />
            </div>
          </div>
        </section>

        {/* ABOUT SECTION EDITING */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-widest border-b-2 border-border-strong pb-2">About Section</h2>
          <div>
            <label className="block text-sm font-bold text-text-secondary uppercase mb-1">Summary</label>
            <textarea 
              className="w-full h-40 bg-background border border-border-strong p-3 outline-none focus:border-accent transition-colors resize-none"
              value={data.content.about.summary}
              onChange={(e) => setData({ ...data, content: { ...data.content, about: { ...data.content.about, summary: e.target.value } } })}
            />
          </div>
        </section>
        
        {/* WE AVOID ARBITRARY HTML/CSS - ONLY TEXT STRINGS ARE MODIFIED */}
        
        <div className="flex items-center gap-2 text-sm text-text-secondary p-4 bg-background border border-border-strong">
          <Clock className="w-4 h-4" />
          <span>Note: Saving will preserve Version {data.version} unchanged and create Version {data.version + 1}. You can freely experiment.</span>
        </div>
      </div>
    </div>
  );
}
