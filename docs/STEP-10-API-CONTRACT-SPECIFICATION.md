# STEP-10-API-CONTRACT-SPECIFICATION.md

**AI-Powered Portfolio Generator — API Contract, Endpoint & Communication Specification**
**Step 10 of the project documentation series**

---

## 1. Executive Summary

This document defines the complete, production-grade API contract for the AI-powered portfolio generator. It specifies every endpoint the backend must expose to support the full user journey — registration through GitHub/LinkedIn integration, AI-assisted content generation, portfolio editing, drafting, templating, publishing, and public consumption — plus the administrative and observability surface needed to operate the system safely at scale.

The contract is designed to be directly translatable into an OpenAPI/Swagger definition, a typed frontend API client, and backend controller signatures, without requiring further architectural decisions. It assumes and remains consistent with the technology direction, system architecture, backend specification, and data model already established in Steps 1–9.

Core guarantees enforced throughout this contract:

- The backend is the sole authority on user identity — no client-supplied `userId` is ever trusted.
- Every user-owned resource enforces ownership server-side, independent of authentication.
- Every response follows one deterministic envelope shape.
- Every error is machine-readable via a stable code, never a raw stack trace or provider error.
- Expensive or externally-triggered operations (OAuth callbacks, sync, AI generation, publishing) are idempotent and job-based where asynchronous.
- Public endpoints expose only explicitly public, published data.

---

## 2. API Principles

1. **Versioned** — all routes are namespaced under `/api/v1`.
2. **Predictable** — identical resource shapes and verbs across modules; no bespoke conventions per module.
3. **Secure by default** — authentication and ownership checks are opt-out, not opt-in; every new endpoint must declare its auth/authz posture explicitly.
4. **REST-oriented, pragmatic** — REST resource semantics are used where they fit naturally; job/async patterns are used where a synchronous REST verb would misrepresent the operation (AI generation, sync, publish).
5. **Consistent** — one response envelope, one error format, one pagination style family, one filtering/sorting convention.
6. **Typed & validated** — every input surface (body, query, params, headers, files) is validated server-side against an explicit schema/DTO; nothing is inferred.
7. **Production-ready** — rate limiting, idempotency, concurrency control, and observability are first-class, not deferred.
8. **Multi-user safe** — user isolation is enforced at the data-access layer, not just the route layer.
9. **No internal leakage** — database structures, internal IDs where unnecessary, provider secrets, and stack traces are never exposed.

---

## 3. Base URL & Versioning

```
Base URL:      https://api.<domain>/api/v1
Public routes: https://<domain>/p/:slug  (portfolio rendering, may be served by frontend/CDN, backed by /api/v1/public/*)
```

**Versioning rules:**

- All authenticated and administrative functionality lives under `/api/v1`.
- A breaking change (removed field, changed semantics, changed status code meaning) requires a new version namespace (`/api/v2`); it must never be introduced silently into `/api/v1`.
- Additive, backward-compatible changes (new optional field, new endpoint, new optional query param) are permitted within `/api/v1`.
- `/api/v1` and `/api/v2` may run concurrently during a migration window; deprecation is communicated via a `Deprecation` and `Sunset` response header on affected endpoints, not by breaking them outright.
- Public portfolio rendering routes are versioned independently from the authenticated API where feasible, since they must remain stable for the longest (indexed, bookmarked, shared URLs).

---

## 4. Authentication Strategy

**Mechanism:** Session-based authentication using an HTTP-only, `Secure`, `SameSite=Lax` (or `Strict` where compatible with OAuth redirect flows) session cookie issued at login/registration. The session token is opaque to the client; the backend resolves it to a user record on every request.

- The frontend never stores or manages a JWT/access token directly for first-party session auth. This removes an entire class of token-leak and storage vulnerabilities (XSS token theft, localStorage exposure).
- A short-lived CSRF token is issued alongside the session and required on all state-changing (`POST`/`PUT`/`PATCH`/`DELETE`) requests from browser clients.
- The backend determines the authenticated user exclusively from the verified session; any `userId` present in a request body or query string is ignored for authorization purposes and, where present in a write payload, rejected via mass-assignment protection.
- Session lifetime, idle timeout, and absolute timeout are configurable; expired sessions return `401 AUTH_SESSION_EXPIRED`.
- Every endpoint below declares one of:
  - **Public** — no authentication required.
  - **Optional** — behavior may vary if authenticated, but unauthenticated access is allowed.
  - **Required** — `401 AUTH_UNAUTHORIZED` if no valid session.

---

## 5. Authorization Strategy

Every protected endpoint in this document declares four properties:

| Property | Meaning |
|---|---|
| **Auth** | Public / Optional / Required |
| **Role** | Minimum role required (`USER`, `ADMIN`, or none) |
| **Owner Check** | Whether the backend must verify the authenticated user owns the target resource |
| **Permission Rules** | Any additional business-rule gate (e.g., "portfolio must be unpublished to delete") |

**Roles (initial):**

- `USER` — standard authenticated account; can manage only their own resources.
- `ADMIN` — full administrative visibility and moderation capability across all users.

**Role model is extensible.** Role checks are implemented as a single reusable middleware taking an allowlist of roles, so future roles (`EDITOR`, `SUPPORT`, `BILLING_ADMIN`, etc.) can be introduced without touching endpoint logic. Role is stored server-side on the user record and is never derived from client input.

**Ownership enforcement pattern:** for every resource with a `userId`/`ownerId` field, the query used to fetch/mutate it always includes the authenticated user's ID as a filter (`{ _id: resourceId, ownerId: session.userId }`), never a fetch-then-compare-in-application-code pattern alone — this closes IDOR gaps even under race conditions.

---

## 6. User Isolation

User isolation is enforced at the data-access layer for every resource type listed below. No endpoint returns or mutates another user's data under any role except `ADMIN`, and admin access is always explicit (separate `/admin` routes), never a fallback path on a user route.

Isolated resource types:

- Professional profile
- Portfolio(s) and drafts
- AI generation jobs and history
- Sync jobs and history
- OAuth connections (GitHub, LinkedIn)
- Imported/normalized source data
- Private analytics
- Account settings and preferences

**Enforcement checklist per resource type:** every list/get/update/delete endpoint filters by `ownerId = session.userId`; every create endpoint sets `ownerId = session.userId` server-side, ignoring any client-supplied owner field.

---

## 7. Request Standards

- Content type: `application/json` for all non-file-upload requests; `multipart/form-data` for file uploads (see Section 37).
- All identifiers in paths are validated as well-formed (e.g., ObjectId shape) before any database call; malformed IDs return `400 VALIDATION_FAILED`, not `404`, to distinguish "malformed" from "not found."
- Every request body is validated against an explicit schema (DTO). Unknown fields are stripped or rejected (configurable per endpoint, default: rejected in security-sensitive endpoints such as auth and user-role fields; stripped elsewhere) — see Section 43.
- Query parameters for list endpoints follow the shared pagination/filtering/sorting contract (Sections 31–33).
- Optional `X-Request-ID` (or backend-generated if absent) is honored and echoed back for correlation (Section 40).
- Optional `Idempotency-Key` header is honored on all endpoints marked **Idempotent** in the endpoint matrix (Section 43/Complete Endpoint Matrix).

---

## 8. Response Standards

All responses share one envelope shape.

**Success:**

```json
{
  "success": true,
  "data": { },
  "metadata": {
    "requestId": "string",
    "pagination": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 }
  }
}
```

