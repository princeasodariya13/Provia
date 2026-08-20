# STEP-04-SYSTEM-ARCHITECTURE.md

**AI Portfolio Generator — System Architecture**
Status: Draft for review · Depends on: PRD, FRD, User Flow & UX Flow (approved) · Feeds into: Step 5 — Backend Specification

---

## 1. Architecture Overview

The platform is a multi-user SaaS product that turns verified professional data (GitHub, LinkedIn, user input) into a published, shareable portfolio. The system is organized around one governing pipeline:

```
SOURCE INTEGRATIONS → SOURCE DATA → NORMALIZATION → UNIFIED PROFILE
→ AI PROCESSING → PORTFOLIO DATA → TEMPLATE RENDERER → PUBLISHED PORTFOLIO
```

Everything else — auth, jobs, caching, logging, admin — exists to support this pipeline safely, reliably, and at scale. The backend is a **modular monolith** (Node.js/Express/TypeScript); the frontend is **Next.js/TypeScript/Tailwind**; the datastore is **MongoDB**. External systems (GitHub, LinkedIn, the AI provider) are accessed only through dedicated, isolated service modules — never directly from route handlers or the frontend.

The architecture is designed so that **no future template, AI provider, or data source requires touching unrelated modules.** That isolation is the central design constraint of this document.

---

## 2. Architecture Principles

1. **Separation of concerns** — UI, API, business logic, integrations, persistence, AI, and rendering are distinct layers with one-directional dependencies (UI → API → services → data access).
2. **Single responsibility per module** — `github`, `linkedin`, `profile`, `generation`, `portfolio`, `publishing` are independent modules with their own controllers/services/repositories.
3. **Data source abstraction** — GitHub and LinkedIn are producers of *source data* only. Nothing downstream (Unified Profile, AI, templates) knows these platforms exist.
4. **AI abstraction** — Portfolio generation talks to an internal `AIProvider` interface, not to a specific vendor SDK.
5. **Template abstraction** — Templates are pure rendering functions over `PortfolioData`. They cannot reach into the database, GitHub, or AI.
6. **Security by default** — Every resource access requires an authenticated identity and an ownership/role check; nothing is implicitly public.
7. **Fail safely** — A GitHub outage, LinkedIn permission revocation, or AI provider failure degrades that feature only; it never corrupts stored data or takes down unrelated functionality.
8. **Observability without exposure** — Every significant action is logged with correlation IDs; no log line ever contains a secret, token, or password.
9. **Design for scale, build for now** — The architecture anticipates 100k+ users and high public traffic, but V1 implementation uses the simplest component that satisfies each requirement (e.g., in-process job queue before Redis/BullMQ).

---

## 3. Technology Architecture

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS | SSR for public portfolios (SEO), CSR-heavy dashboard/editor |
| Backend | Node.js, Express, TypeScript | Modular monolith |
| Database | MongoDB (managed, e.g. Atlas) | Document model fits Unified Profile / PortfolioData's nested, variable-shape sections |
| Auth | Session-based (server-issued, secure cookie) + OAuth for GitHub/LinkedIn | Kept distinct — see §9 |
| AI | Provider-agnostic `AIProvider` interface | Initial implementation targets one provider; swappable |
| Background jobs | In-process job runner (Mongo-backed job collection) at V1 | Designed to migrate to Redis/BullMQ without touching calling code |
| Object storage | S3-compatible object storage | Profile/project images, future resume/PDF export |
| Cache | In-memory (V1) → Redis (scale) | GitHub API responses, published portfolio reads |
| CDN | In front of Next.js static assets and public portfolio images | |

No additional languages/runtimes are introduced. If a future need (e.g., heavy image processing, ML inference) genuinely requires another runtime, that would be an explicit ADR with justification — not a default.

---

## 4. Frontend Architecture

**Routing (Next.js App Router), grouped by access level:**

```
app/
├── (public)/              # marketing, login, register, /p/[slug] public portfolio
├── (auth-required)/
│   ├── dashboard/
│   ├── connections/       # GitHub / LinkedIn connect flows
│   ├── profile/           # unified profile review + completion
│   ├── portfolio/[id]/
│   │   ├── generate/
│   │   ├── edit/
│   │   └── preview/
│   └── settings/
└── (admin)/                # role-gated
```

- **Server components** handle data fetching for read-heavy, SEO-relevant pages (public portfolio, marketing). **Client components** are used only where interactivity requires it (editor, forms, live preview).
- **Route protection**: middleware checks session validity before rendering any `(auth-required)` or `(admin)` route; this is a UX convenience, not the security boundary. The real boundary is the API (§10).
- **State management**: server state (profile, portfolio, jobs) is fetched via the API and cached client-side with a data-fetching library (e.g., React Query semantics); local editor state (unsaved edits) lives in component/store state until explicitly saved.
- **API communication**: a single typed API client wraps all backend calls, attaches credentials, handles 401/403 uniformly (redirect to login / show "not authorized").
- **Forms & validation**: client-side validation is UX-only; every field is re-validated server-side against the same schema definitions (shared validation schema package between frontend and backend where practical).
- **Error boundaries**: route-level error boundaries render safe, user-facing messages; raw errors are never rendered to the DOM.
- **Loading/async states**: portfolio generation and sync operations are asynchronous (see §22); the frontend polls or subscribes to job status rather than blocking on long requests.

**Business logic that must NOT live in the frontend:** authorization decisions, data normalization, AI orchestration, publishing validation, slug uniqueness enforcement. The frontend renders state and submits intent; the backend decides what's allowed.

---

## 5. Backend Architecture

Modular monolith, organized by domain module:

```
src/
├── config/                # env loading, constants, feature flags
├── modules/
│   ├── auth/               # registration, login, sessions, password reset
│   ├── users/               # user profile/account management
│   ├── connections/          # OAuth connection state for GitHub/LinkedIn
│   ├── github/               # GitHub client, sync, source data mapping
│   ├── linkedin/              # LinkedIn client, sync, source data mapping
│   ├── profile/                # normalization + Unified Profile
│   ├── generation/              # AI orchestration, generation jobs
│   ├── portfolio/                 # PortfolioData, editor persistence
│   ├── templates/                  # template registry (structure only, no templates yet)
│   ├── publishing/                  # slug management, publish/unpublish
│   ├── sharing/                       # share links, (future) QR
│   └── admin/                          # admin-only read APIs
├── services/                # cross-module infrastructure services (cache, storage, mailer)
├── middleware/               # auth, authorization, rate-limit, error handler, request-id
├── jobs/                       # job runner + job handlers
├── utils/
├── validators/                 # shared request/schema validation
├── errors/                      # typed error classes
├── logging/
└── app/                          # express app wiring, route mounting
```

