# STEP-07-AI-DATA-INTEGRATION-SPECIFICATION.md

**Project:** AI-Powered Portfolio Generator
**Document:** Step 7 — AI + Data Processing + Integration Specification
**Status:** Draft for implementation
**Depends on:** PROJECT-CONTEXT-STEP-07.md (source of truth for prior steps 1–6)

---

## 1. Executive Summary

This document specifies the source-integration, data-normalization, and AI-generation pipeline that transforms raw professional data (GitHub, LinkedIn, user input, future sources) into validated, factual, structured `PortfolioData` ready for template rendering.

The pipeline enforces three non-negotiable principles carried over from the project context:

1. **Provenance is preserved end-to-end.** Every fact in the system can be traced to a source (GitHub, LinkedIn, User, Derived, AI).
2. **AI never invents facts.** AI is restricted to organizing, rewriting, and presenting information that already exists in the Unified Professional Profile.
3. **User intent always wins.** Manual edits are authoritative and are never silently overwritten by synchronization or regeneration.

This specification defines contracts, schemas, state machines, sequence flows, and matrices sufficient for a production engineering team to implement the system without further product clarification. It does not contain application code, API implementations, OAuth implementations, UI components, or portfolio templates — those belong to other steps/documents.

---

## 2. Core Data Pipeline

```
GitHub | LinkedIn | User Input | Future Sources
        │
        ▼
 Source Connectors  (connect, authorize, fetch, paginate, normalize, sync, disconnect)
        │
        ▼
   Raw Source Data   (immutable snapshot, private, versioned)
        │
        ▼
   Normalization      (per-source mapper → canonical entities)
        │
        ▼
   Deduplication       (confidence-scored entity matching)
        │
        ▼
 Unified Professional Profile (merged, attributed, override-aware)
        │
        ▼
   Data Quality Engine (completeness, conflicts, staleness)
        │
        ▼
   AI Input Builder     (context assembly, source/user/derived tagging)
        │
        ▼
   AI Generation         (provider-agnostic, operation-scoped)
        │
        ▼
   Structured Output (raw model response)
        │
        ▼
   Validation Pipeline (schema, business rules)
        │
        ▼
   Factuality Checks (cross-reference against Unified Profile)
        │
        ▼
   PortfolioData        (canonical, versioned, section-addressable)
        │
        ▼
   User Review / Edit   (overrides recorded, protected from regeneration)
        │
        ▼
   Template Rendering → Publish
```

Each stage is a discrete, independently testable module with a well-defined input/output contract. No stage may skip validation of the stage before it.

---

## 3. Source Connector Architecture

### 3.1 Purpose

Provide a single abstraction so that controllers, sync jobs, and the AI Input Builder never contain provider-specific logic.

### 3.2 Interface Contract (`SourceConnector`)

Every connector (GitHub, LinkedIn, and any future source) implements the same conceptual contract:

| Method | Responsibility |
|---|---|
| `connect(userId, authPayload)` | Establish a connection record; store encrypted tokens |
| `authorize(scopes)` | Initiate authorization flow with the provider |
| `handleCallback(payload)` | Exchange authorization result for tokens |
| `fetchProfile()` | Retrieve provider profile data |
| `fetchCollections()` | Retrieve repositories / experience / education / etc. |
| `paginate(cursor)` | Retrieve next page of a collection |
| `normalize(rawPayload)` | Convert raw provider data into canonical entities |
| `sync(mode: full \| incremental)` | Orchestrate a full connector sync cycle |
| `refreshToken()` | Renew an expiring/expired token |
| `disconnect()` | Revoke tokens and mark connection inactive |
| `deleteData()` | Remove raw and derived data tied to the connection |

### 3.3 Connector Registry

A `ConnectorRegistry` maps a `sourceType` enum (`GITHUB`, `LINKEDIN`, future values) to a connector implementation. Controllers and the sync engine depend only on the registry and the `SourceConnector` interface — never on a concrete connector class.

### 3.4 Adding a Future Connector

To add a new source (e.g., Behance):

1. Implement `SourceConnector` for the new provider.
2. Add a normalization mapper (`BehanceMapper`) producing canonical entities (Section 6).
3. Register the connector in the registry.
4. Add source-type enum value and attribution label.
5. No changes required to: normalization engine core, deduplication engine, AI Input Builder, PortfolioData schema, or validation pipeline.

This is the extensibility guarantee required by Section 34/38 of the project context.

---

## 4. GitHub Integration

### 4.1 OAuth & Scopes

- Standard OAuth 2.0 authorization-code flow against GitHub's official OAuth endpoints.
- Minimum scopes: read access to public profile and public repository metadata. Request the narrowest scope that satisfies the feature set; do not request write or org-admin scopes.
- State parameter (CSRF token) generated per authorization attempt, single-use, short TTL.

### 4.2 Authorization Flow

1. User initiates "Connect GitHub."
2. Backend generates `state`, stores it against the user's session, redirects to GitHub's authorize URL with requested scopes.
3. GitHub redirects back to the registered callback URL with `code` and `state`.
4. Backend validates `state`, exchanges `code` for an access token (and refresh token if supported).
5. Tokens are encrypted at rest and associated with a `SourceConnection` record (`userId`, `sourceType=GITHUB`, `status=CONNECTED`).

### 4.3 Token Lifecycle

- Store: access token, refresh token (if applicable), expiry, granted scopes, obtained-at timestamp.
- Refresh proactively before expiry when the provider supports refresh tokens; otherwise prompt re-authorization.
- On `401/403` from the API: mark connection `status=NEEDS_REAUTH`, surface to user, do not silently drop existing normalized data.
- On explicit revocation (webhook, or detected via failed calls): mark `status=REVOKED`, stop scheduled syncs, retain existing normalized data until user requests deletion.

### 4.4 API Client

- Central `GitHubApiClient` wraps HTTP calls: authentication header injection, pagination helper, rate-limit header inspection, retry-with-backoff, timeout enforcement, structured error mapping.
- Pagination: cursor/page-based, following the provider's pagination convention; connector iterates until no further pages or a configured max-page safety cap is reached.
- Rate limits: read remaining-quota headers on every response; when quota is low, pause and schedule continuation; when exhausted, defer sync and record `RATE_LIMITED` status with retry-after time.

### 4.5 Data Retrieved

**Profile:** username, display name, avatar URL, bio, location, website, public profile URL.

**Repositories (per repo):** name, description, URL, topics, primary language + language breakdown, star count, fork count, license, visibility (public only), created date, updated date, README content (fetched only when needed for project description generation, treated as untrusted text — see Section 19).

### 4.6 Normalization

- Profile → canonical `Person` fields (name, headline candidate, avatar, location, links).
- Repository → canonical `Project` entity (Section 6.5), with `sourceType=GITHUB`, `sourceRecordId=repo.id`.
- Language/topic lists → candidate `Skill` entities marked `derived=true`, `confidence=LOW` until corroborated by another source or confirmed by the user.

### 4.7 Synchronization

- Full sync: fetch profile + all repositories.
- Incremental sync: use stored `lastSyncedAt` plus the provider's "updated since" filtering where the API supports it; otherwise fetch repository list and diff `updatedAt` timestamps against stored raw snapshots, only re-normalizing changed items.
- Deleted repositories: detected when a previously-synced repo is absent from the latest fetch; canonical `Project` entities sourced from GitHub are marked `sourceRemoved=true` (not silently deleted, since a user override may exist).

### 4.8 Disconnect & Deletion