- `data` shape is endpoint-specific and explicitly typed per endpoint (Section 44 governs what may never appear inside it).
- `metadata` is present only where relevant (pagination, job info, rate-limit remaining); omitted otherwise rather than sent empty.

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Human-readable, safe-to-display summary.",
    "fieldErrors": [
      { "field": "email", "message": "Must be a valid email address." }
    ],
    "requestId": "string"
  }
}
```

- `code` is always present and drawn from the catalog in Section 10.
- `fieldErrors` is present only for `400`/`422` validation failures.
- `requestId` is always present so a user-reported error can be traced end-to-end (Section 40).
- The envelope is identical whether the failure originated in validation, business logic, an external provider, or an unhandled server error — only `code`, `message`, and `fieldErrors` vary.

---

## 9. Error Standards

- HTTP status communicates the *category* of failure; `error.code` communicates the *specific* failure. Both are always present and must agree (e.g., a `RESOURCE_FORBIDDEN` code is never paired with a `404` status).
- Internal errors (`500`) always return a generic message ("Something went wrong. Please try again.") plus `requestId`; the underlying exception, stack trace, and any driver-level error are logged server-side only, never serialized to the client.
- External provider failures (GitHub, LinkedIn, AI provider) are always translated to an application-level code (`GITHUB_CONNECTION_FAILED`, `AI_GENERATION_FAILED`, etc.) with a safe, generic message — see Section 38.
- Validation errors always return `422` when the payload is well-formed JSON but fails business/schema validation, and `400` when the payload itself is malformed (not valid JSON, wrong content type, missing required structural element). This distinction is applied consistently across all endpoints.

**Status code usage (canonical mapping):**

| Code | Meaning | Used for |
|---|---|---|
| 200 | OK | Successful GET/PUT/PATCH/DELETE with body |
| 201 | Created | Successful resource creation |
| 202 | Accepted | Asynchronous job started (sync, AI generation, publish where async) |
| 204 | No Content | Successful action with no body (e.g., logout, disconnect) |
| 400 | Bad Request | Malformed request structure |
| 401 | Unauthenticated | Missing/invalid/expired session |
| 403 | Forbidden | Authenticated but not authorized (role or ownership) |
| 404 | Not Found | Resource does not exist (or, for isolation, does not exist *for this user*) |
| 409 | Conflict | Duplicate resource, concurrent-edit version mismatch, slug collision |
| 422 | Validation Error | Well-formed but semantically invalid payload |
| 429 | Rate Limited | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled backend failure |
| 502/503 | External Failure | Upstream provider (GitHub/LinkedIn/AI) unavailable or erroring |

**Important isolation rule:** attempting to access another user's resource by ID returns `404`, not `403` — this avoids confirming the resource's existence to a non-owner (prevents enumeration). `403` is reserved for cases where existence is already implicitly known (e.g., role-gated admin routes).

---

## 10. Error Code Catalog

Organized by domain. This is the authoritative, stable list; new codes may be added but existing codes must never change meaning.

**Auth**
`AUTH_INVALID_CREDENTIALS`, `AUTH_ACCOUNT_NOT_FOUND`, `AUTH_ACCOUNT_LOCKED`, `AUTH_EMAIL_NOT_VERIFIED`, `AUTH_SESSION_EXPIRED`, `AUTH_UNAUTHORIZED`, `AUTH_INVALID_TOKEN`, `AUTH_TOKEN_EXPIRED`, `AUTH_PASSWORD_TOO_WEAK`, `AUTH_EMAIL_ALREADY_EXISTS`, `AUTH_CSRF_INVALID`

**Authorization / Resource**
`RESOURCE_NOT_FOUND`, `RESOURCE_FORBIDDEN`, `RESOURCE_CONFLICT`, `RESOURCE_LOCKED`

**Validation**
`VALIDATION_FAILED`, `MALFORMED_REQUEST`, `UNSUPPORTED_MEDIA_TYPE`, `PAYLOAD_TOO_LARGE`

**Integrations**
`GITHUB_CONNECTION_FAILED`, `GITHUB_ALREADY_CONNECTED`, `GITHUB_NOT_CONNECTED`, `GITHUB_TOKEN_EXPIRED`, `LINKEDIN_CONNECTION_FAILED`, `LINKEDIN_ALREADY_CONNECTED`, `LINKEDIN_NOT_CONNECTED`, `LINKEDIN_TOKEN_EXPIRED`, `OAUTH_STATE_MISMATCH`, `OAUTH_CALLBACK_INVALID`

**Sync**
`SYNC_ALREADY_RUNNING`, `SYNC_FAILED`, `SYNC_NOT_FOUND`, `SYNC_CANCELLED`, `SYNC_SOURCE_UNAVAILABLE`

**AI**
`AI_GENERATION_FAILED`, `AI_RATE_LIMITED`, `AI_JOB_NOT_FOUND`, `AI_JOB_ALREADY_TERMINAL`, `AI_PROVIDER_UNAVAILABLE`, `AI_CONTENT_POLICY_REJECTED`

**Portfolio / Draft**
`PORTFOLIO_NOT_FOUND`, `PORTFOLIO_NOT_PUBLISHED`, `PORTFOLIO_ALREADY_PUBLISHED`, `PORTFOLIO_VALIDATION_FAILED`, `DRAFT_CONFLICT`, `DRAFT_NOT_FOUND`, `REVISION_NOT_FOUND`

**Template / Theme**
`TEMPLATE_NOT_FOUND`, `TEMPLATE_INCOMPATIBLE`, `THEME_NOT_FOUND`, `THEME_VALIDATION_FAILED`

**Publishing**
`SLUG_ALREADY_EXISTS`, `SLUG_RESERVED`, `SLUG_INVALID`, `PUBLISH_FAILED`, `PUBLISH_ALREADY_IN_PROGRESS`, `ROLLBACK_FAILED`

**Rate Limiting / Concurrency**
`RATE_LIMIT_EXCEEDED`, `CONCURRENT_MODIFICATION`, `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD`

**File Uploads**
`FILE_TOO_LARGE`, `FILE_TYPE_NOT_ALLOWED`, `FILE_CONTENT_INVALID`, `FILE_UPLOAD_FAILED`

**System**
`INTERNAL_ERROR`, `EXTERNAL_SERVICE_UNAVAILABLE`, `MAINTENANCE_MODE`

---

## 11. Validation Standards

- Every endpoint's request body, query parameters, route parameters, and headers (where semantically relevant, e.g., `Idempotency-Key` format) are validated against an explicit schema before any handler logic executes.
- Frontend validation is UX-only and never trusted; the same rules are always re-applied server-side.
- Pagination parameters (`page`/`limit` or `cursor`) are bounded (`limit` capped, e.g., max 100) and type-checked.
- Sorting parameters are validated against an explicit allowlist per endpoint (Section 33) — never passed through to the database layer unchecked.
- Filtering parameters are validated for type and, for admin endpoints, scoped so a filter can never be used to reach across users' data.
- IDs in paths are format-validated prior to lookup (Section 7).
- File uploads are validated on MIME (via content sniffing, not the client-declared header), size, extension, and — where applicable — content (e.g., image dimension sanity, PDF structure) before acceptance (Section 37).
- Uploaded/imported provider data is normalized and validated before being persisted into the professional profile, and is never trusted as-is for portfolio rendering.

---

## 12. Auth Endpoints

Base path: `/api/v1/auth`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | Public | Creates account, sends verification email. Rate-limited, idempotent by email+deviceKey. |
| POST | `/auth/login` | Public | Validates credentials, issues session cookie + CSRF token. Heavily rate-limited. |
| POST | `/auth/logout` | Required | Invalidates current session. |
| GET | `/auth/me` | Required | Returns current authenticated user (safe fields only). |
| POST | `/auth/verify-email` | Public | Consumes verification token. |
| POST | `/auth/resend-verification` | Optional | Rate-limited per email/IP to prevent abuse. |
| POST | `/auth/forgot-password` | Public | Always returns generic success regardless of email existence (prevents enumeration). Rate-limited. |
| POST | `/auth/reset-password` | Public | Consumes reset token, sets new password, invalidates existing sessions. |
| GET | `/auth/sessions` | Required | Lists active sessions/devices for the current user. |
| DELETE | `/auth/sessions/:sessionId` | Required, owner check | Revokes a specific session (e.g., "log out other device"). |

**Register**
- Request: `{ email, password, name }`
- Validation: email format + uniqueness, password strength policy, name length bounds.
- Response `201`: `{ user: { id, email, name, emailVerified: false }, requiresVerification: true }`
- Errors: `422 VALIDATION_FAILED`, `409 AUTH_EMAIL_ALREADY_EXISTS`, `429 RATE_LIMIT_EXCEEDED`
- Rate limit: strict, per-IP and per-email.
- Idempotency: `Idempotency-Key` honored to prevent duplicate account creation on client retry.

**Login**
- Request: `{ email, password }`
- Response `200`: `{ user: {...} }` + `Set-Cookie` session + CSRF token in body/header.
- Errors: `401 AUTH_INVALID_CREDENTIALS`, `403 AUTH_ACCOUNT_LOCKED`, `403 AUTH_EMAIL_NOT_VERIFIED` (policy-dependent), `429 RATE_LIMIT_EXCEEDED`
- Rate limit: strict, progressive backoff per account and per IP.

**Logout**
- Response `204`.

**Current user**
- Response `200`: `{ id, email, name, role, emailVerified, createdAt }` — never password hash, never internal fields.

**Email verification / resend**
- Verification token is single-use, short-lived, validated server-side.
- Errors: `400 AUTH_INVALID_TOKEN`, `410`-style handled as `400 AUTH_TOKEN_EXPIRED`.

**Forgot / reset password**
- Forgot-password always responds `200` with a generic message whether or not the email exists.
- Reset consumes a single-use token; on success, all other active sessions for that user are invalidated.
- Errors: `400 AUTH_INVALID_TOKEN`, `400 AUTH_TOKEN_EXPIRED`, `422 AUTH_PASSWORD_TOO_WEAK`

---

## 13. User Endpoints

Base path: `/api/v1/users`

| Method | Path | Auth | Owner Check | Notes |
|---|---|---|---|---|
| GET | `/users/me/profile` | Required | Self only | Account-level profile (distinct from public professional profile). |
| PATCH | `/users/me/profile` | Required | Self only | Update name, avatar, contact prefs. |
| PATCH | `/users/me/preferences` | Required | Self only | Notification/display preferences. |
| POST | `/users/me/change-password` | Required | Self only | Requires current password. Invalidates other sessions. |
| DELETE | `/users/me` | Required | Self only | Soft-delete/queue account deletion; cascades per data-retention policy. |

- Authentication credentials (password hash, sessions) are never mixed into the same response payload as the public professional profile resource — they are separate resources entirely (Section 12 vs. Section 16).
- `DELETE /users/me` requires re-authentication confirmation (password or step-up) and is itself idempotent (safe to call twice).

---

## 14. Integration Endpoints

Base path: `/api/v1/integrations`

Only officially supported GitHub and LinkedIn OAuth APIs/permissions are used; no scraping endpoints exist in this contract.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/integrations/github/connect` | Required | Returns/redirects to GitHub OAuth authorization URL with signed `state`. |
| GET | `/integrations/github/callback` | Required (session must span redirect) | Exchanges code for token, stores encrypted, never returned to client. Idempotent per `state`. |
| GET | `/integrations/github/status` | Required, owner | Connection status, scopes granted, last sync time. |
| POST | `/integrations/github/sync` | Required, owner | Triggers a sync job (see Section 16). |
| DELETE | `/integrations/github/disconnect` | Required, owner | Revokes token, removes connection record. |
| GET | `/integrations/linkedin/connect` | Required | Same pattern as GitHub. |
| GET | `/integrations/linkedin/callback` | Required | Same pattern as GitHub. |
| GET | `/integrations/linkedin/status` | Required, owner | Same pattern as GitHub. |
| POST | `/integrations/linkedin/sync` | Required, owner | Same pattern as GitHub. |
| DELETE | `/integrations/linkedin/disconnect` | Required, owner | Same pattern as GitHub. |