Each module follows the same internal layering:

```
routes → controller → service → repository → MongoDB
                 ↓
           validators, authorization checks
```

- **Controllers**: parse/validate HTTP input, call a service, shape the HTTP response. No business logic.
- **Services**: business logic and orchestration (e.g., `GenerationService` coordinates `ProfileService` + `AIService` + `PortfolioService`). Services never talk to `req`/`res` directly, so they're reusable from jobs.
- **Repositories**: the only layer that touches MongoDB directly (via Mongoose or the native driver). This isolates schema/query concerns and keeps business logic testable.
- **Integration clients** (`github/client.ts`, `linkedin/client.ts`, `ai/provider.ts`): the only code that calls external HTTP APIs. Wrapped with timeouts, retries, and structured error translation.
- **Middleware**: authentication (session validation), authorization (ownership/role checks), rate limiting, request-ID/correlation-ID injection, centralized error handling.

This structure avoids unnecessary layers — small modules (e.g., `sharing`) may skip a repository and use `portfolio`'s repository directly rather than duplicating data access.

---

## 6. Modular Monolith Decision

**Recommendation: modular monolith at launch.**

| | Modular Monolith | Microservices |
|---|---|---|
| Operational complexity | Low — one deployable, one datastore | High — service discovery, distributed tracing, network failure handling |
| Development speed | Fast — shared types, in-process calls | Slower — API contracts between services, more coordination |
| Fits current scale (0 → tens of thousands of users) | Yes | Premature |
| Failure isolation | Weaker (mitigated via job isolation, circuit breakers) | Stronger, but not needed yet |
| Migration path | Modules already have clean boundaries (service interfaces, no cross-module DB access) → can be extracted later | N/A |

Because each module already communicates through service interfaces rather than reaching into each other's repositories, any module that later needs independent scaling — most plausibly `generation` (AI, CPU/IO heavy) or `github`/`linkedin` sync — can be extracted into its own service with minimal refactor. This is the standard "monolith first, extract when scale demands it" path, and is the intended future for this codebase, not a hypothetical.

---

## 7. Authentication Architecture

Two authentication concepts are kept strictly separate:

### 7.1 Application authentication (this platform)
- Registration with email + password (bcrypt/argon2 hashing, never reversible).
- Email verification required before certain actions (publishing) if enabled by product decision.
- Login issues a **server-side session** (session ID stored in MongoDB or Redis at scale; opaque token in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie). No sensitive data in the cookie itself.
- Logout invalidates the session server-side (not just cookie deletion).
- Session expiration (sliding or fixed TTL — decide in Step 8) with server-side revocation support.
- Multiple concurrent sessions supported (e.g., multiple devices), each independently revocable — supports a future "active sessions" settings page.
- Password reset via time-limited, single-use token sent by email; reset invalidates existing sessions.
- Role field on the user record (`user` | `admin`) drives authorization (§8).

### 7.2 External OAuth connections (GitHub / LinkedIn)
- These are **not login mechanisms** for this platform (unless a future "sign in with GitHub" is explicitly added as an ADR) — they are **data-source connections** owned by an already-authenticated user.
- OAuth tokens (access/refresh) are stored encrypted at rest, associated with the user's `Connection` record, and are **never sent to the browser**.
- Expired/revoked tokens are detected on use (API call fails with 401) → connection is marked `needs_reauth` → user is prompted to reconnect; existing source data is not deleted.
- Account deletion cascades: sessions revoked, OAuth tokens revoked with the provider where supported and deleted locally, source data and derived data deleted per data-retention policy (finalized in Step 8).

---

## 8. Authorization Architecture

Every resource has a single owning `userId`. Server-side authorization is mandatory on every protected route — the frontend hiding a button is never sufficient.

```
Request → authenticate (who is this?) → authorize (do they own this / have this role?) → handler
```

- **Ownership check pattern**: middleware/service loads the resource, compares `resource.userId === session.userId`; on mismatch, returns 403/404 (404 preferred for existence-hiding on sensitive resources) rather than leaking existence of another user's data.
- **Admin role**: a separate authorization layer (`requireRole('admin')`) gates all `/admin/*` routes. A normal user token can never satisfy this check — role is read from the persisted user record on every request, not trusted from the client.
- **Public portfolios**: the *only* deliberately public resource type. Public read access is granted through a separate, unauthenticated route (`/p/:slug`) that reads only the published, sanitized `PortfolioData` — never the private dashboard resources.
- **IDOR prevention**: all resource lookups are scoped by both the resource ID *and* the authenticated user's ID at the query level (e.g., `Portfolio.findOne({ _id, userId })`), not fetched-then-checked in application code, to avoid a class of bugs where the check is accidentally skipped.

---

## 9. GitHub Architecture

Isolated module; the only part of the system that speaks GitHub's API.

```
User → GitHub OAuth → Callback → validate state/authorization
     → store encrypted token on Connection → GitHubClient
     → fetch permitted data (profile, repos, languages, topics)
     → raw Source Data → Normalization → Unified Profile
```

- **OAuth**: standard authorization code flow; `state` parameter validated to prevent CSRF on the callback.
- **API client**: thin wrapper over GitHub's REST/GraphQL API with built-in timeout, retry-with-backoff on transient failures, and rate-limit awareness (reads `X-RateLimit-*` headers, backs off proactively rather than waiting for a 403).
- **Pagination**: handled transparently inside the client for repo lists, etc.
- **Sync as a background job** (§22): a "Sync GitHub" action creates a job; the job fetches profile + repositories + language stats, writes them to a `SourceProfile(source: 'github')` document, and updates job status. Large accounts (hundreds of repos) don't block the request thread.
- **Partial failure handling**: if repo fetching partially fails (e.g., timeout on page 4 of 10), the job records what succeeded, marks the sync `partial`, and logs the failure — it does not discard already-fetched data or fail the whole profile.
- **Token lifecycle**: expiration/revocation is detected on API call failure, connection is flagged `needs_reauth`, no destructive action is taken automatically.
- **Repository selection**: users can choose which repos feed into their profile (not necessarily "all public repos") — this is a normalization/profile-layer concern, not a GitHub-client concern.

