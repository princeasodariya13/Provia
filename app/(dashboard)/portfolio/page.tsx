/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, FileText, CheckCircle2, Eye, Globe, ExternalLink, XCircle, Edit, History } from "lucide-react";
import Link from "next/link";

export default function PortfolioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatest() {
      if (!user) return;
      const res = await apiClient.get<any>("/api/v1/portfolio");
      if (res.success) {
        setData(res.data);
      }
      
      const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
      if (vRes.success) {
        setVersions(vRes.data);
      }

      setLoading(false);
    }
    if (!authLoading) fetchLatest();
  }, [user, authLoading]);

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    
    const res = await apiClient.post<any>("/api/v1/portfolio", {});
    
    if (res.success) {
      setData(res.data);
      // Reload versions
      const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
      if (vRes.success) setVersions(vRes.data);
    } else {
      setError(res.error || "Failed to generate portfolio document.");
    }
    setGenerating(false);
  };

  const handlePublish = async (action: 'publish' | 'unpublish', targetId: string = data.id, targetVersion?: number) => {
    if (action === 'publish') {
      const confirmPublish = window.confirm(`Are you sure you want to publish Version ${targetVersion || data.version}? This will overwrite your live portfolio.`);
      if (!confirmPublish) return;
    }

    setError(null);
    setPublishing(true);
    
    const res = await apiClient.post<any>(`/api/v1/portfolio/${targetId}/${action}`, {});
    
    if (res.success) {
      // Reload portfolio data to get updated publication
      const reloadRes = await apiClient.get<any>("/api/v1/portfolio");
      if (reloadRes.success) setData(reloadRes.data);
      
      const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
      if (vRes.success) setVersions(vRes.data);
    } else {
      setError(res.error || `Failed to ${action} portfolio.`);
    }
    setPublishing(false);
  };

  if (authLoading || loading) return <div className="animate-pulse h-40 bg-surface"></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 relative z-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Portfolio Content Engine</h1>
        <p className="text-text-secondary text-lg">
          Transform your canonical profile and AI analysis into a structured, template-agnostic portfolio document.
        </p>
      </div>

      {error && (
        <div className="text-error border border-error p-4 bg-error/10 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <Card className="rounded-none border-border-strong bg-background">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <FileText className="w-8 h-8 text-accent" />
          <h2 className="text-xl font-bold">Generate Document (v{data ? (data.version + 1) : 1})</h2>
          <p className="text-text-secondary max-w-lg">
            This will fetch your latest factual profile and validated AI analysis to deterministically build your final portfolio content.
          </p>
          <Button onClick={handleGenerate} disabled={generating} className="rounded-none font-bold min-w-[200px]">
            {generating ? "Generating..." : "Generate Portfolio Document"}
          </Button>
        </CardContent>
      </Card>

      {data && data.content && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-success font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>Document v{data.version} - Generated Successfully</span>
            </div>
            <span className="text-sm text-text-secondary uppercase tracking-wider font-bold">
              {data.status}
            </span>
          </div>
          
          {data.publication?.isActive && (
            <div className="bg-success/10 border border-success p-4 flex items-center justify-between text-success mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span className="font-medium">Your portfolio is LIVE at:</span>
                <a href={data.publication.publicUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline flex items-center gap-1 hover:text-success/80">
                  {data.publication.publicUrl}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <Link href={`/portfolio/${data.id}/edit`}>
              <Button className="rounded-none font-bold flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Portfolio
              </Button>
            </Link>
            
            <Link href={`/portfolio/${data.id}/preview`}>
              <Button variant="outline" className="rounded-none font-bold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview Private Version
              </Button>
            </Link>
            
            {data.publication?.isActive ? (
              <Button onClick={() => handlePublish('unpublish')} disabled={publishing} variant="destructive" className="rounded-none font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {publishing ? "Processing..." : "Unpublish Portfolio"}
              </Button>
            ) : (
              <Button onClick={() => handlePublish('publish', data.id, data.version)} disabled={publishing} className="rounded-none font-bold flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {publishing ? "Processing..." : "Publish to Web"}
              </Button>
            )}
          </div>
          
          <div className="pt-8 border-t border-border-strong mt-8">
            <div className="flex items-center gap-2 mb-6 text-text-secondary">
              <History className="w-5 h-5" />
              <h3 className="text-xl font-bold uppercase tracking-widest text-primary">Version History</h3>
            </div>
            <div className="space-y-4">
              {versions.map((v) => (
                <div key={v.id} className="border border-border-strong p-4 bg-background flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono bg-surface border border-border-strong px-2 py-0.5 text-sm font-bold">
                        Version {v.version}
                      </span>
                      {v.id === data.id && (
                        <span className="text-xs bg-accent text-white px-2 py-0.5 font-bold uppercase tracking-widest">
                          Latest
                        </span>
                      )}
                      {v.publications && v.publications.length > 0 && (
                        <span className="text-xs bg-success text-white px-2 py-0.5 font-bold uppercase tracking-widest">
                          Published
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-secondary">
                      Created: {new Date(v.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!(v.publications && v.publications.length > 0) && (
                      <Button onClick={() => handlePublish('publish', v.id, v.version)} disabled={publishing} variant="default" size="sm" className="rounded-none font-bold">
                        Publish This Version
                      </Button>
                    )}
                    {v.id !== data.id && (
                      <Link href={`/portfolio/${v.id}/edit`}>
                        <Button variant="outline" size="sm" className="rounded-none font-bold">
                          Restore / Edit
                        </Button>
                      </Link>
                    )}
                    <Link href={`/portfolio/${v.id}/preview`}>
                      <Button variant="outline" size="sm" className="rounded-none font-bold">
                        Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-text-secondary bg-surface p-4 border border-border-strong overflow-x-auto mt-8 hidden">
            <pre>{JSON.stringify(data.content, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
