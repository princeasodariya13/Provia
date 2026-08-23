/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import {
  FileText,
  CheckCircle2,
  Globe,
  ExternalLink,
  History,
  Copy,
  Check,
  Zap,
  LayoutTemplate,
  MonitorSmartphone
} from "lucide-react";

export default function PortfolioPage() {
  const { user, isLoading: authLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatestData() {
      if (!user) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await apiClient.get<any>("/api/v1/portfolio");
        if (res.success) {
          setData(res.data);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
        if (vRes.success) {
          setVersions(vRes.data || []);
        }
      } catch (err) {
        console.error("Failed loading portfolio data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) fetchLatestData();
  }, [user, authLoading]);

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.post<any>("/api/v1/portfolio", {});

    if (res.success) {
      setData(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
      if (vRes.success) setVersions(vRes.data || []);
    } else {
      setError(res.error || "Failed to generate portfolio document.");
    }
    setGenerating(false);
  };

  const handlePublish = async (action: "publish" | "unpublish", targetId: string = data?.id, targetVersion?: number) => {
    if (action === "publish") {
      const confirmPublish = window.confirm(
        `Are you sure you want to publish Version ${targetVersion || data?.version}? This will overwrite your live portfolio.`
      );
      if (!confirmPublish) return;
    }

    setError(null);
    setPublishing(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.post<any>(`/api/v1/portfolio/${targetId}/${action}`, {});

    if (res.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reloadRes = await apiClient.get<any>("/api/v1/portfolio");
      if (reloadRes.success) setData(reloadRes.data);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
      if (vRes.success) setVersions(vRes.data || []);
    } else {
      setError(res.error || `Failed to ${action} portfolio.`);
    }
    setPublishing(false);
  };

  const copyPublicUrl = () => {
    if (data?.publication?.publicUrl) {
      navigator.clipboard.writeText(data.publication.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-12">
        <div className="space-y-4">
          <div className="h-10 w-1/3 bg-surface-muted animate-pulse" />
          <div className="h-5 w-1/2 bg-surface-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const isPublished = data?.publication?.isActive;
  const publicUrl = data?.publication?.publicUrl;

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <PageHeader
        title="Portfolio Studio"
        description="Generate, review, and publish your professional portfolio."
        breadcrumbs={[{ label: "Workspace", href: "/dashboard" }, { label: "Portfolio", href: "/portfolio" }]}
      />

      {error && (
        <div className="p-4 bg-error-muted border border-error text-error text-sm font-semibold rounded-xl flex items-center gap-2">
          {error}
        </div>
      )}

      {/* ── TOP STUDIO CONTROLS ── */}
      <section className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 md:p-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">Publishing Status</h2>
              {isPublished ? (
                <Badge variant="success" className="px-3 py-1 font-bold tracking-widest uppercase text-[10px]">
                  Live
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-3 py-1 font-bold tracking-widest uppercase text-[10px]">
                  Draft
                </Badge>
              )}
            </div>
            
            {isPublished && publicUrl ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-text-secondary">Your portfolio is live at:</p>
                <div className="flex items-center gap-2 max-w-md">
                  <div className="flex-1 bg-surface-muted border border-border-light px-3 py-2 rounded-lg text-xs sm:text-sm text-text-primary truncate select-all font-mono min-w-0">
                    {publicUrl}
                  </div>
                  <Button variant="outline" size="icon" onClick={copyPublicUrl} className="shrink-0 rounded-lg hover:border-brand transition-colors" title="Copy link">
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-text-secondary" />}
                  </Button>
                  <Button variant="outline" size="icon" asChild className="shrink-0 rounded-lg hover:border-brand transition-colors" title="Open in new tab">
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-text-secondary" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary max-w-lg">
                Your portfolio is currently private. Publish it to make it visible to the world.
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            {data ? (
              isPublished ? (
                <Button variant="outline" size="lg" onClick={() => handlePublish("unpublish")} disabled={publishing} className="rounded-full font-bold w-full md:w-auto">
                  {publishing ? "Unpublishing..." : "Unpublish Portfolio"}
                </Button>
              ) : (
                <Button variant="default" size="lg" onClick={() => handlePublish("publish")} disabled={publishing} className="rounded-full shadow-sm font-bold bg-success hover:bg-success w-full md:w-auto">
                  <Globe className="w-4 h-4 mr-2" />
                  {publishing ? "Publishing..." : "Publish to Web"}
                </Button>
              )
            ) : null}
            <Button variant={data ? "outline" : "default"} size="lg" onClick={handleGenerate} disabled={generating} className="rounded-full font-bold shadow-sm w-full md:w-auto">
              <Zap className="w-4 h-4 mr-2" />
              {generating ? "Generating..." : (data ? "Generate New Version" : "Generate Portfolio")}
            </Button>
          </div>
        </div>
      </section>

      {/* ── CURRENT PORTFOLIO PREVIEW ── */}
      {data ? (
        <section className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-border-light p-5 md:p-8 bg-surface-muted/30 flex flex-col justify-between">
            <div>
              <h3 className="text-base md:text-lg font-bold text-text-primary mb-2">Current Working Version</h3>
              <p className="text-sm text-text-secondary mb-6">
                Version {data.version} • Generated {new Date(data.createdAt).toLocaleDateString()}
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-surface border border-border-light rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">Active Template</span>
                  <span className="text-sm font-bold text-text-primary capitalize">{data.templateId.replace("-", " ")}</span>
                </div>
                
                <div className="p-4 bg-surface border border-border-light rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">Document Status</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm font-bold text-text-primary">Structured & Ready</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-8 rounded-xl font-bold bg-white" asChild>
              <Link href={`/portfolio/${data.id}/preview`}>
                <MonitorSmartphone className="w-4 h-4 mr-2 text-text-secondary" />
                Interactive Preview
              </Link>
            </Button>
          </div>
          
          <div className="md:w-2/3 p-6 md:p-8 flex items-center justify-center bg-surface-muted/10">
             {/* Fake browser window for visual premium feel */}
             <div className="w-full max-w-xl bg-background border border-border-light rounded-xl shadow-md overflow-hidden flex flex-col">
                <div className="h-8 bg-surface-muted border-b border-border-light flex items-center px-4 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong/20" />
                </div>
                <div className="p-8 aspect-[4/3] flex flex-col items-center justify-center text-center">
                  <LayoutTemplate className="w-12 h-12 text-border-strong/30 mb-4" />
                  <h4 className="font-bold text-lg text-text-primary mb-2">Editorial Template Ready</h4>
                  <p className="text-sm text-text-secondary max-w-sm">
                    Your professional data has been beautifully typeset and is ready for publishing. 
                  </p>
                </div>
             </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title="No portfolio generated yet"
          description="Click 'Generate Portfolio' to automatically transform your canonical profile data into a beautiful professional publication."
          icon={<LayoutTemplate className="w-8 h-8" />}
          actionLabel="Generate Portfolio"
          actionHref=""
          onAction={handleGenerate}
        />
      )}

      {/* ── VERSION HISTORY ── */}
      {versions.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <History className="w-5 h-5 text-text-secondary" /> Version History
            </h2>
            <p className="text-sm text-text-secondary mt-1">Review past generations or roll back to a previous version.</p>
          </div>
          
          <div className="space-y-3">
            {versions.map((v) => {
              const isActive = v.id === data?.id;
              const isPub = v.publication?.isActive;
              return (
                <div key={v.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border transition-colors ${isActive ? "bg-brand-muted/30 border-brand/20" : "bg-surface border-border-light hover:border-border-strong"}`}>
                  <div className="flex items-center gap-5 mb-4 sm:mb-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? "bg-brand text-white" : "bg-surface-muted text-text-secondary"}`}>
                      v{v.version}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-text-primary capitalize">{v.templateId.replace("-", " ")}</span>
                        {isActive && <Badge variant="default" className="text-[10px] px-2 py-0">Current</Badge>}
                        {isPub && <Badge variant="success" className="text-[10px] px-2 py-0">Live</Badge>}
                      </div>
                      <span className="text-xs text-text-secondary">
                        Generated {new Date(v.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-full" asChild>
                      <Link href={`/portfolio/${v.id}/preview`}>Preview</Link>
                    </Button>
                    {!isPub && (
                      <Button variant="outline" size="sm" className="rounded-full" disabled={publishing} onClick={() => handlePublish("publish", v.id, v.version)}>
                        Publish this version
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
