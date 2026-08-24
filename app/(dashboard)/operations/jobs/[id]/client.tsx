/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function JobDetailsClient({ jobId }: { jobId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/v1/operations/jobs/${jobId}`);
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchJob();
  }, [jobId]);

  const handleRetry = async () => {
    if (!confirm("Are you sure you want to retry this job?")) return;
    try {
      const res = await fetch(`/api/v1/operations/jobs/${jobId}/retry`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchJob();
      } else {
        alert("Failed to retry: " + data.error);
      }
    } catch (err) {
      alert("Failed to retry job");
    }
  };

  if (loading) return <div className="animate-pulse flex flex-col gap-4">
    <div className="h-40 bg-surface rounded-lg"></div>
    <div className="h-40 bg-surface rounded-lg"></div>
  </div>;

  if (!job) return <div>Job not found.</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-text-primary">{job.type}</h2>
            <Badge className={
              job.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-0' :
              job.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border-0' :
              job.status === 'PROCESSING' ? 'bg-brand/10 text-brand border-0' :
              'bg-surface text-text-secondary border-border-strong'
            }>
              {job.status}
            </Badge>
            {job.deadLetteredAt && (
              <Badge className="bg-red-900/30 text-red-500 border-0">DEAD LETTERED</Badge>
            )}
          </div>
          <span className="text-sm font-mono text-text-secondary">{job.id}</span>
        </div>
        {(job.status === 'FAILED' || job.status === 'CANCELLED') && (
          <Button onClick={handleRetry}>Manual Retry</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-surface border-border-light flex flex-col gap-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-border-light pb-2">Overview</h3>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="text-text-secondary">User</div>
            <div className="font-medium">{job.user?.name || job.userId} <br/><span className="text-xs opacity-70">{job.user?.email}</span></div>
            
            <div className="text-text-secondary">Created</div>
            <div className="font-medium">{new Date(job.createdAt).toLocaleString()}</div>
            
            <div className="text-text-secondary">Started</div>
            <div className="font-medium">{job.startedAt ? new Date(job.startedAt).toLocaleString() : '-'}</div>
            
            <div className="text-text-secondary">Completed</div>
            <div className="font-medium">{job.completedAt ? new Date(job.completedAt).toLocaleString() : '-'}</div>

            <div className="text-text-secondary">Duration</div>
            <div className="font-medium">{job.durationMs ? `${job.durationMs}ms` : '-'}</div>
          </div>
        </Card>

        <Card className="p-6 bg-surface border-border-light flex flex-col gap-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-border-light pb-2">Execution</h3>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="text-text-secondary">Attempts</div>
            <div className="font-medium">{job.attempts} / {job.maxAttempts}</div>
            
            <div className="text-text-secondary">Next Retry</div>
            <div className="font-medium">
              {job.status === 'QUEUED' && job.availableAt > new Date().toISOString() 
                ? new Date(job.availableAt).toLocaleString() 
                : '-'}
            </div>
            
            <div className="text-text-secondary">Worker ID</div>
            <div className="font-mono text-xs break-all">{job.workerId || '-'}</div>
            
            <div className="text-text-secondary">Idempotency Key</div>
            <div className="font-mono text-xs break-all">{job.idempotencyKey || '-'}</div>
          </div>
        </Card>
      </div>

      {job.errorMessage && (
        <Card className="p-6 bg-red-900/10 border-red-900/30 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest border-b border-red-900/30 pb-2">Failure Details</h3>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-text-primary">{job.errorCode || 'UNKNOWN_ERROR'}</span>
            <span className="text-sm text-text-secondary font-mono whitespace-pre-wrap">{job.errorMessage}</span>
            {job.failedAt && (
              <span className="text-xs text-text-secondary mt-2">Failed at {new Date(job.failedAt).toLocaleString()}</span>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-surface border-border-light flex flex-col gap-4 overflow-hidden">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-border-light pb-2">Payload (Sanitized)</h3>
          <pre className="text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap">
            {job.payload ? JSON.stringify(job.payload, null, 2) : 'No payload'}
          </pre>
        </Card>

        <Card className="p-6 bg-surface border-border-light flex flex-col gap-4 overflow-hidden">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-border-light pb-2">Result (Sanitized)</h3>
          <pre className="text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap">
            {job.result ? JSON.stringify(job.result, null, 2) : 'No result'}
          </pre>
        </Card>
      </div>
    </div>
  );
}