---

## 10. LinkedIn Architecture

Built strictly against **supported LinkedIn OAuth/API capabilities** — no scraping, no unofficial endpoints.

```
User → LinkedIn OAuth (supported scopes) → Callback → SourceProfile(source: 'linkedin')
     → Normalization → Unified Profile
```

Because LinkedIn's official API surface for third-party apps is intentionally limited (commonly restricted to basic profile fields depending on approved product/scopes — verify current program access before implementation), the architecture explicitly plans for a **partial-data reality**:

- **Automatically available information**: whatever the approved LinkedIn integration legitimately returns (e.g., basic profile fields under granted scopes). Stored as `SourceProfile(source: 'linkedin', field-level provenance)`.
- **User-provided information**: for fields LinkedIn does not expose (commonly: detailed experience, education, certifications, skills, depending on API access level), the UI presents them as **required manual entry**, clearly labeled as user-provided rather than imported.
- **Unsupported information**: anything the platform has no legitimate mechanism to obtain is never simulated, inferred, or scraped — it simply doesn't exist as a field until the user enters it or a future supported API expands access.
- **Permission denial / expiry**: handled identically to GitHub — connection flagged, existing data preserved, user prompted to reconnect.

This module is explicitly designed so that **if LinkedIn's supported API surface changes** (grows or shrinks), only `modules/linkedin` and its normalization mapping change — Unified Profile, AI, and templates are unaffected.

---

## 11. Source Data Architecture

```
GitHub SourceProfile + LinkedIn SourceProfile + User-entered fields
                         ↓
                   SOURCE DATA (raw, source-attributed, immutable-ish log of what was fetched)
                         ↓
                   NORMALIZATION
                         ↓
                   UNIFIED PROFILE
```

