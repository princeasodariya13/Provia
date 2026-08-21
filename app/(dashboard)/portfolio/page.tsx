/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  FileText,
  CheckCircle2,
  Eye,
  Globe,
  ExternalLink,
  XCircle,
  Edit,
  History,
  Copy,
  Check,
  Zap,
} from "lucide-react";

export default function PortfolioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
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
        const res = await apiClient.get<any>("/api/v1/portfolio");
        if (res.success) {
          setData(res.data);
        }

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

    const res = await apiClient.post<any>("/api/v1/portfolio", {});

    if (res.success) {
      setData(res.data);
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

    const res = await apiClient.post<any>(`/api/v1/portfolio/${targetId}/${action}`, {});

    if (res.success) {
      const reloadRes = await apiClient.get<any>("/api/v1/portfolio");
      if (reloadRes.success) setData(reloadRes.data);

      const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
      if (vRes.success) setVersions(vRes.data || []);
    } else {
      setError(res.error || `Failed to ${action} portfolio.`);
    }
    setPublishing(false);
  };

  const handleCopyLink = () => {
    if (data?.publication?.publicUrl) {
      navigator.clipboard.writeText(data.publication.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-surface animate-pulse" />
          <div className="h-4 w-96 bg-surface animate-pulse" />
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
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        title="Portfolio Content Engine"
        description="Transform your canonical profile and AI analysis into a structured, production portfolio."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Portfolio", href: "/portfolio" },
        ]}
        actions={
          data && (
            <Button
              onClick={handleGenerate}
              disabled={generating}
              variant="default"
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {generating ? "Generating..." : `Build New Version (v${(data.version || 0) + 1})`}
            </Button>
          )
        }
      />

      {error && (
        <div className="p-4 border border-error bg-error/10 text-error text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Publication Status"
          value={isPublished ? "Live" : "Draft"}
          subtext={isPublished ? "Public on the web" : "Private draft version"}
          icon={<Globe className="w-5 h-5 text-brand" />}
        />

        <StatCard
          title="Active Document"
          value={data ? `Version ${data.version}` : "None"}
          subtext={data ? `Created ${new Date(data.createdAt).toLocaleDateString()}` : "Not generated yet"}
          icon={<FileText className="w-5 h-5 text-brand" />}
        />

        <StatCard
          title="Total Versions"
          value={versions.length}
          subtext="Generated portfolio revisions"
          icon={<History className="w-5 h-5 text-brand" />}
        />
      </div>

      {/* Live Portfolio Alert Banner */}
      {isPublished && publicUrl && (
        <div className="bg-success/10 border border-success p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-success">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-base">Your portfolio is LIVE</p>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm underline flex items-center gap-1 hover:text-success/80 mt-0.5"
              >
                {publicUrl}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="border-success text-success hover:bg-success hover:text-white"
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button variant="default" size="sm" asChild className="bg-success text-white hover:bg-success/90">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                View Site
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Primary Action Card when no data */}
      {!data && (
        <EmptyState
          title="No portfolio document generated yet"
          description="Build your first portfolio document by compiling your factual profile and validated AI insights."
          icon={<FileText className="w-8 h-8" />}
          actionLabel={generating ? "Generating..." : "Generate Portfolio Document"}
          onAction={handleGenerate}
        />
      )}

      {/* Active Portfolio Controls & Details */}
      {data && (
        <Card className="border-border-strong bg-background rounded-none">
          <CardHeader className="border-b border-border-light pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <CardTitle className="text-xl font-bold">Document Version {data.version}</CardTitle>
              </div>
              <Badge variant={isPublished ? "success" : "secondary"}>
                {isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <p className="text-sm text-text-secondary leading-relaxed">
              This document was generated deterministically from your canonical profile, experience history, skills, and AI analysis.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild variant="default" className="flex items-center gap-2">
                <Link href={`/portfolio/${data.id}/edit`}>
                  <Edit className="w-4 h-4" />
                  Edit Portfolio Content
                </Link>
              </Button>

              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link href={`/portfolio/${data.id}/preview`}>
                  <Eye className="w-4 h-4" />
                  Preview Private Version
                </Link>
              </Button>

              {isPublished ? (
                <Button
                  onClick={() => handlePublish("unpublish")}
                  disabled={publishing}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {publishing ? "Processing..." : "Unpublish Portfolio"}
                </Button>
              ) : (
                <Button
                  onClick={() => handlePublish("publish", data.id, data.version)}
                  disabled={publishing}
                  variant="default"
                  className="flex items-center gap-2 bg-success hover:bg-success/90 text-white"
                >
                  <Globe className="w-4 h-4" />
                  {publishing ? "Processing..." : "Publish to Web"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History Table */}
      {versions.length > 0 && (
        <Card className="border-border-strong bg-background rounded-none">
          <CardHeader className="border-b border-border-light pb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand" />
              <CardTitle className="text-lg font-bold">Version History</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="divide-y divide-border-light">
              {versions.map((v) => {
                const vIsPublished = v.publications && v.publications.length > 0;
                const isCurrent = data && v.id === data.id;

                return (
                  <div
                    key={v.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold bg-surface border border-border-strong px-2 py-0.5">
                          Version {v.version}
                        </span>
                        {isCurrent && <Badge variant="brand">Active</Badge>}
                        {vIsPublished && <Badge variant="success">Published</Badge>}
                      </div>
                      <p className="text-xs text-text-secondary">
                        Created: {new Date(v.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!vIsPublished && (
                        <Button
                          onClick={() => handlePublish("publish", v.id, v.version)}
                          disabled={publishing}
                          size="sm"
                          variant="outline"
                        >
                          Publish
                        </Button>
                      )}
                      {v.id !== data?.id && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/portfolio/${v.id}/edit`}>Restore / Edit</Link>
                        </Button>
                      )}
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/portfolio/${v.id}/preview`}>Preview</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