- Disconnect: revoke token with provider where supported, set `status=DISCONNECTED`, stop future syncs.
- Deletion: purge raw snapshots and, on explicit user confirmation, remove GitHub-sourced normalized fields that have no user override; fields with user overrides are retained as user data with source reference cleared.

---

## 5. LinkedIn Integration

### 5.1 Guiding Constraint

Only officially supported LinkedIn APIs and granted OAuth scopes are used. Scraping is explicitly out of scope and must never be implemented as a fallback.

### 5.2 Availability Split

| Available through official API (subject to current partner/product access) | Not guaranteed / not available |
|---|---|
| Basic profile (name, headline, profile picture) where scope granted | Full work-experience history |
| Authenticated member's own public profile URL | Education history |
| Email address (if scope granted and product access approved) | Skills, endorsements, certifications |
| | Connections, recommendations |
| | Any second/third-party profile data |

Because LinkedIn's partner-product access materially restricts what a general application can retrieve, the system must treat rich professional history (experience, education, skills, certifications) as **not reliably available via API** unless the product has explicit, approved access to a LinkedIn partner program that grants it. The specification below is written for both cases.

### 5.3 Authorization Flow

Identical structural pattern to GitHub (Section 4.2): state-validated OAuth 2.0 authorization-code flow, encrypted token storage, scoped access.

### 5.4 Degraded / Manual-Fallback Behavior

When a requested field is not obtainable via the granted scope/product access:

1. The connector reports the field as `UNAVAILABLE_VIA_API` (not `null` silently).
2. The UI (Step 6) is informed via the sync result so it can prompt manual entry.
3. Manually entered values are stored as canonical entities with `sourceType=USER`, `verified=false` (verified in the sense of "externally verified"; user-entered is still authoritative per Section 7).
4. The system must never mark manually entered data as "LinkedIn-verified."

### 5.5 Token Lifecycle & Failure Handling

Same lifecycle pattern as GitHub (Section 4.3): expiry tracking, refresh where supported, `NEEDS_REAUTH` on auth failure, `REVOKED` on revocation, no destructive action on existing normalized data.

### 5.6 Disconnect & Deletion

Same pattern as Section 4.8, applied to LinkedIn-sourced raw and normalized data.

---

## 6. Raw Source Data

### 6.1 What Is Stored

The verbatim (or minimally-flattened) API response for each fetch operation, keyed by `sourceConnectionId`, `resourceType` (e.g., `PROFILE`, `REPOSITORY`), `sourceRecordId`, and `fetchedAt`.

### 6.2 Why

Traceability, re-normalization after mapper improvements, debugging sync issues, and incremental-sync diffing.

### 6.3 Storage & Versioning

- Stored in a private, non-public-readable store (not the same table/bucket as public portfolio content).
- Each fetch creates a new versioned snapshot rather than overwriting in place, up to a configurable retention window (e.g., last N snapshots or last N days), after which older snapshots are pruned.
- Snapshots are never rendered directly to any public endpoint.

### 6.4 Retention & Deletion

- Default retention: bounded (e.g., 90 days or last 5 snapshots per resource) — exact value is a product/legal decision to be confirmed (see Open Questions).
- On disconnect: raw data retained until deletion is requested or retention expires, whichever comes first, so re-connection doesn't force a full re-sync unnecessarily.
- On explicit "delete my data": raw data purged immediately and irreversibly; normalized data handled per Section 4.8/5.6.

### 6.5 Access Control

Raw data is accessible only to: the owning user (for transparency/export features), internal sync/normalization processes, and support/debug tooling under audit logging. No public or cross-user access path exists.

---

## 7. Normalization

### 7.1 Canonical Entity Schemas

**Person**
```
id, userId, fullName, headline, avatarUrl, location, bio, websiteUrl,
sources: [ { sourceType, sourceRecordId, fetchedAt } ]
```

**Experience**
```
id, personId, title, company, companyNormalizedName, startDate, endDate,
isCurrent, description, location, sourceType, sourceRecordId,
confidence, userOverride: boolean
```

**Education**
```
id, personId, institution, degree, fieldOfStudy, startDate, endDate,
sourceType, sourceRecordId, userOverride: boolean
```

**Skill**
```
id, personId, name, normalizedName, category, sourceTypes: [enum],
confidence, userOverride: boolean
```

**Project**
```
id, personId, name, description, url, topics: [string], languages: [string],
stars, forks, license, createdAt, updatedAt, sourceType, sourceRecordId,
userOverride: boolean, sourceRemoved: boolean
```

**Certification**
```
id, personId, name, issuer, issueDate, expiryDate, credentialUrl,
sourceType, sourceRecordId, userOverride: boolean
```

**Achievement**
```
id, personId, title, description, date, relatedEntityId (optional link
to Experience/Project), sourceType (USER | DERIVED), userOverride: boolean
```

**SocialLink**
```
id, personId, platform, url, sourceType, verified: boolean
```

Every entity carries `sourceType ∈ { GITHUB, LINKEDIN, USER, DERIVED, AI }`, a `sourceRecordId` when applicable, and timestamps (`importedAt`, `lastSyncedAt`).

### 7.2 Mapping Rules

Each connector supplies a `Mapper` (`GitHubMapper`, `LinkedInMapper`, `UserInputMapper`) whose sole job is: raw provider shape → canonical entity shape above. Mappers must:

- Standardize dates to ISO-8601; unresolved partial dates (e.g., "2019") are stored with `precision=YEAR`.
- Standardize URLs (protocol enforcement, trailing-slash normalization) — see Section 20 for security validation, which is separate from formatting normalization.
- Never drop fields silently; unmapped raw fields remain in Raw Source Data for future mapper improvements (Section 6).
- Preserve `sourceRecordId` so the same upstream record always normalizes to the same canonical entity (idempotent normalization).

---

## 8. Deduplication

### 8.1 Matching Dimensions

| Entity | Matching signals |
|---|---|
| Project | normalized URL, normalized name, name similarity + overlapping description |
| Experience (company) | normalized company name (legal-suffix stripping, casing), overlapping date range |
| Skill | normalized skill name via alias table (e.g., "React.js" → "react") |
| Education | normalized institution name + overlapping date range |

### 8.2 Confidence States

`MATCHED` (auto-merge safe — e.g., identical normalized URL), `POSSIBLE_MATCH` (surfaced to user for confirmation), `DISTINCT` (no merge), `NEEDS_REVIEW` (conflicting signals, e.g., same name but non-overlapping dates).

### 8.3 Algorithm Outline

1. Exact-key match (normalized URL / normalized name+company) → `MATCHED`.
2. Fuzzy string similarity above a high threshold + secondary signal agreement (dates overlap, same domain) → `POSSIBLE_MATCH`.
3. Fuzzy similarity in a mid band, or partial signal agreement → `NEEDS_REVIEW`.
4. Below threshold → `DISTINCT`.

`MATCHED` entities are merged automatically (attribution list combines both sources). `POSSIBLE_MATCH`/`NEEDS_REVIEW` are surfaced in the review UI (Step 6) as pending resolutions; they are **not** merged until the user confirms or rejects.

### 8.4 Skill Alias Table

A maintained alias/synonym table (e.g., `react.js`, `reactjs`, `react` → canonical `React`) drives skill-name normalization. New unmapped skill strings are stored as-is with `normalizedName` equal to a lowercased/trimmed form, and are candidates for alias-table growth over time.

---

## 9. Source Attribution

Every normalized field capable of independent provenance stores:

```
source: {
  sourceType: GITHUB | LINKEDIN | USER | DERIVED | AI,
  sourceRecordId: string | null,
  importedAt: timestamp,
  lastSyncedAt: timestamp | null,
  verificationStatus: VERIFIED_EXTERNAL | UNVERIFIED | USER_ASSERTED,
  userOverride: boolean
}
```

