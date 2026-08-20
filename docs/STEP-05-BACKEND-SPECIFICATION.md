# STEP-05-BACKEND-SPECIFICATION.md

**Product:** AI Portfolio Generator
**Step:** 5 — Backend / Database / API Specification
**Source of truth:** PROJECT-CONTEXT-STEP-05.md
**Stack:** Node.js, Express, TypeScript, MongoDB

---

## 1. BACKEND OVERVIEW

### 1.1 Purpose

This document defines the complete backend, database, and API specification required to implement the AI Portfolio Generator. It is implementation-ready: every collection, endpoint, validation rule, and cross-cutting concern (auth, security, concurrency, rate limiting, idempotency) is specified so a development team can build without inventing missing decisions.

### 1.2 Architectural Style

- **Modular monolith** at launch. A single Express/TypeScript service, internally divided into isolated modules (`auth`, `users`, `github`, `linkedin`, `profile`, `portfolio`, `templates`, `ai`, `jobs`, `admin`, `public`), each owning its own routes, controllers, services, and data-access layer.
- Modules communicate through explicit service interfaces, not shared mutable state or direct cross-module DB access. This keeps a future extraction into microservices (e.g., splitting the AI service or the job worker) low-cost.
- A single MongoDB replica set is used for both application data and job persistence. Redis is introduced (see 1.4) for queues, caching, and rate limiting. No relational database is introduced; MongoDB's document model fits the nested, evolving `PortfolioData`/`UnifiedProfile` structures well.

### 1.3 High-Level Component Map

```
Client (Next.js)
   │  HTTPS
   ▼
API Gateway Layer (Express)
   ├─ Global middleware: request-id, logging, CORS, helmet, body limits, rate limiter
   ├─ Auth middleware: session/JWT verification, role checks, ownership checks
   ▼
Route Modules (versioned: /api/v1/*)
   ├─ auth        ├─ users        ├─ github        ├─ linkedin
   ├─ profile     ├─ portfolio    ├─ templates      ├─ ai
   ├─ public      ├─ admin        ├─ jobs (internal)
   ▼
Service Layer (business logic, no HTTP concerns)
   ▼
Integration Layer (GitHub client, LinkedIn client, AI provider client)
   ▼
Data Access Layer (Mongoose/MongoDB native driver models + repositories)
   ▼
MongoDB Atlas (replica set)      Redis (queue, cache, rate-limit, locks)      Object Storage (avatars/assets)
```

### 1.4 Supporting Infrastructure (justified additions)

| Technology | Why it's required |
|---|---|
| **Redis** | (a) Backing store for a job queue (BullMQ) used for GitHub sync, LinkedIn sync, and AI generation — these are long-running, retryable, must-not-block-the-request operations. (b) Distributed rate limiting across multiple API instances. (c) Short-lived caching of public portfolio reads and GitHub/LinkedIn responses to reduce external API pressure. (d) Distributed locks to prevent duplicate concurrent jobs per user/resource (Section 27/31).|
| **Object storage (S3-compatible)** | Avatars, resume uploads, and any exported portfolio assets are binary files that do not belong in MongoDB. Only references (keys/URLs) are stored in Mongo. |
| **BullMQ (on Redis)** | Chosen job-queue library: Mongo alone is a poor fit for polling/leasing job queues at scale; BullMQ provides retries, backoff, concurrency control, and delayed jobs out of the box. |

No relational database, no GraphQL layer, and no separate microservices are introduced at this stage — they are not justified by current scale/requirements.

### 1.5 Environments

`local` → `development` → `staging` → `production`, each with isolated MongoDB databases, isolated Redis instances, isolated OAuth app credentials (GitHub/LinkedIn), and isolated AI provider keys. No environment shares secrets or data with another (Section 36).

---

## 2. DATABASE ARCHITECTURE

### 2.1 Design Principles

1. **Ownership is explicit and indexed.** Every user-owned document carries a `userId` field, indexed, and every query for that document is scoped by `userId` (or an equivalent server-derived ownership chain) — never trusted from client input.
2. **Separation of raw source data, normalized profile, and presentation data.** `SourceData` (raw GitHub/LinkedIn snapshots) → `UnifiedProfile` (normalized, user-editable) → `PortfolioData` (embedded inside `Portfolio`, AI/template-facing). This prevents integrations or AI from silently corrupting each other's layer.
3. **No secrets in documents returned to clients.** Password hashes, OAuth tokens, internal IDs of no external relevance, and session secrets are excluded at the schema-projection level, not just by client-side omission.
4. **Favor embedding for bounded, co-accessed data; favor referencing for independently-growing or independently-queried data.** E.g., `PortfolioData` is embedded inside `Portfolio` (always read/written together); `PortfolioVersion` snapshots are separate documents (grow unbounded, queried independently, need TTL/retention policy).
5. **Schema validation at the database layer** (MongoDB `$jsonSchema` validators) as a second line of defense behind application-level (Zod/Joi) validation — defense in depth, not a substitute.

### 2.2 Collections Summary

| Collection | Purpose |
|---|---|
| `users` | Core identity/auth/profile record |
| `sessions` | Active login sessions per device |
| `password_reset_tokens` | Single-use, short-lived reset tokens |
| `email_verification_tokens` | Single-use, short-lived verification tokens |
| `oauth_connections` | GitHub/LinkedIn external account links |
| `oauth_states` | Short-lived CSRF state for OAuth handshake |
| `source_data` | Raw/normalized snapshots from GitHub/LinkedIn/manual input |
| `unified_profiles` | Normalized, user-editable professional profile |
| `portfolios` | User's portfolio(s), including embedded `PortfolioData` |
| `portfolio_versions` | Immutable snapshots for history/rollback |
| `templates` | Metadata for (future) portfolio templates |
| `generation_jobs` | AI generation job records |
| `sync_jobs` | GitHub/LinkedIn synchronization job records |
| `audit_logs` | Security- and business-relevant event trail |
| `system_logs` | Structured application/error logs (may live in a log platform instead of Mongo — see 2.3) |
| `rate_limit_events` *(Redis, not Mongo)* | Sliding-window counters — noted here for completeness |

### 2.3 Note on Logs

`system_logs` (DEBUG/INFO/WARN/ERROR/CRITICAL application logs) are conceptually part of the data architecture but are **not required to live in MongoDB**. Recommendation: ship structured JSON logs to stdout and aggregate via a log platform (e.g., CloudWatch, Datadog, ELK). `audit_logs`, which are business/security records queried by Admin APIs, **do** live in MongoDB because they need query/filter/pagination as a product feature, not just operational visibility.

---

## 3. COMPLETE COLLECTION SPECIFICATIONS

Notation: **Required** fields are marked `req`; optional fields `opt`. All `_id` fields are MongoDB `ObjectId` unless stated otherwise. Timestamps are UTC `Date`.

