"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, FileText, Activity, AlertCircle } from "lucide-react";
import Link from "next/link";

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
      
      const res = await apiClient.get<AnalyticsPayload>("/api/v1/portfolio/analytics");
      
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load analytics.");
      }
      
      setLoading(false);
    }
    
    if (!authLoading) {
      fetchAnalytics();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-24 relative z-10 animate-pulse">
        <div className="h-10 w-64 bg-surface mb-2" />
        <div className="h-6 w-96 bg-surface" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="h-32 bg-surface" />
          <div className="h-32 bg-surface" />
          <div className="h-32 bg-surface" />
        </div>
        <div className="h-64 bg-surface mt-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-24 relative z-10">
        <div className="text-error border border-error p-4 bg-error/10 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate max views for trend scaling
  const maxViews = Math.max(...data.trend.map(t => t.views), 1); // Minimum 1 to avoid divide by zero

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24 relative z-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Portfolio Analytics</h1>
        <p className="text-text-secondary text-lg">
          Understand how your professional portfolio is performing across the web.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-none border-border-strong bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-text-secondary">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-text-primary">{data.summary.totalViews.toLocaleString()}</div>
            <p className="text-xs text-text-secondary mt-1">All-time portfolio views</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border-strong bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-text-secondary">Recent Views</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-text-primary">{data.summary.recentViews.toLocaleString()}</div>
            <p className="text-xs text-text-secondary mt-1">Over the last 30 days</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border-strong bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-text-secondary">Published</CardTitle>
            <FileText className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-text-primary">{data.summary.publishedPortfolios.toLocaleString()}</div>
            <p className="text-xs text-text-secondary mt-1">Active live portfolios</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="rounded-none border-border-strong bg-background overflow-hidden">
        <CardHeader className="border-b border-border-light bg-surface/30">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-text-primary" />
            <CardTitle className="text-lg font-bold">Views Over Time (30 Days)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-8 pb-4">
          {data.trend.some(t => t.views > 0) ? (
            <div className="h-64 flex items-end gap-1 sm:gap-2">
              {data.trend.map((day, i) => {
                const heightPercentage = (day.views / maxViews) * 100;
                // Only show labels for some days to avoid crowding
                const showLabel = i % 5 === 0 || i === data.trend.length - 1;
                const dDate = new Date(day.date);
                const dateLabel = `${dDate.getMonth() + 1}/${dDate.getDate()}`;
                
                return (
                  <div key={day.date} className="relative flex flex-col items-center flex-1 h-full justify-end group">
                    <div 
                      className="w-full bg-brand/80 hover:bg-brand transition-colors rounded-t-sm"
                      style={{ height: `${Math.max(heightPercentage, 1)}%`, minHeight: day.views > 0 ? '4px' : '0' }}
                    />
                    
                    {/* Tooltip on hover */}
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
            <div className="h-64 flex items-center justify-center border border-dashed border-border-strong bg-surface/30">
              <div className="text-center">
                <BarChart3 className="mx-auto h-8 w-8 text-text-secondary opacity-50 mb-3" />
                <p className="text-text-secondary font-medium">No view data available for the last 30 days.</p>
                <p className="text-sm text-text-secondary mt-1">Publish and share your portfolio to start tracking.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Table */}
      {data.portfolios.length > 0 && (
        <Card className="rounded-none border-border-strong bg-background">
          <CardHeader className="border-b border-border-light bg-surface/30">
            <CardTitle className="text-lg font-bold">Traffic Breakdown by Portfolio</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-surface/50 border-b border-border-strong">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold tracking-widest">Public Slug</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-widest text-right">30-Day Views</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.portfolios.map((portfolio) => (
                  <tr key={portfolio.portfolioId} className="border-b border-border-light hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-brand">
                      {portfolio.slug !== "Unknown" ? `/${portfolio.slug}` : "Archived/Unknown"}
                    </td>
                    <td className="px-6 py-4 font-bold text-right">
                      {portfolio.recentViews.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {portfolio.slug !== "Unknown" ? (
                         <Link href={`/p/${portfolio.slug}`} target="_blank" className="text-xs font-bold uppercase tracking-widest border border-border-strong px-3 py-1.5 hover:bg-brand hover:text-white hover:border-brand transition-colors inline-block">
                           View Live
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