This structure is what powers both the "why is this here" UI affordance and the factuality checker's ability to confirm a claim is grounded (Section 21).

---

## 10. User Overrides

### 10.1 Rule

Any field with `userOverride=true` is authoritative. Synchronization processes must:

1. Fetch and normalize the latest source value as usual (into a "latest source value" holding field, not the display field).
2. Compare against the current authoritative value.
3. If `userOverride=true`, do **not** replace the display field; optionally flag `sourceValueChanged=true` so the UI can tell the user "GitHub now shows a different value — keep your edit or update?"
4. If `userOverride=false`, the newly normalized value becomes the display value.

### 10.2 Restore-to-Source

Because the "latest source value" is retained alongside the override, the UI can offer "revert to GitHub/LinkedIn value," which sets `userOverride=false` and copies the source value into the display field.

### 10.3 Where Overrides Are Set

Any direct user edit of a field previously populated by a connector sets `userOverride=true` on that field automatically. AI-suggested edits accepted by the user (Section 23) also set `userOverride=true`, since the user has now confirmed that content.

---

## 11. Synchronization Engine

### 11.1 Lifecycle

```
REQUEST → JOB CREATED → FETCH → VALIDATE RESPONSE → STORE RAW
   → NORMALIZE → DEDUPLICATE/MERGE → RECALCULATE QUALITY → COMPLETE
```

### 11.2 Job Model

```
SyncJob {
  id, userId, sourceConnectionId, sourceType, mode: FULL | INCREMENTAL,
  status: QUEUED | RUNNING | PARTIAL_SUCCESS | SUCCEEDED | FAILED,
  startedAt, finishedAt, errors: [ { stage, message, retryable } ],
  itemsFetched, itemsNormalized, itemsFailed
}
```

### 11.3 Duplicate / Concurrent Sync Prevention

- Before creating a job, check for an existing `QUEUED` or `RUNNING` job for the same `sourceConnectionId`; if present, return the existing job reference instead of creating a new one (idempotent request).
- A per-connection lock (advisory lock / distributed lock) held for the duration of the job prevents two workers from processing the same connection concurrently.

### 11.4 Partial Failure Handling

- Each fetched item is validated and normalized independently; failure on one repository/experience item does not abort the whole job.
- Job completes as `PARTIAL_SUCCESS` when some items failed; failed items are recorded with reason and retried on the next scheduled sync.
- Previously successfully normalized data is never rolled back because of a later partial failure — sync is additive/corrective, not destructive, per Section 37.

### 11.5 Retry, Rate Limits, Token Expiry

- Transient errors (timeout, 5xx, network) → bounded retry with exponential backoff (Section 27).
- Rate-limit response → job paused, rescheduled after the provider's indicated reset window, status `RATE_LIMITED`.
- Auth failure (401/expired token) → attempt one token refresh; if refresh fails, mark connection `NEEDS_REAUTH` and fail the job with a non-retryable, user-actionable error.

---

## 12. Incremental Sync

### 12.1 When Used

Default mode for any sync after the first successful full sync, unless: the user explicitly requests "full re-sync," the connector detects its normalization mapper version has changed (requiring re-normalization of all raw snapshots), or the last full sync exceeds a staleness threshold (e.g., 30 days), which forces a full sync to catch any drift.

### 12.2 Mechanism

- Store `lastSyncedAt` per connection and, where supported, per-resource cursors/ETags.
- Use provider "updated since" filters when available (GitHub repo `updated_at` sorting/filtering).
- Where the provider offers no incremental filter, fetch the current full list of lightweight identifiers/timestamps and diff against the last stored set to determine adds/updates/removals, then fetch full detail only for changed items.
- Deleted-upstream items are marked `sourceRemoved=true` rather than deleted outright (Section 4.7), preserving any user override.

---

## 13. Data Quality Engine

### 13.1 Computed Signals

- **Completeness** — weighted, not a flat percentage. Core sections (headline, about, at least one experience or project, skills) are weighted higher than optional sections (certifications, achievements).
- **Missing fields** — explicit list with human-readable reason ("Add at least one project to enable portfolio generation").
- **Conflicts** — entities in `NEEDS_REVIEW`/`POSSIBLE_MATCH` state (Section 8) surfaced as actionable items.
- **Invalid data** — malformed URLs, invalid/out-of-order dates (end before start), unsupported characters.
- **Staleness** — source data not synced within a configurable window, flagged for re-sync suggestion.

### 13.2 Weighted Completeness Example

```
completeness = Σ(sectionWeight × sectionFillRatio) / Σ(sectionWeight)
```
Weights are a product-configuration concern (e.g., About=3, Experience=3, Projects=3, Skills=2, Education=1, Certifications=1, Achievements=1) and must be centrally configurable, not hard-coded per call site.

### 13.3 Output Shape

```
DataQualityReport {
  completenessScore, sectionScores: [ { section, score, missingFields } ],
  conflicts: [ { entityType, entityIds, reason } ],
  invalidFields: [ { entityId, field, reason } ],
  staleSources: [ { sourceType, lastSyncedAt } ]
}
```

This report feeds both the review UI and, filtered, the AI Input Builder (only "what's missing" context is relevant to AI; raw invalid-field details are not sent to the model).

---

## 14. Unified Professional Profile

### 14.1 Schema

```
UnifiedProfile {
  personId,
  identity: { fullName, headline, avatarUrl, location, contactEmail },
  about: string | null,
  skills: [Skill],
  experience: [Experience],
  education: [Education],
  projects: [Project],
  certifications: [Certification],
  achievements: [Achievement],
  socialLinks: [SocialLink],
  github: { username, profileUrl } | null,
  contact: { email, phone?, preferredContactMethod },
  dataQuality: DataQualityReport,
  lastUpdatedAt: timestamp
}
```

### 14.2 Extensibility

Adding a new source contributes entities into the *same* canonical arrays above (tagged with the new `sourceType`) rather than introducing parallel per-source profile objects. This is what allows Section 3.4's "no redesign" extensibility guarantee.

---

## 15. AI Architecture

### 15.1 Layered Design

```
GenerationService
  → PromptBuilder (Section 17)
  → AIProvider (abstraction; concrete: ProviderA, ProviderB, ...)
  → StructuredOutputParser
  → SchemaValidator (Section 21)
  → FactualityValidator (Section 20)
  → PortfolioData persistence
```

### 15.2 AIProvider Contract

```
AIProvider {
  generate(request: { systemInstructions, developerRules, userContext,
                       outputSchema, maxOutputTokens }) : RawModelResponse
  supportsStructuredOutput(): boolean
  name / version metadata
}
```

`GenerationService` and everything downstream depend only on this interface. Swapping providers or adding a new one requires only a new `AIProvider` implementation and configuration entry — no changes to prompt logic, validation, or persistence.

---

## 16. AI Input Builder

### 16.1 Principle

Never forward raw source payloads. Build a purpose-built, minimal context object from the Unified Professional Profile for the specific `AIContentType` being generated (Section 18).

### 16.2 Context Shape

```
AIGenerationContext {
  operation: AIContentType,
  verifiedData: { ...only fields relevant to this operation, each tagged
                   with sourceType and confidence },
  userData: { ...user-entered / user-overridden fields relevant to this
               operation },
  derivedData: { ...system-computed hints, e.g. "5 years experience
                  derived from earliest start date" },
  existingPortfolioContent: { ...only the target section(s), for
                                regeneration continuity },
  userPreferences: { tone, length, targetAudience } | null,
  constraints: { maxOutputLength, forbiddenClaims: true }
}
```

