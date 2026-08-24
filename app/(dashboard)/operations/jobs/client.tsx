/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconRefresh, IconArrowRight, IconActivity, IconAlertTriangle, IconCheck, IconServer, IconClock, IconX } from "@tabler/icons-react";
import Link from "next/link";

export function OperationsJobsClient() {
  const [metrics, setMetrics] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dlqOnly, setDlqOnly] = useState(false);
  const [timeFilter, setTimeFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, workersRes, jobsRes] = await Promise.all([
        fetch(`/api/v1/operations/jobs/metrics?timeFilter=${timeFilter}`),
        fetch("/api/v1/operations/workers"),
        fetch(`/api/v1/operations/jobs?page=${page}&limit=20${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${dlqOnly ? '&dlqOnly=true' : ''}`)
      ]);
      
      const metricsData = await metricsRes.json();
      const workersData = await workersRes.json();
      const jobsData = await jobsRes.json();

      if (metricsData.success) setMetrics(metricsData.data);
      if (workersData.success) setWorkers(workersData.data);
      if (jobsData.success) setJobs(jobsData.data.jobs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, [page, statusFilter, dlqOnly, timeFilter]);

  const handleRetry = async (id: string) => {
    if (!confirm("Are you sure you want to retry this job?")) return;
    try {
      const res = await fetch(`/api/v1/operations/jobs/${id}/retry`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert("Failed to retry: " + data.error);
      }
    } catch (err) {
      alert("Failed to retry job");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 flex flex-col gap-2 border-border-light bg-surface">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total</span>
            <span className="text-3xl font-bold text-text-primary">{metrics.totals.all}</span>
          </Card>
          <Card className="p-4 flex flex-col gap-2 border-border-light bg-surface">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Processing</span>
            <span className="text-3xl font-bold text-brand">{metrics.totals.processing}</span>
          </Card>
          <Card className="p-4 flex flex-col gap-2 border-border-light bg-surface">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Failed</span>
            <span className="text-3xl font-bold text-red-500">{metrics.totals.failed}</span>
          </Card>
          <Card className="p-4 flex flex-col gap-2 border-border-light bg-surface">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">DLQ</span>
            <span className="text-3xl font-bold text-red-700">{metrics.totals.deadLettered}</span>
          </Card>
          <Card className="p-4 flex flex-col gap-2 border-border-light bg-surface">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Success Rate</span>
            <span className="text-3xl font-bold text-green-500">{metrics.metrics.successRate}%</span>
          </Card>
          <Card className="p-4 flex flex-col gap-2 border-border-light bg-surface">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Avg Time</span>
            <span className="text-3xl font-bold text-text-primary">{metrics.metrics.avgProcessingTimeMs}ms</span>
          </Card>
        </div>
      )}

      {/* Workers */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <IconServer className="w-5 h-5 text-brand" /> Active Workers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map(w => (
            <Card key={w.id} className="p-4 border-border-light bg-surface flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-text-secondary truncate pr-4">{w.workerId}</span>
                {w.isActuallyOnline ? (
                  <Badge className="bg-green-500/10 text-green-500 border-0">ONLINE</Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-500 border-0">OFFLINE</Badge>
                )}
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Processed:</span>
                  <span className="font-bold text-text-primary">{w.jobsProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Failed:</span>
                  <span className="font-bold text-red-500">{w.jobsFailed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Heartbeat:</span>
                  <span className="font-medium text-text-primary">{new Date(w.lastHeartbeatAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </Card>
          ))}
          {workers.length === 0 && (
            <div className="col-span-full p-4 border border-dashed border-border-strong text-center text-text-secondary text-sm">
              No workers are currently active.
            </div>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <IconActivity className="w-5 h-5 text-brand" /> Job Execution
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <select 
              value={timeFilter} 
              onChange={e => setTimeFilter(e.target.value)}
              className="bg-background border border-border-strong text-text-primary text-sm p-2 rounded-none"
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-background border border-border-strong text-text-primary text-sm p-2 rounded-none"
            >
              <option value="all">All Statuses</option>
              <option value="QUEUED">Queued</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
            <Button 
              variant={dlqOnly ? "default" : "outline"} 
              size="sm" 
              onClick={() => setDlqOnly(!dlqOnly)}
              className="text-xs"
            >
              {dlqOnly ? "Showing DLQ Only" : "Show DLQ"}
            </Button>
            <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading}>
              <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto border border-border-strong bg-surface">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary uppercase bg-background border-b border-border-strong">
              <tr>
                <th className="px-4 py-3 font-bold tracking-widest">Type</th>
                <th className="px-4 py-3 font-bold tracking-widest">Status</th>
                <th className="px-4 py-3 font-bold tracking-widest">Attempts</th>
                <th className="px-4 py-3 font-bold tracking-widest">Duration</th>
                <th className="px-4 py-3 font-bold tracking-widest">Created</th>
                <th className="px-4 py-3 font-bold tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-b border-border-light hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {job.type}
                    {job.deadLetteredAt && (
                      <Badge className="ml-2 bg-red-900/30 text-red-500 text-[10px] border-0">DLQ</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 ${
                      job.status === 'COMPLETED' ? 'text-green-500' :
                      job.status === 'FAILED' ? 'text-red-500' :
                      job.status === 'PROCESSING' ? 'text-brand' :
                      'text-text-secondary'
                    }`}>
                      {job.status === 'COMPLETED' && <IconCheck className="w-3 h-3" />}
                      {job.status === 'FAILED' && <IconX className="w-3 h-3" />}
                      {job.status === 'PROCESSING' && <IconRefresh className="w-3 h-3 animate-spin" />}
                      {job.status === 'QUEUED' && <IconClock className="w-3 h-3" />}
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {job.attempts} / {job.maxAttempts}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {job.durationMs ? `${job.durationMs}ms` : '-'}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(job.status === 'FAILED' || job.status === 'CANCELLED') && (
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleRetry(job.id)}>
                          Retry
                        </Button>
                      )}
                      <Link href={`/operations/jobs/${job.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    No jobs found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-text-secondary">Page {page}</span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={jobs.length < 20}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
