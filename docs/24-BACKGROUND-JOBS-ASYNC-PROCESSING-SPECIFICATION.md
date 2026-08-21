# 24 - Background Jobs & Asynchronous Processing Foundation

## 1. Objective
Establish a production-grade asynchronous background job foundation for Provia. This foundation moves suitable long-running/retryable operations (such as AI profile analysis, portfolio generation, and external provider synchronization) away from direct request/response execution. It provides a robust, provider-agnostic abstraction backed initially by PostgreSQL, designed for future migration to external queues (e.g., BullMQ, SQS) if needed.

## 2. Architecture & Job Abstraction
- **Types & Schemas**: Defined in `lib/jobs/types.ts` and `lib/jobs/schemas.ts`. Each job type (e.g., `PROFILE_ANALYSIS`) has a strongly-typed Zod payload schema to ensure execution safety.
- **Job Service (`lib/jobs/service.ts`)**: The orchestrator for creating, fetching, and retrying jobs. It ensures idempotency and safe data persistence.
- **Job Registry (`lib/jobs/registry.ts`)**: A centralized map of `JobType` to `JobDefinition`, allowing easy registration of new handlers.
- **Job Processor (`lib/jobs/processor.ts`)**: An atomic, lock-based PostgreSQL worker that polls for queued jobs, manages retries with exponential backoff, and recovers stale processing jobs.

## 3. Database Model
A new Prisma model `Job` was added to PostgreSQL with the following fields:
- `id`, `userId`, `type`
- `status` (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`)
- `payload` and `result` (JSON storage)
- `errorCode`, `errorMessage` (for safe user exposure without stack traces)
- `attempts`, `maxAttempts` (defaults to 3)
- `availableAt`, `lockedAt`, `startedAt`, `completedAt`, `failedAt`
- Indexes: `(status, availableAt)`, `(userId, createdAt)`, `(type, status)` for efficient worker claiming.

## 4. Job Lifecycle & Claiming Strategy
1. **QUEUED**: The job is created or scheduled for a retry (waiting for `availableAt` to pass).
2. **PROCESSING**: The worker atomically claims the job using PostgreSQL raw query `FOR UPDATE SKIP LOCKED`. If multiple workers attempt to claim the same job, the locking guarantees that each worker skips locked rows and takes the next available job, eliminating contention and `P2025` lock-miss errors.
3. **COMPLETED**: The handler returns successfully, and the result is saved.
4. **FAILED**: The job exceeds `maxAttempts` or encounters a non-retryable error.

## 5. Idempotency Strategy
Idempotency is enforced at two levels:
1. **Active Check**: If a user attempts to trigger a job while another job of the same type and `userId` is currently `QUEUED` or `PROCESSING`, the `JobService` gracefully returns the existing active job instead of duplicating it.
2. **Database Level**: The `Job` model has a unique `idempotencyKey` field. If clients provide an `idempotencyKey` during job creation, PostgreSQL natively guarantees duplicate prevention, and the service transparently handles the `P2002` error to return the existing job.

## 6. Worker Execution & Stale Recovery
- **Worker Script**: `npm run worker` starts `scripts/worker.ts`.
- **Graceful Shutdown**: Intercepts `SIGINT` and `SIGTERM` to allow the current job to finish before stopping the polling loop.
- **Stale Recovery**: A `recoverStaleJobs` routine runs alongside polling to identify jobs stuck in `PROCESSING` longer than a configured timeout. If attempts remain, they are requeued; otherwise, they are marked `FAILED` with a `TIMEOUT` error code.

## 7. API Endpoints
- `GET /api/v1/jobs/[id]`: Safely retrieves job status and results for the authenticated user.
- `POST /api/v1/jobs/[id]/retry`: Re-queues a explicitly `FAILED` job for the authenticated user, resetting attempts.
- Jobs are created internally via specific feature endpoints (e.g., `POST /api/v1/ai/analyze-profile?async=true`), rather than an arbitrary generic `POST /api/v1/jobs` endpoint, to prevent abuse.

## 8. Security & Multi-User Isolation
- **No Secrets in Payloads**: OAuth tokens and API keys are strictly kept out of job payloads. Handlers rely on existing services (e.g., `AIService`) which fetch required credentials at runtime.
- **User Ownership**: Every API endpoint (GET status, POST retry) verifies that `job.userId === currentUser.id`. A user can never inspect, execute, or retry another user's job.
- **Payload Validation**: Zod strictly validates all payloads upon creation.

## 9. Integration
- `PROFILE_ANALYSIS` job type has been implemented (`lib/jobs/handlers/profile-analysis.ts`).
- `POST /api/v1/ai/analyze-profile` now accepts an `async=true` query parameter to enqueue a background job instead of blocking the HTTP request, preserving backward compatibility for existing clients while enabling asynchronous UI flows.

## 10. Known Limitations
- The claiming strategy uses a raw `FOR UPDATE SKIP LOCKED` query, which requires direct database access and bypasses Prisma's type safety for that specific transaction.
- Adding the `idempotencyKey` to the Prisma schema requires a database migration. This migration must be executed against the production Neon database before the new worker logic is deployed.