**OAuth callback contract (both providers):**
- `state` parameter is signed and bound to the initiating session; mismatch → `400 OAUTH_STATE_MISMATCH`.
- Callback is idempotent: replaying the same `code`/`state` after a token has already been issued does not create a duplicate connection or error the user experience — it resolves to the existing connection status.
- Access/refresh tokens are stored encrypted at rest and are never included in any API response, including `/status`.
- Provider-side errors (denied scope, provider outage) are normalized to `GITHUB_CONNECTION_FAILED` / `LINKEDIN_CONNECTION_FAILED` with a safe message; raw provider error bodies are logged, not returned.

**Status response shape:** `{ connected: boolean, provider, scopes: [...], connectedAt, lastSyncAt, lastSyncStatus }` — never the token.

---

## 15. Source Data Endpoints

Base path: `/api/v1/sources`

| Method | Path | Auth | Owner Check | Notes |
|---|---|---|---|---|
| GET | `/sources` | Required | Yes | List connected sources and their status. |
| GET | `/sources/:sourceId/imported` | Required | Yes | Normalized, safe imported data for review — not raw provider payload. |
| GET | `/sources/:sourceId/history` | Required | Yes | Sync history for this source. Cursor-paginated. |
| GET | `/sources/:sourceId/records/:recordId` | Required | Yes | A single normalized record pending user review/merge. |

- Raw provider payloads are never returned to the frontend; only normalized/safe representations, consistent with Step 9's data model.
- `imported` responses include field-level source attribution (`{ field, value, source: "github", confidence }`) to support the conflict-resolution UI, without exposing raw provider JSON.

---

## 16. Sync Endpoints

Base path: `/api/v1/sync`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/sync` | Required, owner | Body: `{ provider: "github" \| "linkedin" }`. Returns `202` + job. Rejects with `409 SYNC_ALREADY_RUNNING` if a sync for that provider is already in progress for this user. |
| GET | `/sync/:jobId` | Required, owner | Job status/result. |
| GET | `/sync/history` | Required, owner | Cursor-paginated list of past sync jobs. |
| POST | `/sync/:jobId/cancel` | Required, owner | Only valid while job is `QUEUED`/`PROCESSING`. |

**Flow:**
```
POST /sync → 202 Accepted, { jobId, status: "QUEUED" }
→ background worker processes
→ frontend polls GET /sync/:jobId (or subscribes via webhook/SSE if implemented later)
```

- Duplicate concurrent syncs for the same user+provider are prevented at the job-creation layer with a database-level uniqueness/lock check, not just an application-level pre-check, to close the race condition.
- `Idempotency-Key` is honored on `POST /sync` so a client retry after a network timeout does not spawn a second job.

---

## 17. Professional Profile Endpoints

Base path: `/api/v1/profile`

| Method | Path | Auth | Owner Check | Notes |
|---|---|---|---|---|
| GET | `/profile` | Required | Yes | Normalized, unified professional profile. |
| PATCH | `/profile` | Required | Yes | User-authored overrides to specific fields. |
| GET | `/profile/conflicts` | Required | Yes | Fields with conflicting values across sources. |
| POST | `/profile/conflicts/:fieldId/resolve` | Required | Yes | Body: `{ resolution: "useSource" \| "useOverride", value? }`. |
| POST | `/profile/:fieldId/restore-source` | Required | Yes | Reverts a user override back to the source-derived value. |
| GET | `/profile/missing` | Required | Yes | Fields flagged as missing/incomplete, for review prompts. |

- Every field in the returned profile carries its provenance (`source: "github" | "linkedin" | "user"`), preserving source attribution end-to-end as required by Step 9.
- Overrides are stored separately from source-derived values so `restore-source` is always possible without data loss.

---

## 18. AI Endpoints

Base path: `/api/v1/ai`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/ai/generate` | Required, owner | Full portfolio generation from the professional profile. Returns `202` + job. |
| POST | `/ai/generate/section` | Required, owner | Body: `{ portfolioId, section }`. Generates one section. |
| POST | `/ai/regenerate/section` | Required, owner | Body: `{ portfolioId, section, instructions? }`. Regenerates with optional user guidance. |
| GET | `/ai/jobs/:jobId` | Required, owner | Job status/result (see Section 19). |
| GET | `/ai/jobs` | Required, owner | Cursor-paginated generation history. |
| POST | `/ai/jobs/:jobId/cancel` | Required, owner | Only while `QUEUED`/`PROCESSING`. |

- All AI generation is asynchronous and job-based given cost/latency; no endpoint blocks on a synchronous AI provider call.
- `Idempotency-Key` is honored on all three `POST` generation endpoints.
- Rate limiting on `/ai/generate*` is stricter and user-aware (not just IP-aware) given per-call cost.

---

## 19. AI Job Endpoints

Base path: `/api/v1/ai/jobs` (see also Section 18)

**Lifecycle:** `QUEUED → PROCESSING → COMPLETED | FAILED | CANCELLED`

**Safe job representation:**
```json
{
  "jobId": "string",
  "type": "FULL_GENERATION" | "SECTION_GENERATION" | "SECTION_REGENERATION",
  "status": "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED",
  "portfolioId": "string",
  "section": "string | null",
  "createdAt": "ISO8601",
  "completedAt": "ISO8601 | null",
  "result": { "...generated content, only when COMPLETED..." },
  "errorCode": "AI_GENERATION_FAILED | null"
}
```

- Never exposed: internal AI provider credentials, provider request/response payloads, full prompts (unless a prompt is itself user-authored content the user is entitled to see, e.g., their own regeneration instructions).
- `FAILED` jobs expose a stable `errorCode` and safe message only, never the raw provider exception.

---

## 20. Portfolio Endpoints

Base path: `/api/v1/portfolio`

| Method | Path | Auth | Owner Check | Notes |
|---|---|---|---|---|
| POST | `/portfolios` | Required | N/A (creates) | Creates a new portfolio (typically post AI-generation). |
| GET | `/portfolios` | Required | Yes | List user's portfolios. |
| GET | `/portfolios/:portfolioId` | Required | Yes | Full portfolio (content + configuration). |
| PATCH | `/portfolios/:portfolioId` | Required | Yes | Partial update; optimistic concurrency via version field (Section 36). |
| DELETE | `/portfolios/:portfolioId` | Required | Yes | Soft delete/archive rather than hard delete where published history matters. |
| PATCH | `/portfolios/:portfolioId/data` | Required | Yes | Updates `PortfolioData` (content) specifically. |
| PATCH | `/portfolios/:portfolioId/configuration` | Required | Yes | Updates `PortfolioConfiguration` specifically. |
| POST | `/portfolios/:portfolioId/duplicate` | Required | Yes | Creates a copy as a new draft portfolio. |

- Content (`PortfolioData`) and configuration (`PortfolioConfiguration`) are updatable independently, consistent with Step 8's rendering architecture, so a theme change doesn't require re-sending all content and vice versa.
- All mutating endpoints require the resource's current `version` (or `updatedAt`) to be supplied for optimistic concurrency; mismatch returns `409 CONCURRENT_MODIFICATION`.

