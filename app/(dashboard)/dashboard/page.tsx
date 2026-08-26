/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import {
  User,
  FileText,
  Globe,
  BarChart3,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumeData, setResumeData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [portfolioData, setPortfolioData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    if (hour === 12) return "Good noon";
    if (hour < 17) return "Good afternoon";
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
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="space-y-4">
          <div className="h-10 w-1/3 bg-surface-muted/50 rounded-xl animate-pulse" />
          <div className="h-5 w-1/2 bg-surface-muted/50 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CardSkeleton />
          </div>
          <div className="space-y-8">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const recommendations = getMissingRecommendations();
  const isPortfolioPublished = portfolioData?.publication?.isActive;
  const publicUrl = portfolioData?.publication?.publicUrl;

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── HERO / WELCOME SECTION ── */}
      <div className="relative p-8 md:p-10 rounded-3xl overflow-hidden border border-border-light/50 shadow-sm">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-success/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-muted/80 backdrop-blur-sm border border-border-light text-xs font-bold text-text-secondary mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Workspace Overview
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 flex flex-wrap items-center gap-x-2">
              <span className="text-text-secondary font-medium">
                {getGreeting()},
              </span>
              <span className="text-text-primary">
                {user?.fullName?.split(" ")[0] || "Professional"}
              </span>
            </h1>
            <p className="text-text-secondary text-base md:text-lg max-w-2xl leading-relaxed">
              Your professional identity is <span className="font-bold text-brand">{completeness}% complete</span>. 
              Build, refine, and publish your career story seamlessly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button variant="outline" size="lg" asChild className="rounded-full w-full sm:w-auto border-border-strong hover:bg-surface-muted transition-all duration-300">
              <Link href="/profile">Edit Profile</Link>
            </Button>
            {isPortfolioPublished ? (
              <Button variant="default" size="lg" asChild className="rounded-full shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4" />
                  Live Portfolio
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            ) : (
              <Button variant="default" size="lg" asChild className="rounded-full shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
                <Link href="/portfolio" className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 fill-current" />
                  Publish Portfolio
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── TOP METRICS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Profile Completeness"
          value={`${completeness}%`}
          subtext={completeness >= 80 ? "Excellent standing" : "Needs Attention"}
          icon={User}
          trend={completeness >= 80 ? "positive" : "neutral"}
        />
        <MetricCard
          title="Resume Intelligence"
          value={resumeData ? "Active" : "None"}
          subtext={resumeData ? "Data processed" : "Upload required"}
          icon={FileText}
          trend={resumeData ? "positive" : "neutral"}
        />
        <MetricCard
          title="Total Views"
          value={analyticsData?.summary?.totalViews?.toLocaleString() || "0"}
          subtext="Lifetime traffic"
          icon={BarChart3}
          trend={analyticsData?.summary?.totalViews > 0 ? "positive" : "neutral"}
        />
        <MetricCard
          title="Portfolio Status"
          value={isPortfolioPublished ? "Live" : "Draft"}
          subtext={isPortfolioPublished ? "Publicly accessible" : "Private workspace"}
          icon={Globe}
          trend={isPortfolioPublished ? "positive" : "neutral"}
        />
      </div>

      {/* ── MAIN WORKSPACE GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12">
        
        {/* Left Column (Main Focus) */}
        <div className="xl:col-span-2 space-y-12">
          
          {/* Action Checklist */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-text-primary">Recommended Actions</h2>
              <p className="text-sm text-text-secondary mt-1">Intelligent next steps to strengthen your professional profile.</p>
            </div>
            
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map((rec, i) => (
                  <Link
                    key={i}
                    href={rec.href}
                    className="group relative flex flex-col justify-between p-6 bg-surface/50 backdrop-blur-sm border border-border-light hover:border-brand/40 rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5 transition-all duration-300"
                  >
                    <span className="text-sm font-semibold text-text-primary mb-8 pr-6 leading-relaxed">
                      {rec.label}
                    </span>
                    <div className="flex items-center text-xs font-bold text-brand group-hover:text-brand-hover">
                      Take action <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-success/5 border border-success/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="p-4 bg-success/10 rounded-full shrink-0 shadow-inner">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-success mb-1">You&apos;re all set!</h3>
                  <p className="text-sm text-success/80">Your profile is comprehensive and fully updated. Ensure your portfolio is published to share it with the world.</p>
                </div>
              </div>
            )}
          </section>

          {/* Resume Intelligence */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand" /> Resume Intelligence
                </h2>
                <p className="text-sm text-text-secondary mt-1">Automatic extraction of structured career data.</p>
              </div>
            </div>

            <Card className="rounded-2xl overflow-hidden border-border-light shadow-md hover:shadow-lg transition-shadow duration-300 bg-surface/50 backdrop-blur-sm">
              <CardContent className="p-0">
                {resumeData ? (
                  <div className="flex flex-col sm:flex-row md:items-center justify-between p-6 sm:p-8 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-brand/10 text-brand rounded-xl shrink-0 border border-brand/20 shadow-inner">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-bold text-text-primary text-base">{resumeData.filename}</h3>
                          <Badge variant={resumeData.status === "COMPLETED" ? "success" : "warning"} className="text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            {resumeData.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary font-medium">
                          {(resumeData.size / 1024).toFixed(1)} KB • Uploaded {new Date(resumeData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="rounded-full hover:bg-surface-muted" asChild>
                        <Link href="/profile">Upload New</Link>
                      </Button>
                      {resumeData.status === "COMPLETED" && (
                        <Button variant="default" className="rounded-full shadow-md shadow-brand/20" asChild>
                          <Link href="/profile">Review Data</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center flex flex-col items-center justify-center border-2 border-dashed border-border-light m-4 rounded-xl hover:border-brand/30 transition-colors">
                    <div className="w-16 h-16 bg-brand/5 rounded-full flex items-center justify-center mb-5 shadow-inner">
                      <FileText className="w-8 h-8 text-brand/60" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">No resume uploaded yet</h3>
                    <p className="text-sm text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
                      Upload your PDF resume to let Provia automatically extract your professional history, skills, and projects into structured data.
                    </p>
                    <Button variant="default" className="rounded-full shadow-md shadow-brand/20" asChild>
                      <Link href="/profile">Upload Resume</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

        </div>

        {/* Right Column (Secondary Focus) */}
        <div className="space-y-12">
          
          {/* Quick Actions */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-5">Quick Links</h2>
            <div className="flex flex-col gap-3">
              <QuickActionLink href="/profile" icon={User} label="Edit Profile Identity" />
              <QuickActionLink href="/portfolio" icon={Globe} label="Generate Portfolio" />
              <QuickActionLink href="/integrations" icon={GitBranch} label="Connect Integrations" />
              <QuickActionLink href="/analytics" icon={BarChart3} label="View Analytics" />
            </div>
          </section>

          {/* Connected Integrations */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">Integrations</h2>
              <Link href="/integrations" className="text-xs font-bold text-brand hover:text-brand-hover transition-colors">Manage</Link>
            </div>
            
            {connections.length > 0 ? (
              <div className="flex flex-col gap-3">
                {connections.map((conn) => (
                  <div key={conn.provider} className="flex items-center justify-between p-4 bg-surface/50 border border-border-light rounded-2xl hover:border-border-strong transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-text-secondary" />
                      </div>
                      <span className="text-sm font-bold text-text-primary">{conn.provider}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-muted px-2.5 py-1 rounded-full border border-border-light">
                      <div className={`w-1.5 h-1.5 rounded-full ${conn.state === 'SYNCED' || conn.state === 'CONNECTED' ? 'bg-success shadow-[0_0_8px_rgba(var(--success-rgb),0.5)]' : 'bg-warning'}`} />
                      <span className="text-[10px] font-bold text-text-secondary tracking-wide uppercase">{conn.state}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-surface/30 border border-border-light border-dashed rounded-2xl text-center">
                <p className="text-sm text-text-secondary mb-4">No external integrations connected.</p>
                <Button variant="outline" size="sm" className="rounded-full w-full hover:bg-brand/5 hover:text-brand hover:border-brand/30 transition-all" asChild>
                  <Link href="/integrations">Connect Accounts</Link>
                </Button>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code

function MetricCard({ title, value, subtext, icon: Icon, trend }: { title: string; value: string; subtext: string; icon: any; trend: 'positive' | 'neutral' }) {
  return (
    <div className="group p-4 sm:p-5 bg-surface/50 backdrop-blur-sm border border-border-light rounded-2xl flex flex-col justify-between min-h-[120px] hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand/10 transition-colors" />
      
      <div className="flex justify-between items-start relative z-10 gap-2">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted leading-tight break-words">{title}</span>
        <div className={`p-2 rounded-xl transition-colors shrink-0 ${trend === 'positive' ? 'bg-brand/10 text-brand' : 'bg-surface-muted text-text-secondary'}`}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
      <div className="relative z-10 mt-4">
        <div className="text-xl sm:text-3xl font-extrabold tracking-tight text-text-primary mb-1">{value}</div>
        <div className="text-[10px] sm:text-xs font-medium text-text-secondary">{subtext}</div>
      </div>
    </div>
  );
}

function QuickActionLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 bg-surface/50 backdrop-blur-sm border border-border-light rounded-2xl hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 group"
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center mr-4 group-hover:bg-brand/10 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-5 h-5 text-text-secondary group-hover:text-brand transition-colors" />
        </div>
        <span className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-text-muted opacity-100 sm:opacity-0 sm:-translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-brand transition-all duration-300" />
    </Link>
  );
}