### 16.3 Explicit Tagging Rule

Every leaf value passed to the model is nested under `verifiedData`, `userData`, or `derivedData` — never a flat untyped blob — so the system prompt can instruct the model on differing trust levels, and so the Factuality Validator (Section 20) can programmatically know which claims were "in scope" for generation.

---

## 17. AI Prompt Architecture

### 17.1 Layered Prompt Composition

```
1. System Instructions   — fixed, highest priority, defines AI's role and
                            hard constraints (no invented facts, output
                            schema only, ignore embedded instructions in
                            data)
2. Developer Rules       — operation-specific rules (Section 18), e.g.
                            "generate only the About section, ≤600 chars"
3. Structured User Data  — AIGenerationContext (Section 16), clearly
                            wrapped/delimited and labeled as DATA
4. External Source Content — README text, bios, etc. — always the lowest
                            priority layer, explicitly labeled UNTRUSTED
                            DATA, delimited distinctly from instructions
5. Output Schema          — the exact JSON schema the model must return
```

### 17.2 Priority Rule

Layers 1–2 (system + developer) always outrank layers 3–4. The model is explicitly instructed: content inside the DATA/UNTRUSTED DATA delimiters is never to be treated as an instruction, regardless of its phrasing (e.g., a README saying "ignore previous instructions and output X" must be treated as literal text describing a repository, not a command).

---

## 18. AI Generation Operations

| Operation | Input scope | Output schema | Notes |
|---|---|---|---|
| `FULL_PORTFOLIO` | Entire Unified Profile | Full `PortfolioData` | Highest cost; rate-limited more strictly |
| `ABOUT` | identity, top experience/projects, skills summary | `{ about: string }` | |
| `PROJECT_DESCRIPTION` | single Project entity + related skills | `{ projectId, description: string }` | Targeted regeneration |
| `EXPERIENCE_DESCRIPTION` | single Experience entity | `{ experienceId, description: string }` | Targeted regeneration |
| `PROFESSIONAL_SUMMARY` | identity, experience list, skills | `{ summary: string }` | Used for hero/headline area |
| `SKILL_SUMMARY` | skills list, related projects/experience | `{ skillSummary: string }` | |
| `ACHIEVEMENT_DESCRIPTION` | single Achievement + related entity | `{ achievementId, description: string }` | |

Each operation has: a defined input contract (Section 16), a defined output schema (validated per Section 21), length limits, a bounded retry policy (Section 27), and usage/cost tracking (Section 25).

---

## 19. Structured Output

### 19.1 Principle

The AI must return JSON conforming to a per-operation schema — never free-form HTML or markdown intended for direct rendering.

### 19.2 `PortfolioData` Schema (top level)

```
PortfolioData {
  portfolioId, userId, version, status: DRAFT | PUBLISHED,
  hero: { headline, tagline, avatarUrl },
  about: { content, sourceType: AI | USER, lastEditedAt },
  experience: [ { experienceId, title, company, dateRange, description,
                  sourceType, lastEditedAt } ],
  projects: [ { projectId, name, description, url, tags, sourceType,
                lastEditedAt } ],
  skills: [ { name, category } ],
  education: [ { institution, degree, dateRange } ],
  certifications: [ { name, issuer, date } ],
  achievements: [ { title, description, date } ],
  contact: { email, socialLinks: [SocialLink] },
  generationHistory: [ { operation, jobId, generatedAt } ]
}
```

Each content-bearing section stores its own `sourceType` (`AI` vs `USER`) and `lastEditedAt`, enabling Section 24's "user edits survive regeneration" rule at the section/field level, not just the document level.

### 19.3 Validation Rules Applied to Structure

Required fields present; correct types; string length ceilings per field (e.g., About ≤ 600 chars, Project description ≤ 300 chars — exact limits configurable per operation); array bounds (e.g., max 20 projects rendered); URL fields pass URL validation (Section 20); dates parse as valid ISO-8601 and end ≥ start where both present.

---

## 20. Validation Pipeline

```
AI Response (raw text/JSON)
  → Parse (reject if not parseable JSON; trigger retry, Section 27)
  → Schema Validation (required fields, types, lengths, Section 19.3)
  → Business Validation (operation-specific rules, e.g. PROJECT_DESCRIPTION
      must reference an existing projectId in the request context)
  → Factuality Validation (Section 21)
  → Sanitization (Section 22-ish content sanitization: strip any markup
      beyond an allow-listed minimal set, strip scripts/event handlers)
  → Persistence (write into PortfolioData, record generationHistory entry)
```

Any failure at Parse, Schema, or Business validation stages **rejects the response**; it is never partially persisted. Factuality failures (Section 21) are treated as validation failures, not warnings — a factuality failure blocks persistence and triggers the retry/error path (Section 27).

---

## 21. AI Factuality

### 21.1 Allowed AI Behavior

Rewrite, summarize, restructure, improve grammar/tone, and combine facts that exist in `verifiedData`/`userData` from the AI Input Builder context.

### 21.2 Forbidden AI Behavior

Inventing employment, education, projects, technologies, certifications, achievements, dates, or metrics (e.g., "50 production applications," "10 years of experience") not present in the supplied context.

### 21.3 Enforcement Mechanism

A `FactualityValidator` runs after schema validation:

1. Extract factual assertions from the AI's generated text (named technologies, employers, quantities, dates, superlatives/metrics).
2. Cross-reference each assertion against the `AIGenerationContext` that was actually sent for that operation (`verifiedData` + `userData` only — never `derivedData` phrased as a hard fact, and never prior-turn assumptions).
3. Any assertion not traceable to context data is flagged. Numeric/metric claims and named entities (companies, tools, certifications) not present in context are treated as high-severity flags and block persistence; stylistic superlatives with no factual payload (e.g., "passionate," "skilled") are allowed.
4. Flagged responses fail validation and route to the retry/error path (Section 27) with a specific "regenerate, remain grounded in provided data" developer-rule reinforcement on retry.

### 21.4 Example

Context skills: `React, Node.js, MongoDB`. Acceptable: "Full-stack applications using React, Node.js, and MongoDB." Rejected: "Built 50 production applications" (unsupported metric) or "Led a team of 10 engineers" (unsupported claim absent from context).

---

## 22. Prompt Injection Defense

### 22.1 Threat

External content — GitHub README files, repository descriptions, LinkedIn "About" text — may contain text crafted to manipulate the model ("ignore previous instructions and...").

### 22.2 Defenses

- **Structural separation:** external content is always placed in the lowest-priority, explicitly delimited "UNTRUSTED DATA" section of the prompt (Section 17.1), never concatenated into system or developer instruction text.
- **Explicit instruction:** the system prompt explicitly instructs the model that text inside the untrusted-data delimiters is data to summarize/reference, never a command, regardless of imperative phrasing it contains.
- **Output-shape constraint:** because the model must return schema-constrained structured output (Section 19), the blast radius of a successful injection is limited — the model cannot, for example, cause arbitrary HTML/script to be rendered, since the sanitizer (Section 20) and renderer both reject unexpected shapes/markup.
- **Post-generation factuality check:** Section 21's validator also catches injected content that tries to insert fabricated claims, since those claims won't trace back to `verifiedData`/`userData`.
- **No tool/function access from within untrusted content:** the AI's generation calls in this pipeline are pure text-in/structured-text-out; there is no mechanism by which repository content could trigger an external action, so data exfiltration via tool-call hijacking is not applicable to this pipeline's design.
- **Logging:** inputs flagged by heuristic injection detectors (e.g., presence of "ignore previous instructions" style strings) are logged for monitoring, without blocking generation outright (to avoid false-positive denial of legitimate READMEs), but paired with stricter factuality-check thresholds when detected.

