# Document 03 — User Flow & UX Flow Specification
## AI-Powered Developer Portfolio Generation Platform

**Version:** 1.0 (Draft for Approval)
**Based on:** PRD v1.0 + FRD v1.0 (both approved, treated as source of truth)
**Status:** Pre-architecture — UX Behavior Definition
**Scope note:** This document defines *screens, transitions, and states* — not code, not database schemas, not API contracts, not visual design system decisions. Those belong to Document 04 (System Architecture) and a separate visual design system deliverable.

> **Traceability convention:** every flow below references the FRD requirement ID(s) it implements (e.g. `FR-GITHUB-001`) and, where relevant, the PRD section it derives from (e.g. `PRD §9`). Where the FRD flagged an item as **[Decision Required]**, this document flags it again in §37 rather than silently resolving it, per the task's non-negotiable rules.

---

## PRD/FRD Alignment Note

No direct contradictions were found between the PRD and the FRD — the FRD was written as a behavioral elaboration of the PRD and the two are consistent everywhere checked. What this document *does* carry forward are the FRD's own **[Decision Required]** items (FRD §37, 20 items) that are UX-relevant. Those are not treated as settled; each is reproduced in §37 of this document with the UX-specific consequence spelled out, and this document commits to a *recommended* default only where the FRD already recommended one (e.g. "require-confirm" on AI regeneration), always labeled as a recommendation pending sign-off, never as a silent decision.

---

## 1. Product Context (recap, no changes)

Core journey, as defined by PRD §7.1 / FRD §5–22:

```
Landing → Register/Login → Dashboard → Connect GitHub → Connect LinkedIn (identity only)
  → Manual entry for Experience/Education/Skills/Certifications → Sync
  → Review Unified Profile → Complete missing info → Generate Portfolio
  → Generation processing → Generation result (review) → Select Template
  → Edit → Preview → Publish → Share
```

**Hard constraint carried through every flow below (PRD §10, FRD §8):** LinkedIn's OIDC integration supplies **identity, photo, and email only** — never work history, education, skills, or certifications. Every LinkedIn-related screen in this document is written to that reality; nowhere does the UX imply LinkedIn "imported" professional history.

**Hard constraint carried through every flow below (PRD §13, FRD §12 FR-DATA-001):** user-edited data always outranks AI or synced data. No screen in this document allows a sync or an AI regeneration to silently overwrite a field the user has touched.

---

## 2. Document Objective

Every flow section below answers, per screen: what the user sees, why the screen exists, available actions, what happens after each action, displayed information, loading/empty/error/success states, next destination, cancel behavior, integration-failure behavior, incomplete-data behavior, and return-visit behavior — sufficient for a designer/frontend developer to build without guessing.

---

## 3. UX Principles (recap, unchanged from brief)

Premium, modern, simple, professional, developer-focused, trustworthy, fast, easy to understand. Core experience arc: **CONNECT → REVIEW → GENERATE → CUSTOMIZE → PUBLISH**.

Three rules enforced structurally throughout this document (not just stylistically):
1. **Never hide errors** — every FR-level failure mode (FRD §26) maps to a visible, plain-language, actionable UI state.
2. **Never make AI decisions irreversible** — every AI write path (generation, regeneration) is reviewable and, for regeneration, requires explicit accept (FR-AI-004).
3. **Never force manual entry the system can legitimately obtain** — GitHub fields are never re-asked; LinkedIn professional-history fields are *always* manual because they are structurally unobtainable (FR-LINKEDIN-004), not because the UX is being lazy.

---

## 4. User Types & UX Behavior

| User Type | Definition | Primary UX Behavior |
|---|---|---|
| **Guest** | No account, or account not authenticated in this session | Sees marketing/landing site and public portfolios (`/p/[slug]`) only. Any dashboard route redirects to `/login` with a return-to path preserved. |
| **Registered, unverified** | Account created, email not yet confirmed (FR-AUTH-001) | Blocked from dashboard per FR-AUTH-002; sees "check your email" / "verify your email" screens only, with resend action. **[Decision Required — FRD §37-3]**: whether limited Settings access (to resend verification or change email) should be allowed pre-verification; this document assumes hard block per FRD's stated default. |
| **Registered, verified, no connections** | Logged in, GitHub/LinkedIn not connected, no manual data | First-time dashboard experience (§9); single primary CTA to connect GitHub. |
| **Connected user** | At least one provider connected | Dashboard reflects connection state; "Sync" and "Generate" become available/relevant. |
| **User with incomplete profile** | Some data present, completeness < 100% (FR-PROFILE-003) | Missing-info list surfaced on dashboard and pre-generation; never blocks browsing, only nudges. |
| **User with generated portfolio (draft)** | At least one successful generation (FR-AI-001) | Dashboard CTA becomes "Continue editing" / "Publish"; Editor and Preview become primary surfaces. |
| **User with published portfolio** | `portfolios` snapshot exists and is live (FR-PUBLISH-001) | Dashboard shows live URL, View/Edit/Unpublish actions; further edits go to the draft and do not affect the live page until republish (PRD §19, FR-PUBLISH-001). |
| **Admin** | `role: admin` (FR-ADMIN-001) | Sees an entirely separate `(admin)` route group; never reachable via any link visible to a non-admin; server-enforced, not just hidden in UI. |

---

## 5. Complete User Journey — Transition Table

| # | Trigger | Screen | User Action | System Action | Result | Next Destination | Possible Failure |
|---|---|---|---|---|---|---|---|
| 1 | First visit | Landing | Clicks "Get Started" | — | — | Register | — |
| 2 | Submits registration | Register | Fills form, submits | Validates, creates unverified account, sends verification email (FR-AUTH-001) | Account created (unverified) | "Check your email" screen | Duplicate email, validation error, network error |
| 3 | Clicks verification link | Email link | Clicks link | Validates token, marks account verified (FR-AUTH-006) | Verified | Login (or dashboard, per §37 decision) | Expired/invalid token |
| 4 | Logs in | Login | Submits credentials | Authenticates, creates session (FR-AUTH-002) | Session established | Dashboard (first-time state) | Invalid credentials, unverified block, rate limit |
| 5 | Lands on dashboard | Dashboard | Clicks "Connect GitHub" | Redirects to GitHub OAuth (FR-GITHUB-001) | — | GitHub consent screen | — |
| 6 | Authorizes on GitHub | GitHub consent | Approves | Exchanges code, stores token, triggers initial sync (FR-GITHUB-001/004/005) | Connected + syncing | Connections/Dashboard, "GitHub: Connected ✓" | Denial, state mismatch, API failure |
| 7 | Returns from GitHub | Dashboard | Optionally clicks "Connect LinkedIn" | Shows mandatory disclosure screen, then redirects to LinkedIn OIDC (FR-LINKEDIN-001) | — | LinkedIn consent screen | — |
| 8 | Authorizes on LinkedIn | LinkedIn consent | Approves (openid/profile/email) | Verifies ID token, stores identity claims only (FR-LINKEDIN-004) | Connected (identity only) | Connections, "LinkedIn: Connected ✓" + prompt to add experience manually | Denial, email-scope-only partial success, state mismatch |
| 9 | Data available | Profile Review | Reviews imported data | Displays Unified Profile with source tags (FR-PROFILE-004) | — | Stays on Profile Review | Sync partial failure |
| 10 | Gaps identified | Missing Info | Fills manual fields (Experience/Education/Skills/Certifications) | Validates, saves as `source: manual`, recalculates completeness (FR-PROFILE-002/003) | Completeness increases | Back to Profile Review / Dashboard | Validation error, save failure |
| 11 | Ready to generate | Dashboard/Profile Review | Clicks "Generate Portfolio" | Validates non-empty profile, queues `generationJobs` (FR-AI-001) | Job queued | Generation Processing screen | Empty-profile block, job-already-running block |
| 12 | Job runs | Generation Processing | Waits or navigates away | Worker executes sync→normalize→AI→validate→save, staged status (FR-AI-002) | PortfolioData draft created | Generation Result | AI failure, timeout, invalid JSON, network failure |
| 13 | Generation complete | Generation Result | Reviews sections, clicks "Choose Template" or "Edit" | — | — | Template Selection or Editor | — |
| 14 | Template chosen | Template Selection | Selects a template | Updates `meta.templateId` only, non-destructive (FR-TEMPLATE-001/002) | Preview updates instantly | Editor / Preview | Catalog fetch failure |
| 15 | Editing | Portfolio Editor | Edits fields, reorders, hides, features, regenerates sections | Autosaves per field (FR-EDITOR-001–006) | Draft persisted | Stays in Editor; Preview reflects live | Save failure (retried, then warned) |
| 16 | Ready to publish | Editor | Clicks "Publish" | Validates minimum fields, assigns/validates slug, snapshots draft into `portfolios` (FR-PUBLISH-001) | Portfolio live at `/p/[slug]` | Publish Confirmation | Missing required field, slug taken |
| 17 | Wants to share | Publish Confirmation | Clicks "Copy link" / social / QR | Generates link/QR (FR-SHARE-001–003) | Confirmation toast | Stays on screen | Clipboard failure (rare) |
| 18 | Returns later | Login → Dashboard | — | Loads persisted state: connections, draft, publish status, last sync (FR-DASH-001) | Continues where left off | Dashboard reflecting current state | Sub-fetch error (scoped, per-card) |

