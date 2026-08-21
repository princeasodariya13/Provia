# Background Jobs & Asynchronous Processing Foundation Specification

## Purpose
The purpose of this architecture is to move suitable long-running and retryable operations away from direct request/response execution. This foundation ensures that operations such as AI profile analysis, portfolio generation, and third-party data synchronization do not block API requests, can automatically recover from transient failures, and execute reliably in the background.

## Architecture
The background job system is built natively on top of PostgreSQL using Prisma, with a clean abstraction layer (Service/Processor pattern) that allows future migration to external queueing systems like BullMQ, Redis, or SQS without rewriting business logic. The architecture consists of:
- **Database Layer**: A `Job` model storing all necessary state (status, payload, retries).
- **Service Layer (`JobService`)**: Centralized creation, retrieval, and retry logic.
- **Processing Layer (`JobProcessor`)**: Atomic claim logic, failure handling, and handler execution.
- **Handler Registry**: Individual job handlers (`ProfileAnalysis`, `PortfolioGeneration`, `ProviderSync`) encapsulating specific business logic by reusing existing application services.
- **Worker Execution**: A dedicated `worker.ts` entrypoint that safely polls for jobs.

## Job Lifecycle
Jobs transition through a strictly defined set of states:
- **QUEUED**: The initial state when a job is created, or when returned for retry. The `availableAt` field dictates when the job can be processed.
- **PROCESSING**: The job has been atomically claimed by a worker and is actively running.
- **COMPLETED**: The handler executed successfully. The result is stored, and the job is done.
- **FAILED**: The job encountered an error and has exceeded its `maxAttempts`, or the error was deemed non-retryable.

## Job Types
The system uses a strict, typed job definition system. Current supported types include:
- `PROFILE_ANALYSIS`: Calls the AI service to analyze a user's raw data and generate structured output.
- `PORTFOLIO_GENERATION`: Calls the Portfolio Content service to assemble and format a user's portfolio.
- `PROVIDER_SYNC`: Calls the Integration architecture to fetch updated profile data from platforms like GitHub or LinkedIn.
- `EMAIL_DELIVERY`: Enqueues notification and transaction emails.

## Payload Validation
Every job type enforces its own unique Zod schema (`schemas.ts`). When a job is created, its payload is parsed and validated against this schema, ensuring that the background worker never attempts to process malformed data. No sensitive information (such as OAuth tokens, passwords, or raw API keys) is ever stored in generic job payloads.

## Claiming Strategy & Concurrency Model
To prevent multiple workers from executing the same job concurrently, the `JobProcessor` utilizes an atomic claiming strategy native to PostgreSQL:
```sql
UPDATE "Job"
SET status = 'PROCESSING', "lockedAt" = $1, "startedAt" = $1, attempts = attempts + 1
WHERE id = (
  SELECT id FROM "Job" WHERE status = 'QUEUED' AND "availableAt" <= $1
  ORDER BY "createdAt" ASC LIMIT 1
  FOR UPDATE SKIP LOCKED
) RETURNING *;
```
The `FOR UPDATE SKIP LOCKED` clause ensures safe multi-worker concurrency without deadlocking or locking rows longer than necessary, guaranteeing that each job is processed exactly once per attempt.

## Retries & Backoff
The system implements bounded retries with exponential backoff:
- **maxAttempts**: Defaults to 3.
- **Backoff Calculation**: If attempt 1 fails, the job is delayed by ~5 seconds. Attempt 2 adds a delay of ~30 seconds, etc. 
If the maximum number of attempts is exhausted, the job permanently transitions to `FAILED`. 

## Stale Job Recovery
To account for process crashes or network partition events while a job is in the `PROCESSING` state, the `JobProcessor` implements a stale job recovery mechanism. A configurable processing timeout dictates how long a job can remain `PROCESSING`. If a job's `lockedAt` timestamp exceeds this timeout, the worker will automatically requeue the job (if attempts remain) or mark it as `FAILED`.

## Idempotency
To prevent harmful duplicate executions (e.g., triggering multiple simultaneous AI analyses for the same user), the system supports an `idempotencyKey` field. Rather than creating a permanent database-level unique constraint (which would block users from running a job again in the future), the application layer actively blocks new jobs if there is already an existing `QUEUED` or `PROCESSING` job with the same idempotency characteristics.

## Security
- **Authentication**: All API routes interacting with jobs (`POST /api/v1/jobs`, `GET /api/v1/jobs/[id]`) mandate `requireAuth()`.
- **Authorization**: Job ownership is strictly verified. User A cannot view, retry, or create jobs on behalf of User B.
- **Data Protection**: Stack traces and internal provider credentials are never returned to clients.
- **Payload Safety**: Generic payloads do not include API keys, JWTs, or session secrets.

## Logging
The background worker leverages the existing Pino structured logger. Every significant lifecycle event (`job.created`, `job.started`, `job.completed`, `job.retry_scheduled`, `job.failed`) is logged with structured fields (`jobId`, `jobType`, `userId`, `attempt`, `durationMs`). Sensitive data is systematically excluded from the log stream.

## Worker Execution
The worker operates via a clean polling loop implemented in `scripts/worker.ts`.
- Command: `npm run worker`
- Graceful Shutdown: The worker listens for `SIGINT` and `SIGTERM`, preventing jobs from being abandoned mid-flight.
- Environment Constraints: Uses `JOB_POLL_INTERVAL_MS` for safe polling pauses rather than tight loops.

## API Boundaries
- `POST /api/v1/jobs`: Enqueues explicitly supported safe job types. 
- `GET /api/v1/jobs/[id]`: Returns sanitized job status.
- `POST /api/v1/jobs/[id]/retry`: Allows manual retry of failed jobs.
- Direct backward compatibility paths exist in legacy endpoints (like `POST /api/v1/ai/analyze-profile?async=true`), safely wrapping the async job initialization logic for existing frontends.

## Future Migration
By isolating the database layer into `JobService` and the processing layer into `JobProcessor`, replacing the PostgreSQL queue with a distributed external queue (like Redis + BullMQ) requires zero changes to the underlying job handlers, payload schemas, or external API boundaries.