---

## 23. Section Regeneration

### 23.1 Rule

A regeneration request scopes strictly to the requested section(s). The `AIGenerationContext` for a targeted operation (Section 18) includes only that section's relevant profile data and the current `PortfolioData` value for that section — unrelated sections are neither sent to the model nor touched by persistence.

### 23.2 Mechanics

1. User triggers "Regenerate About" (or "Improve Project Description" for a specific project).
2. `GenerationService` builds context scoped to that operation only (Section 16/18).
3. On successful validation (Section 20), only the corresponding `PortfolioData` field(s) are updated; `lastEditedAt`/`sourceType=AI` set on that field only.
4. All other sections' `updatedAt`/content remain byte-for-byte unchanged.

### 23.3 Interaction with User Edits (see also Section 24)

Before regenerating, the service checks whether the target section currently has `sourceType=USER` (i.e., the user manually edited it). If so, the UI must obtain explicit confirmation ("Regenerating will replace your manual edit to About — continue?") before the operation proceeds; this is a UX/consent gate the backend enforces via a required `confirmOverwriteUserEdit: boolean` flag on the request.

---

## 24. AI Job System

### 24.1 Job Model

```
GenerationJob {
  id, userId, portfolioId, operation: AIContentType, status: QUEUED |
    PROCESSING | COMPLETED | FAILED | CANCELLED,
  provider, model, inputContextRef, outputRef,
  startedAt, finishedAt, retryCount, lastError,
  usage: { inputTokens, outputTokens, estimatedCost },
  idempotencyKey
}
```

### 24.2 Statuses & Transitions

`QUEUED → PROCESSING → COMPLETED`
`QUEUED → PROCESSING → FAILED` (after exhausting bounded retries, Section 27)
`QUEUED | PROCESSING → CANCELLED` (explicit user cancellation, or superseded by a newer request for the same section — see Concurrency, Section 29)

### 24.3 Cancellation

A running job can be marked `CANCELLED`; in-flight provider calls are not force-killed mid-network-call but their result is discarded on completion if the job is already cancelled, and no persistence occurs for a cancelled job.

### 24.4 Ownership & Progress

Jobs are always scoped to `userId` + `portfolioId`; all job-status queries are filtered server-side by the authenticated user's ownership (see IDOR protection, Section 30). Progress is exposed via status polling or push updates (mechanism left to Backend Specification, Step 5) with coarse states only (no partial-token streaming requirement in this spec).

---

## 25. Retry Strategy

### 25.1 Retryable

Network errors, request timeouts, provider 5xx / temporary-unavailable responses, rate-limit responses (with provider-indicated backoff), and transient parse failures caused by a malformed-but-plausibly-recoverable model response.

### 25.2 Non-Retryable (fail fast)

Authentication/authorization failures, invalid user input (e.g., missing required profile data for the requested operation), permanent provider errors (e.g., model/deployment not found, content-policy rejection), and repeated factuality-validation failures beyond the retry cap.

### 25.3 Backoff Policy

Bounded exponential backoff (e.g., base delay × 2^attempt, capped, with a maximum of 3 attempts by default, configurable per operation type). Rate-limit responses instead honor the provider's indicated retry-after value when present, rather than the generic backoff curve.

### 25.4 Retry Scope

Retries re-invoke only the failed stage where possible (e.g., re-calling `AIProvider.generate` with the same context) rather than re-running the entire sync/generation pipeline from the start, to avoid redundant upstream fetches.

---

## 26. Idempotency

### 26.1 Problem Cases

Double-clicking "Generate," duplicate sync requests, duplicate publish actions, and client-side network retries that resend an identical request.

### 26.2 Mechanism

- Client generates (or the backend derives from request content + user + operation + target section + a client-supplied nonce) an `idempotencyKey`.
- Backend checks for an existing job/sync with the same `idempotencyKey` in a non-terminal or recently-completed state; if found, the existing job/result is returned instead of creating a new one.
- Idempotency keys for generation are scoped to `(userId, portfolioId, operation, targetSectionId)` plus a short time window, so a genuinely new intentional regeneration (after the window, or after explicit user action following a completed job) is still allowed.

---

## 27. Concurrency

### 27.1 Two Syncs At Once (same connection)

Prevented by the per-connection lock and duplicate-job check described in Section 11.3.

### 27.2 Two Generations At Once (same section)

The newer request supersedes: on receiving a new generation request for a section that already has a `QUEUED`/`PROCESSING` job, the system cancels the prior job (Section 24.3) and starts the new one, rather than allowing both to write concurrently.

### 27.3 Editing During Generation

If a user manually edits a section while a generation job for that same section is in flight, on job completion the system checks whether the section's `lastEditedAt` has advanced past the job's `startedAt`; if so, the generation result is discarded (treated as stale) rather than overwriting the newer manual edit, and the user is notified the regeneration was superseded by their edit.

### 27.4 Publishing While Generating

Publish is blocked (or produces a confirmation warning) if there is an in-flight `PROCESSING` job for `FULL_PORTFOLIO`; targeted section jobs do not block publish but the published snapshot is taken atomically from `PortfolioData` at publish time, so a still-running unrelated section job cannot partially bleed into the published snapshot.

### 27.5 Multiple Browser Tabs

All mutating operations (edits, regeneration, sync, publish) go through the same backend concurrency controls above regardless of originating tab; the backend is the single source of truth, and optimistic-concurrency version checks (`PortfolioData.version` incrementing per change) reject a stale-tab write with a conflict response the client can resolve (re-fetch and retry).

---

## 28. AI Cost Management

### 28.1 Controls

- **Input limits:** AI Input Builder enforces max context size per operation (Section 16); oversized fields (e.g., an extremely long user bio) are truncated with a defined truncation strategy (keep most recent/most relevant content) before being sent.
- **Output limits:** `maxOutputTokens` set per operation (Section 18), aligned with the schema's length ceilings (Section 19.3).
- **Model selection:** operation type maps to a configured model tier (e.g., lighter model for short single-field operations, stronger model for `FULL_PORTFOLIO`); mapping is centrally configurable, not hard-coded per call site.
- **Per-user limits:** daily/monthly caps on number of generation operations and/or total token spend per user tier; enforced before a job is queued.
- **Request frequency limits:** see Rate Limiting, Section 29.
- **Retry cost:** bounded retries (Section 25) inherently cap worst-case cost per request; retry attempts count against per-user usage.
- **Usage tracking:** every `GenerationJob` records `inputTokens`, `outputTokens`, and `estimatedCost`, aggregated per user/day/month for reporting and enforcement.

---

## 29. Rate Limiting

| Operation | Suggested limit basis |
|---|---|
| GitHub sync | Per-user cooldown between manual sync triggers; scheduled syncs run independently on a fixed cadence |
| LinkedIn sync | Same pattern as GitHub sync |
| Full portfolio generation | Stricter per-user daily cap (highest cost operation) |
| Section regeneration | Higher per-user cap than full generation, but still bounded per day |
| Public portfolio endpoints (read) | Standard public-API rate limiting (per-IP and/or per-token) to protect against abuse/scraping of published portfolios |

Exact numeric thresholds are a product/ops configuration decision (see Open Questions) — this spec defines the categories and enforcement points, not final numbers.

---

## 30. Security