---

## 6. Landing Page Flow

**Purpose:** Convert a cold visitor into a registered user by making the CONNECT→REVIEW→GENERATE→CUSTOMIZE→PUBLISH arc feel fast, credible, and safe for real professional data.

### Navigation (logged-out)
Logo · Templates · How It Works · Login · **Get Started** (primary button, high contrast).
*(No "Pricing" — billing is explicitly out of scope for V1 per PRD §5/§32. No nav items not justified by an existing PRD feature.)*

### Navigation (logged-in, visiting `/` directly)
Logo · Templates · How It Works · **Dashboard** (replaces Login/Get Started).

### Hero
- **Main message:** positioning statement from PRD §2 — "Connect your professional profiles. Generate your portfolio. Publish it."
- **Supporting message:** honest about scope — a short line clarifying the system imports what GitHub/LinkedIn *legitimately* allow and never fabricates the rest (sets expectations before the LinkedIn disclosure screen ever appears, reducing later disappointment — this is the UX mitigation for PRD §38 Risk #1).
- **Primary CTA:** "Get Started" → Register.
- **Secondary CTA:** "See templates" → anchor-scrolls to Template Showcase (no auth required).

### How It Works
Four steps, matching the PRD's core arc exactly: **Connect → Generate → Customize → Publish.** Each step gets one line of plain-language copy, no jargon.

### Features
Presented as a benefit-oriented grid (not a spec sheet): "Imports what's real, not what's guessed" (factuality — PRD §13), "One click template switching" (PRD §16), "You're always in control" (edit/review guarantees — PRD §17), "A link you can actually share" (PRD §19–20).

### Template Showcase
Thumbnails of the templates actually available at the current stage of rollout (2–3 at MVP per PRD Addendum A, growing to 6 at V1.0 — FR-TEMPLATE-001 catalog is read from the live `templates` catalog, never hardcoded to "6" in the UI copy, so the page is correct at every stage).

### Privacy/Security
Plain-language section (mirrors the required disclosure surfaces in PRD §31): what's imported from GitHub, what's imported from LinkedIn (explicitly limited), what's always manual, and a link to Settings' full data controls once logged in. This is one of the three mandated plain-language privacy touchpoints (PRD §31: consent screens, landing page, Settings).

### FAQ
Includes at minimum: "Does this post anything on my behalf?" (No — FR-SHARE-002 never posts without explicit user action on the target platform), "Can you see my private repos?" (No — FR-GITHUB §9.3), "Does connecting LinkedIn import my job history?" (No, and explains why + the manual-entry path — FR-LINKEDIN-004), "Can I edit what the AI writes?" (Yes, always — FR-AI-004/FR-DATA-001), "Is my portfolio public?" (Yes by default in V1 — PRD §20).

### CTA (final)
Repeats "Get Started" above the footer.

### Footer
Product links (Templates, How It Works), Legal (Privacy, Terms), Login/Register (if logged out).

### Cross-cutting landing behaviors
- **Mobile nav:** collapses to a hamburger menu; "Get Started" remains visible as a persistent sticky button.
- **Hover/focus states:** all interactive elements have visible focus rings (accessibility requirement, §30).
- **Loading states:** template showcase thumbnails lazy-load with skeleton placeholders; nothing else on the static landing page requires a loading state (server-rendered/static per PRD §24).

---

## 7. Registration Flow (`FR-AUTH-001`)

**Screen:** Register.
**Why it exists:** create the account gate before any data connection can occur.

**Fields:** Name, Email, Password, Confirm Password.
**Inline behaviors:**
- Password visibility toggle (eye icon) on both password fields.
- Live client-side validation: name required; email format; password meets policy (exact policy is **[Decision Required — FRD §37-2]**, this screen enforces whatever the sign-off value ends up being, shown as a strength/requirement checklist under the field, not just a pass/fail).
- Confirm-password field validates match live, not only on submit.
- Terms/Privacy: a required checkbox linking to Terms and Privacy, since the product handles real professional data (PRD §31 requires the disclosure to be visible, not buried) — **[Decision Required]**: whether this is a hard checkbox or implied-by-submit; this document recommends an explicit checkbox given the data-sensitivity of the product.
- Submit button disabled until all fields are valid (FR-AUTH-001 UI State: Disabled rule).

**On submit:**
- **Loading:** button shows spinner, disabled, no double-submit possible.
- **Success:** redirect to "Check your email" screen — **never** directly into the dashboard (FR-AUTH-001 explicit rule). This screen restates the submitted email and offers "Resend verification email" (rate-limited per FR-SEC-002).
- **Duplicate account:** field-level error at the email field; copy is deliberately non-revealing ("An account with this email may already exist — try logging in or resetting your password") per FR-AUTH-001's anti-enumeration rule.
- **Invalid input:** inline field errors, no submission attempt made.
- **Network error:** top-of-form banner error, form state preserved (nothing the user typed is lost).

**Redirect behavior after registration:** always "Check your email," never dashboard, regardless of any other state.

---

## 8. Login Flow (`FR-AUTH-002`)

**Screen:** Login.
**Fields:** Email, Password. "Forgot password?" link. "Don't have an account? Register" link.

**On submit:**
- **Loading:** spinner, submit disabled (prevents double-submit).
- **Success:** session created, redirect to Dashboard — or to the originally-requested protected page if the user was redirected to Login from a deep link (return-to preserved).
- **Invalid credentials:** single generic error ("Incorrect email or password") — never reveals which field was wrong (anti-enumeration, FR-AUTH-002).
- **Unverified account:** distinct screen (not a generic error) — "Please verify your email" with a resend action, per FR-AUTH-002 step 3 (login is blocked, not silently allowed).
- **Rate limit exceeded:** lockout message with a countdown, generic ("Too many attempts, try again in X minutes"), no account-existence hint (FR-SEC-002).
- **Session failure (post-auth):** rare; generic retry banner.
- **Already-authenticated user visiting `/login`:** immediately redirected to Dashboard, login form never shown.
- **Network failure:** top-of-form banner, form state preserved.

---

## 9. First-Time Dashboard Experience (`FR-DASH-001`)

**Screen:** Dashboard — first-time-user variant.

**What's shown:**
```
Profile completion: 0%
GitHub: Not connected
LinkedIn: Not connected
Portfolio: Not created
```
**Primary CTA:** "Connect GitHub to get started" (single primary CTA — FR-DASH-001 explicitly requires de-emphasizing/hiding sections not yet relevant; there is no empty "Published" card, no empty "Draft" card shown at this stage — an empty state for something the user hasn't touched yet is *absence*, not a rendered empty box, consistent with the same principle applied to PortfolioData sections, FR-PORTFOLIO-001).

**Secondary, lower-emphasis option:** "Connect LinkedIn" and "Add info manually" are visible but visually secondary to the GitHub CTA, since GitHub is the richer, lower-friction data source and the product should guide toward the highest-value first action without blocking other paths.

**Onboarding guidance without being annoying:** a single dismissible helper strip ("Most people start with GitHub — it takes 10 seconds and imports the most data automatically") shown only until the user has at least one connection; it does not reappear once dismissed or once a connection exists.

---

## 10. GitHub Connection Flow (`FR-GITHUB-001–007`)

**Screen sequence:** Connections (Not Connected) → OAuth redirect → GitHub's own consent screen (outside app control) → Callback → Connections (Connected) → Sync progress → Sync results.

| State | What the user sees | Trigger to enter | Trigger to leave |
|---|---|---|---|
| 1. Not connected | "GitHub: Not connected" + "Connect GitHub" button | Default/after disconnect | Click Connect |
| 2. Connecting | Connect button disabled, brief redirect transition | Click Connect | Redirect completes |
| 3. Authorization | GitHub's own consent screen (not app UI) | Redirect | User approves/denies |
| 4. Syncing | "Syncing your GitHub data..." with a lightweight progress indicator; if rate-limited, "This is taking a bit longer than usual — hang tight" rather than any technical rate-limit language (FR-GITHUB-005) | Callback success | Sync completes |
| 5. Success | "GitHub: Connected ✓" + summary ("32 repositories analyzed") | Sync completes fully | User navigates on |
| 6. Partial success | "Connected — some data couldn't be loaded" with a scoped explanation and retry for just the failed piece | Sync completes with partial failure | Retry or navigate on |
| 7. Rate limited | Same copy as state 4 (never exposes rate-limit mechanics to the user) — pauses and auto-resumes (FR-GITHUB-005) | Rate limit hit mid-sync | Auto-resume completes |
| 8. Authorization denied | "GitHub connection didn't complete — please try again" + retry button; no partial connection stored | User denies on GitHub's screen | Retry or abandon |
| 9. API failure | "GitHub is temporarily unavailable — try again shortly" + retry | Callback/API error | Retry or abandon |
| 10. Connection expired | Connection card shows "Reconnect needed" badge; existing imported data is retained and still usable, not hidden (FR-GITHUB error handling) | Token invalidated externally | Reconnect |
| 11. Reconnect | Same flow as initial connect; replaces old token, does not duplicate the connection record | User clicks "Reconnect" | Same as states 2–5 |

**Zero-repo case:** sync completes successfully; no error; GitHub Projects section is simply absent later, with a nudge toward adding a manual project instead (FRD Edge Case #1).

**500+ repo case:** capped fetch, "showing top 300 by relevance — more repositories exist" indicator, paginated selection UI in the Projects step (FRD Edge Case #2, FR-GITHUB-005/006).

---

## 11. LinkedIn Connection Flow (`FR-LINKEDIN-001–005`)

**Mandatory pre-connect disclosure screen (this is a functional requirement per FR-LINKEDIN-001, not optional marketing copy):**

> "LinkedIn sign-in confirms your identity, name, and profile photo, and can share your email if you allow it. LinkedIn doesn't allow apps like this to automatically import your work history, education, or skills — you'll add those yourself in a minute, and it's quick."

This screen must be shown **before** the redirect to LinkedIn, every time, not just on first connect.

**State sequence:**

| State | What the user sees |
|---|---|
| Not connected | "LinkedIn: Not connected" + "Connect LinkedIn" button |
| Disclosure | The mandatory copy above, with "Continue" and "Cancel" |
| Authorization | LinkedIn's own OIDC consent screen |
| Callback | Brief loading transition |
| Success (full) | "LinkedIn: Connected ✓" — name, photo, email imported. Immediately followed by a routed prompt: **"Some information isn't available automatically. Complete your profile."** linking directly to the manual Experience/Education/Skills/Certifications forms (FR-LINKEDIN-001 step 7). |
| Success (email scope denied) | Same as above, minus email — this is explicitly a valid partial success, not an error (FR-LINKEDIN-001 Alternative Flow). No red/error styling used for this state. |
| Denied | "LinkedIn sign-in didn't complete — please try again" + retry; nothing stored (FR-LINKEDIN error table, PRD §27). |
| Token expired | Connection card shows "Reconnect needed"; manually-entered experience/education is entirely unaffected since it was never tied to LinkedIn's token lifecycle (FR-LINKEDIN-003). |

**Absolute rule enforced in copy everywhere this state appears:** the UI never says or implies the system "fetched" or "synced" experience/education/skills/certifications from LinkedIn. Those sections are always presented as manual-input sections from the first moment LinkedIn is mentioned, not after a "failed sync."

**Optional V1.0 convenience (`FR-LINKEDIN-005`, not MVP, pending legal review):** "Import from resume" appears as a secondary option inside the manual Experience-entry flow, not as part of the LinkedIn connection flow itself (it is legally distinct — user-supplied file upload, not LinkedIn API access). Parsed candidates are shown as an editable, clearly-labeled "Imported — please review" draft list; nothing saves without per-entry confirmation; low-confidence entries are flagged "please double-check this."

---

## 12. Data Synchronization Flow (`FR-SYNC-001/002`, `FR-PROFILE-004`)

**Trigger:** initial connect (automatic) or user-clicked "Sync" on Connections/Dashboard.

**Progress display (illustrative, matches FRD staged-status requirement FR-AI-002 pattern applied to sync):**
```
✓ GitHub connected
✓ 32 repositories analyzed
✓ Technical skills identified
✓ Profile information imported
⚠ Some information needs your input
```

**Behavior:**
- **Sync again:** available any time at least one provider is connected; disabled with a cooldown timer if rate-limited (FR-SEC-002).
- **Cancel:** not explicitly required by the FRD as a mid-sync cancel action for the user; if a user disconnects a provider mid-sync, the in-flight job is cancelled cleanly server-side with no orphaned partial data (PRD §27) — this is a system-triggered cancellation, not a user-facing "Cancel sync" button, since the FRD does not define one. **[Not specified in FRD — flagged in §37 as an open UX decision rather than assumed.]**
- **Retry:** on partial/full sync failure, a scoped retry is offered for just the failed provider; the succeeding provider's data is not blocked or rolled back (FR-SYNC-001 Failure Result).
- **Partial synchronization:** always a valid, clearly labeled state, never presented as a full failure.
- **Failure recovery:** previously-synced data is never wiped by a failed refresh attempt (FR-GITHUB-004 Failure Result / FR-PROFILE-004 Failure Result).
- **Manual-field preservation:** the sync progress UI never suggests a field the user has manually edited was touched — the precedence rule (FR-DATA-001) is enforced silently and correctly under the hood, and the UI simply reflects the unchanged value.

---

## 13. Imported Profile Review Screen (`FR-PROFILE-004`)

**Purpose:** let the user see everything the system currently knows about them, clearly labeled by origin, before generation.

**Sections shown:** Personal information, About, Skills, Projects, Experience, Education, Certifications, GitHub information, Social links — mirroring the Unified Profile schema (PRD §12).

**Source labeling (mandatory, drives trust):** every field or entry carries a small, consistent label:
- **"From GitHub"** — `source: github`
- **"From LinkedIn"** — `source: linkedin` (identity/photo/email only — this label will essentially never appear on Experience/Education/Skills/Certifications, by design)
- **"You added this"** — `source: manual`
- **"AI-suggested"** — `source: ai` (only ever appears after a generation has run; never before)

**Editability:** every field is editable in place from this screen, or via a "Edit" affordance that routes into the relevant Editor section — the Profile Review screen and the post-generation Editor operate on the same underlying data, so edits made here are never lost or overwritten later.

---

## 14. Profile Completeness Flow (`FR-PROFILE-001/002/003`)

**Display:**
```
Profile completeness: 78%

Missing:
- Education
- Certifications
- Experience description
```
Each missing item is a direct link to the relevant input, not just a label (FR-PROFILE-001).

**CTA:** "Complete Missing Information" — visible on Dashboard and inline before Generate.

**Required vs. optional:** per FR-PORTFOLIO-001's table — e.g. Personal.name is the only hard-required field system-wide; everything else is optional but weighted in the completeness score. The UI visually distinguishes "required for publish" fields (a small marker) from "recommended, improves completeness" fields, so the user understands *why* something is on the missing list without feeling blocked by it.

**Skip behavior:** every manual-entry form can be skipped/closed without penalty beyond the completeness score staying lower; skipping never blocks Generate outright (only an *essentially empty* profile blocks Generate, per FR-AI-001 — a different, much lower bar than "100% complete").

**Save and continue / later completion:** all manual-entry forms autosave per field (consistent with FR-EDITOR-006's autosave contract, applied identically here) — there is no "you must finish this form in one sitting" constraint anywhere in the product.

**Weighting table itself is a [Decision Required — FRD §37-9]** — this document defines only the *UX mechanism* (percentage + linked missing list), not the exact per-field weights.

---

## 15. Generation Flow (`FR-AI-001/002`)

**Trigger:** user clicks "Generate Portfolio" (available once minimal profile content exists).

**Pre-check:** if the profile is essentially empty, Generate is blocked *before* any job is created, with a specific message directing the user to add basic info first — never silently produces a near-empty AI portfolio (FR-AI-001 step 1). Exact "essentially empty" threshold is **[Decision Required — FRD §37-10]**.

**Staged progress (mirrors FR-AI-002's actual backend stage names, translated to reassuring plain language):**

| Backend stage | User-facing message |
|---|---|
| `queued` | "Getting ready..." |
| `syncing` | "Checking your latest GitHub/LinkedIn data..." |
| `generating` | "Writing your portfolio content..." |
| `validating` | "Double-checking everything..." |
| `succeeded` | "Your portfolio is ready to review!" |
| `failed` | Stage-specific plain message (below) |

**Navigate-away behavior:** the job continues in the background regardless of whether the user stays on the screen; the user is notified in-app when it completes, and — if the "generation-complete" email is enabled per the open decision (§37-17) — via email too.

**Duplicate-trigger prevention:** if a job is already running, clicking "Generate" again shows "A generation is already in progress" and does not queue a second job; the existing job's progress is shown instead (FR-AI-001 Alternative Flow).

---

## 16. Generation Failure (`FR-AI-002/003`, PRD §27)

| Failure | User-facing message | Recovery |
|---|---|---|
| AI service fails | "We couldn't generate your portfolio right now — try again." | Retry button; any already-synced data is preserved (FR-AI-002). |
| Timeout | Same generic message, framed as temporary | Retry |
| Invalid AI response (schema failure) | Same generic message — the retry already happened once automatically server-side before this state is ever shown to the user (FR-AI-003) | Retry (triggers a fresh attempt) |
| Network failure | "Connection issue — try again." | Retry |
| Profile data invalid | Routed back to the specific profile field with an inline error, not a generic generation failure | Fix and re-attempt |
| Server error | Generic "Something went wrong, please try again" (FRD §26 rule — never a stack trace or internal code) | Retry / contact support link |

**No data loss guarantee:** a failed generation never touches previously-saved `portfolioDrafts` content; if this was a regeneration attempt, the prior value remains fully intact and visible (FR-AI-004 Failure Result).

**Actions always available on a failure screen:** Retry, Return to Profile (to add more info first), and — if this isn't the user's first successful generation — a way back to the existing draft so a failed *re*-generation never strands the user without their last-good portfolio.

---

## 17. Generation Result Screen (`FR-AI-001` success path)

**What's shown:**
- Overall portfolio completeness (distinct from profile completeness — reflects how much of PortfolioData is populated).
- Every generated section, in brief (About excerpt, skill groups, project cards, experience entries) — a scannable summary, not the full editor yet.
- **Suggested template** (from the AI's `recommendedTemplate` output — PRD §6 persona-adaptation mechanism) shown as a recommendation the user can accept or ignore, never auto-applied silently.
- Primary actions: **"Preview"**, **"Edit"**, **"Choose a different template."**
- Secondary action: **"Regenerate"** (routes into the section-level regeneration flow, §20 below — full-portfolio regeneration is not a single blunt button given the precedence rules; regenerating "everything" still respects per-field manual locks per FR-DATA-001).

**Never automatic:** the system never auto-publishes from this screen. Publish is always a separate, explicit, later action (FR-PUBLISH-001 requires an explicit user trigger).

---

## 18. Template Selection Flow (`FR-TEMPLATE-001/002/003`)

**Screen:** Template gallery — thumbnail grid.

**Per template, shown:** thumbnail (rendered from the user's own current PortfolioData, not generic sample content, so the preview is truthful — consistent with FR-TEMPLATE-001's "same PortfolioData" guarantee applying even at the thumbnail stage where feasible), name, one-line description, style tag (e.g. "dark, code-forward"), "best suited for" persona hint (PRD §16.2), and a "Preview" action opening the full live preview (§21) in that template.

**Selecting a template:** instant — updates `meta.templateId` only; content is never altered (FR-TEMPLATE-002, hard guarantee). No confirmation dialog needed since it's fully reversible and non-destructive.

**Availability at MVP:** 2–3 templates live, not all 6 (PRD Addendum A) — the gallery UI itself is written generically against the live catalog (FR-TEMPLATE-001) so it displays correctly whether 2 or 6 templates exist; it never hardcodes "6" anywhere in copy or layout assumptions.

**Ordering relative to Generation — [Decision Required, FRD §37-16]:** the FRD recommends allowing template selection at any time (before or after first generation), since templates are purely presentational. This document adopts that recommendation: Templates is reachable from the main dashboard nav at all times, not gated behind a completed generation, while still being *suggested* naturally at the Generation Result step for users who haven't picked one yet.

---

## 19. Portfolio Editor Flow (`FR-EDITOR-001–006`)

**Recommended layout (per PRD §17.1's suggested structure, retained here since the FRD does not contradict it):**

```
┌───────────────┬─────────────────────┬───────────────────┐
│ Section Nav   │      Editor          │   Live Preview     │
│ (left, fixed) │      (center)        │   (right, desktop) │
└───────────────┴─────────────────────┴───────────────────┘
```
On mobile/narrow viewports, Live Preview collapses to a separate "Preview" tab rather than a squeezed third column (FRD §32 explicit responsive rule) — this is not "shrinking desktop UI," it's a distinct mobile interaction pattern.

**Section nav items:** Hero, About, Skills, Experience, Education, Projects, Certifications, Achievements, GitHub, Contact, Social Links — matching PortfolioData 1:1 (PRD §15).

| Capability | Behavior |
|---|---|
| **Edit** | Field-level autosave, debounced ~1–2s after last keystroke; subtle "Saved" indicator, not a toast per keystroke (FR-EDITOR-001). |
| **Add** | Blank form appears for list sections (Experience, Education, Projects, Certifications, Achievements, Services); saved as `source: manual` (FR-EDITOR-002). |
| **Delete** | Confirmation required for substantially-filled entries; no confirmation needed to discard a still-blank just-added entry (FR-EDITOR-002). |
| **Reorder** | Drag-and-drop with a keyboard-accessible up/down alternative (mandatory, not optional — FR-EDITOR-003 + accessibility §30); applies to both section order and item order within a section. |
| **Hide/show** | Toggle per section; hidden section's data is retained, not deleted, and reappears unchanged when re-shown (FR-EDITOR-004). A section with *no data at all* never renders regardless of this toggle — the toggle only ever affects sections that do have content. |
| **Feature project** | Applies identically to GitHub-sourced and manually-added projects — no visual/functional distinction by source once featured (FR-EDITOR-005). |
| **Regenerate with AI** | Section-scoped only — see §20. |
| **Undo/redo** | Not defined in the FRD as a required capability. **[Not specified — flagged in §37 as an open UX decision]**; the safety net the FRD does define instead is: every save is field-scoped and non-destructive to other fields, and destructive deletes require confirmation, which covers most of the same risk without a full undo stack. |
| **Autosave/manual save** | **Decided by FRD, not open:** autosave is the functional requirement (FR-EDITOR-006) — no explicit Save button is required to persist changes. A manual "Save" affordance may still be shown as a reassurance/psychological-safety element, but it is never functionally load-bearing. |
| **Unsaved changes** | If a save fails and retries are exhausted, a visible "Unsaved changes — retry" indicator appears, and the user is warned before navigating away from that field (FR-EDITOR-001 Alternative Flow). |

---

## 20. AI Regeneration UX (`FR-AI-004`)

**Flow:** section (e.g. About) → "Improve with AI" → brief scoped loading (spinner on just that section, not a full-page interruption) → **before/after comparison shown** → user explicitly **Accepts** or **Rejects**.

```
About
 → Improve with AI
 → (scoped loading — only this section)
 → Before / After comparison shown
 → Accept → new value saved, tagged source: "ai" (or "manual" if further tweaked before accepting)
 → Reject → prior value retained unchanged, nothing lost
```

**Non-negotiable rule:** AI never silently overwrites user content. The require-confirm pattern above is the FRD's own stated recommendation (FR-AI-004), though the FRD flags "auto-apply vs. require-confirm" as formally open (**[Decision Required — FRD §37-8]**). This document adopts require-confirm as the working default and flags it for the same sign-off the FRD already flagged, rather than treating the FRD's recommendation as unconditionally final.

**Scope guarantee:** regenerating one section (e.g. a single project's description) never touches any other section — verified at the acceptance-criteria level in the FRD (FR-AI-004).

**Full "Regenerate everything":** if offered at all as a single action, it must still respect FR-DATA-001 — any field already tagged `manual` is skipped/preserved unless the user explicitly re-selects that specific field for regeneration. The UI for a "regenerate all" action should make this skip-behavior visible (e.g. "3 sections will be skipped because you've edited them — regenerate anyway?") rather than implying a full silent overwrite.

---

## 21. Live Preview (`FR-PREVIEW-001`)

**Core guarantee:** preview renders through the exact same template pipeline as the public `/p/[slug]` route — never a separate mock (PRD §18, FR-PREVIEW-001). This is the guarantee that makes "what you see is what publishes" literally true, not just a UX promise.

**Viewport switching:** Desktop / Tablet / Mobile, switchable without leaving the editor. Template/theme switching inside preview is instant (pure client-side prop change against already-loaded data).

**Update behavior:** debounced live update as the user edits — matching the same debounce window as autosave, so "Saved" and "Preview updated" feel synchronized rather than jarring.

**Handling:**
- **Unsaved changes:** if the user attempts to leave the editor with a field mid-retry (see §19), a warning is shown before navigation.
- **Rendering error:** a scoped error inside the preview pane only — it never crashes or blanks the surrounding editor (FR-PREVIEW-001 Failure Result).
- **Missing data:** absent sections simply don't render in preview, identical to publish-time behavior — the preview is never "more forgiving" than the real page, since that would break the WYSIWYG guarantee.
- **Template switching:** instant, non-destructive, as described in §18.

---

## 22. Publishing Flow (`FR-PUBLISH-001`)

```
Editor → Click "Publish" → Pre-publish validation → Slug confirmation/edit → Publish confirmation → Published portfolio
```

**Pre-publish validation checks (blocking):**
- Minimum required fields present — at minimum, `Personal.name` (FR-PORTFOLIO-001).
- Slug format valid (lowercase, alphanumeric + hyphen, 3–50 chars) and not on the reserved-word blocklist.
- Slug uniqueness (auto-suggested alternative offered on collision, e.g. `jane-doe-2` — never a silent overwrite, FR-PUBLISH-001).

**Explicitly NOT blocking:** any purely optional/recommended section being empty (Certifications, Achievements, Services, etc.) — publishing with a thin-but-honest portfolio is always allowed; the product never manufactures friction beyond what the PRD requires.

**On success:** public URL shown immediately with "View," "Copy link," and social share actions surfaced right there (so sharing is the natural next step, not a separate hunt).

**On failure:** specific message identifying exactly what's missing/wrong (not a generic "publish failed") — e.g. "Add your name before publishing" or "That URL is taken — try `jane-doe-2`?" (FR-PUBLISH-001 Alternative Flow).

**Draft/published separation (critical UX implication, PRD §17.3/§19):** once published, further edits in the Editor update the **draft** only. The live page does not change until the user explicitly republishes. This must be visibly communicated in the editor UI whenever a portfolio is already published (e.g. a persistent "You have unpublished changes — Republish" banner) so the user is never confused about why their live page hasn't updated.

---

## 23. Published Portfolio Flow (`FR-PUBLIC-001/002`)

**URL:** `/p/[slug]` — public, no authentication, no dashboard chrome.

| State | Behavior |
|---|---|
| Loading | Should rarely be visibly "loading" at all — SSR/ISR rendering (PRD §19/§29) makes this effectively instant on the visitor's side; no third-party API is ever live-fetched at request time (FRD §33). |
| Success | Full render via the selected template, using the immutable published snapshot. |
| Not Found | Slug never existed or was hard-deleted — standard not-found page. |
| Unpublished | Portfolio exists but is currently taken offline by its owner — **distinct** messaging from Not Found (e.g. "This portfolio is currently unavailable" vs. a generic 404), per FR-PUBLISH-002. Exact copy/HTTP status split is **[Decision Required — FRD §37-13]**. |
| Deleted | Same visitor-facing treatment as Not Found once the grace period (if any — **[Decision Required — FRD §37-15]**) elapses. |
| Mobile | Fully responsive per-template, no horizontal scroll, no clipped content at any breakpoint (FRD §32). |
| SEO | Title, meta description, OG tags, Twitter card, canonical URL, JSON-LD Person/ProfilePage — all derived only from actual PortfolioData facts, never fabricated (PRD §30, FR-PUBLIC-002). |
| Social sharing | Handled via the Share flow (§24), not on this page directly. |

**Never exposed on this route, under any circumstance (FR-PUBLIC-001 explicit exclusion list):** OAuth tokens, password hashes, the owner's email (unless the owner explicitly set it as public contact info), internal database IDs, raw `sourceProfiles` data, any other user's data, or unpublished draft content.

---

## 24. Share Flow (`FR-SHARE-001/002/003`)

```
Share button → Copy URL / Social share buttons / QR code
```

- **Copy link:** one click, clipboard write, confirmation toast (FR-SHARE-001).
- **Social sharing:** pre-filled share-intent URLs for LinkedIn/Twitter-X — opens the platform's own native share dialog; the app never posts on the user's behalf without their own explicit action on that platform (FR-SHARE-002).
- **QR code:** generated server-side from the public URL, downloadable as an image (FR-SHARE-003) — **V1.0, not MVP**, per PRD Addendum A/B.
- **Error feedback:** clipboard-write failure (rare, e.g. browser permission denial) shows a fallback "Select and copy manually" state rather than failing silently.

---

## 25. Returning User Flow (`FR-DASH-001`)

On login, the dashboard reconstructs full prior context with no re-onboarding:
- Portfolio state (none / draft / published)
- Selected template
- Draft content
- Published state + live URL
- Connection statuses (GitHub/LinkedIn)
- Last-synced timestamp per provider
- Profile completeness
- Generation status (including "a generation is still in progress" if the user left mid-job)

**Continuation logic:** the primary dashboard CTA adapts automatically to whichever stage the user is actually at (FR-DASH-001 Alternative Flows: "Connect GitHub" → "Generate your portfolio" → "Continue editing / Publish" → live-URL view/edit/unpublish actions) — the user is never re-shown onboarding copy appropriate to an earlier stage they've already passed.

---

## 26. Disconnect / Reconnect Flow (`FR-GITHUB-003`, `FR-LINKEDIN-003`)

| Action | Imported source data | Unified profile | Existing portfolio (published) | User edits | 
|---|---|---|---|---|
| **Disconnect GitHub** | Retained unless "Delete imported data" also used | GitHub-tagged fields retained (tagged) | Unaffected | Untouched |
| **Disconnect LinkedIn** | Retained unless separately deleted | Only identity fields existed to begin with; manual professional-history fields were never LinkedIn-sourced and are entirely unaffected | Unaffected | Untouched |
| **Reconnect (either)** | Old token replaced, not duplicated | Refreshes non-manual fields on next sync only | Unaffected until republish | Untouched (FR-DATA-001) |
| **Resync after reconnect** | Standard sync flow (§12) | Standard merge (§12/FR-PROFILE-004) | Unaffected until republish | Untouched |

**Confirmation required** before any disconnect (destructive-adjacent action, per FR-GITHUB-003/FR-LINKEDIN-003). **Nothing is ever unexpectedly deleted** by a disconnect alone — deletion is always a separate, explicitly-labeled action (§27, "Delete imported data").

---

## 27. Account Deletion Flow (`FR-AUTH-008`)

```
Settings → "Delete my account" → Confirmation modal (destructive styling) → Type confirmation phrase/email
  → Deleting... → Success (redirect to landing, generic message) → Logout completed
```

**Confirmation requirement:** double-confirmation — the destructive-action modal plus a typed confirmation (e.g. the user's own email) before the action proceeds (FR-AUTH-008).

**What's explicitly communicated to the user before they confirm** (plain language, not legalese, consistent with PRD §31's disclosure requirement): account, connections/tokens, imported source data, Unified Profile, portfolio drafts, and the published portfolio (which stops resolving immediately) are all deleted; only anonymized security-log entries may persist per compliance retention rules, with all personal information stripped from them.

**On success:** generic confirmation message, all sessions invalidated, redirect to landing page — the public portfolio URL 404s immediately (FR-AUTH-008).

**On partial cascade failure:** the operation is retried/rolled back rather than left half-done; the user sees an error and is asked to retry or contact support — never a state where "some of my data is gone but my account still exists."

---

## 28. Error / Empty / Loading State Matrix

| Screen | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Dashboard | Skeleton cards | First-time-user CTA variant (§9) | Per-card scoped error, never a full-page failure | Populated summary cards |
| GitHub Connections | Spinner on connect/sync | "Not connected" + CTA | Denial/failure banner + retry | "Connected ✓" + stats |
| LinkedIn Connections | Spinner on connect/sync | "Not connected" + CTA + mandatory disclosure | Denial/failure banner + retry | "Connected ✓" + manual-entry prompt |
| Profile / Missing Info | Skeleton | "Your profile looks complete!" | "Completeness unavailable" (never a wrong number) | Percentage + linked missing list |
| AI Generation | Staged progress messages (§15) | N/A — blocked before start if profile essentially empty | Stage-specific failure + retry (§16) | Redirect to Generation Result |
| Templates | Skeleton catalog | N/A — catalog always non-empty by design | Retry on fetch failure | Thumbnail grid |
| Editor | Per-field save spinner | Blank list-section state with "Add" CTA | Inline field errors; unsaved-changes warning | "Saved" indicator |
| Preview | Initial render skeleton | Mirrors editor state (no separate empty state) | Scoped render error, editor unaffected | Live WYSIWYG render |
| Publishing | "Publishing..." | N/A | Specific validation error (missing field / slug taken) | URL + share actions |
| Public Portfolio | Rarely visible (SSR/ISR) | N/A | Not Found vs. Unavailable (distinct, §23) | Full public render |
| Settings | Skeleton | N/A (always has content: account + connections) | Scoped per-control error | Current accurate state |

---

## 29. Mobile UX

- **Landing page:** hamburger nav; sticky "Get Started" button; hero/features/showcase stack vertically.
- **Dashboard:** cards stack single-column; primary CTA remains sticky/prominent at the top.
- **Connections:** connect/sync actions remain full-width, tap-friendly; disclosure screens (LinkedIn) are full-screen modals, not cramped inline text.
- **Profile editor:** Section Nav collapses into a top horizontal scroller or a "Sections" drop-down rather than a persistent left rail (screen width doesn't support three columns).
- **Template selector:** single-column scrollable gallery instead of a grid; "Preview" opens full-screen.
- **Portfolio editor:** Editor and Preview are **separate tabs**, not simultaneous panes (explicit FRD responsive rule, §32) — this is a distinct interaction pattern, not a shrunk desktop layout.
- **Preview:** the Mobile viewport-simulation option inside Preview is somewhat redundant when the user is already on a phone; the mobile editor's own "Preview" tab effectively *is* the mobile preview — Desktop/Tablet viewport simulation remains available for a mobile user checking how their portfolio looks on larger screens.
- **Public portfolio:** every template must be fully readable/navigable at mobile widths with no horizontal scroll or clipped content (FRD §32, hard requirement across all 6 templates).

---

## 30. Accessibility UX

- **Keyboard navigation:** every interactive element — including drag-and-drop reordering (§19) — has a keyboard-operable equivalent (explicit FRD requirement, not optional).
- **Focus states:** visible focus indicators on every focusable element, dashboard and public templates alike.
- **Form errors:** associated with their field programmatically and announced to screen readers on validation failure, not communicated by color alone.
- **Accessible buttons/labels:** all form inputs have associated, programmatically-linked labels.
- **Screen reader behavior:** semantic HTML landmarks and correct heading hierarchy on every screen, including all public portfolio templates (single H1 = name, per PRD §16.4/§30).
- **Reduced motion:** all motion/animation respects `prefers-reduced-motion`; no essential information is conveyed by animation alone.
- **Color contrast:** WCAG 2.1 AA minimum across all templates and all dashboard UI.
- **Toasts/live regions:** notifications and toasts are announced via an ARIA live region, not purely visual.

---

## 31. Navigation Structure

**Public (logged out):**
Home · Templates · How It Works · Login · Register

**Authenticated (`(dashboard)` route group, per PRD §24):**
Dashboard (Overview) · Profile · Connections · Generate · Templates · Editor · Settings

*(No separate "Portfolio" top-level nav item beyond Editor/Preview/Publish — the FRD models Portfolio as draft-state within the Editor, not as a distinct nav destination; "Preview" and "Publish" are actions/sub-views reached from the Editor, not independent nav items, to avoid inventing navigation the FRD doesn't define.)*

**Admin (`(admin)` route group, role-gated server-side, FR-ADMIN-001):**
Admin Overview · Users · Portfolios (moderation) · Templates (catalog metadata) · Job/System Monitoring

---

## 32. Route Map

Adapted directly from PRD §24's route groups; no routes invented beyond what the PRD/FRD imply.

```
/                          public
/templates                 public
/login                     public (redirects to /dashboard if already authenticated)
/register                  public
/forgot-password           public
/reset-password            public (requires valid reset token)
/verify-email              public (requires valid verification token)

/dashboard                 auth required
/profile                   auth required
/connections               auth required
/generate                  auth required
/templates (dashboard ctx) auth required — template picker, distinct component from public /templates showcase
/portfolio/editor          auth required
/portfolio/preview         auth required (never itself a public URL — FR-PREVIEW-001)
/settings                  auth required

/p/[slug]                  public (guest-accessible)

/admin                     admin role required (server-enforced)
/admin/users               admin role required
/admin/portfolios          admin role required
/admin/system              admin role required
```

**Authentication requirement per route** follows exactly the actor column in the FRD's Functional Requirements Matrix (§35 of the FRD) — every `auth`-scoped route re-checks session ownership server-side on every access (FR-SEC-001), never trusting client-side routing alone.

---

## 33. UX State Machines

### Authentication
```
Guest → Register → (unverified) → Verify → Authenticated
Guest → Login → Authenticated
Authenticated → Logout → Guest
```

### GitHub Connection
```
Disconnected → Connecting → Authorization → Connected → Syncing → Synced
                                  ↓ (denied)
                              Disconnected
Synced → (token invalidated externally) → Needs Reauth → Connecting → ...
```

### LinkedIn Connection
```
Disconnected → Disclosure → Connecting → Authorization → Connected (identity only)
                                              ↓ (denied)
                                          Disconnected
Connected → (manual entry always available regardless of state)
```

### Portfolio
```
No Portfolio → (Generate) → Draft (Generated) → Editing → Ready
Ready → (Publish) → Published
Published → (further edits) → Draft (unpublished changes pending) → (Republish) → Published
Published → (Unpublish) → Unpublished (data retained, slug reserved)
Unpublished → (Republish) → Published
Any draft state → (Delete Portfolio) → No Published Portfolio (draft may persist per FR-PUBLISH-004)
```

### Generation Job
```
Idle → Queued → Syncing → Generating → Validating → Succeeded
                                              ↓ (invalid output)
                                          Retry (once) → Succeeded / Failed
Any stage → (provider/network error) → Failed (stage-specific reason) → Retry (user-triggered)
```

---

## 34. User Flow Diagrams

### Primary happy-path flow
```
User
 ↓
Landing
 ↓
Register → Verify Email
 ↓
Login
 ↓
Dashboard (first-time)
 ↓
Connect GitHub → OAuth → Connected → Auto-Sync
 ↓
Connect LinkedIn → Disclosure → OAuth → Connected (identity only)
 ↓
Manual Entry (Experience / Education / Skills / Certifications)
 ↓
Profile Review (source-labeled)
 ↓
Complete Missing Data
 ↓
Generate Portfolio
 ↓
Generation Processing (staged progress)
 ↓
Portfolio Generated → Generation Result (review, not auto-published)
 ↓
Select Template
 ↓
Edit (autosave, section regeneration with accept/reject)
 ↓
Preview (Desktop / Tablet / Mobile, real render pipeline)
 ↓
Publish (slug validation)
 ↓
Share (copy link / social / QR)
```

### GitHub-only journey (PRD §7.2)
```
User connects GitHub only, skips LinkedIn
 ↓
Sync completes (GitHub data only)
 ↓
Profile Review — Experience/Education sections shown as empty/manual-only, no error
 ↓
User optionally adds Experience/Education manually, or skips
 ↓
Generate — succeeds using GitHub + whatever manual data exists
 ↓
Publish — Experience section simply absent from the live page if never filled in
```

### Re-generation journey (PRD §7.3)
```
User has an existing published portfolio
 ↓
Updates GitHub (new repo) externally
 ↓
Returns to Dashboard → clicks "Sync"
 ↓
Sync refreshes non-manual GitHub-tagged fields only
 ↓
User clicks "Regenerate" on a specific section, or "Regenerate all"
 ↓
Fields the user has manually edited are skipped/preserved (FR-DATA-001)
 ↓
User reviews before/after per regenerated section, accepts or rejects
 ↓
User republishes explicitly — live page unchanged until this step
```

### Disconnection journey (PRD §7.4)
```
User opens Settings → Connections
 ↓
Disconnects LinkedIn
 ↓
Confirmation modal
 ↓
Token deleted; connection marked disconnected
 ↓
Future generations no longer attempt to use LinkedIn-sourced fields
 ↓
Previously-imported identity data remains unless "Delete imported data" also used
 ↓
Portfolio (draft and published) clearly reflects "no longer synced with LinkedIn" where relevant, without deleting anything
```

### Failure journey (PRD §7.5)
```
User attempts GitHub connect
 ↓
OAuth fails / is revoked mid-session
 ↓
Returned to Connections with a clear, non-technical error and a retry action
 ↓
No partial/corrupted state written to the Unified Profile
```

---

## 35. UX Requirements Matrix

| Flow ID | Flow | Actor | Entry Point | Success | Failure | Next Step |
|---|---|---|---|---|---|---|
| UX-AUTH-001 | Registration | Guest | Landing → Register | Unverified account created, verification email sent | Duplicate email / validation error / network error | "Check your email" screen |
| UX-AUTH-002 | Login | Guest | Login screen | Session created | Invalid credentials / unverified / rate-limited | Dashboard |
| UX-AUTH-003 | Logout | Authenticated User | Nav "Log out" | Session invalidated | Rare — local logout still proceeds | Landing page |
| UX-AUTH-004 | Password Reset | Guest | "Forgot password" | Reset email sent (generic confirmation always shown) | Expired/used token at reset step | Login |
| UX-DASH-001 | First-Time Dashboard | Registered, verified | Post-login | Single clear CTA shown, no misleading empty state cards | Sub-fetch error (scoped) | Connect GitHub |
| UX-GITHUB-001 | Connect GitHub | Authenticated User | Dashboard/Connections | Connected + initial sync begins | Denial / API failure / rate limit | Connections (Connected) |
| UX-GITHUB-002 | Disconnect GitHub | Authenticated User | Settings/Connections | Connection removed, data retained | Rare provider-side revoke failure (local disconnect still succeeds) | Connections (Not Connected) |
| UX-LINKEDIN-001 | Connect LinkedIn | Authenticated User | Connections | Identity/photo/(email) imported, routed to manual entry | Denial / partial (email-scope-denied is valid, not a failure) | Connections + manual-entry prompt |
| UX-SYNC-001 | Manual Sync | Authenticated User (≥1 connection) | Connections/Dashboard | Non-manual fields refreshed, manual fields untouched | Partial provider failure | Connections (updated timestamp) |
| UX-PROFILE-001 | Manual Field Entry | Authenticated User | Missing Info / Profile Review | Field saved, completeness recalculated | Validation error | Profile Review |
| UX-GENERATION-001 | Generate Portfolio | Authenticated User | Dashboard/Profile Review | Valid PortfolioData produced | Empty profile block / AI failure / timeout | Generation Result |
| UX-GENERATION-002 | Regenerate Section | Authenticated User | Editor | Only targeted section updates, on explicit accept | Scoped failure, prior value retained | Editor (updated section) |
| UX-TEMPLATE-001 | Select Template | Authenticated User | Template gallery | `templateId` updated, content unchanged | Catalog fetch failure | Editor/Preview |
| UX-EDITOR-001 | Edit / Add / Delete / Reorder / Hide | Authenticated User | Editor | Autosaved | Save failure → retried, then warned | Stays in Editor |
| UX-PREVIEW-001 | Responsive Preview | Authenticated User | Editor "Preview" | Accurate live render at all viewports | Scoped render error | Stays in Preview |
| UX-PUBLISH-001 | Publish Portfolio | Authenticated User | Editor "Publish" | Live at `/p/[slug]` | Missing required field / slug taken | Publish Confirmation |
| UX-PUBLISH-002 | Unpublish Portfolio | Authenticated User | Dashboard/Settings | Slug reserved, page shows "unavailable" | N/A | Dashboard (Unpublished state) |
| UX-PUBLIC-001 | View Public Portfolio | Guest | `/p/[slug]` | Full accurate render, no private fields exposed | Not Found / Unavailable (distinct) | N/A (public terminal view) |
| UX-SHARE-001 | Copy/Share Link | Authenticated User | Publish Confirmation/Dashboard | Link copied / share dialog opened | Clipboard failure (rare) | Stays on screen |
| UX-SETTINGS-001 | Delete Imported Data | Authenticated User | Settings | Provider-sourced data cleared, manual data preserved | N/A (confirmation-gated) | Settings (updated state) |
| UX-SETTINGS-002 | Delete Account | Authenticated User | Settings | Full cascade, public URL 404s immediately | Partial-cascade failure → retried, never left half-done | Landing page (logged out) |

---

## 36. UX Acceptance Criteria (representative set — one per major flow)

### UX-AUTH-001 — Registration
**Given** a guest on the registration page with a unique email and a valid password.
**When** they submit the form.
**Then** an unverified account is created, a verification email is sent, and they are shown a "check your email" screen — never the dashboard directly.

### UX-GITHUB-001 — Connect GitHub
**Given** the user is logged in and GitHub is disconnected.
**When** they click "Connect GitHub" and approve GitHub's consent screen.
**Then** the connection status becomes Connected, an initial sync begins automatically, and the user can start using GitHub-sourced data immediately.
**If authorization fails:** the user sees a useful, non-technical error and can retry; no connection is stored.

### UX-LINKEDIN-001 — Connect LinkedIn
**Given** the user is logged in and LinkedIn is disconnected.
**When** they view the mandatory disclosure and approve LinkedIn's consent screen granting all requested scopes.
**Then** name/photo/email are imported, and the user is immediately and clearly routed to manual entry for Experience/Education/Skills/Certifications — the UI never implies those were imported.
**If the `email` scope specifically is denied:** the connection still succeeds; this is shown as a normal, non-error state.

### UX-SYNC-001 — Manual Sync
**Given** a user has manually edited their About text and has GitHub connected.
**When** they trigger a sync.
**Then** the About text is unchanged, while GitHub-sourced repository data still refreshes to current values.

### UX-GENERATION-001 — Generate Portfolio
**Given** a user with a reasonably populated profile.
**When** they click "Generate Portfolio."
**Then** a job starts with visible staged progress, and on completion the user is routed to a review screen showing valid, schema-conforming content — never auto-published.
**Given** an essentially empty profile, **when** they click Generate, **then** the system blocks with specific guidance to add basic info first.

### UX-GENERATION-002 — Regenerate Section
**Given** a user with an existing draft.
**When** they regenerate only the "About" section and reject the proposed candidate.
**Then** the prior About text remains exactly as it was, and no other section is touched.

### UX-TEMPLATE-001 — Select Template
**Given** a user has fully edited their portfolio content.
**When** they switch templates.
**Then** all content (Experience, Projects, etc.) remains identical — only the visual presentation changes, with no confirmation step required since the action is fully non-destructive.

### UX-PUBLISH-001 — Publish Portfolio
**Given** a valid draft with at least a name set.
**When** the user clicks Publish.
**Then** a public URL is generated and resolves immediately to the current draft content, with Copy Link and social share actions surfaced right away.
**Given** the chosen slug is already taken, **when** they attempt to publish, **then** they are offered an available alternative rather than a silent overwrite or an opaque failure.

### UX-PUBLIC-001 — View Public Portfolio
**Given** a published slug.
**When** any visitor (authenticated or not) requests it.
**Then** the page renders correctly without requiring authentication, and none of the explicitly-excluded private fields (tokens, password hashes, internal IDs, draft content, another user's data) ever appear in the response.

### UX-SETTINGS-002 — Delete Account
**Given** a logged-in user completes the required double-confirmation.
**When** they submit account deletion.
**Then** their account and all associated data are deleted per the cascade rules, and their public portfolio URL stops resolving immediately.

---

## 37. Open UX Decisions

These are carried forward primarily from FRD §37 (UX-relevant subset) plus two items this document identified independently while designing the flows above. **None of these are silently resolved** — each has, at most, a recommended default explicitly labeled as such.

| # | Decision | Where it affects UX | Status |
|---|---|---|---|
| 1 | Exact password policy (length/complexity beyond the 8-char/letter+number baseline) | Registration/Reset Password field validation | Open (FRD §37-2) |
| 2 | Whether an unverified user gets any limited dashboard/Settings access | Post-registration routing (§4, §7) | Open (FRD §37-3) — this document assumes hard block |
| 3 | Onboarding length/whether a guided wizard vs. dashboard-first experience is used | First-Time Dashboard (§9) | Open — not resolved by either PRD or FRD; this document assumes dashboard-first (matches FR-DASH-001's described flow), not a separate wizard |
| 4 | Exact repository cap and "suggested featured" count (N) | GitHub Repository Selection (§10) | Open (FRD §37-5) |
| 5 | Handling of a featured repo that becomes unavailable after being included in a *published* snapshot | Editor/Publish (§19, §22) | Open (FRD §37-6, edge case #27) |
| 6 | Character/length limits for About, experience/project descriptions, etc. | Editor field validation (§19) | Open (FRD §37-7) — placeholder numbers only |
| 7 | AI regeneration: auto-apply vs. require-confirm | AI Regeneration UX (§20) | Open (FRD §37-8) — this document adopts require-confirm as the working default per the FRD's own recommendation |
| 8 | Profile-completeness weighting table (exact per-field weights) | Completeness display (§14) | Open (FRD §37-9) |
| 9 | Minimum completeness threshold to allow triggering Generate | Generation pre-check (§15) | Open (FRD §37-10) — currently only "not essentially empty" |
| 10 | Ordering constraint between Template Selection and first Generation | Template Selection (§18) | Open (FRD §37-16) — this document adopts "available any time" per the FRD's recommendation |
| 11 | Whether editor uses the split-view (Editor + Preview side-by-side) layout recommended in §19, or an alternative | Portfolio Editor layout (§19) | Open — PRD suggests split-view but explicitly invites a better alternative; this document retains split-view (desktop) / tabbed (mobile) as the working assumption |
| 12 | Autosave vs. manual save | Editor (§19) | **Not open** — FRD settles this as autosave-required (FR-EDITOR-006); retained here only because the original task brief listed it as an example open question |
| 13 | Public vs. private/unlisted portfolio visibility | Publishing (§22) | Confirmed out of scope for MVP/V1 per PRD; schema reserves a `visibility` field for future use (FRD §37-20) |
| 14 | Whether a QR code is included at MVP | Share flow (§24) | **Not open** — confirmed V1.0, not MVP, per PRD Addendum A/B |
| 15 | Number of templates in MVP | Template Selection (§18) | **Not open** — confirmed 2–3 at MVP, 6 at V1.0 (PRD Addendum A/B) |
| 16 | Template preview behavior at the gallery-thumbnail stage (rendered from real user data vs. generic sample) | Template Selection (§18) | Open — this document assumes real-data thumbnails where feasible; not explicitly specified by either source document |
| 17 | Exact "unpublished" vs. "not found" copy/HTTP status split | Public Portfolio (§23) | Open (FRD §37-13) |
| 18 | Slug-change redirect behavior (grace-period redirect from old slug vs. immediate break) | Publishing/Slug management (§22) | Open (FRD §37-14) |
| 19 | Soft-delete grace period before a deleted portfolio's slug is released | Publish/Delete (§22) | Open (FRD §37-15) |
| 20 | Whether a user-facing "Cancel sync" action exists mid-sync, vs. only system-triggered cancellation on disconnect | Data Synchronization (§12) | Open — not defined by either source document; flagged independently by this document |
| 21 | Whether the Editor includes a full undo/redo stack beyond field-level autosave and delete-confirmation | Portfolio Editor (§19) | Open — not defined by either source document; flagged independently by this document |
| 22 | Generation-complete notification via email vs. in-app only | Generation Flow (§15) | Open (FRD §37-17) |
| 23 | LinkedIn resume-upload (§11, FR-LINKEDIN-005) legal review outcome | LinkedIn Connection Flow (§11) | Open (FRD §37-18) — entire feature contingent on this |

---

## 38. Final UX Summary

### Core User Journey
Landing → Register/Login → Dashboard → Connect GitHub → Connect LinkedIn (identity only) → Manual entry for professional history → Review Unified Profile (source-labeled) → Complete missing info → Generate → Review AI-generated draft → Choose template → Edit (with reviewable, section-scoped AI regeneration) → Preview (real render pipeline, all viewports) → Publish → Share.

### Critical UX Principles
1. Never claim to have imported something that wasn't legitimately obtainable (especially LinkedIn professional history).
2. Never let AI or sync silently overwrite user-edited content — precedence is enforced structurally, and the UX visibly reflects it (source labels, before/after regeneration confirmation).
3. Never show broken/empty renders for absent optional data — absence is a valid, first-class state throughout, not an error.
4. Never hide a failure behind vague copy — every failure mode has a specific, actionable message and a next step.
5. Never publish or overwrite the live page without an explicit user action — draft and published states are always visibly distinct.

### MVP UX
Auth (register/login/verify/reset) → First-time dashboard → GitHub connect/sync/select → LinkedIn connect (identity-only) + full manual-entry flow → Profile Review + completeness → Generate + staged progress + failure handling → Generation Result (review, not auto-publish) → 2–3 templates → Core editor (edit/add/delete/feature/autosave; reorder/hide recommended) → Preview (all viewports, real pipeline) → Publish/Unpublish → Copy-link sharing → Settings (disconnect, delete imported data, delete account) → Core error/empty/loading states throughout.

### V1 UX
Remaining templates (up to 6) → Section-level AI regeneration UX fully realized with before/after confirmation → Slug editing → Portfolio deletion → Social share buttons + QR code → Resume/PDF import convenience (pending legal review) → Full admin UX (user management, portfolio moderation, job monitoring) → Expanded notifications.

### Future UX
Custom domains, visitor analytics, resume/cover-letter generation, job matching, portfolio scoring, scheduled auto-resync, version history, custom CSS/fonts, team accounts, recruiter mode, marketplace, LinkedIn Partner Program-powered richer import, billing/plan UX, private/unlisted visibility.

### Critical Edge Cases (UX handling confirmed throughout this document)
Zero/500+ GitHub repos · LinkedIn scope partially denied · essentially-empty profile blocking Generate · AI hallucination stripped before the user ever sees it · user-edited field surviving a full regeneration · duplicate project dedup · invalid URLs rejected inline · slug collision offering an alternative · unpublish vs. not-found distinct messaging · draft/published separation after publish · account deletion cascade with immediate public 404.

### Open UX Decisions
23 items, §37 — none silently resolved; each carries either "Open" status or an explicitly labeled recommended default pending sign-off.

### Recommended Next Document
# 04 — System Architecture Document

This UX flow specification should be reviewed and approved before architecture work begins, since several architectural decisions (job status granularity for staged progress, draft/published data separation, source-tagging at the field level, section-scoped AI calls) are directly implied by the UX behavior defined here.

---

*End of Document 03. This document should be treated as the UX behavioral source of truth alongside the PRD and FRD; any UX change discovered during architecture or implementation work should be reflected back into this document (with a version bump) rather than resolved silently downstream.*
