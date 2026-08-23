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
      <div className="space-y-12">
        <div className="space-y-4">
          <div className="h-10 w-1/3 bg-surface-muted animate-pulse" />
          <div className="h-5 w-1/2 bg-surface-muted animate-pulse" />
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
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* ── HERO / WELCOME SECTION ── */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-border-light pb-6 md:pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-2 md:mb-3">
            {getGreeting()}, {user?.fullName?.split(" ")[0] || "Professional"}
          </h1>
          <p className="text-text-secondary text-base md:text-lg max-w-2xl leading-relaxed">
            Your professional identity is <span className="font-semibold text-text-primary">{completeness}% complete</span>. 
            Build, refine, and publish your career story seamlessly.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Button variant="outline" size="lg" asChild className="rounded-full w-full sm:w-auto">
            <Link href="/profile">Edit Profile</Link>
          </Button>
          {isPortfolioPublished ? (
            <Button variant="default" size="lg" asChild className="rounded-full shadow-sm w-full sm:w-auto">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" />
                Live Portfolio
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          ) : (
            <Button variant="default" size="lg" asChild className="rounded-full shadow-sm w-full sm:w-auto">
              <Link href="/portfolio" className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Publish Portfolio
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── TOP METRICS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <MetricCard
          title="Profile Completeness"
          value={`${completeness}%`}
          subtext={completeness >= 80 ? "Excellent" : "Needs Attention"}
          icon={<User className="w-4 h-4 text-text-muted" />}
        />
        <MetricCard
          title="Resume Extraction"
          value={resumeData ? "Active" : "None"}
          subtext={resumeData ? "Processed" : "Upload required"}
          icon={<FileText className="w-4 h-4 text-text-muted" />}
        />
        <MetricCard
          title="Total Views"
          value={analyticsData?.summary?.totalViews?.toLocaleString() || "0"}
          subtext="Lifetime traffic"
          icon={<BarChart3 className="w-4 h-4 text-text-muted" />}
        />
        <MetricCard
          title="Portfolio Status"
          value={isPortfolioPublished ? "Live" : "Draft"}
          subtext={isPortfolioPublished ? "Publicly accessible" : "Private"}
          icon={<Globe className="w-4 h-4 text-text-muted" />}
        />
      </div>

      {/* ── MAIN WORKSPACE GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Left Column (Main Focus) */}
        <div className="xl:col-span-2 space-y-10">
          
          {/* Action Checklist */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold tracking-tight text-text-primary">Recommended Actions</h2>
              <p className="text-sm text-text-secondary mt-1">Intelligent next steps to strengthen your professional profile.</p>
            </div>
            
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map((rec, i) => (
                  <Link
                    key={i}
                    href={rec.href}
                    className="group relative flex flex-col justify-between p-5 bg-surface border border-border-light hover:border-brand-hover rounded-xl card-hover-depth"
                  >
                    <span className="text-sm font-semibold text-text-primary mb-6 pr-6">
                      {rec.label}
                    </span>
                    <div className="flex items-center text-xs font-bold text-brand group-hover:text-brand-hover">
                      Take action <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-surface border border-success/30 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-success-muted rounded-full shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1">You&apos;re all set!</h3>
                  <p className="text-sm text-text-secondary">Your profile is comprehensive and fully updated. Ensure your portfolio is published to share it with the world.</p>
                </div>
              </div>
            )}
          </section>

          {/* Resume Intelligence */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand" /> Resume Intelligence
                </h2>
                <p className="text-sm text-text-secondary mt-1">Automatic extraction of structured career data.</p>
              </div>
            </div>

            <Card className="rounded-xl overflow-hidden border-border-light shadow-sm">
              <CardContent className="p-0">
                {resumeData ? (
                  <div className="flex flex-col sm:flex-row md:items-center justify-between p-5 sm:p-6 gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-3 bg-brand-muted text-brand rounded-lg shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-text-primary">{resumeData.filename}</h3>
                          <Badge variant={resumeData.status === "COMPLETED" ? "success" : "warning"} className="text-[10px] px-2 py-0">
                            {resumeData.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {(resumeData.size / 1024).toFixed(1)} KB • Uploaded {new Date(resumeData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="rounded-full" asChild>
                        <Link href="/profile">Upload New</Link>
                      </Button>
                      {resumeData.status === "COMPLETED" && (
                        <Button variant="default" className="rounded-full" asChild>
                          <Link href="/profile">Review Data</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-surface flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-text-muted" />
                    </div>
                    <h3 className="text-base font-bold text-text-primary mb-2">No resume uploaded yet</h3>
                    <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                      Upload your PDF resume to let Provia automatically extract your professional history, skills, and projects into structured data.
                    </p>
                    <Button variant="default" className="rounded-full" asChild>
                      <Link href="/profile">Upload Resume</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

        </div>

        {/* Right Column (Secondary Focus) */}
        <div className="space-y-10">
          
          {/* Quick Actions */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">Quick Links</h2>
            <div className="flex flex-col gap-3">
              <QuickActionLink href="/profile" icon={User} label="Edit Profile Identity" />
              <QuickActionLink href="/portfolio" icon={Globe} label="Generate Portfolio" />
              <QuickActionLink href="/integrations" icon={GitBranch} label="Connect GitHub/LinkedIn" />
              <QuickActionLink href="/analytics" icon={BarChart3} label="View Traffic Analytics" />
            </div>
          </section>

          {/* Connected Integrations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Integrations</h2>
              <Link href="/integrations" className="text-xs font-semibold text-brand hover:underline">Manage</Link>
            </div>
            
            {connections.length > 0 ? (
              <div className="flex flex-col gap-3">
                {connections.map((conn) => (
                  <div key={conn.provider} className="flex items-center justify-between p-4 bg-surface border border-border-light rounded-xl">
                    <span className="text-sm font-bold text-text-primary">{conn.provider}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${conn.state === 'SYNCED' || conn.state === 'CONNECTED' ? 'bg-success' : 'bg-warning'}`} />
                      <span className="text-xs font-medium text-text-secondary">{conn.state}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-surface border border-border-light border-dashed rounded-xl text-center">
                <p className="text-sm text-text-secondary mb-3">No external integrations connected.</p>
                <Button variant="outline" size="sm" className="rounded-full w-full" asChild>
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

function MetricCard({ title, value, subtext, icon }: { title: string; value: string; subtext: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 sm:p-5 bg-surface border border-border-light rounded-xl flex flex-col justify-between min-h-[100px] sm:h-32">
      <div className="flex justify-between items-start">
        <span className="text-[10px] sm:text-xs font-bold text-text-secondary leading-tight">{title}</span>
        {icon}
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mb-1">{value}</div>
        <div className="text-[10px] sm:text-xs text-text-muted">{subtext}</div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuickActionLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center p-4 bg-surface border border-border-light rounded-xl hover:border-brand-hover hover:bg-surface-muted transition-colors group card-hover-depth"
    >
      <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center mr-4 group-hover:bg-brand-muted transition-colors">
        <Icon className="w-4 h-4 text-text-secondary group-hover:text-brand transition-colors" />
      </div>
      <span className="text-sm font-bold text-text-primary">{label}</span>
    </Link>
  );
}
