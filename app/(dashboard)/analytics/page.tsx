/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
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

  if (error) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <PageHeader
          title="Portfolio Analytics"
          description="Understand how your professional portfolio is performing."
        />
        <div className="p-4 border border-error bg-error/10 text-error text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxViews = Math.max(...data.trend.map((t) => t.views), 1);
  const hasTraffic = data.trend.some((t) => t.views > 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        title="Portfolio Analytics"
        description="Understand how your professional portfolio is performing across the web."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Analytics", href: "/analytics" },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Views"
          value={data.summary.totalViews.toLocaleString()}
          subtext="All-time portfolio views"
          icon={<Eye className="w-5 h-5 text-brand" />}
        />

        <StatCard
          title="Recent Views"
          value={data.summary.recentViews.toLocaleString()}
          subtext="Over the last 30 days"
          icon={<Activity className="w-5 h-5 text-brand" />}
        />

        <StatCard
          title="Published Portfolios"
          value={data.summary.publishedPortfolios.toLocaleString()}
          subtext="Active live portfolios"
          icon={<FileText className="w-5 h-5 text-brand" />}
        />
      </div>

      {/* Trend Chart Card */}
      <Card className="rounded-none border-border-strong bg-background overflow-hidden">
        <CardHeader className="border-b border-border-light bg-surface/30">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand" />
            <CardTitle className="text-lg font-bold">Views Over Time (30 Days)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-8 pb-4">
          {hasTraffic ? (
            <div className="h-64 flex items-end gap-1 sm:gap-2">
              {data.trend.map((day, i) => {
                const heightPercentage = (day.views / maxViews) * 100;
                const showLabel = i % 5 === 0 || i === data.trend.length - 1;
                const dDate = new Date(day.date);
                const dateLabel = `${dDate.getMonth() + 1}/${dDate.getDate()}`;

                return (
                  <div
                    key={day.date}
                    className="relative flex flex-col items-center flex-1 h-full justify-end group"
                  >
                    <div
                      className="w-full bg-brand/80 hover:bg-brand transition-colors rounded-t-xs"
                      style={{
                        height: `${Math.max(heightPercentage, 2)}%`,
                        minHeight: day.views > 0 ? "4px" : "0",
                      }}
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-border-strong px-2 py-1 text-xs font-bold whitespace-nowrap z-10 pointer-events-none shadow-sm">
                      {dateLabel}: {day.views} views
                    </div>

                    <div className="mt-2 h-4">
                      {showLabel && (
                        <span className="text-[10px] text-text-secondary font-mono">
                          {dateLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No view data recorded yet"
              description="Publish and share your portfolio link to start tracking recruiter and visitor engagement."
              icon={<BarChart3 className="w-6 h-6" />}
              actionLabel="Go to Portfolio"
              actionHref="/portfolio"
            />
          )}
        </CardContent>
      </Card>

      {/* Traffic Breakdown Table */}
      {data.portfolios.length > 0 && (
        <Card className="rounded-none border-border-strong bg-background">
          <CardHeader className="border-b border-border-light bg-surface/30">
            <CardTitle className="text-lg font-bold">Traffic Breakdown by Portfolio</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-surface/50 border-b border-border-strong">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold tracking-widest text-text-secondary">
                    Public Slug
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-widest text-text-secondary text-right">
                    30-Day Views
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-widest text-text-secondary text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {data.portfolios.map((portfolio) => (
                  <tr
                    key={portfolio.portfolioId}
                    className="hover:bg-surface/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-brand font-bold">
                      {portfolio.slug !== "Unknown" ? `/${portfolio.slug}` : "Archived/Unknown"}
                    </td>
                    <td className="px-6 py-4 font-bold text-right text-text-primary">
                      {portfolio.recentViews.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {portfolio.slug !== "Unknown" ? (
                        <Link
                          href={`/p/${portfolio.slug}`}
                          target="_blank"
                          className="text-xs font-bold uppercase tracking-widest border border-border-strong px-3 py-1.5 hover:bg-brand hover:text-white transition-colors inline-flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          View Live
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-text-secondary text-xs italic">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
