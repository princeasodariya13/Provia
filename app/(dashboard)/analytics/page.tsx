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
  url: string;
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
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30 | 90>(30);
  const [isPortfoliosExpanded, setIsPortfoliosExpanded] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      if (!data) setLoading(true);
      else setIsRefetching(true);
      
      try {
        const res = await apiClient.get<AnalyticsPayload>(`/api/v1/portfolio/analytics?days=${timeRange}`);

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
        setIsRefetching(false);
      }
    }

    if (!authLoading) {
      fetchAnalytics();
    }
  }, [user, authLoading, timeRange]);

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

  // SVG Area Chart Calculations (Used for 90D view)
  const chartHeight = 240;
  const paddingY = 40;
  
  const points = data.trend.map((point, index) => {
    const x = (index / Math.max(data.trend.length - 1, 1)) * 100;
    const y = chartHeight - paddingY - (maxViews > 0 ? (point.views / maxViews) * (chartHeight - paddingY * 2) : 0);
    return { x, y, ...point };
  });

  const pathD = points.length > 0 
    ? `M 0,${points[0].y} ` + points.map(p => `L ${p.x},${p.y}`).join(" ")
    : "";
  
  const areaPathD = points.length > 0
    ? `${pathD} L 100,${chartHeight} L 0,${chartHeight} Z`
    : "";

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
          subtext={`Last ${timeRange} days`}
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
          
          {/* ── TRAFFIC TREND ── */}
          <section className="xl:col-span-2">
            <Card className="rounded-2xl border-border-light shadow-sm overflow-hidden bg-surface relative">
              <div className="p-5 sm:p-6 border-b border-border-light bg-surface-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Traffic Trend</h3>
                  <p className="text-sm text-text-secondary mt-1">Daily view count across all your published portfolios.</p>
                </div>
                
                <div className="flex bg-surface-muted p-1 rounded-lg border border-border-light">
                  {[
                    { label: '7D', value: 7 },
                    { label: '14D', value: 14 },
                    { label: '30D', value: 30 },
                    { label: '90D', value: 90 },
                  ].map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setTimeRange(range.value as any)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        timeRange === range.value 
                          ? 'bg-white text-brand shadow-sm border border-border-light' 
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading Overlay */}
              {isRefetching && (
                <div className="absolute inset-0 z-50 mt-[80px] flex items-center justify-center pointer-events-none backdrop-blur-[1px] rounded-b-2xl transition-all duration-300">
                  <div className="relative flex items-center justify-center">
                    {/* Outer slow spinning ring */}
                    <div className="absolute w-12 h-12 border border-brand/30 border-t-brand rounded-full animate-[spin_2s_linear_infinite]" />
                    {/* Ripple effect */}
                    <div className="absolute w-8 h-8 border-2 border-brand/40 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                    {/* Pulsing core */}
                    <div className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse shadow-[0_0_12px_rgba(var(--brand),0.8)]" />
                  </div>
                </div>
              )}

              <CardContent className={`transition-opacity duration-300 ${isRefetching ? 'opacity-30 pointer-events-none' : 'opacity-100'} ${timeRange === 90 ? 'p-0 relative h-[280px]' : 'p-4 sm:p-8'}`}>
                {timeRange === 90 ? (
                  <>
                    {points.length > 0 && (
                      <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none" viewBox={`0 0 100 ${chartHeight}`}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        
                        <line x1="0" y1={paddingY} x2="100" y2={paddingY} stroke="currentColor" className="text-border-light opacity-30" strokeWidth="0.2" strokeDasharray="1 1" />
                        <line x1="0" y1={chartHeight / 2} x2="100" y2={chartHeight / 2} stroke="currentColor" className="text-border-light opacity-30" strokeWidth="0.2" strokeDasharray="1 1" />
                        <line x1="0" y1={chartHeight - paddingY} x2="100" y2={chartHeight - paddingY} stroke="currentColor" className="text-border-light opacity-50" strokeWidth="0.2" />

                        <path d={areaPathD} fill="url(#colorViews)" className="opacity-70 transition-all duration-500" />
                        <path d={pathD} fill="none" stroke="var(--brand)" strokeWidth="0.8" className="transition-all duration-500" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}

                    <div className="absolute inset-0 flex items-end justify-between px-2 pb-6">
                      {points.map((point, index) => (
                        <div key={index} className="relative h-full flex flex-col justify-end flex-1 group">
                          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-brand opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity" />
                          <div className="w-full h-full cursor-crosshair z-10" />
                          <div 
                            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white bg-brand opacity-0 group-hover:opacity-100 pointer-events-none z-20 shadow-md transition-all duration-200" 
                            style={{ top: `${(point.y / chartHeight) * 100}%` }}
                          />
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 mb-2 bg-text-primary text-background text-[10px] font-bold px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none flex flex-col items-center">
                            <span className="text-white text-sm">{point.views} <span className="font-normal text-text-muted text-xs">views</span></span>
                            <span className="text-text-muted mt-0.5">{new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-text-primary rotate-45" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-1.5 left-4 right-4 flex justify-between text-[9px] font-bold uppercase tracking-widest text-text-muted pointer-events-none">
                      <span>{new Date(data.trend[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="hidden sm:block">{new Date(data.trend[Math.floor(data.trend.length / 2)]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>{new Date(data.trend[data.trend.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-48 sm:h-64 flex items-end gap-0.5 sm:gap-1.5 md:gap-3 justify-between">
                      {data.trend.map((point, index) => {
                        const heightPercent = maxViews > 0 ? (point.views / maxViews) * 100 : 0;
                        return (
                          <div key={index} className="relative flex flex-col justify-end h-full w-full group">
                            <div
                              className="w-full bg-brand/60 hover:bg-brand transition-all duration-300 rounded-t-sm"
                              style={{ height: `${Math.max(heightPercent, 2)}%` }}
                            ></div>
                            
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
                  </>
                )}
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
              <CardContent className="p-0 flex-1 flex flex-col">
                {data.portfolios.length > 0 ? (
                  <>
                    <div className="divide-y divide-border-light flex-1">
                      {(isPortfoliosExpanded ? data.portfolios : data.portfolios.slice(0, 5)).map((portfolio) => (
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
                            href={portfolio.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-text-secondary hover:text-brand flex items-center gap-1 transition-colors truncate max-w-[200px] sm:max-w-[300px]"
                          >
                            {portfolio.url}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </a>
                        </div>
                      ))}
                    </div>
                    {data.portfolios.length > 5 && (
                      <div className="p-4 border-t border-border-light bg-surface flex justify-center mt-auto">
                        <button
                          onClick={() => setIsPortfoliosExpanded(!isPortfoliosExpanded)}
                          className="text-xs font-bold text-brand hover:text-brand-hover transition-colors px-5 py-2 bg-brand/5 hover:bg-brand/10 rounded-full border border-brand/10"
                        >
                          {isPortfoliosExpanded ? "Hide" : `View more ${data.portfolios.length - 5}`}
                        </button>
                      </div>
                    )}
                  </>
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