---

## 21. Portfolio Editing Endpoints

Base path: `/api/v1/portfolio/:portfolioId`

**Content sections** — each independently addressable for targeted updates:

| Method | Path | Notes |
|---|---|---|
| PATCH | `/portfolios/:portfolioId/sections/about` | |
| PATCH | `/portfolios/:portfolioId/sections/experience` | Array update; supports item-level add/edit/remove semantics in payload. |
| PATCH | `/portfolios/:portfolioId/sections/projects` | |
| PATCH | `/portfolios/:portfolioId/sections/skills` | |
| PATCH | `/portfolios/:portfolioId/sections/education` | |
| PATCH | `/portfolios/:portfolioId/sections/certifications` | |
| PATCH | `/portfolios/:portfolioId/sections/achievements` | |
| PATCH | `/portfolios/:portfolioId/sections/contact` | |
| PATCH | `/portfolios/:portfolioId/sections/social-links` | |

**Configuration:**

| Method | Path | Notes |
|---|---|---|
| PATCH | `/portfolios/:portfolioId/configuration/template` | Body: `{ templateId }`. Validates template compatibility. |
| PATCH | `/portfolios/:portfolioId/configuration/theme` | Body: `{ themeId, customizations? }`. |
| PATCH | `/portfolios/:portfolioId/configuration/sections` | Visibility + order. |
| PATCH | `/portfolios/:portfolioId/configuration/featured` | Featured items selection. |
| PATCH | `/portfolios/:portfolioId/configuration/seo` | Meta title/description/social preview. |
| PATCH | `/portfolios/:portfolioId/configuration/slug` | Validated against Section 27 rules; `409 SLUG_ALREADY_EXISTS` / `422 SLUG_INVALID` / `403 SLUG_RESERVED`. |

All endpoints in this section: **Auth Required, Owner Check Yes**, optimistic concurrency applies (Section 36).

---

## 22. Draft Endpoints

Base path: `/api/v1/portfolio/:portfolioId/draft`

| Method | Path | Auth | Owner Check | Notes |
|---|---|---|---|---|
| GET | `/draft` | Required | Yes | Current draft state. |
| POST | `/draft` | Required | Yes | Creates a draft from the current published (or blank) state if none exists. |
| PATCH | `/draft` | Required | Yes | Update draft content/configuration. |
| POST | `/draft/autosave` | Required | Yes | High-frequency, lightweight save; distinct rate limit from manual save. |
| POST | `/draft/revisions` | Required | Yes | Explicitly snapshot the current draft as a named revision. |
| GET | `/draft/revisions` | Required | Yes | Cursor-paginated revision history. |
| POST | `/draft/revisions/:revisionId/restore` | Required | Yes | Restores draft to a prior revision. |
| DELETE | `/draft/changes` | Required | Yes | Discards unsaved draft changes, reverting to last saved/published state. |

- **Guarantee:** draft mutations never write to the published portfolio record. Publishing (Section 26) is the only path that promotes draft → published.
- Autosave is idempotent per debounce window and rate-limited separately (higher frequency, lower per-call cost) from manual `PATCH`.

---

## 23. Template Endpoints

Base path: `/api/v1/templates`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/templates` | Public/Optional | List available system templates. |
| GET | `/templates/:templateId` | Public/Optional | Template detail. |
| GET | `/templates/:templateId/versions` | Public/Optional | Version history of the template definition. |
| GET | `/templates/:templateId/capabilities` | Public/Optional | Supported sections, customization points, constraints. |
| GET | `/templates/:templateId/preview-metadata` | Public/Optional | Thumbnail/preview assets and metadata. |

- Templates are system-level, read-only resources from the user's perspective. No `USER`-role endpoint can create/modify/delete a template; that capability exists only under `/admin/templates` (Section 28).

---

## 24. Theme Endpoints

Base path: `/api/v1/themes`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/themes` | Public/Optional | List available themes. |
| GET | `/themes/:themeId` | Public/Optional | Theme detail (tokens, supported customizations). |
| POST | `/portfolios/:portfolioId/theme/apply` | Required, owner | Applies a theme to a portfolio (see also Section 21 configuration/theme). |
| PATCH | `/portfolios/:portfolioId/theme/customization` | Required, owner | Safe, schema-validated customization only (e.g., accent color from an allowed palette) — never arbitrary CSS injection. |

- Theme customization payloads are validated against an explicit schema per theme to prevent injection of arbitrary styles/scripts into rendered public pages.

---

## 25. Preview Endpoints

Base path: `/api/v1/portfolio/:portfolioId/preview`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/preview` | Required, owner | Renders/returns the current **draft** state for in-app preview. |
| POST | `/preview/token` | Required, owner | Issues a short-lived, unguessable preview link/token for sharing an unpublished draft with a third party (e.g., a reviewer) without publishing it. |
| GET | `/preview/shared/:token` | Public (token-gated) | Resolves a valid preview token to draft content; expires and is revocable. |

- Preview never mutates or publishes the portfolio.
- Shared preview tokens are single-purpose, expiring, and revocable independently of the account session, so they can be shared without granting account access.

---

## 26. Publishing Endpoints

Base path: `/api/v1/portfolio/:portfolioId/publish`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/publish/validate` | Required, owner | Dry-run validation without publishing; returns blocking issues. |
| POST | `/publish` | Required, owner | Publishes the current draft. Atomic; `202` if treated as a job, `200`/`201` if synchronous — see below. |
| POST | `/publish/republish` | Required, owner | Re-publishes after edits to an already-published portfolio. |
| POST | `/unpublish` | Required, owner | Takes the portfolio offline; slug becomes unresolvable publicly. |
| GET | `/publish/status` | Required, owner | Current publication status + last publish result. |
| GET | `/publish/version` | Required, owner | Metadata of the currently published version. |
| POST | `/publish/rollback` | Required, owner | Reverts to the previous published version. |

**Atomicity guarantee:** publishing is atomic — either the new version fully replaces the public version, or the operation fails and the previously published version remains served unchanged. There is no intermediate state visible to public visitors.

- `Idempotency-Key` honored on `/publish` and `/publish/republish`.
- `409 PUBLISH_ALREADY_IN_PROGRESS` if a publish for this portfolio is already underway (concurrency guard, Section 36).
- Failed publish → `PUBLISH_FAILED`, previous version untouched, safe to retry.

---

## 27. Public Portfolio Endpoints

Base path: `/api/v1/public`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/public/portfolio/:slug` | Public | Returns only public data (below). |
| GET | `/public/portfolio/:slug/seo` | Public | SEO/meta payload, separable for SSR/meta-tag generation. |

**Response includes only:**
- Public portfolio content (about, experience, projects, skills, education, certifications, achievements, contact, social links — as marked visible)
- Public configuration (visible sections, order, featured items, applied theme)
- Template information (which template, resolved rendering data)
- Theme information
- SEO information (title, description, social preview image)

**Never included, under any circumstance:**
- User authentication data (email, password hash, session info)
- OAuth connection details
- Raw source snapshots
- Private draft content
- AI job history
- Admin-only data
- Internal IDs beyond what's needed for rendering (public-safe slugs/handles only)

**Response semantics for slug states:**

| Condition | Response |
|---|---|
| Slug published and active | `200` with public data |
| Slug exists but portfolio unpublished | `404 PORTFOLIO_NOT_PUBLISHED` (never reveal draft existence) |
| Slug does not exist | `404 RESOURCE_NOT_FOUND` |
| Slug malformed | `400 SLUG_INVALID` |
| Slug reserved (e.g., matches a system route) | `403 SLUG_RESERVED` (only reachable during slug *assignment*, not lookup) |

This endpoint is public, high-traffic, and unauthenticated — it receives the strictest caching and rate-limiting treatment among non-auth routes (Section 34).

---

## 28. Public Routing

- Canonical public portfolio URL pattern: `/p/:slug`.
- The frontend route `/p/:slug` is backed by `GET /api/v1/public/portfolio/:slug` for data, typically via SSR for SEO.
- Slug rules: lowercase, alphanumeric + hyphen, length-bounded, validated against a reserved-word list (e.g., `admin`, `api`, `login`, `p`, `public`) to prevent collision with system routes.
- Slug assignment happens via `PATCH /portfolios/:portfolioId/configuration/slug` (Section 21) and is checked for uniqueness at write time with a database-level unique index as the final guarantee (not just an application-level pre-check), to close the race condition on simultaneous slug claims.

---

## 29. Admin Endpoints

Base path: `/api/v1/admin` — **Auth Required, Role: ADMIN on every route in this section, enforced server-side via role middleware, never inferred from any client-supplied field.**

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/dashboard` | Aggregate overview metrics. |
| GET | `/admin/users` | Paginated/filterable user list. |
| GET | `/admin/users/:userId` | Single user detail. |
| PATCH | `/admin/users/:userId/role` | Change a user's role. Audit-logged. |
| PATCH | `/admin/users/:userId/status` | Suspend/reinstate account. Audit-logged. |
| GET | `/admin/portfolios` | Cross-user portfolio list, filterable. |
| GET | `/admin/portfolios/:portfolioId` | Full portfolio detail (moderation context). |
| PATCH | `/admin/portfolios/:portfolioId/moderation` | e.g., force-unpublish for policy violation. Audit-logged. |
| GET | `/admin/ai-jobs` | Cross-user AI job list/monitoring. |
| GET | `/admin/sync-jobs` | Cross-user sync job list/monitoring. |
| GET | `/admin/audit-logs` | Cursor-paginated audit trail (Section 30). |
| GET | `/admin/errors` | Aggregated error/incident feed (codes + counts, not raw stack traces). |
| GET | `/admin/usage` | Usage metrics (AI cost, sync volume, storage). |
| GET | `/admin/system-health` | Aggregated health/dependency status (richer than public `/health`). |
| GET | `/admin/templates` | Template management list. |
| POST | `/admin/templates` | Create a new system template. |
| PATCH | `/admin/templates/:templateId` | Update a system template. |
| DELETE | `/admin/templates/:templateId` | Deprecate/remove a system template (only if unused or with migration plan). |