Source data is stored **as received** (shape close to the provider's), separately from the Unified Profile. This separation matters because:
- Re-normalization can be re-run without re-fetching from GitHub/LinkedIn.
- Debugging "why does my profile show X" is possible by inspecting the source record.
- A provider's data shape changing doesn't corrupt the Unified Profile — only the normalization mapping needs updating.
- Deleting a connection can cleanly remove that source's contribution without affecting user-entered or other-source data.

---

## 12. Data Normalization Architecture

```
Raw GitHub + Raw LinkedIn + User Input
        ↓
  Field mapping (per-source → common schema)
        ↓
  Deduplication (e.g., same project mentioned in GitHub repo + LinkedIn project)
        ↓
  Validation (URLs, dates, enums)
        ↓
  Source attribution tagging (github | linkedin | user | derived)
        ↓
  Conflict resolution (priority order, §13)
        ↓
  UNIFIED PROFILE
```

Normalization concerns handled here: inconsistent date formats → ISO 8601; skill name variants (e.g., "JS" / "Javascript" → canonical taxonomy entry, with the original preserved as an alias); duplicate projects matched by URL/name similarity and merged rather than duplicated; invalid or unreachable URLs flagged, not silently dropped; missing fields left explicitly `null`/absent — never inferred.

---

## 13. Unified Profile Architecture

`UnifiedProfile` is the platform's canonical, source-independent professional record.

**Sections**: `personal`, `about`, `skills`, `experience`, `education`, `projects`, `certifications`, `achievements`, `github`, `socialLinks`, `contact`.

Each field carries lightweight provenance: `{ value, source: 'github'|'linkedin'|'user'|'derived', verified: boolean, updatedAt }`.

**Priority order when sources conflict:**

```
USER-EDITED  >  VERIFIED SOURCE DATA (GitHub/LinkedIn)  >  DERIVED  >  AI PRESENTATION
```

AI-generated *presentation* text sits below all factual layers — AI can rephrase, never override, a user-edited or verified fact. This ordering is enforced at the normalization/merge step, not left to convention.

**Completeness scoring**: computed from required vs. optional fields per section (e.g., `personal.name` required, `certifications` optional); exposed to the frontend as a percentage plus a list of missing required fields, so the "Complete missing information" step can guide the user precisely.

---

## 14. AI Architecture

```
Unified Profile → AI Input Builder → AIProvider (abstraction) → raw model output
     → Schema Validation (structured/JSON schema) → Factuality Validation → PortfolioData
```

- **AI Input Builder**: assembles only verified Unified Profile data into the prompt/context — never source data with unresolved conflicts, never data the user hasn't seen.
- **AIProvider interface**: `generate(input): Promise<StructuredOutput>` — the only contract the rest of the system depends on. A concrete implementation (e.g., a specific vendor's API) is swappable behind this interface (see ADR-005).
- **Structured output**: the provider is instructed to return schema-conformant JSON (e.g., function-calling / JSON mode where supported); output is validated against the `PortfolioData` schema before being trusted.
- **Factuality validation**: a post-generation check that every entity the AI output references (company names, project names, technologies, dates) exists in the input Unified Profile. Any unmatched entity is treated as a hallucination — the section is flagged for regeneration or rejected rather than saved. AI is explicitly disallowed from inventing employers, projects, technologies, certifications, achievements, or metrics.
- **Reliability controls**: request timeout, retry with backoff on transient provider errors, per-user and global rate limiting, cost/usage tracking per generation (tokens/cost logged, not billed yet — feeds future billing).
- **Generation history**: every generation attempt (input snapshot reference, output, validation result, success/failure) is persisted for regeneration, auditing, and debugging.
- **AI never writes to the database directly** — its output passes through validation and is written by `GenerationService`, which enforces the priority rules from §13.

---

## 15. PortfolioData Architecture

`PortfolioData` is the **stable contract** between generated/edited content and visual rendering.

```
UnifiedProfile → (AI or manual edit) → PortfolioData → TemplateRenderer
```

Sections mirror the Unified Profile's professional content but are presentation-shaped (e.g., AI-written summaries, ordered/curated project lists, featured flags) rather than raw facts: `hero`, `personal`, `about`, `skills`, `experience`, `education`, `projects`, `certifications`, `achievements`, `github`, `socialLinks`, `contact`.

This contract is versioned (a `schemaVersion` field) so that future template systems and future AI output formats can evolve independently, with migration logic bridging versions rather than breaking old portfolios.

**Why this separation is critical**: it is the single point that makes "do not build templates yet" architecturally safe. Every future template — however many are eventually built — consumes exactly this contract. GitHub, LinkedIn, and AI internals can all change without ever touching a template, and templates can be added/replaced without touching profile, sync, or AI code.

---

## 16. Future Template Architecture

No templates are built now. This section defines only the seam they will plug into.

```
PortfolioData → TemplateRegistry.get(templateId) → TemplateDefinition → TemplateRenderer(data, config) → rendered Portfolio
```

- **TemplateRegistry**: a lookup of available templates by `templateId`, each declaring a version, supported `PortfolioData` sections, and a theme configuration schema (colors, fonts, layout options) — no visual/CSS decisions made yet.
- **TemplateDefinition**: metadata only at this stage (id, name, capabilities, compatibility with `PortfolioData.schemaVersion`).
- **TemplateRenderer**: the future interface each template implements; guaranteed to receive only `PortfolioData` + user theme config — never raw source data, database handles, or AI internals.
- Switching a user's selected template changes only a `templateId` reference on the portfolio record — it never mutates `UnifiedProfile` or `PortfolioData`.
- Adding a new template later requires no changes to auth, database core, GitHub/LinkedIn, or AI modules — only a new entry in the registry and a new renderer implementation.

---

## 17. Portfolio Editor Architecture

```
PortfolioData → Editor state (client) → user changes → validation
    → persisted PortfolioData → live preview (same TemplateRenderer used for publishing)
```

- **Autosave**: edits are debounced and persisted via API (draft state); explicit "Save" is not required to avoid data loss, but a clear saved/unsaved indicator is shown.
- **Section operations**: add / edit / delete / reorder / hide-show / feature-unfeature are all modeled as operations on `PortfolioData` sections/items, validated server-side (e.g., can't delete a required `hero`).
- **AI regeneration**: scoped to a single section (§18) — never a silent full-portfolio overwrite.
- **Preview**: renders the *current in-progress* `PortfolioData` through the same `TemplateRenderer` the public site will use, so preview and published output can never visually diverge.
- **Conflict handling**: last-write-wins at the section-save granularity for V1 (single-owner data, so true concurrent-edit conflicts are rare — e.g., same user in two tabs); the ADR notes this as revisitable if multi-editor portfolios are ever introduced.

---

## 18. AI Regeneration Architecture

```
Section (e.g., "about") → "Improve with AI" → AI Input Builder (section-scoped)
    → AIProvider → validated candidate → shown as diff/preview → Accept (persist) / Reject (discard)
```

Regeneration never silently overwrites existing content — the candidate is always presented for explicit accept/reject, and rejected candidates are discarded without touching the persisted section. Accepted regenerations are recorded in generation history (§14) for traceability.

---

## 19. Publishing Architecture

```
Draft → validation (required sections present, slug available) → Published Version → Public Renderer
```

- **Lifecycle**: `draft → generated → editing → ready → published`, with `published → unpublished` as a reversible action (unpublishing does not delete data).
- **Slug**: unique, URL-safe identifier (`/p/unique-slug`), user-customizable within constraints; uniqueness enforced via a unique database index plus application-level collision retry/suggestion (not just a "hope it's unique" check-then-write).
- **Versioning**: publishing snapshots the current `PortfolioData` as the "published version," distinct from the in-progress draft, so a user can keep editing without affecting the live public page until they republish.
- **No unnecessary duplication**: the published snapshot references/reuses the same section structures rather than deep-copying unrelated data blindly; only content, not source/AI metadata, is included in what's publicly served.

---

## 20. Public Portfolio Architecture

```
Request /p/:slug → slug lookup (indexed) → published PortfolioData (sanitized) → TemplateRenderer (SSR)
    → HTML response (cache headers) → CDN
```

- **Performance**: server-rendered via Next.js for fast first paint and SEO; published portfolio reads are cache-friendly (slug → data rarely changes except on republish) and cached at the edge/CDN with explicit invalidation on republish/unpublish.
- **SEO**: standard meta tags, Open Graph data, semantic HTML generated from `PortfolioData`; sitemap entry added on publish, removed on unpublish.
- **Security**: the public rendering path is a completely separate code path from the private dashboard — it queries only the `published` snapshot and only fields defined as public-safe. OAuth tokens, internal IDs, source-attribution metadata, and private account data are structurally excluded from the public data shape (not just hidden in the UI).
- **Responsiveness**: template contract (§16) requires responsive rendering as a baseline capability, independent of which template is later chosen.

---

## 21. Sharing Architecture

Sharing is a thin layer over the published portfolio: copy-URL and social-share use the canonical `/p/:slug` URL directly (no separate short-link system needed at V1). The architecture reserves space for a future QR-code generator and short-link service as additive, non-breaking features.

---

## 22. Background Job Architecture

Long-running operations (GitHub sync, LinkedIn sync, AI generation, large-profile processing) never run inline on the request/response cycle.

```
API request → create Job (status: queued) → return jobId immediately
     → Job Runner picks up job → Worker executes (service-layer call, not route logic)
     → Job updated (progress/result/error) → Frontend polls GET /jobs/:id (or subscribes)
```

- **V1 implementation**: a MongoDB-backed job collection with a simple in-process poller/worker (single job type per document: `type`, `status`, `payload`, `result`, `error`, `attempts`, timestamps). Sufficient for expected V1 load and operationally simple (no extra infrastructure).
- **Idempotency**: each job type is written to be safely retryable (e.g., a GitHub sync re-run overwrites/merges the same `SourceProfile`, it doesn't duplicate it).
- **Isolation**: jobs are always scoped to a single `userId`; a worker processing User A's job has no access path to User B's data beyond what the job's own scoped service calls allow.
- **Scaling path**: because job *creation* and job *execution* are already separated through this interface, migrating to Redis/BullMQ with dedicated worker processes later is a swap of the runner implementation — callers (`createJob(type, payload)`) do not change.

---

## 23. Database Architecture Overview

Detailed schemas belong to Step 5. Major domains identified here:

- **Users** — account, credentials (hashed), role, verification status
- **Sessions** — server-side session records for revocation support
- **Connections** — OAuth connection state per user per provider (GitHub/LinkedIn), encrypted tokens, status (`connected`/`needs_reauth`/`revoked`)
- **SourceProfiles** — raw, source-attributed data per provider per user
- **UnifiedProfiles** — normalized, merged professional profile per user
- **Portfolios** — portfolio record: owner, selected template, lifecycle status, slug
- **PortfolioVersions** — draft vs. published snapshots of `PortfolioData`
- **GenerationJobs** — AI generation attempts, inputs/outputs, validation results
- **Jobs** — generic background job records (sync, generation, processing)
- **Templates** — template registry metadata (no template content yet)
- **AuditLogs** — security-relevant and admin-relevant events

Relationships are conceptually one-owner-to-many-resources (`User 1—N Portfolio`, `User 1—N Connection`, `User 1—1 UnifiedProfile`, `Portfolio 1—N PortfolioVersion`), all foreign-keyed by `userId` for authorization enforcement at the query layer.

---

## 24. Caching Architecture

| Data | Cache? | Notes |
|---|---|---|
| GitHub API responses (per-user, short-lived) | Yes | Reduces rate-limit pressure; short TTL; keyed by user+resource, never shared across users |
| Published public portfolio data | Yes | Longest-lived; invalidated explicitly on republish/unpublish |
| Template registry metadata | Yes | Effectively static; invalidated on deploy |
| Draft/in-progress portfolio data | No | Must always reflect latest edit |
| AI generation results | Persisted (DB), not "cached" | Reused via generation history, not a TTL cache |
| Session data | Fast-lookup store (Mongo/Redis) | Not a general-purpose cache; correctness-critical |

V1 uses in-process memory caching where safe (single-instance-tolerant); the architecture assumes this is replaced by Redis once the backend runs multi-instance, since in-process caches would otherwise cause instance-inconsistent behavior. No sensitive per-user data (tokens, private profile fields) is ever cached in a shared/global cache.

---

## 25. Storage Architecture

Object storage (S3-compatible) for profile images, portfolio/project images, and future resume/PDF exports.

- **Upload flow**: client requests a pre-signed upload URL from the backend (backend validates ownership/quota first) → client uploads directly to object storage → backend records the resulting object reference.
- **Validation**: MIME-type allowlist, file-size limits, image dimension sanity checks enforced server-side before issuing the upload URL and re-validated on any server-side processing.
- **Access control**: private assets (if any) served via signed, time-limited URLs; public portfolio images served via CDN with long cache lifetimes.
- **Deletion**: object deletion is triggered by the owning record's deletion/edit flow (e.g., replacing a profile photo deletes the old object) — no orphaned-object cleanup relied upon manually at V1, but a periodic orphan-sweep job is noted as a future addition.

---

## 26. Logging Architecture

Structured, leveled logging (`DEBUG / INFO / WARN / ERROR / CRITICAL`) with a correlation/request ID attached to every log line for a given request or job.

**Categories:**
- **Application** — requests (method, route, status, duration), unhandled errors, key business events (portfolio published, connection made)
- **Security** — login, logout, failed login, password reset requested/completed, OAuth connect/disconnect, role/permission changes
- **Integrations** — GitHub/LinkedIn sync start/complete/fail, rate-limit hits, partial-sync outcomes
- **AI** — generation started/completed/failed, provider errors, validation failures (factuality rejections), token/cost metadata

**Never logged**: passwords, access/refresh tokens, session secrets, full OAuth payloads, unnecessary PII. Log statements are reviewed against this rule as part of code review (a lint rule or log-sanitizing wrapper is recommended in Step 8/10).

---

## 27. Admin/Observability Architecture

Admin APIs (role-gated, §8) expose read/operational visibility without exposing secrets:

- Users (search, status — not credentials)
- Portfolios (status, publish state)
- Generation jobs (status, failure reasons, cost aggregate — not raw prompts containing PII unless necessary and access-logged)
- Failed jobs / integration failures (for operational triage)
- AI usage aggregates
- System health (§37)
- Error rates
- Searchable/filterable audit log view (by user, action type, date range, severity)

The admin UI itself is specified later; this section only guarantees the backend exposes the necessary read APIs and that they are fully separated from user-facing APIs by the authorization layer.

---

## 28. Error Architecture

Centralized error handling via typed error classes and a single Express error-handling middleware.

**Categories**: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `GitHubIntegrationError`, `LinkedInIntegrationError`, `AIProviderError`, `DatabaseError`, `RateLimitError`, `PublishingError`.

Each maps to a safe HTTP status and a **generic, user-safe message**; internal details (stack traces, provider error bodies, query specifics) are logged with the request's correlation ID but never sent to the client. The frontend receives a consistent `{ error: { code, message, requestId } }` shape it can render uniformly.

---

## 29. API Architecture Principles

(Full endpoint list is Step 5.) Principles governing all endpoints:

- **Versioning**: `/api/v1/...` prefix from day one.
- **Auth**: every non-public route requires a valid session; public routes are explicitly and narrowly defined (`/api/v1/public/portfolios/:slug`).
- **Validation**: every input validated against a schema before reaching business logic.
- **Consistent response envelope**: `{ data }` on success, `{ error }` on failure.
- **Pagination**: cursor or offset pagination on all list endpoints (repos, portfolios, logs) — never unbounded result sets.
- **Rate limiting**: per-user and per-IP limits, tighter on auth and AI-generation endpoints.
- **Idempotency**: mutation endpoints that trigger jobs (sync, generate) are safe to retry (return the existing in-flight job rather than duplicating it).
- **Correlation IDs**: every request gets a request ID, propagated into logs and returned in error responses for support/debugging.

---

## 30. Security Architecture

High-level only — full spec in Step 8.

- Authentication & authorization as defined in §7–8.
- Passwords hashed with a modern algorithm (bcrypt/argon2), never stored/logged in plaintext.
- OAuth tokens encrypted at rest; decrypted only in-memory at point of use.
- HTTPS enforced everywhere (including internal calls where applicable); HSTS enabled.
- Input validation on every endpoint; output encoding to prevent XSS in any user-generated content rendered on public portfolios.
- CSRF considered for cookie-based session auth (SameSite cookies + CSRF token on state-changing requests from browser contexts).
- Rate limiting and IDOR prevention as in §8/§29.
- Secure HTTP headers (CSP, X-Frame-Options, etc.).
- Centralized secret management (environment/secret manager, never source control).
- Audit logging for security-relevant events (§26).
- Data deletion supports account-deletion requests end-to-end (§7.2).

---

## 31. Multi-user Architecture

Every design decision above already assumes concurrent, isolated multi-tenancy; this section states the guarantees explicitly:

- **No shared/global state** for user data anywhere in the backend — every query is scoped by `userId`.
- **Sessions** are per-user, independently issued and revocable; no session data is ever reused across requests from different users (no in-memory "current user" globals).
- **Jobs** are created per-user-action and processed independently; the job runner has no cross-job shared mutable state beyond the queue itself.
- **Slugs** are enforced unique at the database level (unique index), with collision handled by suggesting an alternative rather than silently failing or overwriting.
- **Caching** never keys purely on a resource ID without the owning user where the data is private (public portfolio cache is the deliberate exception, since it's public by definition).
- **Concurrent edits** to the same user's own portfolio are handled at section-save granularity (§17); concurrent *different* users acting simultaneously are fully independent by construction (no shared mutable resources between them).

---

## 32. Scalability

| Scale | Primary bottleneck | Response |
|---|---|---|
| 100 → 1,000 users | None significant | Current architecture holds |
| 1,000 → 10,000 users | GitHub API rate limits, AI provider throughput/cost, single-instance job runner | Add per-user request caching/backoff tuning (already designed in); move job runner to Redis/BullMQ; add read replica or connection pool tuning for MongoDB |
| 10,000 → 100,000+ users | Backend CPU/IO under concurrent AI + sync jobs; public portfolio read traffic | Horizontally scale backend instances (stateless API, session store externalized to Mongo/Redis so any instance can serve any request); dedicated worker processes for jobs; CDN + aggressive public-portfolio caching to keep read traffic off the origin; consider extracting `generation` and `github`/`linkedin` sync into separately scaled services (enabled by their existing module boundaries) |

Nothing above requires a rewrite — each step is an infrastructure/deployment change against interfaces already defined in this document (job runner interface, cache interface, stateless API design).

---

## 33. Reliability

- **Timeouts** on every external call (GitHub, LinkedIn, AI provider).
- **Retries with backoff** for transient failures (network errors, 5xx, rate-limit-with-retry-after); no retry on 4xx client errors that won't succeed on repeat.
- **Graceful degradation**: e.g., if LinkedIn sync fails, GitHub-derived and user-entered data still produce a usable profile; if AI generation fails, the user retains their existing `PortfolioData` and can retry or edit manually.
- **Idempotency**: job creation and job execution are both safe to retry (§22, §29).
- **Failure isolation**: a failing background job updates its own status/error and does not affect other jobs, requests, or users.
- **Data consistency**: writes to `UnifiedProfile`/`PortfolioData` go through validated service methods, not ad hoc partial updates, to avoid leaving documents in an inconsistent shape.
- **Backups**: managed MongoDB automated backups with defined retention (finalize retention window in Step 8/11); periodic restore-test as an operational practice.
- **Recovery**: documented runbook (Step 11) for restoring from backup and replaying/resuming interrupted jobs.

---

## 34. Deployment Architecture

```
Frontend  → Next.js hosting (SSR-capable platform + CDN for static/public assets)
Backend   → Node/Express hosting (containerized, horizontally scalable)
Database  → Managed MongoDB (Atlas or equivalent)
Storage   → S3-compatible object storage
CDN       → In front of public portfolio pages and static/image assets
External  → GitHub API, LinkedIn API, AI provider (all outbound, credentialed via secrets)
```

Frontend and backend are deployed as separate services communicating over HTTPS, allowing independent scaling and deployment cadence.

---

## 35. Environment Architecture

Three isolated environments: **Development, Staging, Production** — each with its own database, its own OAuth app registrations (distinct callback URLs per environment), its own AI provider keys/limits, and its own secret store. No environment shares credentials or data with another. Logging verbosity is higher (DEBUG) in development/staging and restricted (INFO+) in production. All secrets are injected via environment variables/secret manager at deploy time — never committed to source control (enforced via secret-scanning in CI, see §36).

---

## 36. CI/CD Architecture

```
Git push → Lint → Type check → Unit tests → Build
   → Integration tests → Deploy to Staging → Automated + manual validation
   → Deploy to Production (with rollback capability)
```

Recommended branch strategy: trunk-based development with short-lived feature branches, protected `main`, required passing checks before merge, and an explicit release/deploy step from `main` to Staging then Production (not automatic prod-on-merge at this project stage). Production deploys must support fast rollback to the previous known-good build/image.

---

## 37. Monitoring & Health Checks

Monitored surfaces: API availability/latency, database connectivity, background job queue depth and failure rate, GitHub integration health (error/rate-limit rate), LinkedIn integration health, AI provider health (error rate, latency, cost trend), overall error rate, public portfolio availability/latency.

A `/health` endpoint reports backend + database connectivity for load-balancer/orchestrator health checks; a separate internal `/health/deep` (admin-only) can report integration and job-runner status for operational dashboards.

---

## 38. Data Flow Diagrams

**Authentication**
```
Browser → POST /auth/login → validate credentials → create session → set secure cookie → 200
```

**GitHub synchronization**
```
User clicks "Sync GitHub" → API creates Job(type: github_sync) → 202 + jobId
Worker → GitHubClient (paginated fetch) → raw data → SourceProfile(github) saved
     → Normalization triggered → UnifiedProfile updated → Job(status: complete)
Frontend polls Job → shows result
```

**LinkedIn synchronization** — same shape as GitHub, via `LinkedInClient` and `SourceProfile(linkedin)`, with explicit handling of partial/limited data (§10).

**Unified profile creation**
```
SourceProfile(github) + SourceProfile(linkedin) + user-entered fields
   → Normalization pipeline → conflict resolution by priority (§13) → UnifiedProfile saved
   → completeness score recomputed
```

**AI generation**
```
User clicks "Generate Portfolio" → API creates Job(type: ai_generation) → 202 + jobId
Worker → AI Input Builder (from UnifiedProfile) → AIProvider.generate()
   → schema validation → factuality validation
   → pass: PortfolioData saved (status: generated), Job complete
   → fail: Job(status: failed, reason), UnifiedProfile untouched, user notified
```

**Portfolio editing**
```
Editor loads PortfolioData → user edits section → autosave → PATCH /portfolios/:id/sections/:section
   → validate → persist → preview re-renders via TemplateRenderer
```

**Publishing**
```
User clicks Publish → validate required sections + slug → snapshot PortfolioData as PortfolioVersion(published)
   → Portfolio.status = published → cache invalidated for slug → 200 + public URL
```

**Public portfolio request**
```
Browser → GET /p/:slug → slug lookup → published PortfolioVersion (sanitized)
   → TemplateRenderer (SSR) → HTML → CDN cache → Browser
```

**Admin observability**
```
Admin → GET /admin/... (role-checked) → aggregate reads across Users/Portfolios/Jobs/AuditLogs (read-only, no secret fields) → Admin UI
```

---

## 39. Security Boundary Diagram

```
                         PUBLIC INTERNET
                               │
                 ┌─────────────┴─────────────┐
                 │                            │
        Public routes (no auth)      Frontend app shell
        /p/:slug, /login, /register  (auth-required routes render only
                 │                    after client has a valid session)
                 └─────────────┬─────────────┘
                               ▼
                     ┌───────────────────┐
                     │   Backend API      │  ← session validated here (real boundary)
                     │  auth + authz mw   │  ← ownership/role enforced here
                     └─────────┬──────────┘
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
      Protected Services   Admin Services   Public Read Service
      (own-data only)      (role: admin)    (published data only)
             │                 │                 │
             └────────┬────────┴────────┬────────┘
                       ▼                 ▼
                   MongoDB          Object Storage
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   GitHub API     LinkedIn API    AI Provider
   (server-side only — tokens/keys never reach the browser)
```

Sensitive credentials (OAuth tokens, AI provider keys, DB credentials) exist **only** inside the Backend API's server-side environment/secret store and the database (tokens encrypted at rest). Nothing in the Frontend bundle, browser storage, or public API responses ever contains them.

---

## 40. Architectural Decision Records

**ADR-001 — Modular Monolith vs. Microservices**
Decision: Modular monolith at launch.
Reason: Matches current team/product scale; avoids distributed-systems overhead before it's needed.
Alternatives: Microservices from day one.
Tradeoffs: Slightly weaker failure isolation now; mitigated by job isolation and per-module service boundaries.
Future: `generation` and source-sync modules are the most likely first extraction candidates as they are naturally isolated already.

**ADR-002 — Session-Based Application Authentication**
Decision: Server-side sessions with secure, HttpOnly cookies rather than client-held JWTs for platform login.
Reason: Enables real-time server-side revocation (logout everywhere, admin-forced logout) which stateless JWTs complicate.
Alternatives: JWT access/refresh token pair.
Tradeoffs: Requires a session store lookup per request (mitigated with Redis at scale) vs. JWT's stateless verification.

**ADR-003 — GitHub Integration via Official OAuth/API Only**
Decision: All GitHub data comes through authorized API calls under user-granted scopes.
Reason: Legitimacy, reliability, ToS compliance, and a stable data contract.
Alternatives: Scraping public profile pages.
Tradeoffs: Bounded by API-available fields and rate limits (mitigated by caching/backoff, §9).

**ADR-004 — LinkedIn Integration via Officially Supported APIs Only, with Manual Fallback**
Decision: No scraping; explicitly designed for partial/limited automatic data with structured manual fallback (§10).
Reason: LinkedIn's third-party API access is restrictive by design; scraping is against terms and unreliable.
Alternatives: Unofficial scraping (rejected — legal/ToS/reliability risk).
Tradeoffs: Users will likely need to manually enter more LinkedIn-sourced fields than GitHub-sourced ones; UX must set this expectation clearly.

**ADR-005 — AI Provider Abstraction**
Decision: All AI access goes through an internal `AIProvider` interface; no direct vendor SDK calls outside `modules/generation`.
Reason: Avoid vendor lock-in, enable provider swaps/multi-provider fallback later, and centralize factuality/schema validation.
Alternatives: Direct vendor SDK usage scattered where needed.
Tradeoffs: A thin extra abstraction layer to maintain, justified by the swap-ability and safety guarantees it buys.

**ADR-006 — PortfolioData as a Stable Contract**
Decision: A single, versioned `PortfolioData` schema mediates between content (AI/edits) and rendering (templates).
Reason: Enables "don't build templates yet" without risk — future templates plug into a contract that already exists and won't need to change when content generation logic evolves.
Alternatives: Let templates read `UnifiedProfile`/AI output directly (rejected — couples rendering to content-generation internals).

**ADR-007 — Template Architecture Deferred, Seam Defined Now**
Decision: Build `TemplateRegistry`/`TemplateRenderer` interfaces now; build zero actual templates now.
Reason: Explicit product requirement; avoids wasted design work before templates are researched/selected.
Alternatives: Build one template now as a reference implementation (deferred — noted as a good idea for Step 5/6 onward, not Step 4).

**ADR-008 — Background Job Strategy: In-Process + MongoDB, Redis/BullMQ Later**
Decision: V1 uses a MongoDB-backed job collection with a simple runner; interface designed for a drop-in Redis/BullMQ replacement.
Reason: Avoids introducing Redis/infrastructure before load justifies it, while not blocking the future migration.
Alternatives: Redis/BullMQ from day one.
Tradeoffs: In-process runner requires care around multi-instance deployment (must externalize job claiming, e.g., via atomic Mongo findOneAndUpdate) before horizontally scaling the backend — flagged as a required step before that scaling stage (§32).

**ADR-009 — Public Portfolio Rendering: SSR + CDN Cache, Fully Separated from Dashboard**
Decision: Public portfolios are server-rendered via a route/data path structurally separate from authenticated dashboard APIs, cached at the CDN.
Reason: SEO, performance, and a hard security boundary against private-data leakage (§20, §39).
Alternatives: Client-side rendering of public portfolios (rejected — worse SEO/perf).

**ADR-010 — Logging/Observability Strategy: Structured Leveled Logs + Correlation IDs, No Secret Logging**
Decision: All logs structured, leveled, correlation-ID tagged; secrets/tokens/passwords are never logged, enforced by convention now and recommended tooling (log-sanitizing wrapper/lint rule) in Step 8/10.
Reason: Debuggability and compliance without creating a secondary secret-leak surface.
Alternatives: Ad hoc `console.log` (rejected).

---

## 41. Architecture Risks

| Risk | Mitigation |
|---|---|
| LinkedIn API access limitations (restrictive scopes/approval) | Design explicitly assumes partial data + manual fallback (§10); do not build product promises around fields that may be unavailable |
| GitHub API rate limits at scale | Proactive backoff, per-user caching, background sync rather than sync-on-every-page-load |
| AI hallucination | Factuality validation step (§14) rejects unmatched entities before persistence |
| AI cost growth | Per-generation cost tracking, rate limiting, regeneration scoped to sections rather than full re-generation by default |
| OAuth token security | Encryption at rest, never sent to browser, scoped minimally, revocation handled gracefully |
| Public portfolio traffic spikes | CDN caching, SSR with cache headers, public path isolated from authenticated backend load |
| Data privacy (source data, PII) | Source data separated from portfolio data (§11); public rendering path structurally excludes private fields (§20, §39) |
| Database growth (repos, jobs, generation history) | Indexing strategy and retention/archival policy to be finalized in Step 5/11 (e.g., trimming old job records) |
| Concurrent edits | Section-level save granularity limits blast radius (§17); revisit if collaborative editing is ever added |
| Background job reliability | Idempotent job handlers, status/error tracking, retry policy (§22, §33) |
| Third-party outages (GitHub/LinkedIn/AI) | Timeouts, retries, graceful degradation — failures isolated to the affected feature (§33) |
| Template compatibility with future `PortfolioData` changes | Schema versioning on `PortfolioData` (§15) with explicit migration handling |

---

## 42. Open Architectural Questions

1. **Session store for production scale**: MongoDB-backed sessions vs. introducing Redis at launch vs. at first scale milestone — recommend deciding in Step 8 based on expected concurrency.
2. **Email verification**: mandatory before any action, or only before publishing? Affects auth flow detail in Step 5.
3. **LinkedIn API access tier**: exact scopes/fields available depend on LinkedIn's current partner program approval — must be confirmed before Step 5 finalizes the `SourceProfile(linkedin)` shape.
4. **AI provider selection and fallback**: single provider at launch, or design for automatic fallback to a second provider on outage? Cost/latency tradeoff to decide before Step 7.
5. **Data retention policy**: how long generation history, source data, and audit logs are retained before archival/deletion — needed for Step 8 (privacy) and Step 11 (storage cost).
6. **Multi-session UX**: is a user-facing "active sessions/devices" management screen in scope for V1, or a later addition? Backend already supports it (§7.1); frontend scope is a product decision.
7. **Collaborative/team portfolios**: explicitly out of scope for this architecture (single-owner model throughout) — flag if product direction changes, as it would affect §8, §17, and §31 materially.

---

## 43. What Step 5 Must Define

Step 5 (Backend Specification — Database + API) must take this architecture and produce:

- Full MongoDB schema for every domain in §23 (fields, types, indexes, validation rules)
- Complete REST API endpoint list per module, following the principles in §29 (routes, methods, request/response shapes, status codes)
- Detailed authentication/session data model (session document shape, token structure)
- Detailed `SourceProfile`, `UnifiedProfile`, and `PortfolioData` field-level schemas (including provenance metadata from §13)
- Job document schema and job-type-specific payload/result shapes
- Concrete rate-limit values per endpoint class
- Concrete pagination parameters/defaults

---

## Final Architecture Summary

### Technology Stack
Next.js/TypeScript/Tailwind (frontend) · Node.js/Express/TypeScript modular monolith (backend) · MongoDB (database) · S3-compatible object storage · in-process job runner with a defined migration path to Redis/BullMQ · CDN in front of public/static content · provider-agnostic AI abstraction.

### Major Components
Auth & session management · GitHub integration module · LinkedIn integration module · Normalization pipeline · Unified Profile · AI generation service (provider-agnostic, factuality-validated) · PortfolioData contract · Template registry (seam only, no templates yet) · Portfolio editor · Publishing & slug management · Public portfolio renderer (SSR + CDN) · Background job system · Admin/observability layer.

### Data Flow
`Source Integrations → Source Data → Normalization → Unified Profile → AI → PortfolioData → Template Renderer → Published Portfolio`, with authentication/authorization enforced at every layer and every resource strictly scoped to its owning user.

### Security Boundaries
Real authorization boundary is the backend API (not the frontend). Public portfolio rendering is a structurally separate, sanitized path. OAuth tokens and provider credentials never leave the server. Admin routes require a persisted role check on every request.

### Scalability Strategy
Stateless, horizontally scalable API; externalized session/job state before multi-instance scaling; CDN-cached public traffic; module boundaries already in place to extract `generation` and sync services independently if/when needed.

### Reliability Strategy
Timeouts + retries + backoff on every external call; idempotent, isolated background jobs; graceful degradation per integration; validated writes; managed backups with a documented recovery path.

### Observability Strategy
Structured, leveled, correlation-ID-tagged logs across application/security/integration/AI categories, with a strict no-secrets-logged rule; admin-facing searchable audit log and operational health views.

### Major Architectural Decisions
See §40 (ADR-001 through ADR-010) — modular monolith, session-based app auth, official-API-only integrations, AI provider abstraction with factuality validation, `PortfolioData` as a stable versioned contract, deferred-but-seamed template system, incrementally scalable job system, structurally separated public rendering, and a strict no-secret-logging observability policy.

### Major Risks
LinkedIn API limitations, GitHub rate limits, AI hallucination/cost, OAuth token security, public traffic scaling, data privacy boundaries, database growth, job reliability, third-party outages, and future template/schema compatibility — each with a mitigation defined in §41.

### Open Architectural Questions
Session store timing, email-verification scope, exact LinkedIn API access tier, AI provider fallback strategy, data retention policy, multi-session UX scope, and collaborative-portfolio scope — listed in §42 for resolution in subsequent steps.

### What Step 5 Must Define
Full database schemas, complete API endpoint specification, detailed auth/session and profile/portfolio field-level models, job schemas, and concrete rate-limit/pagination values — see §43.
