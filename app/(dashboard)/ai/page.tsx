/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

export default function AIPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatest() {
      if (!user) return;
      const res = await apiClient.get<any>("/api/v1/ai/analyze-profile");
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
    
    const res = await apiClient.post<any>("/api/v1/ai/analyze-profile", {});
    
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error || "Failed to analyze profile.");
    }
    setGenerating(false);
  };

  if (authLoading || loading) return <div className="animate-pulse h-40 bg-surface"></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 relative z-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">AI Analysis</h1>
        <p className="text-text-secondary text-lg">Process your canonical profile into structured professional insights.</p>
      </div>

      {error && (
        <div className="text-error border border-error p-4 bg-error/10 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <Card className="rounded-none border-border-strong bg-background">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <Sparkles className="w-8 h-8 text-accent" />
          <h2 className="text-xl font-bold">Generate Profile Analysis</h2>
          <p className="text-text-secondary max-w-lg">
            This will pass your effective profile through the AI layer to extract career themes, strengths, and highlights. This structured data is used for portfolio generation.
          </p>
          <Button onClick={handleGenerate} disabled={generating} className="rounded-none font-bold min-w-[200px]">
            {generating ? "Processing..." : (data ? "Re-analyze Profile" : "Analyze Profile")}
          </Button>
        </CardContent>
      </Card>

      {data && data.status === "COMPLETED" && data.result && (
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-success font-medium">
            <CheckCircle2 className="w-5 h-5" />
            <span>Analysis Completed Successfully</span>
          </div>
          
          <Card className="rounded-none border-border-strong">
            <CardHeader className="border-b border-border-strong">
              <CardTitle>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-text-secondary leading-relaxed">
              {data.result.professionalSummary}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-none border-border-strong">
              <CardHeader className="border-b border-border-strong">
                <CardTitle>Core Strengths</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                  {data.result.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border-strong">
              <CardHeader className="border-b border-border-strong">
                <CardTitle>Technical Skills</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                  {data.result.technicalSkills?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border-strong md:col-span-2">
              <CardHeader className="border-b border-border-strong">
                <CardTitle>Experience Highlights</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                  {data.result.experienceHighlights?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border-strong md:col-span-2">
              <CardHeader className="border-b border-border-strong">
                <CardTitle>Career Themes</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="list-disc list-inside space-y-2 text-text-secondary">
                  {data.result.careerThemes?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {data && data.status === "FAILED" && (
        <div className="text-error border border-error p-4 bg-error/10">
          <strong>Previous generation failed:</strong> {data.failureReason || "Unknown error"}
        </div>
      )}
    </div>
  );
}
