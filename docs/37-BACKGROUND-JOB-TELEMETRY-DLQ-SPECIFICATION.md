# Step 37 — Background Job Telemetry + Dead Letter Queue (DLQ) Specification

## 1. Architecture
The Provia Background Job architecture has been upgraded to a production-grade observable and recoverable platform. The system remains backed by PostgreSQL and uses `FOR UPDATE SKIP LOCKED` to prevent concurrency issues and race conditions. 

It introduces a Dead Letter Queue (DLQ) mechanism to deterministically handle jobs that exhaust their maximum retry attempts, and detailed telemetry using the existing analytics architecture.

## 2. Job Lifecycle
The job lifecycle has been extended:
\`\`\`
QUEUED → PROCESSING → COMPLETED
                   ↘ FAILED → RETRY (if attempts < maxAttempts)
                              ↓
                             DLQ (status: FAILED, deadLetteredAt: NOW)
\`\`\`

## 3. DLQ (Dead Letter Queue)
Jobs automatically transition to the DLQ when `job.attempts >= job.maxAttempts`. 
- The job's status becomes `FAILED`.
- The `deadLetteredAt` timestamp is populated.
- A `job.dead_lettered` telemetry event is emitted.
- DLQ jobs remain in the database for manual operator review.

## 4. Retry Behavior
Retry behavior is bounded. 
- Exponential backoff is used: 5s, 30s, etc.
- Concurrency safety is maintained by clearing the `workerId` and `lockedAt` fields and advancing the `availableAt` timestamp during a retry schedule.
- Safe retries can be triggered by authorized ADMIN users from the operations dashboard, which atomically sets the job back to `QUEUED` and resets attempts to 0.

## 5. Worker Health
A new `WorkerStatus` model tracks active worker instances.
- Upon startup, a worker generates a unique `workerId`.
- The worker emits heartbeats every 10 seconds.
- It tracks the current job ID and metrics for `jobsProcessed` and `jobsFailed`.
- During graceful shutdown (`SIGINT`/`SIGTERM`), it sets its status to `OFFLINE`.

## 6. Telemetry and Observability
Integrated with `AnalyticsService` to emit:
- \`job.queued\`
- \`job.started\`
- \`job.completed\`
- \`job.failed\`
- \`job.retry\`
- \`job.dead_lettered\`
- \`job.cancelled\`
- \`job.stuck_detected\`

New `durationMs` field is logged directly on the `Job` record and emitted in telemetry.

## 7. APIs
New endpoints added (all require `ADMIN` role via server-side session checks):
- \`GET /api/v1/operations/jobs\`: Fetches paginated jobs with status, time, and type filters.
- \`GET /api/v1/operations/jobs/[id]\`: Details for a specific job, with sanitized payload and results.
- \`GET /api/v1/operations/jobs/metrics\`: Aggregates job statuses, DLQ count, processing times, and failures.
- \`POST /api/v1/operations/jobs/[id]/retry\`: Safely retries a failed or DLQ job.
- \`GET /api/v1/operations/workers\`: Fetches the status and heartbeats of active workers.

## 8. Security & Sanitization
- **Authorization**: `requireRole("ADMIN")` strictly protects all operations endpoints.
- **Sanitization**: Raw payloads containing sensitive keys (`accessToken`, `refreshToken`) are redacted before being served to the dashboard.
- **Data Protection**: Existing rate limiting (via `withAPIHandler`) applies to the new endpoints automatically.

## 9. Failure Recovery
- **Stuck Jobs**: Jobs stuck in `PROCESSING` without completing for over 5 minutes are requeued, or moved to DLQ if max attempts are exceeded. Telemetry `job.stuck_detected` is recorded.
- **Worker Crash**: If a worker crashes, its heartbeat expires. Stale jobs left by crashed workers are recovered by the `recoverStaleJobs` polling task.

## 10. Operations Dashboard
The UI is built using existing Provia primitives, accessible at `/operations/jobs` for authorized operators.
Features:
- KPI metrics (Success Rate, Processing Time, DLQ count).
- Active workers monitoring.
- Job tables with pagination and robust filtering (Time, Status, DLQ).
- Detailed single job view with JSON representations of sanitized payloads.
