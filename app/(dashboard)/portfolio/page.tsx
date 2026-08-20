/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileText, CheckCircle2, Eye } from "lucide-react";
import Link from "next/link";

export default function PortfolioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatest() {
      if (!user) return;
      const res = await apiClient.get<any>("/api/v1/portfolio");
      if (res.success) {
        setData(res.data);
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
    } else {
      setError(res.error || "Failed to generate portfolio document.");
    }
    setGenerating(false);
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
          
          <div className="flex gap-4">
            <Link href={`/portfolio/${data.id}/preview`}>
              <Button className="rounded-none font-bold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview Portfolio
              </Button>
            </Link>
          </div>
          
          {/* Debug View of Content */}
          <Card className="rounded-none border-border-strong">
            <CardHeader className="border-b border-border-strong">
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-text-secondary">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {data.content.hero.name}
                </div>
                <div>
                  <strong>Headline:</strong> {data.content.hero.headline}
                </div>
                <div className="col-span-2">
                  <strong>Intro:</strong> {data.content.hero.shortIntroduction}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border-strong">
            <CardHeader className="border-b border-border-strong">
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-text-secondary">
              <p>{data.content.about.summary}</p>
              {data.content.about.careerThemes?.length > 0 && (
                <div className="mt-4">
                  <strong>Themes:</strong> {data.content.about.careerThemes.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none border-border-strong">
            <CardHeader className="border-b border-border-strong">
              <CardTitle>Content Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-text-secondary">
              <ul className="list-disc list-inside space-y-1">
                <li>{data.content.experience?.length || 0} Experience items mapped</li>
                <li>{data.content.education?.length || 0} Education items mapped</li>
                <li>{data.content.projects?.length || 0} Projects mapped</li>
                <li>{data.content.skills?.[0]?.skills?.length || 0} Technical skills mapped</li>
              </ul>
            </CardContent>
          </Card>
          
          <div className="text-xs text-text-secondary bg-surface p-4 border border-border-strong overflow-x-auto">
            <pre>{JSON.stringify(data.content, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