- Every admin filter parameter is validated so it cannot be used to bypass the isolation guarantees elsewhere in this contract (e.g., an admin "user" filter is explicit and logged, not a generic passthrough).
- Every mutating admin action is written to the audit log (Section 30) with actor, action, target, before/after where relevant, and timestamp.

---

## 30. Admin Logging

Admin-inspectable event categories (via `/admin/audit-logs`, filterable by category):

- Authentication events (login success/failure, password reset, session revocation)
- Integration events (connect/disconnect, OAuth failures)
- Sync events (start, complete, fail, cancel)
- AI events (generation start/complete/fail, cost where tracked)
- Portfolio events (create, update, delete, duplicate)
- Publishing events (publish, republish, unpublish, rollback)
- Errors (aggregated by code, not raw traces)
- Security events (role changes, account suspension, repeated auth failures, rate-limit trips)

**Guarantee:** secrets (tokens, password hashes, session identifiers, raw API keys) never appear in any log entry surfaced through this endpoint, even to `ADMIN` role. Logs reference resources by ID, not by dumping sensitive payloads.

---

## 31. Analytics Endpoints

Base path: `/api/v1/analytics`

| Method | Path | Auth | Owner Check | Notes |
|---|---|---|---|---|
| GET | `/analytics/portfolio/:portfolioId` | Required | Yes | Views, referrers, engagement for the user's own portfolio. |
| GET | `/analytics/activity` | Required | Self only | User's own activity summary. |
| GET | `/admin/analytics/ai-usage` | Required, ADMIN | N/A | Platform-wide AI usage/cost. |
| GET | `/admin/analytics/integration-usage` | Required, ADMIN | N/A | Platform-wide integration adoption/health. |
| GET | `/admin/analytics/system-metrics` | Required, ADMIN | N/A | Platform-wide operational metrics. |

- User-facing analytics (`/analytics/*`) and admin analytics (`/admin/analytics/*`) are strictly separate route trees with separate authorization, so a user-scoped analytics endpoint can never accidentally aggregate cross-user data.

---

## 32. Health Endpoints