### 3.1 `users`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `email` | string | req | lowercase, trimmed, unique |
| `passwordHash` | string | req | bcrypt/argon2id hash; **never returned by API** |
| `passwordAlgo` | string | req | e.g. `argon2id`, enables future migration |
| `role` | enum `USER`, `ADMIN` | req | default `USER`; extensible enum (future: `SUPPORT`, `MODERATOR`) |
| `status` | enum `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `DELETED` | req | default `PENDING_VERIFICATION` |
| `emailVerifiedAt` | Date \| null | opt | null until verified |
| `profile.displayName` | string | req | |
| `profile.avatarUrl` | string | opt | object-storage reference |
| `profile.timezone` | string | opt | IANA tz string |
| `security.failedLoginAttempts` | number | req | default 0; used for lockout |
| `security.lockedUntil` | Date \| null | opt | temporary lockout after repeated failures |
| `security.lastLoginAt` | Date \| null | opt | |
| `security.lastPasswordChangeAt` | Date \| null | opt | |
| `security.mfaEnabled` | boolean | req | default false (reserved for future MFA) |
| `deletion.requestedAt` | Date \| null | opt | soft-delete workflow start |
| `deletion.scheduledPurgeAt` | Date \| null | opt | grace-period purge date |
| `createdAt` / `updatedAt` | Date | req | Mongoose timestamps |

**Sensitive / never publicly exposed:** `passwordHash`, `passwordAlgo`, `security.*`.
**Indexes:** unique index on `email`; index on `status`; TTL is **not** applied directly to `users` (deletion is a two-step soft/hard delete — see Section 15).

### 3.2 `sessions`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | session ID (also used as opaque session token seed — see 6) |
| `userId` | ObjectId (ref `users`) | req | |
| `tokenHash` | string | req | hash of the session token presented by the client; raw token never stored |
| `device.userAgent` | string | opt | |
| `device.name` | string | opt | derived label, e.g. "Chrome on macOS" |
| `ip` | string | opt | stored for anomaly detection, not exposed to other users |
| `createdAt` | Date | req | |
| `lastActiveAt` | Date | req | updated on each authenticated request (throttled, see 6.4) |
| `expiresAt` | Date | req | TTL index target |
| `revoked` | boolean | req | default false |
| `revokedAt` | Date \| null | opt | |
| `revokedReason` | enum `LOGOUT`, `LOGOUT_ALL`, `PASSWORD_CHANGE`, `ADMIN_ACTION`, `EXPIRED` | opt | |

**Sensitive:** `tokenHash`, `ip` — never returned to the client except as a device list without raw token/IP (Section 6).
**Indexes:** `userId` (list sessions); TTL index on `expiresAt` (auto-purge expired sessions); index on `tokenHash` (fast lookup on each request).

### 3.3 `password_reset_tokens`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `userId` | ObjectId | req | |
| `tokenHash` | string | req | raw token emailed to user, only hash stored |
| `expiresAt` | Date | req | e.g. 30 minutes; TTL index |
| `usedAt` | Date \| null | opt | single-use enforcement |
| `createdAt` | Date | req | |
| `requestIp` | string | opt | |

**Indexes:** TTL on `expiresAt`; index on `userId`; unique-ish usage enforced at application level (reject if `usedAt` set).

### 3.4 `email_verification_tokens`

Same shape as `password_reset_tokens` (`userId`, `tokenHash`, `expiresAt` TTL, `usedAt`). Longer TTL (e.g., 24h).

### 3.5 `oauth_connections`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `userId` | ObjectId | req | |
| `provider` | enum `GITHUB`, `LINKEDIN` | req | |
| `providerAccountId` | string | req | external account ID |
| `providerUsername` | string | opt | display only |
| `accessTokenEncrypted` | string | req | encrypted at rest (see 36); **never returned via API** |
| `refreshTokenEncrypted` | string \| null | opt | encrypted at rest; GitHub tokens generally don't expire, LinkedIn refresh tokens may exist depending on product type |
| `scopes` | string[] | req | granted OAuth scopes |
| `tokenExpiresAt` | Date \| null | opt | null if non-expiring |
| `status` | enum `CONNECTED`, `EXPIRED`, `REVOKED`, `ERROR` | req | default `CONNECTED` |
| `lastSyncedAt` | Date \| null | opt | |
| `lastSyncStatus` | enum `SUCCESS`, `PARTIAL`, `FAILED`, `NEVER_RUN` | opt | |
| `lastError` | string \| null | opt | human-readable, no secrets |
| `createdAt` / `updatedAt` | Date | req | |

**Sensitive:** `accessTokenEncrypted`, `refreshTokenEncrypted` — excluded from every API projection without exception.
**Indexes:** compound unique index on `{ userId, provider }` (one connection per provider per user); index on `{ provider, providerAccountId }` (detect re-linking/collisions).

### 3.6 `oauth_states`

Short-lived CSRF-protection records for the OAuth handshake.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `state` | string | random, unique, sent to provider and verified on callback |
| `userId` | ObjectId | initiating user |
| `provider` | enum `GITHUB`, `LINKEDIN` | |
| `redirectAfter` | string | internal path only, validated against an allow-list |
| `createdAt` | Date | |
| `expiresAt` | Date | TTL index, e.g. 10 minutes |

### 3.7 `source_data`

Raw/normalized external snapshots, kept separate from the unified profile so re-sync or re-normalization never requires re-fetching from the provider, and so the AI/normalization pipeline has an audit trail of what was actually returned.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `userId` | ObjectId | req | |
| `source` | enum `GITHUB`, `LINKEDIN`, `MANUAL` | req | |
| `kind` | enum `PROFILE`, `REPOSITORIES`, `LINKEDIN_PROFILE`, `LINKEDIN_EXPERIENCE`, `LINKEDIN_EDUCATION`, `LINKEDIN_SKILLS` | req | |
| `raw` | object | req | provider response, minimally transformed (field renames only) |
| `normalized` | object | req | shape matching the relevant `UnifiedProfile` section |
| `fetchedAt` | Date | req | |
| `syncJobId` | ObjectId (ref `sync_jobs`) | opt | traceability |

**Why store raw snapshots:** enables re-normalization when mapping logic improves without re-hitting rate-limited external APIs, supports debugging sync discrepancies, and provides an audit trail distinguishing "what the provider said" from "what we derived."
**Indexes:** compound `{ userId, source, kind }` (latest-snapshot lookup); consider capping history via a retention job rather than TTL (last N snapshots kept, not time-based) — see 33.

### 3.8 `unified_profiles`

One document per user; the normalized, user-editable professional profile.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `userId` | ObjectId | req, unique | one profile per user |
| `sections.personal` | object | opt | name, headline, location, contact |
| `sections.about` | object | opt | `{ text, source: enum USER/AI/GITHUB/LINKEDIN, userEdited: boolean }` |
| `sections.skills` | array | opt | `{ name, source, verified: boolean }[]` |
| `sections.experience` | array | opt | `{ title, company, startDate, endDate, description, source, userEdited }[]` |
| `sections.education` | array | opt | similar shape |
| `sections.projects` | array | opt | derived from GitHub repos + manual entries |
| `sections.certifications` | array | opt | |
| `sections.achievements` | array | opt | |
| `sections.github` | object | opt | summary stats (public repo count, stars, top languages) |
| `sections.socialLinks` | array | opt | `{ platform, url }[]` |
| `sections.contact` | object | opt | `{ email (optional public), website, phone (private) }` |
| `completeness.score` | number 0–100 | req | computed field, cached |
| `completeness.missingFields` | string[] | opt | |
| `sync.lastGithubSyncAt` | Date \| null | opt | |
| `sync.lastLinkedinSyncAt` | Date \| null | opt | |
| `createdAt` / `updatedAt` | Date | req | |

Each field-level entry that can originate from multiple sources carries `source` and `userEdited`; **`userEdited: true` fields are never overwritten by a subsequent sync or AI pass** without explicit user confirmation (Section 9 data-priority rule).

**Indexes:** unique index on `userId`.

### 3.9 `portfolios`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `userId` | ObjectId | req | owner |
| `title` | string | req | |
| `slug` | string | req, unique (global) | URL-safe, lowercase |
| `status` | enum `DRAFT`, `PUBLISHED`, `UNPUBLISHED` | req | default `DRAFT` |
| `portfolioData` | object | req | embedded; the template-facing content (sections mirrored/curated from `UnifiedProfile` + AI copy) |
| `templateId` | ObjectId (ref `templates`) \| null | opt | null until user selects a template |
| `templateVersion` | string \| null | opt | pinned version for stability |
| `theme` | object | opt | color/font/layout configuration consumed by the template |
| `seo.metaTitle` | string | opt | |
| `seo.metaDescription` | string | opt | |
| `seo.ogImageUrl` | string | opt | |
| `publishedVersionId` | ObjectId (ref `portfolio_versions`) \| null | opt | pointer to the currently-live snapshot |
| `publishedAt` | Date \| null | opt | |
| `unpublishedAt` | Date \| null | opt | |
| `lastAutosaveAt` | Date \| null | opt | |
| `createdAt` / `updatedAt` | Date | req | |

**Indexes:** unique index on `slug`; index on `userId`; index on `{ status, publishedAt }` for admin/listing queries.
**Ownership:** every read/write scoped to `userId === req.user.id` except admin routes (Section 21).

### 3.10 `portfolio_versions`

Immutable snapshots supporting publish history and rollback (design rationale in Section 4 below / Section 11 of context).

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `portfolioId` | ObjectId | req | |
| `userId` | ObjectId | req | denormalized for fast ownership checks |
| `versionType` | enum `AUTOSAVE`, `PUBLISH_SNAPSHOT` | req | |
| `portfolioDataSnapshot` | object | req | full copy of `portfolioData` at save time |
| `templateId` / `templateVersion` | | opt | |
| `createdAt` | Date | req | |
| `createdBy` | ObjectId | req | usually the owning user; could be a system job |

**Retention strategy (recommendation):** keep all `PUBLISH_SNAPSHOT` versions (they are the audit/rollback trail and are relatively low-frequency), but cap `AUTOSAVE` versions to the most recent N (e.g., 20) per portfolio via a periodic pruning job — not TTL, because "most recent N" isn't time-based. This avoids unbounded growth from frequent autosaves while preserving meaningful publish history.
**Indexes:** compound `{ portfolioId, createdAt: -1 }`.

### 3.11 `templates`

Metadata only — no template rendering logic lives in the backend at this stage.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `key` | string | req, unique | stable identifier, e.g. `minimal-v1` |
| `name` | string | req | |
| `version` | string | req | semver |
| `status` | enum `DRAFT`, `ACTIVE`, `DEPRECATED` | req | |
| `supportedSections` | string[] | req | which `PortfolioData` sections it can render |
| `configSchema` | object | req | JSON-schema for the `theme` config it accepts |
| `compatibleWith` | string[] | opt | portfolio-data schema versions it supports |
| `createdAt` / `updatedAt` | Date | req | |

**Indexes:** unique on `key`; index on `status`.
Templates consume `portfolioData` only — never GitHub/LinkedIn/`source_data`/`unified_profiles` directly (enforced by API contract, not just convention: the template-facing API only ever returns `portfolioData` + `theme`).

### 3.12 `generation_jobs`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `userId` | ObjectId | req | |
| `portfolioId` | ObjectId | req | |
| `type` | enum `FULL_GENERATION`, `SECTION_REGENERATION` | req | |
| `targetSection` | string \| null | opt | required if `SECTION_REGENERATION` |
| `inputRef` | object | req | `{ unifiedProfileId, unifiedProfileUpdatedAt }` — pins the input version used |
| `provider` | string | req | e.g. `anthropic` |
| `model` | string | req | e.g. `claude-sonnet-4-6` |
| `status` | enum `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED` | req | |
| `idempotencyKey` | string | req, unique | client-supplied or derived (Section 26) |
| `attempt` | number | req | default 1 |
| `maxAttempts` | number | req | default 3 |
| `startedAt` | Date \| null | opt | |
| `completedAt` | Date \| null | opt | |
| `error` | object \| null | opt | `{ code, message }` — no stack traces |
| `usage.inputTokens` / `usage.outputTokens` | number | opt | cost tracking |
| `outputRef` | object \| null | opt | `{ portfolioVersionId }` once applied |
| `createdAt` / `updatedAt` | Date | req | |

**Indexes:** unique on `idempotencyKey`; compound `{ userId, status }`; compound `{ portfolioId, createdAt: -1 }` (history).

### 3.13 `sync_jobs`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `userId` | ObjectId | req | |
| `provider` | enum `GITHUB`, `LINKEDIN` | req | |
| `status` | enum `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED` | req | |
| `progress` | number 0–100 | opt | |
| `attempt` / `maxAttempts` | number | req | |
| `idempotencyKey` | string | req, unique | |
| `startedAt` / `completedAt` | Date \| null | opt | |
| `error` | object \| null | opt | |
| `resultSummary` | object | opt | `{ reposFound, reposImported }` etc. |
| `createdAt` / `updatedAt` | Date | req | |

**Indexes:** unique on `idempotencyKey`; compound `{ userId, provider, status }`.

### 3.14 `audit_logs`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| `_id` | ObjectId | req | |
| `actorUserId` | ObjectId \| null | req | null for unauthenticated events (e.g., failed login of unknown email) |
| `actorRole` | string \| null | opt | |
| `event` | string | req | e.g. `AUTH.LOGIN_SUCCESS`, `PORTFOLIO.PUBLISHED`, `ADMIN.USER_SUSPENDED` |
| `targetType` | string \| null | opt | e.g. `Portfolio`, `User` |
| `targetId` | ObjectId \| null | opt | |
| `metadata` | object | opt | event-specific, non-sensitive details only |
| `requestId` | string | req | correlation |
| `ip` | string | opt | |
| `createdAt` | Date | req | |

**Indexes:** compound `{ event, createdAt: -1 }`; compound `{ actorUserId, createdAt: -1 }`; compound `{ targetType, targetId }`.
**Retention:** kept indefinitely by default, or per a compliance-driven retention policy (e.g., 2 years) — flagged as an open question (Section 37).

---

## 4. INDEX STRATEGY

Consolidated view (also see Section 35 Database Matrix):

| Collection | Index | Reason |
|---|---|---|
| `users` | `{ email: 1 }` unique | login lookup, prevent duplicate accounts |
| `users` | `{ status: 1 }` | admin filtering |
| `sessions` | `{ tokenHash: 1 }` | per-request auth lookup |
| `sessions` | `{ userId: 1 }` | list/revoke-all |
| `sessions` | `{ expiresAt: 1 }` TTL | auto-expire |
| `password_reset_tokens` | `{ expiresAt: 1 }` TTL | auto-expire |
| `email_verification_tokens` | `{ expiresAt: 1 }` TTL | auto-expire |
| `oauth_connections` | `{ userId: 1, provider: 1 }` unique | one connection per provider |
| `oauth_connections` | `{ provider: 1, providerAccountId: 1 }` | collision detection |
| `oauth_states` | `{ state: 1 }` unique, `{ expiresAt: 1 }` TTL | CSRF handshake |
| `source_data` | `{ userId: 1, source: 1, kind: 1 }` | latest snapshot lookup |
| `unified_profiles` | `{ userId: 1 }` unique | one profile per user |
| `portfolios` | `{ slug: 1 }` unique | public resolution, uniqueness |
| `portfolios` | `{ userId: 1 }` | owner listing |
| `portfolios` | `{ status: 1, publishedAt: -1 }` | admin/public listing |
| `portfolio_versions` | `{ portfolioId: 1, createdAt: -1 }` | history/rollback |
| `templates` | `{ key: 1 }` unique, `{ status: 1 }` | lookup, filtering active templates |
| `generation_jobs` | `{ idempotencyKey: 1 }` unique | dedupe |
| `generation_jobs` | `{ userId: 1, status: 1 }`, `{ portfolioId: 1, createdAt: -1 }` | user job list, history |
| `sync_jobs` | `{ idempotencyKey: 1 }` unique | dedupe |
| `sync_jobs` | `{ userId: 1, provider: 1, status: 1 }` | in-flight check |
| `audit_logs` | `{ event: 1, createdAt: -1 }`, `{ actorUserId: 1, createdAt: -1 }`, `{ targetType: 1, targetId: 1 }` | admin filtering/search |

---

## 5. RELATIONSHIPS

```
User (1) ──< Session (N)
User (1) ──< OAuthConnection (N, max 1 per provider)
User (1) ──< SourceData (N)
User (1) ── UnifiedProfile (1)
User (1) ──< Portfolio (N)
Portfolio (1) ──< PortfolioVersion (N)
Portfolio (N) ──> Template (1)         [optional, nullable]
User (1) ──< GenerationJob (N)  ── Portfolio (1)
User (1) ──< SyncJob (N)
User (1) ──< AuditLog (N)              [as actor]
```

All "belongs to" edges are enforced via a `userId` field on the child, validated against the authenticated session on every write and most reads (public reads are the sole exception — Section 16).

---

## 6. AUTHENTICATION

### 6.1 Mechanism

Session-based authentication using an **opaque, server-issued session token** stored in an `httpOnly`, `Secure`, `SameSite=Lax` cookie (not a client-readable JWT) — appropriate for a first-party web client and avoids the token-revocation problem inherent to stateless JWTs. The cookie value is a high-entropy random string; only its SHA-256 hash is persisted in `sessions.tokenHash`.

### 6.2 Registration

1. Validate `email` (RFC 5322 shape + max length) and `password` (Section 22).
2. Reject if `email` already exists (generic "unable to register" message to avoid account enumeration is a product decision — flagged as open question, Section 37; default here: return a distinct "email already in use" error, since the UX benefit generally outweighs enumeration risk for this product type).
3. Hash password (argon2id).
4. Create `User` with `status = PENDING_VERIFICATION`.
5. Issue an `email_verification_token`, send verification email.
6. Do **not** log the user in with a full session until email is verified (configurable; default: allow login but gate portfolio publishing behind verification — product decision, flagged in Section 37).

### 6.3 Login

1. Rate-limited (Section 25).
2. Look up by `email`; constant-time compare failure vs. wrong-password to reduce enumeration signal.
3. Check `status` — reject `SUSPENDED`/`DELETED` with specific error codes; `PENDING_VERIFICATION` allowed to log in but flagged.
4. On success: reset `security.failedLoginAttempts`, create a `Session`, set cookie, write `AUTH.LOGIN_SUCCESS` audit event.
5. On failure: increment `security.failedLoginAttempts`; after N (e.g., 5) within a window, set `security.lockedUntil` and return a lockout error; write `AUTH.LOGIN_FAILURE` audit event.

### 6.4 Session Verification (every protected request)

1. Read cookie → hash → look up `sessions` by `tokenHash`.
2. Reject if missing, `revoked`, or `expiresAt < now`.
3. Update `lastActiveAt` (throttled — e.g., only if >5 minutes stale, to avoid a write on every request).
4. Attach `req.user = { id, role, status }` from a fresh `users` read (or a short-TTL cache) so role/status changes take effect promptly (not baked into a long-lived token).

### 6.5 Logout / Logout-All

- **Logout current session:** mark that session `revoked = true`, `revokedReason = LOGOUT`, clear cookie.
- **Logout all sessions:** mark all sessions for `userId` revoked (`LOGOUT_ALL`); used after password change or on user request.

### 6.6 Password Reset

1. `POST /forgot-password` — always returns a generic success response regardless of whether the email exists (prevents enumeration here even though registration does not — reset is a higher-risk enumeration surface).
2. Issue `password_reset_tokens` entry, email the raw token as a link.
3. `POST /reset-password` — validate token hash + `expiresAt` + `usedAt IS NULL`, set new password hash, mark token used, **revoke all existing sessions** (`PASSWORD_CHANGE`), write audit event.

### 6.7 Email Verification

`GET/POST /verify-email` with token → validate → set `emailVerifiedAt`, mark token used, `status` transitions from `PENDING_VERIFICATION` to `ACTIVE` if that was the only gate.

### 6.8 Account/Session States Handled Everywhere

| Condition | Behavior |
|---|---|
| Invalid credentials | 401, generic message |
| Expired session | 401, client redirects to login |
| Revoked session | 401, same as expired to the client |
| Suspended account | 403, specific `ACCOUNT_SUSPENDED` code |
| Deleted account | 401 (treated as non-existent) |
| Locked out (too many attempts) | 429 with `retryAfter` |

---

## 7. SESSIONS (Design Detail)

Already schema'd in 3.2. Product-facing session behaviors:

- `GET /api/v1/auth/sessions` — list current user's active sessions (device name, created, last active — **never token or raw IP**).
- `DELETE /api/v1/auth/sessions/:sessionId` — revoke one (must belong to caller).
- `DELETE /api/v1/auth/sessions` — revoke all except current, or all including current (query flag), both audited.

---

## 8. OAUTH CONNECTIONS

### 8.1 Separation of Concerns

Application authentication (Section 6) is entirely independent of external OAuth connections (this section). A user can have zero, one, or two (`GITHUB`, `LINKEDIN`) connections; none of them ever function as an alternative login mechanism in this spec (no "Sign in with GitHub") unless explicitly added later as its own feature.

### 8.2 Connect Flow

1. `POST /api/v1/github/connect` (auth required) → server generates `oauth_states` record with random `state`, builds the provider authorization URL server-side (client secret never touches the browser), returns the URL.
2. Client redirects the browser to the provider.
3. Provider redirects back to `GET /api/v1/github/callback?code&state`.
4. Server validates `state` exists, unexpired, matches `userId` from the current session.
5. Exchanges `code` for tokens **server-to-server**.
6. Encrypts tokens (Section 36), upserts `oauth_connections` for `{ userId, provider }`.
7. Enqueues an initial `sync_jobs` entry.
8. Redirects the browser to an internal success page.

### 8.3 Token Handling

- Tokens are encrypted at rest (AES-256-GCM, key from a secrets manager, not environment-committed).
- Tokens are **never** included in any API response, including to the owning user — the frontend only ever needs "connected: true/false" plus metadata.
- Token refresh (LinkedIn, where applicable): a service-layer function checks `tokenExpiresAt` before each provider call and refreshes proactively; on refresh failure, `status` transitions to `EXPIRED` and the user is prompted to reconnect.

### 8.4 Disconnect

`DELETE /api/v1/github/disconnect` — revokes locally (deletes/invalidates the `oauth_connections` doc), best-effort calls the provider's token-revocation endpoint if supported, does **not** delete previously-synced `source_data` (user can choose to also purge it via account settings), audit-logged.

---

## 9–10. GITHUB API SERVICE / LINKEDIN API SERVICE

These are covered together for structure; each is implemented as an isolated integration module — no GitHub/LinkedIn-specific logic in controllers.

### 9.1 GitHub Service Responsibilities

- OAuth token exchange/refresh.
- Authenticated REST/GraphQL client with:
  - **Pagination** — follow `Link` headers / GraphQL cursors until complete or a safety cap (e.g., 500 repos) is hit.
  - **Rate-limit awareness** — read `X-RateLimit-Remaining`/`Reset` headers; back off and reschedule the job rather than failing hard when near the limit.
  - **Retry** — exponential backoff with jitter on 5xx/network errors; no retry on 4xx (auth/permission) errors.
  - **Timeout** — per-request timeout (e.g., 10s) distinct from job-level timeout.
- **Sync lifecycle:** create `sync_jobs` (`QUEUED`) → worker picks up → `PROCESSING` → fetch profile + repos → normalize → write `source_data` → update `unified_profiles` (respecting `userEdited` locks) → `COMPLETED`/`FAILED` (partial success allowed — see below).
- **Partial failure handling:** if profile fetch succeeds but repository fetch partially fails (e.g., rate-limited mid-pagination), persist what was retrieved, mark `sync_jobs.status = COMPLETED` with `resultSummary` noting partial data, and set `lastSyncStatus = PARTIAL` on the connection — never discard successfully-fetched data because of a later failure.
- **Repository normalization:** map GitHub repo objects to the `sections.projects` shape (`name, description, url, primaryLanguage, stars, topics, updatedAt`), filtering forks/archived repos per user-configurable preference (default: exclude forks).

### 9.2 LinkedIn Service Responsibilities

- Uses **only officially supported LinkedIn OAuth/API products** available to the app's approved product/scopes. **No scraping, no headless browsing, no unofficial endpoints.**
- Because LinkedIn's public API surface for profile/experience/education data is limited and permission-gated, the service must:
  1. Request only the scopes the app is actually approved for.
  2. If a requested data category (e.g., full work history) is not available via the granted API product, **do not fabricate it** — mark that `unified_profiles` section as `source: MANUAL`, `missing: true`, and prompt the user to fill it in manually.
  3. Handle `insufficient_scope`/`403` responses by surfacing a clear "LinkedIn didn't provide this data" state rather than retrying indefinitely.
- Handle expiration/revocation identically to GitHub (`status` transitions, resync prompts).
- Because real-time LinkedIn scope availability changes over time and depends on LinkedIn's partner program status, **the exact set of importable LinkedIn fields is an implementation-time decision constrained by whatever API products the application is approved for** — this is flagged explicitly as an open question (Section 37) rather than guessed at.

---

## 11. UNIFIED PROFILE (API Behavior)

- `GET /api/v1/profile` — returns the full `unified_profiles` document for the caller (creating an empty one lazily if absent).
- `PATCH /api/v1/profile` — partial update; any field touched by the user is marked `userEdited: true` on that field/section and is thereafter immune to being overwritten by sync or AI regeneration unless the user explicitly triggers "resync this section" (a distinct, opt-in action).
- `GET /api/v1/profile/completeness` — returns `{ score, missingFields }`, recomputed on every profile write (not real-time on every read, to avoid recomputation cost — cached and invalidated on write).
- `GET /api/v1/profile/sources` — returns, per section, which `source_data` snapshot it was derived from and `lastSyncedAt`, for UI transparency (no raw provider payload returned here, just attribution metadata).

---

## 12. PORTFOLIO

### 12.1 Lifecycle

`DRAFT` (default on create) → `PUBLISHED` (via explicit publish action, Section 13) → `UNPUBLISHED` (owner takes it offline; slug is released back to availability only after a grace period — see 12.3) → can return to `DRAFT`/`PUBLISHED` again.

### 12.2 CRUD Rules

- **Create:** requires `title`; `slug` auto-generated from title (or user-supplied), uniqueness enforced at the DB level (unique index) with a friendly "slug taken" error surfaced from the duplicate-key exception.
- **Update:** partial updates to `portfolioData`, `theme`, `seo`, `templateId`. Every update triggers an `AUTOSAVE` `portfolio_versions` entry (Section 13) if content materially changed (diff check to avoid a version per keystroke — debounced client-side, additionally throttled server-side, e.g., max one autosave version per 30 seconds).
- **Delete:** soft-delete recommended (`status` stays but a `deletedAt` field is added) so publish history/audit remain intact; hard-delete purges `portfolio_versions` after a retention window. If a user has multiple portfolios (product allows this — "Duplicate" endpoint implies it), delete only cascades to that portfolio's own versions/jobs, never siblings.
- **Duplicate:** copies `portfolioData`/`theme`/`templateId` into a new `DRAFT` portfolio with a new slug; does not copy publish history.

### 12.3 Slug Handling on Unpublish/Delete

Releasing a slug immediately on unpublish risks slug squatting/confusion (another user grabs the old URL). Recommendation: slug remains reserved to the original portfolio for a grace period (e.g., 30 days) after unpublish, then becomes available again; hard-deleted portfolios release the slug immediately since the record is gone.

---

## 13. PORTFOLIO VERSIONING

**Recommended production approach:**

- `AUTOSAVE` versions capture in-progress edits, pruned to the most recent N per portfolio (Section 3.10) — cheap, frequent, disposable.
- `PUBLISH_SNAPSHOT` versions are created **only** on a publish action, are immutable, retained indefinitely (or per compliance policy), and are what `portfolios.publishedVersionId` points to — this is what the public API actually serves (Section 16), decoupled from whatever draft edits are in progress.
- **Rollback** = admin/owner selects a prior `PUBLISH_SNAPSHOT`, backend copies its `portfolioDataSnapshot` into `portfolios.portfolioData` as a new draft state (does not silently republish — publishing remains an explicit action), so the user can review before re-publishing.
- This avoids duplicating the full document on every autosave indefinitely while preserving a complete, auditable publish history.

---

## 14. TEMPLATES

- Read-only metadata API at this stage (`GET /templates`, `GET /templates/:id`) — no rendering logic in the backend.
- `configSchema` lets the frontend render a theme-configuration UI generically without backend changes per template.
- **Enforced boundary:** the template-facing contract is exactly `{ portfolioData, theme, templateVersion }` — templates have no code path to reach `oauth_connections`, `source_data`, or `unified_profiles`. This is enforced by the fact that the public/preview endpoints only ever assemble and return this shape (Section 16), not by template code trust.

---

## 15. AI GENERATION

### 15.1 Pipeline

```
UnifiedProfile (+ user prompt/preferences)
   → Input Builder (selects & redacts fields, applies length limits)
   → AI Provider Client (abstracted interface: generate(input) → structuredOutput)
   → Structured Output (JSON matching a strict schema)
   → Schema Validation (reject/retry on malformed JSON)
   → Factuality Validation (no invented employers/dates/skills — cross-check against UnifiedProfile's factual fields; only "presentation" text — summaries, phrasing — is AI-original)
   → Merge into PortfolioData (never overwrites userEdited PortfolioData fields without a distinct "regenerate section" action)
```

### 15.2 Provider Abstraction

`AiProvider` interface (`generate(prompt, schema): Promise<Result>`) with a concrete Anthropic implementation, so the provider can be swapped/multiplexed without touching the generation service or job logic.

### 15.3 Job-Backed, Not Synchronous

Generation always runs as a `generation_jobs` background job (Section 3.12), even though individual calls may be fast, because: it must be retryable, must be idempotent under client retries (Section 26), must be cancellable, and must not hold an HTTP request open for a variable-latency external call.

### 15.4 Failure Handling

- Malformed/schema-invalid AI output → automatic retry up to `maxAttempts` with a stricter re-prompt; final failure → `status = FAILED`, `error.code = AI_OUTPUT_INVALID`, no partial application to `portfolioData`.
- Provider timeout/5xx → retried with backoff; provider 4xx (bad request) → not retried, surfaced immediately.
- Factuality-check failure (AI introduced an unverifiable claim) → treated as a validation failure, not silently "cleaned and accepted."

### 15.5 Regeneration

`SECTION_REGENERATION` jobs operate on a single `targetSection`, leaving the rest of `portfolioData` untouched, and still require the "apply" step to be explicit (Section 15.6) so users can compare before accepting.

### 15.6 Apply Step

Generation produces a proposed `portfolioDataSnapshot`; a **separate** endpoint (`POST /ai/generations/:id/apply`) commits it into the live `portfolios.portfolioData` and creates an `AUTOSAVE` version. This two-step design (generate → review → apply) prevents AI output from silently overwriting a user's live draft.

---

## 16. BACKGROUND JOBS

### 16.1 Common Job Contract

Both `generation_jobs` and `sync_jobs` share: `status` state machine (`QUEUED → PROCESSING → COMPLETED|FAILED|CANCELLED`), `idempotencyKey`, `attempt`/`maxAttempts`, owner scoping, and are processed by BullMQ workers reading from Redis-backed queues (`ai-generation`, `github-sync`, `linkedin-sync`).

### 16.2 Isolation

Every job payload includes `userId` (and `portfolioId` where relevant); workers re-validate ownership against the current DB state before acting (not just trusting the enqueue-time payload), since a user could be suspended/deleted between enqueue and processing.

### 16.3 Concurrency Control

A Redis lock (`lock:sync:{userId}:{provider}` / `lock:generation:{portfolioId}`) is acquired before processing and held for the job's duration, preventing two concurrent syncs/generations for the same owner/resource (Section 27).

---

## 17. PUBLISHING

### 17.1 Publish

`POST /api/v1/portfolios/:id/publish`:

1. Ownership check.
2. Validate `portfolioData` against minimum-required-sections rules (e.g., must have at least `personal` + one of `experience`/`projects`) and slug validity.
3. Create a `PUBLISH_SNAPSHOT` `portfolio_versions` document from the current `portfolioData`.
4. Set `portfolios.status = PUBLISHED`, `publishedVersionId`, `publishedAt`.
5. Audit-logged (`PORTFOLIO.PUBLISHED`).
6. Idempotent: republishing with no changes since the last snapshot is a no-op that still returns 200 (Section 26).

### 17.2 Unpublish

Sets `status = UNPUBLISHED`, `unpublishedAt`; `publishedVersionId` is retained (not cleared) so history/rollback still works; the public endpoint (Section 18) simply stops serving it (404) while unpublished.

### 17.3 Delete

Soft-delete (Section 12.2) immediately unpublishes (public endpoint 404s) regardless of prior status; hard purge follows the account/resource retention policy.

---

## 18. PUBLIC PORTFOLIO APIs

### 18.1 Contract

`GET /api/v1/public/portfolios/:slug` returns **only**:

```
{
  title, slug, portfolioData, theme, templateId, templateVersion,
  seo: { metaTitle, metaDescription, ogImageUrl },
  publishedAt
}
```

No `userId`, no internal IDs beyond what's needed for template rendering, no `source_data`/`unified_profiles` reference, no draft content (always served from `publishedVersionId`'s snapshot, never live `portfolioData`, so an in-progress edit never leaks publicly).

### 18.2 Rules

- Returns 404 for `DRAFT`, `UNPUBLISHED`, soft-deleted, or nonexistent slugs — never a 403 that would confirm existence to an unauthorized prober beyond what a 404 already implies (acceptable here since slugs are meant to be public/discoverable by design).
- Cached at the edge/Redis with short TTL (e.g., 60s) keyed by slug; cache invalidated on publish/unpublish.
- Rate-limited more leniently than authenticated endpoints (Section 25), but still capped to prevent scraping abuse.

---

## 19. ADMIN APIs

All under `/api/v1/admin/*`, requiring `role = ADMIN` **and** an `ACTIVE` account status, verified server-side on every request (never trust a client-asserted role).

| Endpoint | Purpose |
|---|---|
| `GET /admin/users` | Paginated, filterable (`status`, `role`, `email` search) |
| `GET /admin/users/:id` | Detail, excluding sensitive fields (password hash never returned even to admins) |
| `PATCH /admin/users/:id/status` | Suspend/reactivate; audit-logged |
| `GET /admin/portfolios` | Paginated, filterable by `status`/`userId` |
| `GET /admin/jobs` | Paginated `generation_jobs` + `sync_jobs`, filterable by `status`/`type` |
| `GET /admin/jobs/failed` | Shortcut filter for triage |
| `GET /admin/logs` | Queries `system_logs` (if stored) / log platform proxy |
| `GET /admin/audit-logs` | Paginated, filterable by `event`, `actorUserId`, date range |
| `GET /admin/health` | Aggregate system health (DB connectivity, queue depth, provider status) |
| `GET /admin/integrations/status` | GitHub/LinkedIn/AI provider connectivity + error rates |

Admin actions that mutate state (suspend user, cancel job) are always audit-logged with `actorUserId = admin's id`.

---

## 20. API STANDARDS

### 20.1 Versioning

All routes prefixed `/api/v1/`. Breaking changes ship as `/api/v2/...` running alongside `v1` until deprecation; additive/backward-compatible changes (new optional fields, new endpoints) do not require a version bump. Deprecation is communicated via a `Deprecation`/`Sunset` response header before removal.

### 20.2 Request/Response Conventions

- JSON only (`Content-Type: application/json`), UTF-8.
- Every response includes `requestId` (echoed from an inbound `X-Request-Id` or generated) for correlation.
- Success envelope: `{ success: true, data: ... , meta?: {...} }`.
- Timestamps: ISO-8601 UTC strings.
- IDs: stringified `ObjectId`.

---

## 21. COMPLETE ENDPOINT SPECIFICATIONS

Format per endpoint: Method, Route, Auth, Role, Purpose, Params, Body, Validation, Success, Errors, Authorization, Rate Limit, Idempotency, Side Effects, Audit.

### 21.1 Authentication Module

**POST /api/v1/auth/register**
- Auth: none · Role: — · Purpose: create account
- Body: `{ email, password, displayName }`
- Validation: email format, password policy (22.2), displayName 1–80 chars
- Success: 201 `{ userId, status }`
- Errors: 400 validation, 409 email exists
- Authorization: n/a · Rate limit: 5/hour/IP · Idempotency: not required (natural 409 on retry) · Side effects: creates user + verification token + sends email · Audit: `AUTH.REGISTER`

**POST /api/v1/auth/login**
- Auth: none · Body: `{ email, password }`
- Validation: required fields present
- Success: 200 `{ user: {id, email, role, status} }` + sets session cookie
- Errors: 401 invalid credentials, 403 suspended, 429 locked out
- Rate limit: 10/15min/IP + 5/15min/email · Idempotency: n/a · Audit: `AUTH.LOGIN_SUCCESS`/`AUTH.LOGIN_FAILURE`

**POST /api/v1/auth/logout**
- Auth: session · Success: 200, clears cookie · Side effects: revoke current session · Audit: `AUTH.LOGOUT`

**GET /api/v1/auth/me**
- Auth: session · Success: 200 current user (safe projection) · Errors: 401

**POST /api/v1/auth/forgot-password**
- Auth: none · Body: `{ email }` · Success: 200 generic message always · Rate limit: 5/hour/IP+email · Side effects: token issued if email exists · Audit: `AUTH.PASSWORD_RESET_REQUESTED`

**POST /api/v1/auth/reset-password**
- Auth: none · Body: `{ token, newPassword }` · Validation: token valid+unused+unexpired, password policy · Success: 200 · Errors: 400 invalid/expired token · Side effects: revoke all sessions · Audit: `AUTH.PASSWORD_RESET_COMPLETED`

**POST /api/v1/auth/verify-email**
- Auth: none (token-based) · Body: `{ token }` · Success: 200 · Errors: 400 invalid/expired · Audit: `AUTH.EMAIL_VERIFIED`

**GET /api/v1/auth/sessions** / **DELETE /api/v1/auth/sessions/:id** / **DELETE /api/v1/auth/sessions**
- Auth: session · Authorization: only caller's own sessions · Audit: `AUTH.SESSION_REVOKED`

### 21.2 Users Module

**GET /api/v1/users/me** — safe profile projection.
**PATCH /api/v1/users/me** — update `profile.displayName`, `profile.avatarUrl`, `profile.timezone`; validated lengths/URL format; Audit `USER.PROFILE_UPDATED`.
**POST /api/v1/users/me/change-password** — body `{ currentPassword, newPassword }`; verifies current; revokes other sessions; Audit `USER.PASSWORD_CHANGED`.
**DELETE /api/v1/users/me** — initiates soft-delete (`deletion.requestedAt`, `status=DELETED`), revokes all sessions, schedules purge job; Audit `USER.ACCOUNT_DELETION_REQUESTED`. Rate limit: standard authenticated tier.

### 21.3 GitHub Module

**POST /api/v1/github/connect** — Auth: session · Success: `{ authorizationUrl }` · Side effects: creates `oauth_states`.
**GET /api/v1/github/callback** — Auth: state-validated (not a normal session header, since it's a browser redirect from GitHub) · Validation: `state` matches, unexpired · Success: redirect · Errors: 400 invalid state · Side effects: upsert `oauth_connections`, enqueue sync job · Audit `INTEGRATION.GITHUB_CONNECTED`.
**GET /api/v1/github/status** — Auth: session · Success: `{ connected, status, lastSyncedAt, lastSyncStatus }` (no tokens).
**POST /api/v1/github/sync** — Auth: session · Idempotency: `idempotencyKey` derived as `sync:{userId}:github:{last-completed-job-hash}` to avoid duplicate concurrent syncs (Section 26) · Rate limit: 1/5min/user · Side effects: enqueues `sync_jobs` · Audit `INTEGRATION.GITHUB_SYNC_REQUESTED`.
**DELETE /api/v1/github/disconnect** — Auth: session · Side effects: revoke connection · Audit `INTEGRATION.GITHUB_DISCONNECTED`.
**GET /api/v1/github/repositories** — Auth: session · Query: `page, limit` (paginated, Section 24) · Success: paginated normalized repo list from `source_data`.

### 21.4 LinkedIn Module

Mirrors GitHub module 1:1 (`connect`, `callback`, `status`, `sync`, `disconnect`), same rules, same audit-event naming convention (`INTEGRATION.LINKEDIN_*`). No repository-equivalent listing endpoint (not applicable).

### 21.5 Profile Module

**GET /api/v1/profile** — Auth: session · Success: full `UnifiedProfile`.
**PATCH /api/v1/profile** — Auth: session · Body: partial section updates · Validation: per-section schema (22) · Side effects: marks touched fields `userEdited: true`, recomputes completeness · Audit `PROFILE.UPDATED`.
**GET /api/v1/profile/completeness** — Auth: session · Success: `{ score, missingFields }`.
**GET /api/v1/profile/sources** — Auth: session · Success: per-section source attribution.

### 21.6 Portfolio Module

**POST /api/v1/portfolios** — Auth: session · Body: `{ title, slug? }` · Validation: title required, slug format if provided · Success: 201 · Rate limit: standard · Audit `PORTFOLIO.CREATED`.
**GET /api/v1/portfolios** — Auth: session · Query: pagination · Success: caller's portfolios only.
**GET /api/v1/portfolios/:id** — Auth: session · Authorization: `portfolio.userId === req.user.id` · Errors: 404 (not 403, to avoid confirming existence of other users' resources).
**PATCH /api/v1/portfolios/:id** — Auth: session · Same ownership rule · Body: partial `portfolioData`/`theme`/`seo`/`templateId` · Side effects: throttled autosave version · Audit `PORTFOLIO.UPDATED`.
**DELETE /api/v1/portfolios/:id** — Auth: session · Same ownership rule · Side effects: soft-delete, unpublish · Audit `PORTFOLIO.DELETED`.
**POST /api/v1/portfolios/:id/duplicate** — Auth: session · Success: 201 new draft copy · Audit `PORTFOLIO.DUPLICATED`.
**GET /api/v1/portfolios/:id/preview** — Auth: session · Success: assembled `{ portfolioData, theme, templateId }` from **live draft** (unlike public endpoint) for owner-only preview.
**POST /api/v1/portfolios/:id/publish** — Auth: session · Idempotency: hash of current `portfolioData` as key, repeat calls with unchanged content are no-ops · Rate limit: 10/hour/user · Side effects: version snapshot, status change · Audit `PORTFOLIO.PUBLISHED`.
**POST /api/v1/portfolios/:id/unpublish** — Auth: session · Audit `PORTFOLIO.UNPUBLISHED`.

### 21.7 AI Module

**POST /api/v1/ai/generate** — Auth: session · Body: `{ portfolioId, type: FULL_GENERATION|SECTION_REGENERATION, targetSection? }` · Header: `Idempotency-Key` required (Section 26) · Validation: portfolio ownership, `unified_profiles` exists and meets minimum completeness · Success: 202 `{ jobId, status: QUEUED }` · Rate limit: 5/hour/user (cost control) · Side effects: enqueue `generation_jobs` · Audit `AI.GENERATION_REQUESTED`.
**GET /api/v1/ai/generations/:id** — Auth: session · Authorization: owner only · Success: job status + (if completed) proposed `portfolioDataSnapshot` for review.
**POST /api/v1/ai/generations/:id/apply** — Auth: session · Side effects: commits snapshot into live `portfolioData`, creates autosave version · Idempotency: naturally idempotent (re-apply = same result) but guarded against applying a `FAILED`/`CANCELLED` job · Audit `AI.GENERATION_APPLIED`.
**GET /api/v1/ai/generations** — Auth: session · Query: `portfolioId`, pagination · Success: history for that portfolio.
**POST /api/v1/ai/generations/:id/cancel** — Auth: session · Only valid while `QUEUED`/`PROCESSING` · Audit `AI.GENERATION_CANCELLED`.

### 21.8 Templates Module

**GET /api/v1/templates** — Auth: session (or public, product decision) · Query: pagination, `status=ACTIVE` filter default · Success: list of metadata.
**GET /api/v1/templates/:id** — Success: single template metadata incl. `configSchema`.

### 21.9 Public Module

**GET /api/v1/public/portfolios/:slug** — Auth: none · Rate limit: IP-based, generous but capped · Cache: short TTL · Success: public-safe shape (18.1).

### 21.10 Admin Module

See Section 19 table; each entry additionally requires: Auth: session, Role: `ADMIN`, Rate limit: elevated but still capped, Audit: mutating actions only, Idempotency: n/a for reads, natural-key-based for the rare admin write actions.

---

## 22. VALIDATION

Schema-based validation (Zod recommended for TS-native inference) applied at the route boundary, before controllers run.

| Field type | Rule |
|---|---|
| Email | RFC-5322-compatible regex, max 254 chars, lowercase-normalized |
| Password | min 10 chars, at least one letter and one number (configurable policy); checked against a common-password blocklist; max 128 chars (DoS guard) |
| Display name | 1–80 chars, no control characters |
| URLs (social links, website) | must parse as valid `http(s)` URL; **SSRF guard** — reject internal/loopback/link-local hosts if the backend ever fetches these URLs server-side (e.g., OG image fetch) |
| Slugs | lowercase `a-z0-9-`, 3–60 chars, no leading/trailing hyphen, reserved-word blocklist (`admin`, `api`, `www`, etc.) |
| Portfolio content (text fields) | max lengths per field (e.g., `about` ≤ 2000 chars), HTML/script stripped or escaped (XSS guard), no raw HTML accepted from AI or user input rendered unsanitized |
| GitHub/LinkedIn imported data | validated against the same section schemas as manual input before being written into `unified_profiles` — external data is untrusted input too |
| AI output | must validate against a strict JSON schema per section; unknown fields dropped, missing required fields → job failure, not silent defaults |
| Query params (pagination) | `page ≥ 1`, `limit` capped (e.g., max 100), non-numeric rejected |

---

## 23. ERROR RESPONSE STANDARD

```json
{
  "success": false,
  "error": {
    "code": "PORTFOLIO_SLUG_TAKEN",
    "message": "This URL is already in use.",
    "details": [ { "field": "slug", "issue": "duplicate" } ]
  },
  "requestId": "..."
}
```

- `code` is a stable, machine-readable string (SCREAMING_SNAKE), documented per module.
- `message` is safe to display to end users; never contains stack traces, file paths, or raw DB errors.
- `details` is present only for validation errors.
- **HTTP status conventions:** 400 validation, 401 unauthenticated, 403 authorization/forbidden, 404 not found or not owned (see 21.6), 409 conflict (duplicate slug/email), 422 semantically invalid (e.g., publish without required sections), 429 rate limited, 500 unhandled server error, 502/503 upstream (GitHub/LinkedIn/AI provider) failure.
- All uncaught exceptions pass through a single centralized error-handling middleware that logs full details internally and returns only the safe envelope externally.

---

## 24. PAGINATION

**Cursor-based** pagination for collections that are frequently appended-to and read in recency order (`audit_logs`, `generation_jobs`, `sync_jobs`, `portfolio_versions`, admin lists): `?cursor=<opaque>&limit=20`, response includes `nextCursor: string | null`. Cursor encodes `{ createdAt, _id }` for stable ordering under concurrent inserts.

**Offset/page-based** acceptable for smaller, less-volatile lists (`GET /portfolios` for a single user, `GET /templates`): `?page=1&limit=20`, response includes `{ page, limit, total, totalPages }`.

`limit` is always server-capped (e.g., max 100) regardless of client request — unlimited-record responses are explicitly disallowed everywhere (Section 50 rule).

---

## 25. RATE LIMITING

Redis-backed sliding-window limiter, keyed by `{ip}` for unauthenticated endpoints and `{userId}` (plus `{ip}` as a secondary guard) for authenticated ones.

| Endpoint class | Limit |
|---|---|
| Login | 10 / 15 min / IP, 5 / 15 min / email |
| Register | 5 / hour / IP |
| Forgot/reset password | 5 / hour / IP+email |
| General authenticated API | 300 / 15 min / user |
| GitHub sync | 1 / 5 min / user |
| LinkedIn sync | 1 / 5 min / user |
| AI generation | 5 / hour / user (cost control), plus a daily cap |
| Public portfolio reads | 60 / min / IP |
| Admin API | 600 / 15 min / admin (elevated, still capped) |

429 responses include a `Retry-After` header. Limits are configuration-driven (not hardcoded) so they can be tuned without a deploy.

---

## 26. IDEMPOTENCY

Operations requiring idempotency, and how duplicates are prevented:

| Operation | Mechanism |
|---|---|
| AI generation request | Client-supplied `Idempotency-Key` header (or server-derived from `{portfolioId, type, targetSection, inputHash}` if omitted); unique index on `generation_jobs.idempotencyKey`; a duplicate key within its validity window returns the existing job instead of creating a new one |
| Sync request | Derived key `sync:{userId}:{provider}:{inFlightCheck}`; if a `QUEUED`/`PROCESSING` job already exists for that user+provider, the new request returns the existing job (via the Redis lock in Section 16.3) rather than enqueuing a duplicate |
| Publish | Not header-based; made naturally idempotent by content-hash comparison — republishing identical `portfolioData` is a no-op (200, no new version) |
| Registration | Natural idempotency via the unique `email` index (retry safely returns 409, client treats as "already registered") |
| Future payments (if introduced) | Would require the standard `Idempotency-Key` pattern scoped per payment intent; explicitly out of scope today, called out for forward-compatibility only |

---

## 27. CONCURRENCY

| Scenario | Handling |
|---|---|
| Concurrent profile updates (two tabs) | Last-write-wins at the field/section level via `PATCH` semantics (only submitted fields are touched); optional `If-Unmodified-Since`/version check can be added client-side to warn on stale saves — flagged as a UX enhancement, not a hard backend requirement |
| Concurrent portfolio editing | Same last-write-wins on `PATCH`; autosave versioning (Section 13) means no edit is ever silently lost even if overwritten — prior states remain in `portfolio_versions` |
| Multiple generation requests for the same portfolio | Redis lock `lock:generation:{portfolioId}` — a second request while one is `PROCESSING` is rejected with 409 or returns the in-flight job (idempotency-aware) |
| Multiple sync requests | Redis lock `lock:sync:{userId}:{provider}` — identical pattern |
| Duplicate publishing | Handled by idempotency (Section 26) — concurrent publish calls converge on one version being canonical, guarded additionally by an atomic `findOneAndUpdate` transition on `portfolios.status` |
| Duplicate job creation under retries | Unique index on `idempotencyKey` at the DB level is the final backstop even if the Redis lock is somehow bypassed |
| Cross-user isolation | Every query is scoped by `userId` server-side; no operation can affect another user's documents regardless of timing |

---

## 28. DATA CONSISTENCY

- A `Portfolio`, `SourceData`, `UnifiedProfile`, `OAuthConnection`, `GenerationJob`, or `SyncJob` cannot exist without a valid `userId` referencing an existing `users` document — enforced at the application layer on create (MongoDB has no native FK enforcement); referential checks run inside the relevant service method, not scattered across controllers.
- A `PortfolioVersion`/`GenerationJob` referencing a `portfolioId` is validated against that portfolio's current `userId` at creation time.
- A `PUBLISHED` portfolio's `publishedVersionId` must always point to an existing `portfolio_versions` document — publish is a single atomic write (create version, then update pointer) wrapped in a MongoDB **multi-document transaction** since it spans two collections and must not partially apply.
- **Where transactions are used (deliberately limited to genuine multi-document invariants):** publish (version create + portfolio pointer update), account soft-delete (user status + session revocation), job completion that both updates job status and applies AI output (Section 15.6 "apply" step touches `generation_jobs` + `portfolios` + `portfolio_versions`). Everyday single-document updates (profile `PATCH`, portfolio `PATCH`) do **not** use transactions — unnecessary overhead for single-document atomic writes, which MongoDB already guarantees.
- On user deletion: soft-delete immediately unpublishes all portfolios (no publicly-accessible data survives even the grace period) and revokes all sessions/connections; hard purge later removes documents per retention policy (Section 36).

---

## 29. SECURITY

Covered in depth across Sections 6 (auth), 8 (OAuth token handling), 22 (validation), 25 (rate limiting), 36 (DB security), 37 (API security). Summary of cross-cutting controls:

- Password hashing: argon2id (or bcrypt with adequate cost factor as a fallback), never reversible, never logged.
- All traffic over HTTPS/TLS; HSTS enabled.
- `helmet` middleware for standard security headers (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
- CORS restricted to known frontend origin(s) per environment; credentials mode only for the trusted origin.
- CSRF: since auth uses `httpOnly` cookies, state-changing routes require either a `SameSite=Lax/Strict` cookie (mitigates most CSRF) plus a double-submit CSRF token on top for defense-in-depth on the highest-risk actions (password change, account deletion, publish).
- Request body size limits (e.g., 1MB JSON, larger explicit limit for file upload endpoints only).
- SSRF prevention on any server-side URL fetch (OG image fetch, avatar-from-URL if ever added): resolve DNS, reject private/loopback/link-local ranges, disallow redirects to disallowed hosts.
- Injection prevention: parameterized/ODM-driven queries only, never string-concatenated Mongo queries; strict `$jsonSchema` validators as a second line of defense; input sanitization against NoSQL injection operators (`$where`, `$ne` etc. stripped from any object that's meant to be a plain value).

---

## 30. LOGGING / AUDITING

### 30.1 Application Logs (`system_logs` / log platform)

Structured JSON, one line per event, fields: `timestamp, level, requestId, userId?, module, message, metadata`. Levels: `DEBUG, INFO, WARN, ERROR, CRITICAL`. `CRITICAL` triggers alerting (e.g., paging) in production.

### 30.2 What Is Never Logged

Passwords (raw or hashed), OAuth tokens, session token raw values, password reset/verification token raw values, full request bodies for auth endpoints.

### 30.3 Audit Events (non-exhaustive canonical list)

`AUTH.REGISTER`, `AUTH.LOGIN_SUCCESS`, `AUTH.LOGIN_FAILURE`, `AUTH.LOGOUT`, `AUTH.PASSWORD_RESET_REQUESTED`, `AUTH.PASSWORD_RESET_COMPLETED`, `AUTH.EMAIL_VERIFIED`, `AUTH.SESSION_REVOKED`, `USER.PROFILE_UPDATED`, `USER.PASSWORD_CHANGED`, `USER.ACCOUNT_DELETION_REQUESTED`, `INTEGRATION.GITHUB_CONNECTED`, `INTEGRATION.GITHUB_DISCONNECTED`, `INTEGRATION.GITHUB_SYNC_REQUESTED`, `INTEGRATION.LINKEDIN_*` (mirrored), `PROFILE.UPDATED`, `PORTFOLIO.CREATED`, `PORTFOLIO.UPDATED`, `PORTFOLIO.DELETED`, `PORTFOLIO.DUPLICATED`, `PORTFOLIO.PUBLISHED`, `PORTFOLIO.UNPUBLISHED`, `AI.GENERATION_REQUESTED`, `AI.GENERATION_APPLIED`, `AI.GENERATION_CANCELLED`, `ADMIN.USER_SUSPENDED`, `ADMIN.USER_REACTIVATED`, `ADMIN.JOB_CANCELLED`.

---

## 31. PERFORMANCE

- Every list-returning endpoint is paginated and index-backed (Sections 4, 24) — no full-collection scans.
- Public portfolio reads are cached (Redis, short TTL) and served from `portfolio_versions` snapshots, decoupling public traffic from live-edit write load.
- External API calls (GitHub/LinkedIn/AI) never happen inline in a user-facing request path — always via background jobs — so a slow/rate-limited provider never blocks the API.
- Connection pooling configured for the MongoDB driver (sane pool size per instance) and for the Redis client.
- N+1 prevention: portfolio/profile reads are single-document fetches by design (embedding strategy in Section 2.1); admin list views that need cross-collection data use `$lookup` aggregation pipelines rather than per-row application-level joins.
- Response payload size: `PortfolioData` is bounded by field-level max lengths (Section 22); repository lists are paginated, not returned in full.

---

## 32. BACKEND FOLDER STRUCTURE

```
src/
├── config/            # env loading & validation, per-environment config objects
├── app/               # Express app assembly, route mounting, global middleware wiring
├── modules/
│   ├── auth/          # routes, controller, service, validators
│   ├── users/
│   ├── github/
│   ├── linkedin/
│   ├── profile/
│   ├── portfolio/
│   ├── templates/
│   ├── ai/
│   ├── public/
│   └── admin/
├── middleware/         # auth, ownership, rate-limit, request-id, error handler
├── services/            # cross-module shared services (e.g., slug generator, completeness scorer)
├── integrations/
│   ├── github/          # provider client, normalizer
│   ├── linkedin/        # provider client, normalizer
│   └── ai/              # provider abstraction + concrete Anthropic client
├── jobs/
│   ├── queues/           # BullMQ queue definitions
│   ├── workers/          # sync worker, generation worker
│   └── schedulers/       # cron-style jobs (version pruning, TTL-adjacent cleanup)
├── database/
│   ├── models/            # Mongoose schemas per collection
│   ├── repositories/      # data-access functions per collection (used by services, not controllers directly)
│   └── migrations/        # schema/index migration scripts
├── validators/             # Zod schemas, shared across modules
├── errors/                 # AppError classes, error codes registry
├── logging/                 # logger setup, redaction rules
├── security/                 # encryption helpers (token encryption), password hashing
└── utils/                     # generic helpers (pagination cursor encode/decode, etc.)
```

**Responsibilities:** controllers only parse/validate HTTP input and call services; services contain business logic and orchestrate repositories/integrations; repositories are the only layer touching Mongoose models directly; integrations isolate all third-party API/SDK specifics; jobs/workers are thin wrappers that call the same services controllers call (no duplicated business logic between the HTTP path and the job path).

---

## 33. TTL DATA

| Data | TTL | Mechanism |
|---|---|---|
| Password reset tokens | ~30 min | MongoDB TTL index on `expiresAt` |
| Email verification tokens | ~24 hours | MongoDB TTL index |
| Sessions | matches configured session lifetime (e.g., 30 days sliding, 90 days hard cap) | MongoDB TTL index on `expiresAt` |
| OAuth state (CSRF) | ~10 min | MongoDB TTL index |
| `source_data` history | not TTL — retention by count (last N snapshots per `{userId, source, kind}`), pruned by a scheduled job | Application-level pruning job (Section 32 `schedulers`) |
| `portfolio_versions` (AUTOSAVE) | not TTL — retention by count (last N per portfolio) | Application-level pruning job |
| Redis rate-limit counters | window length (e.g., 15 min) | Redis key TTL |
| Redis locks | job-duration bound with a safety max (e.g., 10 min) to prevent permanent deadlock on a crashed worker | Redis key TTL |

---

## 34. DATABASE RELATIONSHIP DIAGRAM (Conceptual)

```
                         ┌────────────┐
                         │   User     │
                         └─────┬──────┘
        ┌───────────┬──────────┼───────────┬─────────────┬───────────────┐
        ▼           ▼           ▼           ▼             ▼               ▼
   ┌─────────┐ ┌───────────┐ ┌────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
   │ Session │ │OAuthConn. │ │SourceD.│ │UnifiedProf│ │ Portfolio │ │ AuditLog  │
   └─────────┘ └───────────┘ └────────┘ └───────────┘ └─────┬─────┘ └───────────┘
                                                              │
                                          ┌───────────────────┼───────────────────┐
                                          ▼                   ▼                   ▼
                                 ┌────────────────┐   ┌───────────────┐   ┌───────────────┐
                                 │PortfolioVersion│   │ GenerationJob │   │  (SyncJob is   │
                                 └────────────────┘   └───────────────┘   │  User-owned,   │
                                          ▲                                │  not Portfolio-│
                                          │                                │  owned)        │
                                 ┌────────┴───────┐                       └───────────────┘
                                 │    Template     │  (Portfolio → Template, optional, N:1)
                                 └────────────────┘
```

Ownership (`userId`) flows from `User` to every leaf collection either directly or (for `PortfolioVersion`/`GenerationJob`) via a denormalized `userId` field alongside the `portfolioId` reference, so ownership checks never require a join.

---

## 35. API FLOW DIAGRAMS

1. **Registration:** Client → `POST /auth/register` → validate → hash password → create User(`PENDING_VERIFICATION`) → issue verification token → send email → 201.
2. **Login:** Client → `POST /auth/login` → validate → check lockout/status → verify password → create Session → set cookie → 200.
3. **GitHub connection:** Client → `POST /github/connect` → create oauth_state → return authUrl → browser → GitHub consent → `GET /github/callback` → validate state → exchange code → encrypt+store tokens → enqueue sync job → redirect.
4. **LinkedIn connection:** identical shape to (3), LinkedIn-specific scopes/consent screen.
5. **GitHub sync:** enqueue → worker locks `{userId,GITHUB}` → fetch profile+repos (paginated, rate-limit aware) → normalize → write `source_data` → merge into `unified_profiles` (respecting userEdited) → mark job COMPLETED/PARTIAL/FAILED → release lock.
6. **LinkedIn sync:** same shape, constrained to approved API scopes; missing categories flagged, not fabricated.
7. **Unified profile generation (merge):** triggered post-sync — normalize `source_data` → apply data-priority rules (Section 9 of context: USER_EDITED > VERIFIED_SOURCE > DERIVED > AI) → update `unified_profiles` → recompute completeness.
8. **AI portfolio generation:** Client → `POST /ai/generate` (Idempotency-Key) → create `generation_jobs`(QUEUED) → 202 → worker locks `{portfolioId}` → build input from `unified_profiles` → call AI provider → validate schema+factuality → mark COMPLETED with `outputRef` proposal → Client polls `GET /ai/generations/:id` → Client → `POST /ai/generations/:id/apply` → commit into `portfolioData` + autosave version.
9. **Portfolio editing:** Client → `PATCH /portfolios/:id` → ownership check → validate → update `portfolioData` → throttled autosave version write → 200.
10. **Portfolio publishing:** Client → `POST /portfolios/:id/publish` → ownership + validation → transaction: create `PUBLISH_SNAPSHOT` version + update `portfolios.status/publishedVersionId/publishedAt` → invalidate public cache for slug → 200.
11. **Public portfolio request:** Visitor → `GET /public/portfolios/:slug` → cache check → if miss, fetch `portfolios` (status=PUBLISHED) joined to its `publishedVersionId` snapshot → return public-safe shape → cache set.
12. **Admin monitoring:** Admin → session+role check on every `/admin/*` call → paginated queries against `users`/`portfolios`/`generation_jobs`/`sync_jobs`/`audit_logs` → mutating actions (suspend, cancel job) additionally audit-logged.

---

## 36. SECURITY MATRIX

| Resource | Endpoint(s) | Auth | Authorization | Owner Validation | Admin Access | Rate Limit |
|---|---|---|---|---|---|---|
| User account | `/auth/*`, `/users/me*` | none (auth routes) / session | self only | n/a / self | via `/admin/users` | see Section 25 |
| Session | `/auth/sessions*` | session | self only | `session.userId === req.user.id` | none direct (admin revokes via user suspension flow) | standard |
| OAuth connection | `/github/*`, `/linkedin/*` | session | self only | `connection.userId === req.user.id` | via `/admin/integrations/status` (aggregate only, no tokens) | see 25 |
| Source data | (internal only, exposed via `/profile/sources`) | session | self only | `sourceData.userId === req.user.id` | none | n/a |
| Unified profile | `/profile*` | session | self only | `profile.userId === req.user.id` | none | standard |
| Portfolio | `/portfolios*` | session | self only | `portfolio.userId === req.user.id` | via `/admin/portfolios` (read) | standard / 10/hr publish |
| Portfolio version | (internal, surfaced via portfolio rollback UI) | session | self only | `version.userId === req.user.id` | via admin portfolio detail | n/a |
| Generation job | `/ai/*` | session | self only | `job.userId === req.user.id` | via `/admin/jobs` (read) | 5/hr generation |
| Sync job | `/github/sync`, `/linkedin/sync` | session | self only | `job.userId === req.user.id` | via `/admin/jobs` (read) | 1/5min |
| Public portfolio | `/public/portfolios/:slug` | none | public by design | n/a (only PUBLISHED served) | n/a | 60/min/IP |
| Admin resources | `/admin/*` | session | `role === ADMIN` | n/a (cross-user by design, scoped to admin purpose) | full | 600/15min |

---

## 37. API MATRIX

| Module | Method | Route | Auth | Role | Purpose | Rate Limit | Idempotency | Audit |
|---|---|---|---|---|---|---|---|---|
| Auth | POST | /auth/register | none | — | create account | 5/hr/IP | natural (unique email) | yes |
| Auth | POST | /auth/login | none | — | login | 10/15min/IP,5/15min/email | n/a | yes |
| Auth | POST | /auth/logout | session | USER/ADMIN | end session | standard | n/a | yes |
| Auth | GET | /auth/me | session | USER/ADMIN | current user | standard | n/a | no |
| Auth | POST | /auth/forgot-password | none | — | request reset | 5/hr | n/a | yes |
| Auth | POST | /auth/reset-password | none | — | complete reset | 5/hr | token single-use | yes |
| Auth | POST | /auth/verify-email | none | — | verify email | standard | token single-use | yes |
| Auth | GET/DELETE | /auth/sessions[/:id] | session | USER/ADMIN | manage sessions | standard | n/a | yes (revoke) |
| Users | GET/PATCH | /users/me | session | USER/ADMIN | profile mgmt | standard | n/a | yes (patch) |
| Users | POST | /users/me/change-password | session | USER/ADMIN | change pw | standard | n/a | yes |
| Users | DELETE | /users/me | session | USER/ADMIN | delete account | standard | n/a | yes |
| GitHub | POST | /github/connect | session | USER/ADMIN | start OAuth | standard | n/a | n/a |
| GitHub | GET | /github/callback | state | — | complete OAuth | n/a | n/a | yes |
| GitHub | GET | /github/status | session | USER/ADMIN | connection status | standard | n/a | no |
| GitHub | POST | /github/sync | session | USER/ADMIN | trigger sync | 1/5min | derived key | yes |
| GitHub | DELETE | /github/disconnect | session | USER/ADMIN | remove connection | standard | n/a | yes |
| GitHub | GET | /github/repositories | session | USER/ADMIN | list repos | standard | n/a | no |
| LinkedIn | (same set) | /linkedin/* | mirrors GitHub | | | | | |
| Profile | GET/PATCH | /profile | session | USER/ADMIN | unified profile | standard | n/a | yes (patch) |
| Profile | GET | /profile/completeness | session | USER/ADMIN | completeness | standard | n/a | no |
| Profile | GET | /profile/sources | session | USER/ADMIN | attribution | standard | n/a | no |
| Portfolio | POST | /portfolios | session | USER/ADMIN | create | standard | n/a | yes |
| Portfolio | GET | /portfolios[/:id] | session | USER/ADMIN | read | standard | n/a | no |
| Portfolio | PATCH | /portfolios/:id | session | USER/ADMIN | update | standard | n/a | yes |
| Portfolio | DELETE | /portfolios/:id | session | USER/ADMIN | delete | standard | n/a | yes |
| Portfolio | POST | /portfolios/:id/duplicate | session | USER/ADMIN | duplicate | standard | n/a | yes |
| Portfolio | GET | /portfolios/:id/preview | session | USER/ADMIN | preview | standard | n/a | no |
| Portfolio | POST | /portfolios/:id/publish | session | USER/ADMIN | publish | 10/hr | content-hash | yes |
| Portfolio | POST | /portfolios/:id/unpublish | session | USER/ADMIN | unpublish | standard | n/a | yes |
| AI | POST | /ai/generate | session | USER/ADMIN | request generation | 5/hr | header key | yes |
| AI | GET | /ai/generations[/:id] | session | USER/ADMIN | status/history | standard | n/a | no |
| AI | POST | /ai/generations/:id/apply | session | USER/ADMIN | apply output | standard | natural | yes |
| AI | POST | /ai/generations/:id/cancel | session | USER/ADMIN | cancel | standard | n/a | yes |
| Templates | GET | /templates[/:id] | session | USER/ADMIN | list/detail | standard | n/a | no |
| Public | GET | /public/portfolios/:slug | none | — | public view | 60/min/IP | n/a | no |
| Admin | GET | /admin/users[/:id] | session | ADMIN | user mgmt | 600/15min | n/a | no (read) |
| Admin | PATCH | /admin/users/:id/status | session | ADMIN | suspend/reactivate | 600/15min | n/a | yes |
| Admin | GET | /admin/portfolios | session | ADMIN | portfolio oversight | 600/15min | n/a | no |
| Admin | GET | /admin/jobs[/failed] | session | ADMIN | job monitoring | 600/15min | n/a | no |
| Admin | GET | /admin/logs | session | ADMIN | logs | 600/15min | n/a | no |
| Admin | GET | /admin/audit-logs | session | ADMIN | audit trail | 600/15min | n/a | no |
| Admin | GET | /admin/health | session | ADMIN | system health | 600/15min | n/a | no |
| Admin | GET | /admin/integrations/status | session | ADMIN | integration health | 600/15min | n/a | no |

---

## 38. DATABASE MATRIX

| Collection | Purpose | Owner | Key Indexes | Sensitive Data | TTL | Relationships |
|---|---|---|---|---|---|---|
| `users` | identity/auth | self | `email` (unique), `status` | passwordHash, security.* | no | parent of all owned collections |
| `sessions` | login sessions | user | `tokenHash`, `userId`, `expiresAt` (TTL) | tokenHash, ip | yes | → `users` |
| `password_reset_tokens` | pw reset | user | `expiresAt` (TTL), `userId` | tokenHash | yes | → `users` |
| `email_verification_tokens` | email verify | user | `expiresAt` (TTL), `userId` | tokenHash | yes | → `users` |
| `oauth_connections` | external linkage | user | `{userId,provider}` unique, `{provider,providerAccountId}` | access/refresh tokens | no | → `users` |
| `oauth_states` | OAuth CSRF | user (transient) | `state` unique, `expiresAt` (TTL) | state value | yes | → `users` |
| `source_data` | raw/normalized snapshots | user | `{userId,source,kind}` | raw provider payload (may include PII) | count-based prune | → `users`, `sync_jobs` |
| `unified_profiles` | normalized profile | user | `userId` unique | contact info | no | → `users` |
| `portfolios` | portfolio content | user | `slug` unique, `userId`, `{status,publishedAt}` | none beyond owner's chosen public content | no | → `users`, `templates` |
| `portfolio_versions` | history/rollback | user (via portfolio) | `{portfolioId,createdAt}` | none | count-based prune (autosave) | → `portfolios` |
| `templates` | template metadata | system | `key` unique, `status` | none | no | referenced by `portfolios` |
| `generation_jobs` | AI job tracking | user | `idempotencyKey` unique, `{userId,status}`, `{portfolioId,createdAt}` | prompt input references (no raw secrets) | no | → `users`, `portfolios` |
| `sync_jobs` | sync job tracking | user | `idempotencyKey` unique, `{userId,provider,status}` | none | no | → `users` |
| `audit_logs` | security/business trail | system (actor-attributed) | `{event,createdAt}`, `{actorUserId,createdAt}`, `{targetType,targetId}` | none (metadata scrubbed of secrets) | policy-based (Section 37 open Q) | → `users` (actor) |

---

## 39. TESTING REQUIREMENTS

| Module | Unit | Integration | API | Authorization | Security | Concurrency | Failure |
|---|---|---|---|---|---|---|---|
| Auth | password hashing, token generation, lockout math | register→verify→login flow against test DB | all `/auth/*` status codes and payloads | session required where expected | brute-force lockout, enumeration checks, CSRF | duplicate registration race | DB unavailable, email send failure |
| Sessions | expiry/revocation logic | multi-session creation & revoke-all | `/auth/sessions*` | only-self access | token hash never leaks in responses | concurrent logout-all vs. new login | expired session cleanup |
| OAuth (GitHub/LinkedIn) | state generation/validation, token encryption | full connect→callback→sync happy path against provider sandbox/mocks | connect/status/sync/disconnect endpoints | only-self access, admin read-only | token never in API responses, SSRF-safe redirect handling | concurrent sync requests (lock behavior) | provider 5xx, rate-limit, revoked token, partial pagination failure |
| Profile | completeness scoring, merge/priority logic | sync → normalize → merge into unified profile | `/profile*` | only-self | userEdited fields immune to overwrite | concurrent PATCH from two sessions | malformed provider data |
| Portfolio | slug generation, version pruning | create→edit→publish→rollback flow | full CRUD + publish/unpublish | only-self, 404 not 403 for others' resources | XSS-safe rendering of stored content, IDOR probes | concurrent publish calls | DB transaction failure mid-publish |
| AI | schema validation, factuality check logic | generate→apply flow against mocked provider | `/ai/*` | only-self | provider key never logged/exposed, injection-safe prompt building | concurrent generation requests locked | provider timeout, malformed JSON output, quota exceeded |
| Jobs (sync/generation) | idempotency key derivation | worker processing against BullMQ test harness | n/a (internal) | job payload re-validated against current ownership | lock acquisition/release correctness | two workers racing the same job | worker crash mid-job (lock TTL recovery) |
| Public | cache invalidation logic | publish → immediately visible; unpublish → 404 | `/public/portfolios/:slug` | no auth required, never leaks draft data | rate limiting effectiveness | cache stampede on popular slug | slug collision edge cases |
| Admin | pagination/filter logic | full admin listing against seeded data | all `/admin/*` | role=ADMIN enforced, non-admin 403 | privilege escalation attempts blocked | n/a | downstream service (log platform) unavailable |

General cross-cutting suites: **IDOR sweep** (attempt every resource-scoped endpoint with another user's ID), **rate-limit verification** (confirm 429 at configured thresholds), **secrets-never-in-response** contract tests (snapshot every response shape and assert absence of token/hash fields).

---

## 40. OPEN QUESTIONS

These require a product/business decision before final implementation and are intentionally not guessed at:

1. **Registration enumeration policy** — return a specific "email already in use" error (better UX) vs. a generic response (stronger anti-enumeration)? Default assumed: specific error.
2. **Email verification gating** — does an unverified user get a fully-usable account (gated only at publish time) or a restricted account until verified? Default assumed: gated at publish only.
3. **LinkedIn data scope** — the exact set of importable fields depends on which LinkedIn API products/scopes the application is approved for, which is a partner-program decision outside this spec's control. The backend is designed to degrade gracefully (manual fallback) regardless of the outcome.
4. **Multiple portfolios per user** — is this a launch feature or future? The schema (Section 3.9) supports N portfolios per user by design either way; confirm whether the pricing/plan model imposes a cap.
5. **Audit log retention period** — indefinite vs. a fixed compliance window (e.g., 2 years); affects whether a TTL/archival job is needed on `audit_logs`.
6. **MFA** — `security.mfaEnabled` field is reserved; full MFA flow (TOTP/WebAuthn) is out of scope for this step and should be its own future spec if prioritized.
7. **File/avatar upload provider** — confirm the specific object-storage vendor (S3, GCS, R2, etc.) so upload endpoint details (presigned URL flow) can be finalized; the conceptual design (Section 3.1 `profile.avatarUrl`) is provider-agnostic today.
8. **AI cost budgeting** — whether per-user or per-plan generation quotas beyond the flat rate limit (Section 25) are needed, and whether `usage.inputTokens/outputTokens` feeds into billing.

---

## 41. FINAL IMPLEMENTATION READINESS CHECKLIST

- [ ] All 14 collections created with Mongoose schemas + MongoDB `$jsonSchema` validators matching Section 3.
- [ ] All indexes in Section 4 / Section 38 created via migration scripts (not manual/ad hoc).
- [ ] Session-cookie auth implemented per Section 6; password hashing (argon2id) verified with a security review.
- [ ] OAuth connect/callback/status/sync/disconnect implemented identically for GitHub and LinkedIn per Sections 8–10, with token encryption at rest (Section 36) confirmed via a secrets-manager-backed key, not an env-committed key.
- [ ] Data-priority rule (`userEdited` immunity to overwrite) implemented and covered by a dedicated test (Section 39, Profile row).
- [ ] Portfolio publish flow uses a MongoDB transaction (Section 28) and is verified idempotent under duplicate submission (Section 26).
- [ ] AI generation is job-backed, schema-validated, factuality-checked, and requires an explicit "apply" step before touching live `portfolioData` (Section 15).
- [ ] Public portfolio endpoint verified to never expose draft content, tokens, or internal IDs (Section 18), and 404s correctly for non-published states.
- [ ] Every list endpoint is paginated and every route is present in the Rate Limiting table (Section 25) with an enforced limiter.
- [ ] Centralized error handler in place; manual check confirms no stack traces/secrets leak in any error response (Section 23).
- [ ] Audit logging wired for every event listed in Section 30.3, verified to exclude secrets.
- [ ] Admin routes verified to reject non-`ADMIN` roles even when a valid session is presented (role-escalation test, Section 39).
- [ ] IDOR sweep test suite passes across all owner-scoped resources (Portfolio, Profile, OAuthConnection, Sessions, Jobs).
- [ ] TTL indexes verified functioning in a staging environment (tokens/sessions actually expire).
- [ ] Version-pruning scheduled jobs (autosave versions, source_data history) deployed and verified not to remove `PUBLISH_SNAPSHOT` versions.
- [ ] Open Questions (Section 40) resolved or explicitly deferred with product sign-off before launch.

---

*End of STEP-05-BACKEND-SPECIFICATION.md*
