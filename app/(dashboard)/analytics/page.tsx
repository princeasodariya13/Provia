/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { BarChart3, Eye, FileText, Activity, AlertCircle, ExternalLink, Globe } from "lucide-react";

interface TrendData {
  date: string;
  views: number;
}

interface PortfolioData {
  portfolioId: string;
  slug: string;
  recentViews: number;
}

interface AnalyticsPayload {
  summary: {
    totalViews: number;
    publishedPortfolios: number;
    recentViews: number;
  };
  trend: TrendData[];
  portfolios: PortfolioData[];
}

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      try {
        const res = await apiClient.get<AnalyticsPayload>("/api/v1/portfolio/analytics");

        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.error || "Failed to load analytics.");
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("An unexpected error occurred while fetching analytics.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchAnalytics();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="space-y-12 max-w-7xl mx-auto">
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

  if (error) {
    return (
      <div className="space-y-12 max-w-7xl mx-auto">
        <PageHeader
          title="Portfolio Analytics"
          description="Understand how your professional portfolio is performing."
          breadcrumbs={[{ label: "Workspace", href: "/dashboard" }, { label: "Analytics", href: "/analytics" }]}
        />
        <div className="p-5 border border-error bg-error-muted text-error text-sm font-semibold flex items-center gap-3 rounded-xl shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxViews = Math.max(...data.trend.map((t) => t.views), 1);
  const hasTraffic = data.summary.totalViews > 0;

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16">
      <PageHeader
        title="Traffic Analytics"
        description="Monitor the reach and engagement of your published professional identity."
        breadcrumbs={[{ label: "Workspace", href: "/dashboard" }, { label: "Analytics", href: "/analytics" }]}
      />

      {/* ── METRICS ROW ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <MetricCard
          title="Total Lifetime Views"
          value={data.summary.totalViews.toLocaleString()}
          subtext="All versions"
          icon={<Eye className="w-4 h-4 text-text-muted" />}
        />
        <MetricCard
          title="Recent Views"
          value={data.summary.recentViews.toLocaleString()}
          subtext="Last 30 days"
          icon={<Activity className="w-4 h-4 text-text-muted" />}
        />
        <MetricCard
          title="Active Portfolios"
          value={data.summary.publishedPortfolios.toLocaleString()}
          subtext="Live now"
          icon={<Globe className="w-4 h-4 text-text-muted" />}
        />
      </div>

      {hasTraffic ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* ── 30-DAY TREND ── */}
          <section className="xl:col-span-2">
            <Card className="rounded-2xl border-border-light shadow-sm overflow-hidden bg-surface">
              <div className="p-6 border-b border-border-light bg-surface-muted/30">
                <h3 className="text-lg font-bold text-text-primary">30-Day Traffic Trend</h3>
                <p className="text-sm text-text-secondary mt-1">Daily view count across all your published portfolios.</p>
              </div>
              <CardContent className="p-4 sm:p-8">
                <div className="h-48 sm:h-64 flex items-end gap-0.5 sm:gap-1.5 md:gap-3 justify-between">
                  {data.trend.map((point, index) => {
                    const heightPercent = maxViews > 0 ? (point.views / maxViews) * 100 : 0;
                    return (
                      <div key={index} className="relative flex flex-col justify-end h-full w-full group">
                        <div
                          className="w-full bg-brand/10 hover:bg-brand transition-all duration-300 rounded-t-sm"
                          style={{ height: `${Math.max(heightPercent, 2)}%` }}
                        ></div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-text-primary text-background text-[10px] font-bold px-2.5 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {point.views} views<br />
                          {point.date}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  <span>{data.trend[0]?.date}</span>
                  <span>{data.trend[data.trend.length - 1]?.date}</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── TOP PERFORMING ── */}
          <section className="xl:col-span-1">
            <Card className="rounded-2xl border-border-light shadow-sm overflow-hidden bg-surface h-full flex flex-col">
              <div className="p-6 border-b border-border-light bg-surface-muted/30">
                <h3 className="text-lg font-bold text-text-primary">Portfolio Performance</h3>
                <p className="text-sm text-text-secondary mt-1">Breakdown by live URL.</p>
              </div>
              <CardContent className="p-0 flex-1">
                {data.portfolios.length > 0 ? (
                  <div className="divide-y divide-border-light">
                    {data.portfolios.map((portfolio) => (
                      <div key={portfolio.portfolioId} className="p-5 hover:bg-surface-muted/50 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-brand" />
                            <span className="font-bold text-sm text-text-primary">Portfolio</span>
                          </div>
                          <span className="text-xs font-bold text-text-secondary bg-surface-muted px-2 py-0.5 rounded">
                            {portfolio.recentViews.toLocaleString()} views
                          </span>
                        </div>
                        <a
                          href={`/p/${portfolio.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-text-secondary hover:text-brand flex items-center gap-1 transition-colors"
                        >
                          /p/{portfolio.slug}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-text-secondary flex flex-col items-center justify-center h-full">
                    <Globe className="w-8 h-8 mb-3 text-border" />
                    No active published portfolios found.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

        </div>
      ) : (
        <EmptyState
          title="No traffic data available yet"
          description="Your analytics dashboard will automatically populate once you publish your portfolio and start receiving visitors."
          icon={<BarChart3 className="w-8 h-8" />}
          actionLabel="Go to Portfolio Studio"
          actionHref="/portfolio"
        />
      )}
    </div>
  );
}

function MetricCard({ title, value, subtext, icon }: { title: string; value: string; subtext: string; icon: React.ReactNode }) {
  return (
    <div className="p-3 sm:p-6 bg-surface border border-border-light rounded-2xl flex flex-col justify-between min-h-[90px] sm:h-36 shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-[10px] sm:text-xs font-bold text-text-secondary leading-tight">{title}</span>
        <span className="hidden sm:block">{icon}</span>
      </div>
      <div>
        <div className="text-xl sm:text-3xl font-bold tracking-tight text-text-primary mb-0.5 sm:mb-1">{value}</div>
        <div className="text-[10px] sm:text-xs text-text-muted">{subtext}</div>
      </div>
    </div>
  );
}
