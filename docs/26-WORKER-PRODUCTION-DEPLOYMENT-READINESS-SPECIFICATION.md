# 26 - Worker Production Deployment Readiness & Execution Hardening

## 1. Objective
Harden the existing PostgreSQL background worker to ensure it is production-ready for deployment on persistent hosting platforms (e.g., Render, Railway, Fly.io). The worker strictly isolates the Next.js web application from heavy background tasks, executing long-running operations safely, concurrently, and reliably.

## 2. Worker Architecture
- **Persistent Process Requirement**: The worker runs as a continuous Node.js process using `npm run worker` (`tsx scripts/worker.ts`). It cannot run as a Vercel serverless function because of its continuous polling loop.
- **Environment**: Shares the same `DATABASE_URL` as the web application to access the `Job` queue.
- **Startup / Failure**: Validates required configuration (`DATABASE_URL`) on startup and fails fast (with safe logs) if missing.

## 3. Database Connection Strategy
- **Shared Architecture**: Uses the exact same Prisma Client configured for the Neon PostgreSQL database.
- **No Duplicate Queues**: The authoritative queue remains PostgreSQL. No Redis dependency was introduced for job orchestration.
- **Concurrency**: `JobProcessor.claimNextJob` uses the robust `FOR UPDATE SKIP LOCKED` raw query, ensuring multiple worker instances can run in parallel without claiming the same job.

## 4. Execution Lifecycle
- **Polling**: Continuously fetches new jobs based on `JOB_POLL_INTERVAL_MS`.
- **Stale Job Recovery**: Interrogates `PROCESSING` jobs whose leases have expired (`JOB_PROCESSING_TIMEOUT_MS`). Re-queues them atomically via `updateMany` to prevent concurrent recovery collisions.
- **Retry Behavior**: Failed handlers (e.g., AI timeout) trigger an exponential backoff retry. Permanent failures exhaust attempts securely. Max attempts default to `3`.

## 5. Idempotency & Concurrency Expectations
- Uses database-level unique constraints (`idempotencyKey`) added in Step 24.
- Safe across multi-user environments and crash scenarios (e.g. Worker 1 crashes -> Worker 2 safely recovers the job post-timeout).

## 6. Health & Readiness
- A minimal native Node.js HTTP server binds to `process.env.PORT` (or 8080) in the worker script to respond to `/health` probes. This prevents deployment platforms from killing the worker under the assumption it failed to bind a port.

## 7. Graceful Shutdown
- Captures `SIGINT` and `SIGTERM`.
- Stops polling loop immediately.
- Allows the current active job to finish.
- Cleans up and calls `prisma.$disconnect()` before exiting.

## 8. Logging & Security
- Uses the `pino` logger.
- Emits structured events (`worker.started`, `job.started`, `job.completed`, etc.).
- Never logs sensitive data like `DATABASE_URL`, OAuth tokens, session secrets, or integration encryption keys.
- Isolation: Handlers explicitly derive data using `job.userId`, fully protecting User B from User A's malformed requests.

## 9. Deployment Summary
- **Web App**: Deploy on Vercel.
- **Database**: Host on Neon PostgreSQL.
- **Worker**: Deploy on Render/Railway. Set Build Command (`npm run build`) and Start Command (`npm run worker`). Ensure `DATABASE_URL` is exactly the same as the Vercel configuration.