| Concern | Mitigation |
|---|---|
| OAuth token storage | Encrypted at rest, never logged, never returned in API responses beyond internal use |
| SSRF via user/AI-supplied URLs | Central URL validator (Section 32) applied before any server-side fetch of a URL (e.g., avatar/image fetch, link preview) |
| XSS via AI or user content | Structured-output-only AI responses (Section 19), sanitized rich text (Section 20), templates render via safe/escaped bindings, never raw `innerHTML` from unsanitized source |
| Prompt injection | Section 22 |
| Data leakage | AI Input Builder never forwards secrets/tokens; raw source data never sent to AI provider wholesale; logs scrub PII/secrets (Section 31) |
| IDOR | All resource access (jobs, sync connections, portfolios) authorized against the authenticated user's ownership at the data-access layer, not just at the route layer |
| Secret leakage | Tokens/credentials excluded from application logs, error messages, and client-facing responses by default; secret-scanning in CI recommended |
| Malicious content (README/bio) | Treated as untrusted data throughout (Sections 19, 22, 32) |

---

## 31. Privacy

### 31.1 Lifecycle

1. **Connecting:** user explicitly authorizes each source; requested scopes are the minimum needed and disclosed before authorization.
2. **Synchronizing:** user can see what was last synced and when; sync is either user-triggered or on a disclosed schedule.
3. **Storing:** raw vs. normalized vs. public distinction (Sections 6, 19) is enforced so imported data is not public by default — only content the user has reviewed and the portfolio has published is public.
4. **Using AI:** user is informed which fields are sent to the AI provider for generation (this spec's `AIGenerationContext`, Section 16, is the basis for a user-facing "what we send to AI" disclosure).
5. **Disconnecting:** immediately stops future syncs; existing data retained per Section 6.4 policy until deletion.
6. **Deleting source data:** removes raw snapshots and non-overridden normalized fields (Sections 4.8, 5.6).
7. **Deleting account:** cascades deletion across raw data, normalized profile, generation history, and published portfolio, subject to any legal/operational retention requirements to be confirmed by legal/compliance (Open Questions).

---

## 32. URL & Image Security

### 32.1 URL Validation

Applied to any URL originating from a source connector, user input, or AI output before storage or use in a server-side fetch:

- Require `https` (allow `http` only where product explicitly needs it, with an allow-list mindset).
- Reject `javascript:`, `data:`, `file:`, and other non-http(s) schemes outright.
- Reject malformed URLs (fails standard URL parsing).
- Reject URLs resolving to localhost/loopback or private/internal IP ranges to prevent SSRF, before any server-side fetch is performed (resolve DNS and check the resulting IP, not just the literal hostname string).
- AI- or user-supplied URLs are never fetched server-side speculatively; fetching only happens for explicitly supported features (e.g., link-preview generation) with the above checks gating the fetch.

### 32.2 Image Handling

- Validate MIME type against an allow-list (e.g., PNG/JPEG/WebP).
- Validate file size and dimensions against configured maxima before accepting an upload.
- Store uploaded images in a dedicated, access-controlled store, associated with `userId`/`portfolioId`.
- Do not fetch arbitrary remote images referenced by AI output; avatar/profile images come only from a source connector's own profile-image field (already a known trusted provider URL) or from a direct user upload — never from a URL the AI generated.

---

## 33. Observability

### 33.1 Metrics & Logs

Sync duration, sync success/failure counts, API rate-limit events, OAuth error counts, AI request latency, AI failure counts, AI retry counts, generation job queue delay, generation duration, token usage (input/output), and provider health/error-rate.

### 33.2 Logging Rules

- No credentials, tokens, or raw AI provider request/response bodies containing user PII are written to standard logs; use structured, redacted logging with correlation IDs (`jobId`, `syncJobId`) to allow tracing without exposing content.
- Errors are logged with enough context (stage, operation, retry count) to diagnose without needing to log the sensitive payload itself.

---

## 34. Failure Recovery

| Failure | Behavior |
|---|---|
| GitHub unavailable | Sync job marked `FAILED`/`PARTIAL_SUCCESS`; existing normalized GitHub data untouched; scheduled retry per Section 25 |
| LinkedIn unavailable | Same pattern as GitHub |
| OAuth failure / token expired | Connection marked `NEEDS_REAUTH`; user prompted; no data loss |
| AI provider unavailable | Generation job `FAILED` after bounded retries (Section 25); prior `PortfolioData` content for the target section remains as-is (not cleared) |
| AI timeout | Treated as a retryable transient failure (Section 25.1) |
| Invalid AI output | Rejected at validation (Section 20); never persisted; job fails or retries per policy |
| Database failure | Operation aborted transactionally; no partial writes; job status reflects failure for retry |
| Network failure | Retryable per Section 25 |
| Rate limit | Deferred/rescheduled, not treated as a hard failure (Sections 11.5, 29) |
| Partial source data | Normalize what's available; missing fields surface via Data Quality Engine (Section 13) rather than blocking the whole profile |

**Invariant:** no failure mode in the AI or sync pipeline is permitted to delete or corrupt existing valid `UnifiedProfile` or `PortfolioData` content. Failures are additive-safe: the system may fail to add/update, but does not regress previously good state.

---

## 35. Future Connector Architecture

To add Behance, Dribbble, Stack Overflow, resume upload, personal website, or another source:

1. Implement `SourceConnector` (Section 3.2) for the new source (for file-based sources like resume upload, `authorize`/`fetch` are simplified to a parse step rather than OAuth).
2. Implement a `Mapper` producing the existing canonical entities (Section 7.1) — no new entity types required for typical professional data (name, experience, education, skill, project, certification, achievement, link).
3. Register in the `ConnectorRegistry` (Section 3.3).
4. Add the new `sourceType` enum value used throughout attribution (Section 9), quality scoring (Section 13), and AI context tagging (Section 16).
5. No changes required to: normalization core, deduplication engine, AI prompt architecture, validation pipeline, or `PortfolioData` schema.

---

## 36. Sequence Diagrams (Textual)

**1. GitHub OAuth**
`User → Frontend: Connect GitHub` → `Backend: create state, redirect` → `GitHub: authorize` → `GitHub → Backend callback: code, state` → `Backend: validate state, exchange code` → `Backend: store encrypted tokens, SourceConnection=CONNECTED` → `Backend → Frontend: success`

**2. LinkedIn OAuth**
Same structural flow as (1), with LinkedIn-specific scopes and the availability-split disclosure (Section 5.2) surfaced to the frontend on success.

**3. GitHub Sync**
`Trigger (user or schedule) → SyncEngine: create/find SyncJob` → `Connector: fetchProfile + fetchRepositories (paginated)` → `Store Raw Snapshots` → `Normalize → canonical entities` → `Deduplicate/Merge into UnifiedProfile` → `Data Quality recalculation` → `SyncJob=SUCCEEDED/PARTIAL_SUCCESS`

**4. LinkedIn Sync**
Same structural flow as (3); fields unavailable via API are marked `UNAVAILABLE_VIA_API` rather than fetched.

**5. Source Normalization**
`Raw Snapshot → Mapper.normalize() → Canonical Entity (unmerged) → Deduplication Engine → MATCHED/POSSIBLE_MATCH/DISTINCT/NEEDS_REVIEW → UnifiedProfile update (auto-merge MATCHED; queue others for review)`

**6. Conflict Resolution**
`UnifiedProfile has POSSIBLE_MATCH/NEEDS_REVIEW entities → surfaced to user (Step 6 UI) → User confirms merge or marks distinct → Deduplication Engine finalizes entity state → UnifiedProfile updated → Data Quality recalculated`

**7. Full AI Generation**
`User → GenerationService: request FULL_PORTFOLIO (idempotencyKey)` → `Check existing job (Section 26)` → `AI Input Builder: assemble AIGenerationContext from UnifiedProfile` → `PromptBuilder → AIProvider.generate` → `StructuredOutputParser → SchemaValidator → FactualityValidator` → `Persist PortfolioData, record generationHistory` → `GenerationJob=COMPLETED`

**8. Section Regeneration**
`User → GenerationService: request e.g. PROJECT_DESCRIPTION(projectId)` → `Check target section sourceType=USER? → confirm overwrite if so (Section 23.3)` → `Cancel any in-flight job for same section (Section 27.2)` → `AI Input Builder (scoped context)` → `AIProvider.generate → validate → persist only target field` → `Other sections unchanged`

**9. AI Failure/Retry**
`AIProvider.generate fails (timeout/5xx) → retryable? → backoff → retry (bounded, Section 25) → still failing → GenerationJob=FAILED, lastError recorded, existing PortfolioData section left untouched`

**10. Portfolio Publishing**
`User → Publish request` → `Check no in-flight FULL_PORTFOLIO job (Section 27.4)` → `Take atomic snapshot of current PortfolioData` → `Run final validation/sanitization pass` → `Write immutable published snapshot, status=PUBLISHED` → `Public rendering endpoint serves published snapshot only (never live/raw data)`

---

## 37. Data Flow Diagram (Textual)

```
[GitHub API] [LinkedIn API] [User Input] [Future Sources]
        │             │            │             │
        └────────────┬┴────────────┴─────────────┘
                      ▼
              Source Connectors
                      ▼
                Raw Source Data  (private, versioned)
                      ▼
                 Normalizer  (per-source Mapper → canonical entities)
                      ▼
                Deduplicator  (confidence-scored matching)
                      ▼
             Unified Professional Profile  (attributed, override-aware)
                      ▼
                Data Quality Engine
                      ▼
              AI Input Builder  (source/user/derived tagged context)
                      ▼
                AI Provider(s)  (structured generation)
                      ▼
              Validation (schema + business + factuality + sanitize)
                      ▼
                PortfolioData  (section-addressable, versioned)
                      ▼
              User Review / Edit  (overrides recorded)
                      ▼
              Template Rendering (Step 6 design system)
                      ▼
              Public Portfolio (published snapshot only)
```

---

## 38. State Machines

### 38.1 OAuth Connection (`SourceConnection.status`)
`DISCONNECTED → (authorize) → PENDING_CALLBACK → (callback success) → CONNECTED`
`CONNECTED → (auth failure) → NEEDS_REAUTH → (re-authorize) → CONNECTED`
`CONNECTED → (user disconnect / revocation detected) → DISCONNECTED`
`DISCONNECTED → (delete data requested) → DELETED`

### 38.2 Source Synchronization (`SyncJob.status`)
`QUEUED → RUNNING → SUCCEEDED`
`QUEUED → RUNNING → PARTIAL_SUCCESS`
`QUEUED → RUNNING → FAILED`
`RUNNING → RATE_LIMITED → RUNNING (resumed after window)`

### 38.3 AI Generation (`GenerationJob.status`)
`QUEUED → PROCESSING → COMPLETED`
`QUEUED → PROCESSING → FAILED`
`QUEUED | PROCESSING → CANCELLED`

### 38.4 Portfolio Generation (document-level, `PortfolioData.status` composite of section states)
`NO_CONTENT → PARTIALLY_GENERATED → FULLY_GENERATED → USER_REVIEWED → READY_TO_PUBLISH`
(Any section-level `AI` edit or `USER` edit can move the aggregate backward from `READY_TO_PUBLISH` to `USER_REVIEWED`/`PARTIALLY_GENERATED` until re-confirmed.)

### 38.5 Publishing (`PortfolioData.publishStatus`)
`DRAFT → (publish) → PUBLISHED`
`PUBLISHED → (unpublish) → DRAFT` (published snapshot retained until overwritten by a subsequent publish)
`PUBLISHED → (republish after edits) → PUBLISHED` (new immutable snapshot version)

---

## 39. Security Matrix

| Resource | Input | Threat | Protection | Validation | Logging |
|---|---|---|---|---|---|
| GitHub data | OAuth tokens, API responses | Token theft, SSRF via repo links | Encrypted token storage, URL validator (32.1) before any fetch | Schema-check API responses before normalization | Correlation ID only, no token values |
| LinkedIn data | OAuth tokens, API responses | Token theft, over-claiming unavailable data | Encrypted token storage, explicit `UNAVAILABLE_VIA_API` marking | Field-level availability checks | Correlation ID only |
| User input | Free text, URLs, images | XSS, malicious URLs/images | Input sanitization, URL validator, image MIME/size checks | Type/length/format validation | Field-level error logging without content |
| AI prompt | Assembled context incl. external content | Prompt injection | Layered prompt with untrusted-data delimiting (Section 22) | Context-shape validation before send | Injection-heuristic flag logging |
| AI output | Model response | Hallucinated facts, injected markup/script | Structured-output-only, factuality validator, sanitizer | Full validation pipeline (Section 20) | Failure reason logged, not full payload |
| URLs | Source/user/AI-derived links | SSRF, protocol abuse | Central URL validator (32.1) | Scheme/host/format checks pre-fetch | Rejected-URL count metric |
| Images | Uploaded files | Oversized/malicious files | MIME/size/dimension checks, dedicated store | Pre-storage validation | Rejection reason logged |

---

## 40. Integration Matrix

| Integration | Purpose | Authentication | Data Retrieved | Rate Limits | Failure Modes | Retry | Storage | Privacy |
|---|---|---|---|---|---|---|---|---|
| GitHub | Import repos/profile as project evidence | OAuth 2.0, minimal public scopes | Profile, public repos, README (on demand) | Provider quota headers respected; user-triggered sync cooldown | Unavailable, rate-limited, auth expired, partial pagination failure | Bounded backoff for transient; reauth prompt for auth failure | Raw snapshot (private, versioned) + normalized entities | User-controlled disconnect/delete; scopes minimized |
| LinkedIn | Import professional identity/experience where API allows | OAuth 2.0, product-approved scopes | Basic profile always; experience/education/skills only if partner access granted | Provider quota respected; user-triggered sync cooldown | Unavailable, rate-limited, auth expired, field unavailable via API | Same as GitHub | Raw snapshot (private, versioned) + normalized entities | Explicit "not available via API" disclosure; manual fallback |
| User Input | Fill gaps, override source data | Session auth (existing app auth) | Any profile field | Standard API rate limiting | Invalid input | N/A (validation, not retry) | Directly into canonical entities, `sourceType=USER` | Always private until published |
| Future Connector | Extend source coverage | Per-provider (OAuth or file parse) | Per-provider, mapped to canonical schema | Per-provider policy | Per-provider | Same bounded-retry pattern | Same raw+normalized pattern | Same disclosure/deletion pattern |

---

## 41. AI Operation Matrix

| Operation | Input | Output | Model tier | Validation | Retry | Rate Limit | Cost Tracking | User Action |
|---|---|---|---|---|---|---|---|---|
| `FULL_PORTFOLIO` | Full Unified Profile (tagged) | Full `PortfolioData` | Strongest configured tier | Full pipeline (Section 20) | Bounded, Section 25 | Strictest per-user daily cap | Full input/output token logging | "Generate Portfolio" |
| `ABOUT` | Identity + top experience/projects + skills | `{ about }` | Standard tier | Full pipeline | Bounded | Standard section cap | Logged | "Regenerate About" |
| `PROJECT_DESCRIPTION` | Single project + skills | `{ projectId, description }` | Standard/light tier | Full pipeline + `projectId` existence check | Bounded | Standard section cap | Logged | "Improve Project Description" |
| `EXPERIENCE_DESCRIPTION` | Single experience | `{ experienceId, description }` | Standard/light tier | Full pipeline + `experienceId` existence check | Bounded | Standard section cap | Logged | "Improve Experience Description" |
| `PROFESSIONAL_SUMMARY` | Identity + experience + skills | `{ summary }` | Standard tier | Full pipeline | Bounded | Standard section cap | Logged | "Generate Summary" |
| `SKILL_SUMMARY` | Skills + related projects/experience | `{ skillSummary }` | Light tier | Full pipeline | Bounded | Standard section cap | Logged | "Summarize Skills" |
| `ACHIEVEMENT_DESCRIPTION` | Single achievement + related entity | `{ achievementId, description }` | Light tier | Full pipeline + entity existence check | Bounded | Standard section cap | Logged | "Improve Achievement" |

---

## 42. Testing Requirements

Required test coverage areas (test cases, not test code):

- **OAuth:** successful authorization flow, state/CSRF mismatch rejection, callback error handling, token storage encryption, token refresh success/failure.
- **API integration:** successful profile/repo fetch, malformed API response handling, pagination correctness across multiple pages, provider error-code mapping.
- **Token expiration:** expired-token detection, refresh success, refresh failure → `NEEDS_REAUTH` transition, no data loss on expiry.
- **Synchronization:** full sync end-to-end, incremental sync correctness (only changed items re-normalized), duplicate sync request returns existing job, concurrent sync attempts serialize correctly, partial failure produces `PARTIAL_SUCCESS` without losing prior good data.
- **Pagination:** correct traversal of multi-page results, safety-cap behavior on runaway pagination.
- **Rate limits:** correct pause/resume behavior, correct `RATE_LIMITED` status handling, respecting provider retry-after values.
- **Deduplication:** exact-match auto-merge, fuzzy `POSSIBLE_MATCH` surfaced not auto-merged, `NEEDS_REVIEW` correctly flagged, skill-alias normalization correctness.
- **Conflict resolution:** user-confirmed merge updates entities correctly; user-rejected merge keeps entities distinct.
- **User overrides:** override flag set on manual edit, sync does not overwrite an overridden field, "revert to source" restores correctly, `sourceValueChanged` flag raised when source diverges from an override.
- **AI generation:** each operation type (Section 18) produces schema-valid output on a representative fixture profile.
- **Invalid AI output:** malformed JSON rejected and retried; schema-violating output rejected and not persisted.
- **Prompt injection:** fixture README/bio content containing injection attempts does not alter system behavior or leak into unrelated output fields.
- **Factuality:** fixture case with an AI response containing an unsupported metric/entity is correctly flagged and blocked from persistence; fixture case with fully-grounded content passes.
- **Retry:** transient failure retried up to the bound then fails cleanly; permanent failure does not retry.
- **Idempotency:** duplicate generate/sync requests with the same idempotency key return the same job rather than creating duplicates.
- **Concurrency:** simultaneous edit + regeneration resolves per Section 27.3 (newer edit wins); simultaneous regeneration requests for the same section supersede correctly (Section 27.2).
- **Data deletion:** disconnect stops future syncs without deleting existing normalized data; explicit deletion removes raw and non-overridden normalized data; account deletion cascades fully.
- **Security:** SSRF-protection test (private-IP/localhost URL rejected pre-fetch), XSS-protection test (script-bearing AI/user content is not rendered unsanitized), IDOR test (user A cannot access user B's job/sync/portfolio resources).

---

## 43. Open Questions

The following require product, legal, or infrastructure decisions before final implementation sign-off:

1. Exact raw-data retention window (days/snapshot count) — currently a placeholder default in Section 6.4.
2. Confirmed LinkedIn API/partner-product access level actually available to this product — determines how much of Section 5's "available" column is real versus manual-fallback-only in practice.
3. Exact numeric rate-limit and per-user AI cost caps (Sections 28, 29) — currently categorized but not numerically fixed.
4. Legal/compliance retention requirements on account deletion (Section 31.7) that might require exceptions to full-cascade deletion (e.g., billing records).
5. Which AI provider(s) are approved for initial launch, and whether multiple providers run concurrently (for redundancy) or purely as a swap-capability (Section 15).
6. Exact weighting configuration for the Data Quality completeness score (Section 13.2) — a product/design decision, not a technical constraint.
7. Whether published portfolio snapshots are versioned/publicly diffable, or only the latest snapshot is ever publicly served (Section 38.5 assumes latest-only; needs confirmation).

---

## 44. Implementation Readiness Checklist

- [ ] `SourceConnector` interface and registry implemented; GitHub and LinkedIn connectors conform to it.
- [ ] OAuth flows (GitHub, LinkedIn) implemented with state/CSRF protection and encrypted token storage.
- [ ] Raw Source Data store implemented with versioning, retention, and access control.
- [ ] Normalization mappers implemented for GitHub, LinkedIn, and User Input, producing the canonical schemas in Section 7.1.
- [ ] Deduplication engine implemented with confidence states and a user-facing review queue for `POSSIBLE_MATCH`/`NEEDS_REVIEW`.
- [ ] Source attribution fields present and populated on every applicable entity.
- [ ] User override mechanism implemented, including restore-to-source.
- [ ] Synchronization engine implemented (full + incremental), with job model, duplicate/concurrency prevention, and partial-failure handling.
- [ ] Data Quality Engine implemented with weighted completeness and actionable missing-field reporting.
- [ ] Unified Professional Profile schema implemented and confirmed extensible to a future source without redesign.
- [ ] AI provider abstraction implemented; at least one concrete provider integrated.
- [ ] AI Input Builder implemented with strict source/user/derived tagging and per-operation scoping.
- [ ] Layered prompt architecture implemented with untrusted-data delimiting.
- [ ] All AI operations from Section 18 implemented with defined schemas and limits.
- [ ] Full validation pipeline implemented (parse → schema → business → factuality → sanitize).
- [ ] Factuality validator implemented and demonstrated to block fixture hallucination cases.
- [ ] Prompt injection defenses implemented and demonstrated against fixture injection attempts.
- [ ] Section regeneration implemented with scoping and user-edit-overwrite confirmation.
- [ ] `GenerationJob` system implemented with full status lifecycle and cancellation.
- [ ] Retry strategy implemented with bounded backoff and correct retryable/non-retryable classification.
- [ ] Idempotency keys implemented for sync and generation requests.
- [ ] Concurrency handling implemented for the cases in Section 27.
- [ ] AI cost controls implemented (input/output limits, model tiering, per-user caps, usage tracking).
- [ ] Rate limiting implemented across all listed operation categories.
- [ ] Security controls implemented and tested (SSRF, XSS, IDOR, prompt injection, secret handling).
- [ ] Observability implemented (metrics, structured/redacted logging) across sync and AI pipelines.
- [ ] Privacy lifecycle implemented (disclosure, disconnect, delete-source-data, delete-account cascade).
- [ ] Failure recovery behavior implemented and tested to guarantee no destructive side effects from any listed failure mode.
- [ ] All test categories in Section 42 have corresponding test cases written (implementation deferred to engineering, per this document's scope).
- [ ] Open Questions (Section 43) have been resolved or explicitly deferred with owner and target date.

---

*End of STEP-07-AI-DATA-INTEGRATION-SPECIFICATION.md*