Base path: `/api/v1/health`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health/live` | Public | Liveness — process is up. Minimal payload, no dependency checks. |
| GET | `/health/ready` | Public | Readiness — process can serve traffic (DB reachable, critical config loaded). |
| GET | `/health/dependencies` | Required, ADMIN | Detailed per-dependency status (DB, AI provider, GitHub/LinkedIn API reachability, job queue). Not exposed publicly to avoid leaking infrastructure topology. |

- `/health/live` and `/health/ready` return minimal boolean-style payloads only; no version strings, no internal hostnames, no dependency detail — that detail is reserved for the admin-only dependency endpoint.

---

## 33. Pagination

Two supported strategies, chosen per endpoint based on data characteristics:

**Page/limit** — used for user-facing, low-volume, randomly-accessed lists (e.g., `GET /portfolios`, `GET /templates`).
```
?page=1&limit=20
```
Response `metadata.pagination`: `{ page, limit, total, totalPages }`

**Cursor-based** — used for high-volume, append-heavy, or real-time-changing lists where offset pagination would skip/duplicate items: audit logs, AI/sync job history, analytics events.
```
?cursor=<opaque>&limit=20
```
Response `metadata.pagination`: `{ nextCursor: "opaque|null", limit }`

- `limit` is always capped server-side (e.g., max 100) regardless of client request, to prevent resource-exhaustion via a single oversized query.
- Endpoint documentation (Section "Complete Endpoint Matrix") specifies which strategy applies per list endpoint.

---

## 34. Filtering

- Standardized query parameters per domain: `status`, `provider`, `dateFrom`/`dateTo`, `jobType`, `templateId`, and — admin-only — `userId`, `portfolioId`.
- Every filterable field is validated for type/enum membership; invalid values return `400 VALIDATION_FAILED` rather than being silently ignored or passed through.
- **Admin filtering guarantee:** a `userId` filter is available only on `/admin/*` routes. It is never accepted as a filter parameter on any user-scoped route (where the owner is always implicitly `session.userId`), preventing any possibility of cross-user data access via a filter parameter.

---

## 35. Sorting

- Sorting is exposed via `?sortBy=<field>&sortOrder=asc|desc`.
- `sortBy` is validated against an explicit **allowlist defined per endpoint** (e.g., portfolios: `createdAt`, `updatedAt`, `name`). Arbitrary field names are rejected with `400 VALIDATION_FAILED` — never passed through to the database driver, which prevents field-injection and avoids exposing unindexed/internal fields as a sort vector.
- Default sort is always specified per endpoint (typically `updatedAt desc` or `createdAt desc`) so behavior is deterministic when no sort is supplied.

---

## 36. Rate Limiting

Rate limits are defined per endpoint group, applied per-user where authenticated and per-IP where not (both simultaneously where relevant, e.g., login).

| Group | Limit posture |
|---|---|
| Login / Register | Strict; per-IP and per-account; progressive backoff on repeated failures |
| Password reset / email verification | Strict; per-IP and per-email |
| OAuth connect/callback | Moderate; per-user |
| AI generation | Strict; per-user, cost-aware (may factor into a usage quota, not just request count) |
| Sync | Moderate; per-user; also gated by the single-in-flight-job rule (Section 16) |
| Draft autosave | Lenient but bounded (e.g., debounced client-side + server-side ceiling) |
| Public portfolio reads | Lenient per-IP with anti-abuse ceiling; cache-first to absorb legitimate traffic spikes |
| Admin routes | Moderate; per-admin-user; primarily an abuse/mistake safeguard, not a scale constraint |

- Exceeding a limit returns `429 RATE_LIMIT_EXCEEDED` with a `Retry-After` header and, where useful, remaining-quota info in `metadata`.
- Rate-limit trips on sensitive endpoints (login, password reset) are logged as security events (Section 30).

---

## 37. Idempotency

**`Idempotency-Key` header is honored on:**

- `POST /auth/register`
- `POST /integrations/:provider/callback` (natively idempotent via `state`, additionally protected)
- `POST /sync`
- `POST /ai/generate`, `POST /ai/generate/section`, `POST /ai/regenerate/section`
- `POST /portfolios/:portfolioId/publish`, `POST /portfolios/:portfolioId/publish/republish`
- (Reserved) future payment-related operations

**Behavior:** the backend stores the result of the first request for a given key (scoped per-user, per-endpoint) for a bounded retention window. A retried request with the same key and an equivalent payload returns the original result without re-executing side effects. A reused key with a *different* payload returns `409 IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD` rather than silently executing either version.

- This prevents duplicate accounts, duplicate sync/generation jobs, and duplicate publishes caused by client retries, double-clicks, or network timeouts.

---

## 38. Concurrency

- **Multiple tabs / duplicate requests:** idempotency (Section 37) plus optimistic concurrency (below) together ensure duplicate submissions are either no-ops or explicit conflicts, never silent double-application.
- **Simultaneous edits:** every mutable resource (portfolio, draft, profile) carries a `version` (or `updatedAt`) that the client must echo back on write; a stale version returns `409 CONCURRENT_MODIFICATION` with the current server state included so the client can re-merge.
- **Sync while editing:** editing the professional profile is permitted while a sync is in progress; sync writes are merged field-by-field with source attribution rather than wholesale-overwriting user overrides.
- **AI generation while editing:** generation targets a specific section/snapshot; if the user has since edited that section, the generation result is returned as a proposed change for review rather than silently overwriting live edits.
- **Publish while another publish is running:** guarded explicitly — `409 PUBLISH_ALREADY_IN_PROGRESS` (Section 26) — publishing is effectively serialized per portfolio.

---

## 39. File Upload Contract

Applies to: profile image, project images, resume, other explicitly allowed assets.

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/uploads/profile-image` | Required, owner | |
| POST | `/uploads/project-image` | Required, owner | Body includes target `portfolioId`/project reference. |
| POST | `/uploads/resume` | Required, owner | |
| DELETE | `/uploads/:assetId` | Required, owner | |

**Validation, in order, before persistence:**
1. Size limit (per asset type).
2. Extension allowlist.
3. **Content-sniffed** MIME type — the client-declared `Content-Type` header is never trusted alone.
4. Content sanity (e.g., image can actually be decoded and has reasonable dimensions; PDF structure is well-formed for resumes).
5. Ownership — the asset is always associated with `session.userId` server-side, regardless of any client-supplied owner field.

- Storage uses the cloud image/storage system defined in the architecture (Step 4); the API returns only a stable asset reference/URL, never a raw storage credential.

---

## 40. External Provider Error Mapping

GitHub, LinkedIn, and the AI provider all fail in provider-specific ways (rate limits, auth expiry, outages, malformed responses). None of this is exposed raw.

| Provider condition | Mapped application error |
|---|---|
| GitHub API error/outage | `502/503` + `GITHUB_CONNECTION_FAILED` or `SYNC_SOURCE_UNAVAILABLE` |
| GitHub token expired | `401`-equivalent domain error + `GITHUB_TOKEN_EXPIRED`, prompts reconnect |
| LinkedIn API error/outage | `502/503` + `LINKEDIN_CONNECTION_FAILED` or `SYNC_SOURCE_UNAVAILABLE` |
| LinkedIn token expired | `LINKEDIN_TOKEN_EXPIRED`, prompts reconnect |
| AI provider error/outage | `502/503` + `AI_PROVIDER_UNAVAILABLE` |
| AI provider rate limit | `429` + `AI_RATE_LIMITED` |
| AI content policy rejection | `422` + `AI_CONTENT_POLICY_REJECTED` |

- Raw provider error bodies, status codes, and headers are logged server-side (with secrets redacted) for debugging, correlated via `requestId`, but never forwarded to the client.

---

## 41. Security Requirements

Explicit mitigations required across the API surface:

- **IDOR** — closed by mandatory ownership-scoped queries (Section 6) and `404`-not-`403` on cross-user resource access.
- **Injection** — parameterized queries only; no dynamic query construction from unsanitized input; sort/filter allowlists (Sections 33–34).
- **XSS** — all user-authored content (portfolio text, theme customizations) is treated as untrusted on render; output-encoded or sanitized at render time; theme customization is schema-constrained, not free-form CSS/JS (Section 24).
- **CSRF** — CSRF token required on all cookie-authenticated state-changing requests (Section 4).
- **SSRF** — any server-side fetch triggered by user input (e.g., avatar-from-URL, if ever supported) is restricted to an allowlist and never fetches internal/private network ranges.
- **Broken authentication** — session-based auth with secure cookie flags, progressive lockout, and no credential leakage in errors (Section 12).
- **Broken authorization** — role and ownership checks are middleware-enforced on every route, not left to per-handler discipline.
- **Excessive data exposure** — explicit response schemas everywhere (Section 44); no `SELECT *`-equivalent serialization.
- **Rate-limit abuse** — Section 36.
- **Mass assignment** — Section 42.
- **Parameter pollution** — duplicate query parameters are explicitly rejected or deterministically resolved (first/last-wins documented per framework behavior), never silently concatenated into an unexpected type.

---

## 42. Mass Assignment Protection

- Every write endpoint uses an explicit request DTO/schema listing exactly the fields it accepts; any other field in the payload is either stripped or rejected (reject for security-sensitive resources: user role, ownership fields, verification/status flags).
- Concretely, `PATCH /users/me/profile` cannot set `role`; `PATCH /portfolios/:id` cannot set `ownerId`; no user-facing endpoint can set `emailVerified` or account status directly.
- Role and account-status changes exist only via `/admin/users/:userId/role` and `/admin/users/:userId/status`, both `ADMIN`-only and audit-logged.

---

## 43. Response Data Control

- No endpoint ever serializes a raw database document. Every response passes through an explicit output schema/serializer per resource.
- Fields excluded from all API responses regardless of role, unless explicitly and narrowly required (e.g., password hash is *never* included, full stop): password hashes, OAuth access/refresh tokens, raw provider payloads, internal stack traces, admin-only metadata on non-admin routes, internal-only IDs not needed for client operation.
- Admin responses may include additional fields (e.g., account status, role, moderation flags) but still exclude secrets — admin visibility is broader operationally, not a bypass of the secrets rule.

---

## 44. Correlation IDs

- Every request is assigned a `requestId` (client-supplied via `X-Request-ID` if present and well-formed, otherwise backend-generated).
- The `requestId` threads through: incoming request → business logic → any database operation logs → any background job spawned as a result → any external API call made → any error/log entry.
- The `requestId` is always returned in both success (`metadata.requestId`) and error (`error.requestId`) responses, so a user-reported issue can be traced precisely without exposing any internal detail beyond the identifier itself.

---

## 45. Background Job Contract

Applies uniformly to sync jobs and AI jobs (and any future async operation, e.g., bulk export).

```
POST /sync            → { jobId, status: "QUEUED" }
POST /ai/generate      → { jobId, status: "QUEUED" }
GET  /sync/:jobId      → { jobId, status, result?, errorCode? }
GET  /ai/jobs/:jobId   → { jobId, status, result?, errorCode? }
```

- The client never controls job internals directly (no client-supplied job ID at creation, no client-set status transitions). The client only creates (implicitly gets a server-generated ID back), reads, and — where explicitly supported — cancels.
- Job records are owner-scoped identically to any other resource (Section 6).
- Terminal states (`COMPLETED`, `FAILED`, `CANCELLED`) are immutable; a cancel request against an already-terminal job returns `409 AI_JOB_ALREADY_TERMINAL` / equivalent `SYNC_*` code rather than silently succeeding.

---

## 46. API Observability

Tracked for every request, feeding the admin system-health/usage surfaces (Sections 29, 31):

- Request count (by endpoint, method, status code)
- Response time (p50/p95/p99 by endpoint)
- Error rate (by endpoint and by error code)
- Status code distribution
- Per-endpoint, per-user (aggregated, not per-request-body) usage
- `requestId` on every logged event for correlation
- External provider call latency and error rate (GitHub, LinkedIn, AI provider), separated from internal processing time
- Rate-limit trip events

**Guarantee:** no secret (token, password, session identifier, raw provider credential) is ever written to logs or metrics, structured or otherwise. Logging redaction is applied at the logging-utility layer, not left to call-site discipline, to make this systematic rather than best-effort.

---

## 47. Complete Endpoint Matrix

Legend: **Auth** = P(ublic)/O(ptional)/R(equired) · **Role** = U(SER)/A(DMIN)/– · **Owner** = Y/N · **RL** = Rate Limit tier (S=Strict, M=Moderate, L=Lenient) · **Idem** = Idempotency supported

| Method | Path | Auth | Role | Owner | Status(es) | RL | Idem |
|---|---|---|---|---|---|---|---|
| POST | /auth/register | P | – | N | 201,400,409,422,429 | S | Y |
| POST | /auth/login | P | – | N | 200,401,403,429 | S | N |
| POST | /auth/logout | R | U | N | 204,401 | L | N |
| GET | /auth/me | R | U | N | 200,401 | L | N |
| POST | /auth/verify-email | P | – | N | 200,400 | M | N |
| POST | /auth/resend-verification | O | – | N | 200,429 | S | N |
| POST | /auth/forgot-password | P | – | N | 200,429 | S | N |
| POST | /auth/reset-password | P | – | N | 200,400,422 | S | N |
| GET | /auth/sessions | R | U | Y(self) | 200,401 | M | N |
| DELETE | /auth/sessions/:sessionId | R | U | Y | 204,401,404 | M | N |
| GET | /users/me/profile | R | U | Y(self) | 200,401 | L | N |
| PATCH | /users/me/profile | R | U | Y(self) | 200,401,422 | M | N |
| PATCH | /users/me/preferences | R | U | Y(self) | 200,401,422 | M | N |
| POST | /users/me/change-password | R | U | Y(self) | 200,401,422 | S | N |
| DELETE | /users/me | R | U | Y(self) | 202,401 | S | Y |
| GET | /integrations/github/connect | R | U | N | 302,401 | M | N |
| GET | /integrations/github/callback | R | U | N | 200,400 | M | Y |
| GET | /integrations/github/status | R | U | Y | 200,401 | L | N |
| POST | /integrations/github/sync | R | U | Y | 202,401,409 | M | Y |
| DELETE | /integrations/github/disconnect | R | U | Y | 204,401,404 | M | N |
| GET | /integrations/linkedin/connect | R | U | N | 302,401 | M | N |
| GET | /integrations/linkedin/callback | R | U | N | 200,400 | M | Y |
| GET | /integrations/linkedin/status | R | U | Y | 200,401 | L | N |
| POST | /integrations/linkedin/sync | R | U | Y | 202,401,409 | M | Y |
| DELETE | /integrations/linkedin/disconnect | R | U | Y | 204,401,404 | M | N |
| GET | /sources | R | U | Y | 200,401 | L | N |
| GET | /sources/:sourceId/imported | R | U | Y | 200,401,404 | L | N |
| GET | /sources/:sourceId/history | R | U | Y | 200,401,404 | L | N |
| GET | /sources/:sourceId/records/:recordId | R | U | Y | 200,401,404 | L | N |
| POST | /sync | R | U | Y | 202,401,409 | M | Y |
| GET | /sync/:jobId | R | U | Y | 200,401,404 | L | N |
| GET | /sync/history | R | U | Y | 200,401 | L | N |
| POST | /sync/:jobId/cancel | R | U | Y | 200,401,404,409 | M | N |
| GET | /profile | R | U | Y | 200,401 | L | N |
| PATCH | /profile | R | U | Y | 200,401,422 | M | N |
| GET | /profile/conflicts | R | U | Y | 200,401 | L | N |
| POST | /profile/conflicts/:fieldId/resolve | R | U | Y | 200,401,404,422 | M | N |
| POST | /profile/:fieldId/restore-source | R | U | Y | 200,401,404 | M | N |
| GET | /profile/missing | R | U | Y | 200,401 | L | N |
| POST | /ai/generate | R | U | Y | 202,401,429 | S | Y |
| POST | /ai/generate/section | R | U | Y | 202,401,404,429 | S | Y |
| POST | /ai/regenerate/section | R | U | Y | 202,401,404,429 | S | Y |
| GET | /ai/jobs/:jobId | R | U | Y | 200,401,404 | L | N |
| GET | /ai/jobs | R | U | Y | 200,401 | L | N |
| POST | /ai/jobs/:jobId/cancel | R | U | Y | 200,401,404,409 | M | N |
| POST | /portfolios | R | U | N | 201,401,422 | M | Y |
| GET | /portfolios | R | U | Y | 200,401 | L | N |
| GET | /portfolios/:portfolioId | R | U | Y | 200,401,404 | L | N |
| PATCH | /portfolios/:portfolioId | R | U | Y | 200,401,404,409,422 | M | N |
| DELETE | /portfolios/:portfolioId | R | U | Y | 204,401,404 | M | N |
| PATCH | /portfolios/:portfolioId/data | R | U | Y | 200,401,404,409,422 | M | N |
| PATCH | /portfolios/:portfolioId/configuration | R | U | Y | 200,401,404,409,422 | M | N |
| POST | /portfolios/:portfolioId/duplicate | R | U | Y | 201,401,404 | M | N |
| PATCH | /portfolios/:portfolioId/sections/* | R | U | Y | 200,401,404,409,422 | M | N |
| PATCH | /portfolios/:portfolioId/configuration/template | R | U | Y | 200,401,404,409,422 | M | N |
| PATCH | /portfolios/:portfolioId/configuration/theme | R | U | Y | 200,401,404,409,422 | M | N |
| PATCH | /portfolios/:portfolioId/configuration/sections | R | U | Y | 200,401,404,409,422 | M | N |
| PATCH | /portfolios/:portfolioId/configuration/featured | R | U | Y | 200,401,404,409,422 | M | N |
| PATCH | /portfolios/:portfolioId/configuration/seo | R | U | Y | 200,401,404,409,422 | M | N |
| PATCH | /portfolios/:portfolioId/configuration/slug | R | U | Y | 200,401,404,409,422 | M | N |
| GET | /portfolios/:portfolioId/draft | R | U | Y | 200,401,404 | L | N |
| POST | /portfolios/:portfolioId/draft | R | U | Y | 201,401,404 | M | N |
| PATCH | /portfolios/:portfolioId/draft | R | U | Y | 200,401,404,409,422 | M | N |
| POST | /portfolios/:portfolioId/draft/autosave | R | U | Y | 200,401,404 | L | Y |
| POST | /portfolios/:portfolioId/draft/revisions | R | U | Y | 201,401,404 | M | N |
| GET | /portfolios/:portfolioId/draft/revisions | R | U | Y | 200,401,404 | L | N |
| POST | /portfolios/:portfolioId/draft/revisions/:revisionId/restore | R | U | Y | 200,401,404 | M | N |
| DELETE | /portfolios/:portfolioId/draft/changes | R | U | Y | 200,401,404 | M | N |
| GET | /templates | O | – | N | 200 | L | N |
| GET | /templates/:templateId | O | – | N | 200,404 | L | N |
| GET | /templates/:templateId/versions | O | – | N | 200,404 | L | N |
| GET | /templates/:templateId/capabilities | O | – | N | 200,404 | L | N |
| GET | /templates/:templateId/preview-metadata | O | – | N | 200,404 | L | N |
| GET | /themes | O | – | N | 200 | L | N |
| GET | /themes/:themeId | O | – | N | 200,404 | L | N |
| POST | /portfolios/:portfolioId/theme/apply | R | U | Y | 200,401,404,422 | M | N |
| PATCH | /portfolios/:portfolioId/theme/customization | R | U | Y | 200,401,404,422 | M | N |
| GET | /portfolios/:portfolioId/preview | R | U | Y | 200,401,404 | L | N |
| POST | /portfolios/:portfolioId/preview/token | R | U | Y | 201,401,404 | M | N |
| GET | /preview/shared/:token | P | – | N | 200,404,410 | M | N |
| POST | /portfolios/:portfolioId/publish/validate | R | U | Y | 200,401,404,422 | M | N |
| POST | /portfolios/:portfolioId/publish | R | U | Y | 200/202,401,404,409,422 | M | Y |
| POST | /portfolios/:portfolioId/publish/republish | R | U | Y | 200/202,401,404,409,422 | M | Y |
| POST | /portfolios/:portfolioId/unpublish | R | U | Y | 200,401,404 | M | N |
| GET | /portfolios/:portfolioId/publish/status | R | U | Y | 200,401,404 | L | N |
| GET | /portfolios/:portfolioId/publish/version | R | U | Y | 200,401,404 | L | N |
| POST | /portfolios/:portfolioId/publish/rollback | R | U | Y | 200,401,404,422 | M | N |
| GET | /public/portfolio/:slug | P | – | N | 200,400,403,404 | L | N |
| GET | /public/portfolio/:slug/seo | P | – | N | 200,404 | L | N |
| GET | /admin/dashboard | R | A | N | 200,401,403 | M | N |
| GET | /admin/users | R | A | N | 200,401,403 | M | N |
| GET | /admin/users/:userId | R | A | N | 200,401,403,404 | M | N |
| PATCH | /admin/users/:userId/role | R | A | N | 200,401,403,404,422 | M | N |
| PATCH | /admin/users/:userId/status | R | A | N | 200,401,403,404,422 | M | N |
| GET | /admin/portfolios | R | A | N | 200,401,403 | M | N |
| GET | /admin/portfolios/:portfolioId | R | A | N | 200,401,403,404 | M | N |
| PATCH | /admin/portfolios/:portfolioId/moderation | R | A | N | 200,401,403,404 | M | N |
| GET | /admin/ai-jobs | R | A | N | 200,401,403 | M | N |
| GET | /admin/sync-jobs | R | A | N | 200,401,403 | M | N |
| GET | /admin/audit-logs | R | A | N | 200,401,403 | M | N |
| GET | /admin/errors | R | A | N | 200,401,403 | M | N |
| GET | /admin/usage | R | A | N | 200,401,403 | M | N |
| GET | /admin/system-health | R | A | N | 200,401,403 | M | N |
| GET | /admin/templates | R | A | N | 200,401,403 | M | N |
| POST | /admin/templates | R | A | N | 201,401,403,422 | M | N |
| PATCH | /admin/templates/:templateId | R | A | N | 200,401,403,404,422 | M | N |
| DELETE | /admin/templates/:templateId | R | A | N | 204,401,403,404,409 | M | N |
| GET | /analytics/portfolio/:portfolioId | R | U | Y | 200,401,404 | L | N |
| GET | /analytics/activity | R | U | Y(self) | 200,401 | L | N |
| GET | /admin/analytics/ai-usage | R | A | N | 200,401,403 | M | N |
| GET | /admin/analytics/integration-usage | R | A | N | 200,401,403 | M | N |
| GET | /admin/analytics/system-metrics | R | A | N | 200,401,403 | M | N |
| POST | /uploads/profile-image | R | U | Y | 201,401,422 | M | N |
| POST | /uploads/project-image | R | U | Y | 201,401,404,422 | M | N |
| POST | /uploads/resume | R | U | Y | 201,401,422 | M | N |
| DELETE | /uploads/:assetId | R | U | Y | 204,401,404 | M | N |
| GET | /health/live | P | – | N | 200 | L | N |
| GET | /health/ready | P | – | N | 200,503 | L | N |
| GET | /health/dependencies | R | A | N | 200,401,403 | M | N |

---

## 48. API Sequence Diagrams

### 48.1 Register
```
Client → POST /auth/register → Backend
Backend → validate → create user (unverified) → send verification email
Backend → 201 { user, requiresVerification: true } → Client
```

### 48.2 Login
```
Client → POST /auth/login → Backend
Backend → validate credentials → create session
Backend → 200 { user } + Set-Cookie(session) + CSRF token → Client
```

### 48.3 GitHub OAuth
```
Client → GET /integrations/github/connect → Backend
Backend → 302 redirect (GitHub authorize URL, signed state) → Client
Client → GitHub authorize → GitHub → 302 redirect(code, state) → Client
Client → GET /integrations/github/callback?code&state → Backend
Backend → verify state → exchange code for token (server-to-server)
Backend → store encrypted token → create/update connection record
Backend → 200 { connected: true } → Client
```

### 48.4 LinkedIn OAuth
```
(identical shape to GitHub OAuth, provider = linkedin)
```

### 48.5 Source Synchronization
```
Client → POST /sync { provider } → Backend
Backend → check no in-flight sync for user+provider → create job (QUEUED) → 202 { jobId }
Backend (worker) → fetch from provider → normalize → resolve/flag conflicts → persist
Backend (worker) → job status → PROCESSING → COMPLETED | FAILED
Client → GET /sync/:jobId (poll) → Backend → 200 { status, result? }
```

### 48.6 AI Generation
```
Client → POST /ai/generate → Backend
Backend → create job (QUEUED) → 202 { jobId }
Backend (worker) → PROCESSING → call AI provider → validate output → COMPLETED | FAILED
Client → GET /ai/jobs/:jobId (poll) → Backend → 200 { status, result? }
```

### 48.7 Portfolio Editing
```
Client → PATCH /portfolios/:id/sections/experience { version, data } → Backend
Backend → verify ownership → verify version matches → apply update → bump version
Backend → 200 { updated section, newVersion } → Client
   (on version mismatch) → 409 CONCURRENT_MODIFICATION { currentState } → Client
```

### 48.8 Draft Autosave
```
Client → POST /portfolios/:id/draft/autosave { changes } → Backend (debounced client-side)
Backend → verify ownership → merge into draft (not published portfolio) → 200 { savedAt }
```

### 48.9 Publishing
```
Client → POST /portfolios/:id/publish/validate → Backend → 200 { valid: bool, issues: [] }
Client → POST /portfolios/:id/publish { Idempotency-Key } → Backend
Backend → check no publish in-flight → atomically promote draft → published
Backend → 200 { publishedVersion } | 409 PUBLISH_ALREADY_IN_PROGRESS | error(previous version retained)
```

### 48.10 Public Portfolio Request
```
Visitor → GET /p/:slug → Frontend/SSR → GET /api/v1/public/portfolio/:slug → Backend
Backend → resolve slug → check published → return public data only
Backend → 200 { public data } | 404 (not found / not published) → Frontend renders → Visitor
```

### 48.11 Admin Request
```
Admin Client → GET /admin/users (session cookie) → Backend
Backend → verify session → verify role == ADMIN → query (no owner scoping; admin scope) → 200 { data }
Backend → audit log entry (read access to sensitive data may also be logged per policy)
```

### 48.12 API Error Flow
```
Client → any request → Backend
Backend → validation/business/provider/system failure
Backend → map to { code, message, fieldErrors?, requestId } + correct HTTP status
Backend → log full detail (redacted secrets) server-side, keyed by requestId
Backend → safe error envelope → Client
```

---

## 49. Testing Requirements

Test coverage required per module, prior to implementation sign-off:

- **Authentication** — register/login/logout, token/session expiry, lockout behavior, email verification, password reset flows (including enumeration-safety of forgot-password).
- **Authorization** — role gating on every `ADMIN` route; negative tests confirming `USER` role is rejected.
- **User isolation** — for every owned resource type, confirm cross-user access returns `404`, not data leakage.
- **Validation** — boundary and malformed-input tests for every DTO (body, query, params, headers, files).
- **Error handling** — every documented error code is reachable via a test and returns the correct status + envelope shape.
- **Rate limits** — confirm limits trip at the configured threshold and reset correctly; confirm `429` envelope shape.
- **Pagination** — page/limit and cursor strategies both tested for correctness at boundaries (empty set, single page, exact-limit page).
- **Idempotency** — same key + same payload returns identical result without duplicate side effects; same key + different payload returns the conflict error.
- **Concurrency** — simultaneous edits produce a `409` for the loser, not silent overwrite; simultaneous publish attempts serialize correctly.
- **Public endpoints** — unpublished/nonexistent/malformed/reserved slug states all return the correct, non-leaking response.
- **Admin endpoints** — role enforcement, audit logging on every mutating action, filter scoping correctness.
- **OAuth** — state mismatch, callback replay (idempotency), token-expiry-triggers-reconnect, provider-outage mapping.
- **Sync** — duplicate-concurrent-sync prevention under race conditions, cancellation, history correctness.
- **AI** — job lifecycle transitions, cancellation, failure mapping, cost/rate-limit enforcement.
- **Portfolio** — content/configuration independence, ownership enforcement, duplicate operation correctness.
- **Publishing** — atomicity (forced-failure test confirms previous version remains live), rollback correctness.

---

## 50. Open Questions

The following require a decision before or during implementation; they do not block this contract but should be resolved early in build-out:

1. Should `publish` be synchronous (`200/201`) or job-based (`202`) for large portfolios? This document supports either; the endpoint matrix marks it `200/202` pending that decision.
2. Session store technology (e.g., in-memory/Redis-backed) — affects horizontal scaling of session validation but not the contract itself.
3. Exact password policy thresholds (length/complexity) and account lockout thresholds.
4. Whether email verification is a hard gate on login or a soft gate (restricted functionality until verified).
5. Data retention window for soft-deleted accounts/portfolios before hard deletion.
6. Whether real-time job status (SSE/WebSocket) supplements polling for sync/AI jobs, or polling remains the sole mechanism for v1.
7. Exact reserved-slug list and slug length/character bounds.
8. AI usage quota model (hard cap vs. soft warning vs. billing-linked) — affects `AI_RATE_LIMITED` triggering logic.
9. Whether preview-sharing tokens (Section 25) require an expiry configurable by the user or a fixed system default.
10. Scope of `/admin/portfolios/:id/moderation` actions beyond force-unpublish (e.g., content flags, user notification).

---

## 51. Implementation Readiness Checklist

- [ ] Every protected endpoint has explicit authentication rules (Public/Optional/Required) documented and implementable as middleware.
- [ ] Every user-owned endpoint has ownership validation enforced at the data-access layer, not just the route layer.
- [ ] Admin endpoints have server-side role checks with no client-influenceable bypass.
- [ ] No endpoint trusts a client-supplied `userId`/`ownerId` for identity or authorization.
- [ ] API responses never expose secrets (passwords, tokens, stack traces, raw provider payloads) — verified via explicit response schemas.
- [ ] OAuth tokens are stored encrypted and never returned in any response.
- [ ] Raw source/provider data is never returned directly; only normalized, attributed data.
- [ ] AI jobs are user-isolated and job internals are server-controlled only.
- [ ] Sync jobs are user-isolated, single-in-flight per user+provider, and race-condition-safe at the database layer.
- [ ] Public endpoints expose only explicitly published, public-safe data; unpublished existence is never confirmed.
- [ ] Drafts cannot become public except through the explicit, atomic publish operation.
- [ ] Publishing preserves the previous version on any failure (verified via forced-failure test).
- [ ] Rate limits are defined and enforced for every endpoint group, especially auth, AI, and public reads.
- [ ] Idempotency is implemented for every endpoint marked `Idem: Y` in the endpoint matrix.
- [ ] Concurrency is addressed via optimistic versioning on every mutable resource, and serialized where required (publish).
- [ ] Every error uses a stable, catalog-defined machine-readable code paired with the correct HTTP status.
- [ ] The API is versioned under `/api/v1` with a documented policy for introducing `/api/v2`.
- [ ] Validation occurs server-side for every input surface, independent of any frontend validation.
- [ ] Mass assignment is prevented via explicit DTOs on every write endpoint; sensitive fields (role, ownerId, verification/status flags) are never client-settable outside admin routes.
- [ ] IDOR is explicitly prevented and verified via cross-user access tests returning `404`.
- [ ] This document is complete enough to directly generate an OpenAPI/Swagger definition, a typed frontend client, and backend controller stubs without further architectural decisions.

---

*End of STEP-10-API-CONTRACT-SPECIFICATION.md*
