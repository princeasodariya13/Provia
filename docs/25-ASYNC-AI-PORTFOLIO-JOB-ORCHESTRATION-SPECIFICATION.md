# 25 - Async AI & Portfolio Job Orchestration

## 1. Objective
Connect the asynchronous PostgreSQL Job infrastructure from Step 24 to the existing AI profile-analysis and portfolio-generation workflows. This orchestrates long-running tasks in the background without duplicating business logic, ensuring safe, idempotent, and isolated execution.

## 2. Job-to-Business Service Boundary
The worker serves strictly as an orchestrator. It does not implement business logic. 
- **Worker Responsibilities**: Claim jobs, parse payloads safely, enforce user isolation, invoke existing services, update status, manage retries.
- **Service Responsibilities**: Fetch data, call AI models, handle templates, enforce domain rules, save core database records.

## 3. PROFILE_ANALYSIS Job Flow
- **API**: `POST /api/v1/ai/analyze-profile?async=true` creates a `PROFILE_ANALYSIS` job using `idempotencyKey: profile-analysis-<userId>`.
- **Payload**: `{ userId: "..." }`
- **Handler**: Invokes `AIService.analyzeProfile(job.userId)`.
- **Completion**: Updates Job status and saves the `AIGeneration` ID to the job result.

## 4. PORTFOLIO_GENERATION Job Flow
- **API**: `POST /api/v1/portfolio/generate?async=true` creates a `PORTFOLIO_GENERATION` job using `idempotencyKey: portfolio-generate-<userId>`.
- **Payload**: `{ userId: "..." }`
- **Handler**: Invokes `PortfolioContentService.generatePortfolio(job.userId)`.
- **Completion**: Updates Job status and saves the `PortfolioDocument` ID/version to the job result.

## 5. Idempotency & Retry Behavior
- Idempotency is derived deterministically (e.g., `operation-<userId>`), preventing duplicate queues for the same operation.
- Retries are automatically managed by the Step 24 processor (exponential backoff). Permanent failures (e.g., unconfigured AI) do not retry endlessly.

## 6. Security Boundaries
- **Payloads**: No secrets, tokens, or credentials exist in the job payload. 
- **Isolation**: Handlers inherently trust `job.userId` to load context, never an arbitrary `userId` supplied inside the payload body.
- **API**: The existing synchronous endpoints remain intact for backward compatibility. Async endpoints return safe Job status metadata.

## 7. Scope Note
- **Step 25**: Job orchestration for existing generation workflows.
- **Step 26**: Has NOT been started. Future integrations or notifications remain out of scope.
