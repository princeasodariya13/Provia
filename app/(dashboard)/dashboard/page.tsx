/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import {
  User,
  FileText,
  Globe,
  BarChart3,
  GitBranch,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Plus,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        const [profRes, resRes, portRes, anaRes, connRes] = await Promise.all([
          apiClient.get<any>("/api/v1/profile"),
          apiClient.get<any>("/api/v1/profile/resume"),
          apiClient.get<any>("/api/v1/portfolio"),
          apiClient.get<any>("/api/v1/portfolio/analytics"),
          apiClient.get<any>("/api/v1/integrations"),
        ]);

        if (profRes.success) setProfile(profRes.data);
        if (resRes.success) setResumeData(resRes.data);
        if (portRes.success) setPortfolioData(portRes.data);
        if (anaRes.success) setAnalyticsData(anaRes.data);
        if (connRes.success) setConnections(connRes.data || []);
      } catch (err) {
        console.error("Failed loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  // Real Profile Completeness Calculation
  const calcCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.fullName) score += 10;
    if (profile.headline) score += 10;
    if (profile.bio) score += 15;
    if (profile.location) score += 5;
    if (profile.avatarUrl) score += 10;
    if (profile.experiences && profile.experiences.length > 0) score += 20;
    if (profile.education && profile.education.length > 0) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 10;
    if (profile.projects && profile.projects.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const completeness = calcCompleteness();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getMissingRecommendations = () => {
    if (!profile) return [];
    const recs = [];
    if (!profile.avatarUrl) recs.push({ label: "Upload a professional profile photo", href: "/profile" });
    if (!profile.headline) recs.push({ label: "Add a headline to describe your role", href: "/profile" });
    if (!profile.bio) recs.push({ label: "Write a short summary about your background", href: "/profile" });
    if (!profile.experiences || profile.experiences.length === 0) recs.push({ label: "Add your work experience entries", href: "/profile" });
    if (!resumeData) recs.push({ label: "Upload your PDF resume for automatic extraction", href: "/profile" });
    if (!portfolioData || !portfolioData.publication?.isActive) recs.push({ label: "Publish your portfolio to the public web", href: "/portfolio" });
    const githubConn = connections.find((c) => c.provider === "GITHUB" && c.state === "SYNCED");
    if (!githubConn) recs.push({ label: "Connect your GitHub account", href: "/integrations" });
    return recs;
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-surface animate-pulse" />
          <div className="h-4 w-96 bg-surface animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const recommendations = getMissingRecommendations();
  const isPortfolioPublished = portfolioData?.publication?.isActive;
  const publicUrl = portfolioData?.publication?.publicUrl;

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <PageHeader
        title={`${getGreeting()}, ${user?.fullName?.split(" ")[0] || "Professional"}`}
        description="Your professional identity operating system. Build, refine, and publish your career story."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/profile">Edit Profile</Link>
            </Button>
            {isPortfolioPublished ? (
              <Button variant="default" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  View Live Site
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            ) : (
              <Button variant="default" asChild>
                <Link href="/portfolio" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Publish Portfolio
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Profile Strength"
          value={`${completeness}%`}
          subtext={completeness >= 80 ? "Comprehensive" : completeness >= 50 ? "Moderate" : "Needs Attention"}
          icon={<User className="w-5 h-5 text-brand" />}
        />

        <StatCard
          title="Resume Intelligence"
          value={resumeData ? "Active" : "None"}
          subtext={resumeData ? resumeData.filename : "No resume uploaded"}
          icon={<FileText className="w-5 h-5 text-brand" />}
        />

        <StatCard
          title="Total Views"
          value={analyticsData?.summary?.totalViews?.toLocaleString() || "0"}
          subtext="All-time portfolio traffic"
          icon={<BarChart3 className="w-5 h-5 text-brand" />}
        />

        <StatCard
          title="Portfolio Status"
          value={isPortfolioPublished ? "Live" : "Draft"}
          subtext={isPortfolioPublished ? "Publicly accessible" : "Private draft version"}
          icon={<Globe className="w-5 h-5 text-brand" />}
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Completion Engine Card */}
          <Card className="border-border-strong bg-background rounded-none">
            <CardHeader className="border-b border-border-light pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Profile Strength Engine</CardTitle>
                  <p className="text-xs text-text-secondary mt-1">
                    Calculated from verified factual fields in your canonical profile.
                  </p>
                </div>
                <Badge variant={completeness >= 80 ? "success" : completeness >= 50 ? "warning" : "error"}>
                  {completeness}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-surface-muted h-3 border border-border-strong overflow-hidden">
                  <div
                    className="bg-brand h-full transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-text-secondary font-medium">
                  <span>Getting Started</span>
                  <span>Professional Ready</span>
                </div>
              </div>

              {/* Action Checklist */}
              {recommendations.length > 0 ? (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                    Recommended Next Steps
                  </h4>
                  <div className="space-y-2">
                    {recommendations.slice(0, 4).map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border border-border-light bg-surface hover:border-brand transition-colors"
                      >
                        <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand" />
                          {rec.label}
                        </span>
                        <Link
                          href={rec.href}
                          className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                        >
                          Action <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-success bg-success/10 text-success text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Your profile has all essential fields completed!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume Intelligence Primary Card */}
          <Card className="border-border-strong bg-background rounded-none">
            <CardHeader className="border-b border-border-light pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand" />
                  <CardTitle className="text-xl font-bold">Resume Intelligence</CardTitle>
                </div>
                {resumeData && (
                  <Badge variant={resumeData.status === "COMPLETED" ? "success" : "warning"}>
                    {resumeData.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {resumeData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border-strong bg-surface">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-brand" />
                      <div>
                        <p className="font-bold text-sm text-text-primary">{resumeData.filename}</p>
                        <p className="text-xs text-text-secondary">
                          {(resumeData.size / 1024).toFixed(1)} KB • Uploaded{" "}
                          {new Date(resumeData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/profile">Manage Resume</Link>
                    </Button>
                  </div>

                  {resumeData.status === "COMPLETED" && (
                    <div className="p-4 bg-surface-muted/50 border border-border-light text-xs text-text-secondary space-y-2">
                      <p className="font-bold text-text-primary">Extraction Results:</p>
                      <p>
                        Structured resume analysis completed. Experience, skills, and education entries are ready for review and transactional import into your profile.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No resume uploaded"
                  description="Upload your PDF resume to let Provia automatically extract experience, education, skills, and projects."
                  icon={<FileText className="w-6 h-6" />}
                  actionLabel="Upload Resume"
                  actionHref="/profile"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Quick Action Matrix */}
          <Card className="border-border-strong bg-background rounded-none">
            <CardHeader className="border-b border-border-light pb-4">
              <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <Link
                href="/profile"
                className="flex items-center justify-between p-3 border border-border-light hover:border-brand bg-surface hover:bg-surface-muted transition-colors text-xs font-bold text-text-primary group"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-brand" />
                  <span>Update Profile Data</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-brand" />
              </Link>

              <Link
                href="/portfolio"
                className="flex items-center justify-between p-3 border border-border-light hover:border-brand bg-surface hover:bg-surface-muted transition-colors text-xs font-bold text-text-primary group"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-brand" />
                  <span>Generate Portfolio</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-brand" />
              </Link>

              <Link
                href="/integrations"
                className="flex items-center justify-between p-3 border border-border-light hover:border-brand bg-surface hover:bg-surface-muted transition-colors text-xs font-bold text-text-primary group"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4 text-brand" />
                  <span>Connect External Accounts</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-brand" />
              </Link>

              <Link
                href="/analytics"
                className="flex items-center justify-between p-3 border border-border-light hover:border-brand bg-surface hover:bg-surface-muted transition-colors text-xs font-bold text-text-primary group"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-brand" />
                  <span>View Traffic Analytics</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-brand" />
              </Link>
            </CardContent>
          </Card>

          {/* Connection Status Card */}
          <Card className="border-border-strong bg-background rounded-none">
            <CardHeader className="border-b border-border-light pb-4">
              <CardTitle className="text-lg font-bold">Connected Integrations</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {connections.map((conn) => (
                <div
                  key={conn.provider}
                  className="flex items-center justify-between p-3 border border-border-light bg-surface text-xs"
                >
                  <span className="font-bold text-text-primary">{conn.provider}</span>
                  <Badge
                    variant={conn.state === "SYNCED" || conn.state === "CONNECTED" ? "success" : "secondary"}
                  >
                    {conn.state}
                  </Badge>
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                <Link href="/integrations">Manage Connections</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
