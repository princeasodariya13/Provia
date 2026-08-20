# Functional Requirements Document (FRD)
## AI-Powered Developer Portfolio Generation Platform

**Version:** 1.0 (Draft for Approval)
**Based on:** PRD v1.0 (AI-Powered Developer Portfolio Generation Platform)
**Status:** Pre-architecture — Functional Behavior Definition
**Scope note:** This document defines *behavior*, not implementation. No code, no schemas-as-code, no infrastructure decisions beyond what the PRD already fixed (Next.js/TS, Node/Express/TS, MongoDB, GitHub API, LinkedIn OIDC, AI provider, Tailwind).

---

## Table of Contents

1. Purpose & How to Read This Document
2. Requirement ID Convention
3. Requirement Format
4. Authentication (FR-AUTH)
5. Dashboard (FR-DASH)
6. GitHub Integration (FR-GITHUB)
7. GitHub Repository Selection (FR-GITHUB, continued)
8. LinkedIn Integration (FR-LINKEDIN)
9. Missing Information System (FR-PROFILE)
10. Unified Profile (FR-PROFILE, continued)
11. Synchronization (FR-SYNC)
12. Data Priority Rules (FR-DATA)
13. AI Portfolio Generation (FR-AI)
14. AI Factuality (FR-AI, continued)
15. PortfolioData (FR-PORTFOLIO)
16. Templates (FR-TEMPLATE)
17. Editor (FR-EDITOR)
18. AI Regeneration (FR-AI, continued)
19. Preview (FR-PREVIEW)
20. Publishing (FR-PUBLISH)
21. Public Portfolio (FR-PUBLIC)
22. Sharing (FR-SHARE)
23. Account/Profile Settings (FR-SETTINGS)
24. Admin (FR-ADMIN)
25. Notifications (FR-NOTIF)
26. Cross-Cutting: Error Handling
27. Cross-Cutting: Authorization (FR-SEC)
28. Cross-Cutting: Rate Limiting (FR-SEC, continued)
29. Cross-Cutting: Data Deletion
30. Cross-Cutting: Loading / Empty / Error States
31. Cross-Cutting: Accessibility
32. Cross-Cutting: Responsive Behavior
33. Cross-Cutting: Performance
34. Functional Edge Cases
35. Functional Requirements Matrix
36. MVP vs. V1 vs. Future
37. Open Questions / Decisions Required
38. Final FRD Summary

---

## 1. Purpose & How to Read This Document

This FRD translates the approved PRD into precise, testable behavior for every user-facing and system-facing function. It is written so that a developer can implement a feature correctly without needing to ask "what should happen if...". Where the PRD left a decision open or where this document had to make a judgment call not explicitly settled by the PRD, it is flagged inline as **[Decision Required — see §37, ID]** rather than silently resolved.

This document does **not** define database schemas, API contracts, or file structure — that is the architecture document's job (recommended next document per §38 and per the original task instructions is the User Flow & UX Flow Document; a technical architecture document follows after that).

---

## 2. Requirement ID Convention

Prefixes used in this document: `FR-AUTH`, `FR-DASH`, `FR-GITHUB`, `FR-LINKEDIN`, `FR-PROFILE`, `FR-SYNC`, `FR-DATA`, `FR-AI`, `FR-PORTFOLIO`, `FR-TEMPLATE`, `FR-EDITOR`, `FR-PREVIEW`, `FR-PUBLISH`, `FR-PUBLIC`, `FR-SHARE`, `FR-SETTINGS`, `FR-ADMIN`, `FR-NOTIF`, `FR-SEC`. IDs are never reused; a removed requirement's ID is retired, not recycled.

---

## 3. Requirement Format

Every requirement below uses this structure: **Requirement ID · Name · Description · Actor · Preconditions · Trigger · Main Flow · Alternative Flows · Validation · Success Result · Failure Result · Data Impact · Authorization · UI State (Loading/Empty/Success/Error/Disabled) · Acceptance Criteria (Given/When/Then).**

---

## 4. Authentication (FR-AUTH)

### FR-AUTH-001 — User Registration
**Description:** Allows a new visitor to create an account with email and password.
**Actor:** Guest
**Preconditions:** User is not authenticated.
**Trigger:** User submits the registration form.
**Main Flow:**
1. User enters name, email, password, password confirmation.
2. Client-side validation runs (format, match, strength).
3. Form submits to the backend.
4. Backend validates uniqueness of email.
5. Password is hashed (argon2id) and never stored in plain text.
6. Account is created with `status: unverified`, `role: user`, `plan: free`.
7. A verification email is sent (see FR-AUTH-006).
8. User is redirected to a "check your email" screen (not directly into the dashboard).
**Alternative Flows:**
- If email already exists → error shown at the email field, no account created, no duplicate-account information leaked beyond "an account with this email may already exist."
**Validation:**
- Name: required, 1–100 chars.
- Email: required, valid email format, case-insensitive uniqueness check.
- Password: minimum 8 characters, must include at least one letter and one number (exact policy — **[Decision Required, see §37-P1]**).
- Password confirmation must match password exactly.
**Success Result:** Account created (unverified), verification email queued, user sees confirmation screen.
**Failure Result:** Field-level error messages; no partial account persisted on any validation failure.
**Data Impact:** Creates one `users` record.
**Authorization:** None required (public action); rate-limited (see §28).
**UI State:**
- Loading: submit button shows spinner, disabled.
- Empty: N/A (form is always populated by user input).
- Success: redirect to "verify your email" screen with the submitted email shown.
- Error: inline field errors; a top-of-form error for non-field failures (e.g., server error).
- Disabled: submit disabled until all required fields are non-empty and client-side valid.
**Acceptance Criteria:**
- Given a guest on the registration page, when they submit valid, unique information, then an unverified account is created and a verification email is sent.
- Given a guest submits an email that already exists, when they submit, then no new account is created and a generic "check your email or try logging in" message is shown.
- Given a guest submits a password shorter than the minimum, when they submit, then the account is not created and a specific password-policy message is shown.

### FR-AUTH-002 — User Login
**Description:** Authenticates an existing user and creates a session.
**Actor:** Guest (becomes Authenticated User on success)
**Preconditions:** Account exists.
**Trigger:** User submits login form with email + password.
**Main Flow:**
1. User enters email and password.
2. Backend verifies credentials against stored hash.
3. If account is unverified, block login and prompt re-send verification (do not silently log them in).
4. If valid and verified, a session/token is created (see §37 for JWT vs. server session decision) and the user is redirected to the dashboard.
**Alternative Flows:**
- Invalid credentials → generic "Incorrect email or password" (never reveal which field was wrong).
- Unverified account → "Please verify your email" screen with a resend-verification action.
- Too many failed attempts → rate-limited (§28).
**Validation:** Email format; both fields required.
**Success Result:** Session established; redirect to dashboard (or to the page the user was trying to reach, if applicable).
**Failure Result:** No session created; generic error shown; failed attempt logged for rate-limiting purposes.
**Data Impact:** Creates a session record (if server-side sessions are used) or issues a signed token; updates `lastLoginAt` on `users`.
**Authorization:** None required to attempt; publicly accessible route.
**UI State:** Loading (spinner on submit), Success (redirect), Error (inline generic error), Disabled (submit disabled while request in flight to prevent double-submit).
**Acceptance Criteria:**
- Given a verified user with correct credentials, when they submit login, then a session is created and they land on the dashboard.
- Given a user with incorrect password, when they submit, then no session is created and a generic error is shown, with no indication of whether the email exists.
- Given an unverified user with correct credentials, when they submit, then login is blocked and they're prompted to verify their email.

### FR-AUTH-003 — Logout
**Description:** Ends the current session.
**Actor:** Authenticated User
**Preconditions:** User has an active session.
**Trigger:** User clicks "Log out."
**Main Flow:** Session/token invalidated server-side → client-side auth state cleared → redirect to landing page.
**Alternative Flows:** None.
**Validation:** N/A.
**Success Result:** Session destroyed; subsequent requests with the old session/token are rejected as unauthenticated.
**Failure Result:** If invalidation fails server-side, client still clears local state and treats the user as logged out; a background retry/logging occurs.
**Data Impact:** Session record deleted or token added to a revocation mechanism.
**Authorization:** Must be authenticated to call.
**UI State:** Brief loading indicator, then redirect; no error state normally surfaced to the user.
**Acceptance Criteria:** Given an authenticated user, when they click Log out, then their session is invalidated and they are redirected to the landing page, and any subsequent authenticated request fails until they log in again.

### FR-AUTH-004 — Forgot Password (Request)
**Description:** Lets a user request a password-reset email.
**Actor:** Guest
**Preconditions:** None (works even if email doesn't exist, to avoid account enumeration).
**Trigger:** User submits their email on the "Forgot password" screen.
**Main Flow:** User submits email → backend checks if account exists → if it does, generate a single-use, time-limited reset token and email a reset link → regardless of existence, show the same generic confirmation ("If an account exists, a reset link has been sent").
**Validation:** Email format only.
**Success Result:** Generic confirmation screen shown in all cases (existence-safe).
**Failure Result:** Same generic confirmation is shown even on internal failure to avoid leaking system state; actual failures are logged server-side and, if email delivery genuinely fails, a retry mechanism applies.
**Data Impact:** Creates a password-reset token record (tied to `userId`, with expiry).
**Authorization:** None required.
**UI State:** Loading, Success (generic confirmation), Error only for malformed email input.
**Acceptance Criteria:** Given a guest submits an email tied to a real account, when they submit, then a reset token is generated and emailed, and the UI shows a generic confirmation regardless of whether the account exists.

### FR-AUTH-005 — Reset Password
**Description:** Lets a user set a new password using a valid reset token.
**Actor:** Guest (holder of a valid reset link)
**Preconditions:** A valid, unexpired, unused reset token exists.
**Trigger:** User opens the reset link and submits a new password.
**Main Flow:** Token validated (exists, not expired, not already used) → new password validated per policy → password hash updated → token marked used/deleted → all existing sessions for that user are invalidated (forces re-login everywhere) → user redirected to login with a success message.
**Alternative Flows:**
- Expired token → "This link has expired, request a new one" with a direct action to FR-AUTH-004.
- Already-used token → same expired-style message (tokens are single-use).
**Validation:** New password must meet the same policy as FR-AUTH-001; confirmation must match.
**Success Result:** Password updated, all sessions invalidated, user redirected to login.
**Failure Result:** No password change on invalid/expired/malformed token; specific, safe error shown.
**Data Impact:** Updates `users.passwordHash`; deletes/invalidates the reset token; invalidates active sessions for the user.
**Authorization:** Possession of a valid token is the authorization mechanism (no login required).
**UI State:** Loading, Success (redirect + toast), Error (expired/invalid token screen), Disabled (submit disabled until password fields are valid and match).
**Acceptance Criteria:**
- Given a valid unexpired token, when the user submits a new valid password, then the password is updated, all sessions are invalidated, and the user is redirected to login.
- Given an expired or already-used token, when the user attempts to reset, then no change occurs and they are prompted to request a new link.

### FR-AUTH-006 — Email Verification
**Description:** Confirms the user controls the email address used to register.
**Actor:** Guest/Authenticated User (immediately post-registration)
**Preconditions:** Unverified account exists.
**Trigger:** User clicks the verification link sent in FR-AUTH-001, or clicks "Resend verification."
**Main Flow:** Token validated → account `status` updated to `verified` → user redirected to login (or auto-logged-in, per the decision in §37) with confirmation.
**Alternative Flows:** Expired/invalid token → prompt to resend; resend is rate-limited (§28) to prevent email-spam abuse.
**Validation:** Token must be valid, unexpired, and match the account.
**Success Result:** Account marked verified; login is now permitted (FR-AUTH-002 no longer blocks).
**Failure Result:** Account remains unverified; user shown a clear retry path.
**Data Impact:** Updates `users.status`; deletes/invalidates the verification token.
**Authorization:** Token possession is the authorization mechanism.
**UI State:** Success confirmation screen; Error screen with resend action.
**Acceptance Criteria:** Given an unverified account and a valid verification link, when the user opens it, then the account becomes verified and login is unblocked.

### FR-AUTH-007 — Change Password (Authenticated)
**Description:** Lets a logged-in user change their password from Settings.
**Actor:** Authenticated User
**Preconditions:** User is logged in.
**Trigger:** User submits current password + new password in Settings.
**Main Flow:** Current password verified against stored hash → new password validated per policy → hash updated → (recommended) all other active sessions invalidated except the current one, with a confirmation notice.
**Validation:** Current password must match; new password must meet policy and differ from current.
**Success Result:** Password updated; confirmation toast shown.
**Failure Result:** Current-password mismatch → specific field error; no change made.
**Data Impact:** Updates `users.passwordHash`.
**Authorization:** Must be authenticated; acts only on the requester's own account.
**UI State:** Loading, Success (toast), Error (inline).
**Acceptance Criteria:** Given a logged-in user who correctly enters their current password and a valid new password, when they submit, then the password is updated and other sessions are invalidated.

### FR-AUTH-008 — Account Deletion
**Description:** Permanently deletes a user's account and cascades per PRD §31.
**Actor:** Authenticated User
**Preconditions:** User is logged in; explicit confirmation step completed.
**Trigger:** User confirms "Delete my account" (with a secondary confirmation, e.g., typing their email or a confirm phrase).
**Main Flow:** User confirms intent (double-confirmation required) → backend revokes provider tokens where the provider supports revocation → cascades deletion across `connections`, `sourceProfiles`, `githubRepositories`, `unifiedProfiles`, `portfolioDrafts`, `portfolios` (public slug immediately stops resolving) → `users` record deleted or anonymized per retention policy (**[Decision Required, §37]** — hard delete vs. anonymize-and-retain minimal audit trail) → all sessions invalidated → confirmation shown → redirect to landing page.
**Validation:** Confirmation text/step must match exactly before the action proceeds.
**Success Result:** Account and all associated personal data removed per §29 cross-cutting deletion rules; public portfolio 404s immediately.
**Failure Result:** If cascade fails partway, the operation is retried/rolled back rather than left in a partial state (transactional guarantee); user is shown an error and asked to retry or contact support.
**Data Impact:** Deletes/anonymizes across all collections listed in PRD §31.
**Authorization:** Must be authenticated; acts only on the requester's own account; cannot be triggered on another user's account except by Admin under a separate, audited admin flow (not defined as self-service here).
**UI State:** Confirmation modal (destructive-action styling), Loading, Success (redirect + generic "your account has been deleted" message), Error (retry).
**Acceptance Criteria:** Given a logged-in user completes the double-confirmation, when they submit, then their account and all associated data are deleted per the cascade rules, and their public portfolio URL immediately stops resolving.

---

## 5. Dashboard (FR-DASH)

### FR-DASH-001 — Dashboard Overview
**Description:** The authenticated landing screen summarizing account/connection/portfolio state.
**Actor:** Authenticated User
**Preconditions:** User is logged in and verified.
**Trigger:** Navigation to `/dashboard` (default post-login destination).
**Main Flow:** Load user profile summary, connection statuses (GitHub/LinkedIn), profile completeness %, portfolio status (none/draft/published), selected template (if any), publish status and URL (if published) → render summary cards/CTAs appropriate to state.
**Alternative Flows:**
- **First-time user** (no connections, no portfolio): dashboard emphasizes a single primary CTA — "Connect GitHub to get started" — and de-emphasizes/hides sections not yet relevant (e.g., no "Published" card until something exists).
- **Returning user with connections but no generated portfolio:** CTA is "Generate your portfolio."
- **Returning user with a draft:** CTA is "Continue editing" / "Publish."
- **Returning user with a published portfolio:** shows live URL, "View," "Edit," and "Unpublish" actions.
**Validation:** N/A (read-only screen).
**Success Result:** Accurate, current state rendered.
**Failure Result:** If any sub-fetch fails (e.g., connection status service error), that card shows a scoped error state rather than failing the entire dashboard.
**Data Impact:** Read-only (may trigger a lightweight status recheck, not a full sync).
**Authorization:** Authenticated user sees only their own data.
**UI State:**
- Loading: skeleton cards for each dashboard section.
- Empty: first-time-user variant described above.
- Success: fully populated cards.
- Error: per-card scoped error with retry, not a full-page failure.
**Acceptance Criteria:** Given a first-time authenticated user, when they land on the dashboard, then they see a single clear "Connect GitHub" primary action and no misleading empty "Published" or "Draft" cards.

### FR-DASH-002 — Profile Completeness Display
**Description:** Shows a completeness percentage and a list of missing fields driving that score.
**Actor:** Authenticated User
**Preconditions:** At least one data source (GitHub, LinkedIn, or manual entry) has been touched — otherwise completeness is 0% by definition, not an error.
**Trigger:** Automatically computed on dashboard/profile load; recomputed after any profile edit or sync.
**Main Flow:** System evaluates the Unified Profile against a defined required/optional field weighting (see FR-PROFILE-003) → renders percentage + a "Missing" list linking directly to the relevant input.
**Validation:** N/A (derived value).
**Success Result:** Accurate percentage and actionable missing-field list.
**Failure Result:** If computation fails, show "Completeness unavailable" rather than a wrong number — never show a stale/incorrect percentage silently.
**Data Impact:** Read-only.
**Authorization:** User sees only their own completeness.
**UI State:** Loading (skeleton), Empty (0% with "Connect GitHub or add info to get started"), Success (percentage + list), Error (explicit "unavailable" state).
**Acceptance Criteria:** Given a user with GitHub connected but no experience/education entered, when they view the dashboard, then completeness reflects that gap and "Add experience," "Add education" appear as missing items, each linking to the correct input location.

---

## 6. GitHub Integration (FR-GITHUB)

### FR-GITHUB-001 — Connect GitHub
**Description:** Initiates and completes GitHub OAuth authorization.
**Actor:** Authenticated User
**Preconditions:** User is logged in; GitHub is not already connected (or is connected and being reconnected/reauthorized).
**Trigger:** User clicks "Connect GitHub."
**Main Flow:**
1. Backend generates an OAuth authorization URL with a signed state parameter and redirects the user to GitHub.
2. User authenticates with GitHub (if not already) and approves the requested scopes (`read:user` + public repo read access — see PRD §9.1).
3. GitHub redirects back to the app's callback URL with an authorization code and the state parameter.
4. Backend validates the state parameter (CSRF protection), exchanges the code for an access token, and stores the token encrypted, associated with `{userId, provider: "github"}`.
5. Backend immediately performs an initial data fetch (FR-GITHUB-004/005).
6. User is returned to the dashboard/Connections screen showing "GitHub: Connected ✓."
**Alternative Flows:**
- User denies authorization on GitHub's consent screen → redirected back with an error state; connection remains "Not connected"; no partial data stored.
- State parameter mismatch/missing (possible CSRF attempt) → request rejected, generic error shown, logged as a security event.
- Reconnecting an already-connected account (e.g., after a revoke) → old token is replaced, not duplicated.
**Validation:** State parameter must match; authorization code must successfully exchange for a token.
**Success Result:** `connections` record created/updated with `status: connected`; initial GitHub sync triggered.
**Failure Result:** No connection persisted; user sees a specific, non-technical error ("GitHub connection didn't complete — please try again") with a retry action.
**Data Impact:** Creates/updates a `connections` record (encrypted token); triggers `sourceProfiles`/`githubRepositories` population via FR-GITHUB-004/005.
**Authorization:** Only the authenticated user can connect GitHub to their own account.
**UI State:** Loading (during redirect round-trip), Success ("Connected ✓" badge), Error (denial/failure banner with retry), Disabled (Connect button disabled while a connection attempt is already in flight).
**Acceptance Criteria:**
- Given an authenticated user with no GitHub connection, when they complete GitHub's consent screen, then a connection is stored and an initial sync begins automatically.
- Given the user denies authorization, when they're redirected back, then no connection is stored and a clear retry option is shown.

### FR-GITHUB-002 — GitHub OAuth Callback Validation
**Description:** Server-side validation step underlying FR-GITHUB-001, called out separately because it is security-critical.
**Actor:** System
**Preconditions:** A redirect from GitHub's OAuth authorize endpoint has been received.
**Trigger:** Callback URL is hit.
**Main Flow:** Validate `state` matches the value issued for this user's session → exchange `code` for a token via GitHub's token endpoint (server-to-server, never exposing the client secret to the browser) → verify the token by making a minimal authenticated call (e.g., fetch the authenticated user) before persisting.
**Validation:** State match, successful token exchange, successful verification call.
**Success/Failure Result:** As in FR-GITHUB-001.
**Data Impact:** As in FR-GITHUB-001.
**Authorization:** The callback itself is validated via the signed state parameter, not user session alone (defense against CSRF).
**UI State:** N/A (server-side step; UI reflects the outcome via FR-GITHUB-001 states).
**Acceptance Criteria:** Given a callback request with a tampered or missing state parameter, when it is processed, then the request is rejected and no token is persisted.

### FR-GITHUB-003 — Disconnect GitHub
**Description:** Removes the GitHub connection and stops future syncing.
**Actor:** Authenticated User
**Preconditions:** GitHub is currently connected.
**Trigger:** User clicks "Disconnect" in Settings/Connections.
**Main Flow:** Confirmation prompt shown → on confirm, stored token is deleted (revocation attempted via GitHub's API where supported) → `connections.status` set to `disconnected` → previously imported `sourceProfiles`/`githubRepositories` data **remains** unless the user separately chooses "Delete imported data" (FR-SETTINGS-002) → any already-generated portfolio content sourced from GitHub is **not** retroactively removed from the published portfolio.
**Alternative Flows:** User cancels the confirmation → no change.
**Validation:** Confirmation required before executing (destructive-adjacent action).
**Success Result:** Connection marked disconnected; token invalidated; dashboard shows "GitHub: Not connected."
**Failure Result:** If provider-side revocation call fails, the local disconnection still proceeds (token deleted locally) and the failure is logged — the user is not blocked by an external API hiccup.
**Data Impact:** Updates `connections.status`; deletes the encrypted token; does not touch `unifiedProfiles`/`portfolios` unless the user separately requests data deletion.
**Authorization:** Only the owning user.
**UI State:** Confirmation modal, Loading, Success (badge updates), Error (rare — logged, but local disconnect still succeeds).
**Acceptance Criteria:** Given a connected GitHub account, when the user confirms disconnect, then the connection status becomes "Not connected," future syncs are blocked, and existing portfolio content is unaffected until the user explicitly deletes imported data.

### FR-GITHUB-004 — GitHub Profile Sync
**Description:** Fetches the authenticated GitHub user's public profile fields.
**Actor:** System (triggered by connect, manual sync, or generation)
**Preconditions:** Valid, connected GitHub token exists.
**Trigger:** Initial connect (FR-GITHUB-001), manual sync (FR-SYNC-001), or as part of a generation job (FR-AI-001).
**Main Flow:** Call GitHub's authenticated-user endpoint → map returned fields to the normalized `GithubProfile` shape (username, displayName, avatarUrl, bio, company [self-reported string], location [self-reported string], blogUrl, publicEmail if set, followers, publicRepoCount) → store in `sourceProfiles` → mark `fetchedAt`.
**Data classification (explicit, per PRD §9.2/§9.3):**
- **Public/automatically obtainable:** username, display name, avatar, bio, self-reported company/location strings, public repo count, followers, blog/website URL, public email (only if the user has made it public on GitHub).
- **Not fetched:** private email (unless explicitly public), organization-internal data, anything requiring scopes beyond `read:user` + public repo read.
**Alternative Flows:** Some fields may be null (e.g., no bio set) — stored as null, never defaulted to placeholder text.
**Validation:** API response shape validated before mapping; unexpected/missing fields handled gracefully (field-level null, not a fetch failure).
**Success Result:** `sourceProfiles` updated with current GitHub profile snapshot.
**Failure Result:** On API error, sync marked failed for this step; existing previously-fetched data is preserved (not wiped on a failed refresh).
**Data Impact:** Upserts one `sourceProfiles` document (GitHub type) per user.
**Authorization:** System-level call using the user's own stored token; never used to fetch another user's private data.
**UI State:** Reflected via FR-SYNC-002 (sync status) rather than its own dedicated screen.
**Acceptance Criteria:** Given a connected GitHub account with a public bio and location set, when a sync runs, then those fields are stored accurately; given a field is unset on GitHub, then it is stored as null, not a placeholder.

### FR-GITHUB-005 — GitHub Repository Sync
**Description:** Fetches the user's public repositories with pagination and rate-limit handling.
**Actor:** System
**Preconditions:** Valid, connected GitHub token exists.
**Trigger:** Same as FR-GITHUB-004.
**Main Flow:** Fetch repositories page by page (following pagination links) up to a defined cap (e.g., 300) → for each repo, map: name, description, URL, homepage, primary language, language breakdown, topics, stars, forks, isFork, isArchived, license, createdAt, pushedAt, openIssues, default branch → store/update `githubRepositories` (upsert per `repoId`) → check rate-limit headers between batches; if exhausted, pause and resume automatically after reset rather than failing.
**Data classification:** All fields above are public data available without elevated scopes for public repositories. README content and detailed content-level metadata are fetched separately and only for user-selected/candidate-featured repos (FR-GITHUB-007), not for all repos, to control API usage.
**Alternative Flows:**
- Zero repositories → sync completes successfully with an empty list; this is a valid, non-error state (see §34, edge case 1).
- Repository cap reached (e.g., 500+ repos) → sync completes with the top-N by simple recency/relevance pre-filter and a flag `moreReposExist: true` surfaced to the user.
**Validation:** Each repo record validated for required identity fields (`repoId`, `name`) before upsert; malformed entries are skipped and logged, not allowed to fail the whole sync.
**Success Result:** `githubRepositories` reflects current public repo state; relevance scoring (FR-GITHUB-006) runs afterward.
**Failure Result:** Partial sync preserved (repos fetched before a failure remain stored); user notified sync was incomplete with a retry option; no silent data loss of previously synced repos.
**Data Impact:** Upserts/updates `githubRepositories`; removes repos that no longer exist/are no longer public (soft-flagged rather than hard-deleted if they are currently featured in a published portfolio — **[Decision Required, §37]**).
**Authorization:** System-level, scoped to the user's own token.
**UI State:** Sync progress indicator ("Syncing GitHub... this may take a moment") if rate-limited and paused; success toast on completion; error state with retry on failure.
**Acceptance Criteria:**
- Given a user with 0 repos, when sync runs, then it completes successfully with an empty repository list and no error is shown.
- Given a user with 500+ repos, when sync runs, then it completes with a capped, relevance-ordered set and a visible "more repositories exist" indicator.
- Given the GitHub rate limit is hit mid-sync, when this occurs, then the sync pauses and automatically resumes after the reset window, without the user needing to manually retry.

### FR-GITHUB-006 — Repository Relevance Ranking
**Description:** Computes a relevance score used to pre-suggest featured repositories.
**Actor:** System
**Preconditions:** Repository sync (FR-GITHUB-005) has completed at least once.
**Trigger:** Runs automatically after every repository sync.
**Main Flow:** For each repo, compute a score from: not-a-fork (positive), not-archived (positive), has description (positive), has README (positive), recency of last push (positive, decaying), star count (positive, diminishing returns), presence of recognized languages/topics (positive), non-trivial repo size (positive; filters out empty scaffolds) → sort descending → mark the top N (default 6–8, **[Decision Required, §37]** exact N) as `suggestedFeatured: true`.
**Alternative Flows:** Fewer than N qualifying repos exist → all available repos are suggested; system does not pad with irrelevant repos to reach N.
**Validation:** N/A (derived computation).
**Success Result:** Each repo has a `relevanceScore` and a `suggestedFeatured` flag available to the editor.
**Failure Result:** If scoring fails for a subset of repos (e.g., malformed data), those repos are simply excluded from suggestions (default `suggestedFeatured: false`), not treated as a hard failure.
**Data Impact:** Updates `githubRepositories.relevanceScore` / `suggestedFeatured` fields.
**Authorization:** System-level.
**UI State:** N/A directly; consumed by FR-GITHUB repository-selection UI and FR-EDITOR-005.
**Acceptance Criteria:** Given a user's repos include forks, archived repos, and one active well-described original repo, when scoring runs, then the active original repo scores higher and is suggested as featured; forks/archived repos are not suggested by default.

### FR-GITHUB-007 — Repository Selection (Manual Override)
**Description:** Lets the user view all synced repositories, see AI/system suggestions, and make the final featured-project selection.
**Actor:** Authenticated User
**Preconditions:** Repository sync has completed at least once.
**Trigger:** User opens the "Projects" step of generation or the editor's Projects section.
**Main Flow:** Display all repos (paginated for large sets) with suggested-featured ones pre-checked → user can check/uncheck any repo, search/filter by name or language, and reorder the selected/featured set → selection saved as `isFeatured` (user-set) per repo, which always overrides `suggestedFeatured`.
**Alternative Flows:**
- Zero repos → this screen shows an empty state directing the user to add a manual project entry instead (manual project entries are a distinct, non-GitHub-sourced item in the Unified Profile's `projects` list — see FR-PROFILE §10/§11).
- User has exactly one repo → it is pre-suggested and pre-checked, but the user can still uncheck it.
**Validation:** No hard minimum number of featured projects required to proceed (empty Projects section is valid — see FR-PORTFOLIO), though the UI nudges toward selecting at least one if any repos exist.
**Success Result:** User's featured selection is persisted and used by AI generation (FR-AI-001) and the editor.
**Failure Result:** Save failure shows a retry; unsaved selection is preserved client-side until the retry succeeds.
**Data Impact:** Updates `githubRepositories.isFeatured` per repo for this user.
**Authorization:** Only the owning user can select/deselect their own repos.
**UI State:** Loading (fetching repo list), Empty (no repos → prompt to add manual project), Success (list with checkboxes), Error (retry).
**Acceptance Criteria:** Given the system suggests 6 featured repos, when the user unchecks 2 and checks 1 additional repo, then the final featured set reflects exactly the user's choices on next load, regardless of the original suggestion.

---

## 7. (Continued in §6 — GitHub Repository Selection is covered by FR-GITHUB-006/007 above.)

---

## 8. LinkedIn Integration (FR-LINKEDIN)

### FR-LINKEDIN-001 — Connect LinkedIn
**Description:** Initiates and completes "Sign In with LinkedIn" (OpenID Connect) authorization.
**Actor:** Authenticated User
**Preconditions:** User is logged in.
**Trigger:** User clicks "Connect LinkedIn."
**Main Flow:**
1. Before redirecting, the UI shows a clear, plain-language explanation: *"LinkedIn sign-in confirms your identity, name, and profile photo, and can share your email if you allow it. LinkedIn does not allow apps like this to automatically import your work history, education, or skills — you'll add those yourself in a minute."* (This disclosure is a functional requirement, not optional copy — see PRD §10.5.)
2. Backend generates the OIDC authorization URL (scopes: `openid`, `profile`, `email`) with a signed state parameter, redirects to LinkedIn.
3. User authenticates with LinkedIn and approves scopes.
4. LinkedIn redirects back with an authorization code.
5. Backend validates state, exchanges the code for tokens, verifies the ID token, stores the access token encrypted.
6. Backend fetches identity claims (name, photo, email if granted) and stores them in `sourceProfiles`.
7. User is returned to Connections with "LinkedIn: Connected ✓" and immediately shown the manual-entry prompts for Experience/Education/Skills/Certifications.
**Alternative Flows:**
- User denies authorization → connection remains not-connected, clear retry shown.
- User grants `openid`/`profile` but denies `email` → connection still succeeds; email field remains empty/manual; this is a valid partial-success state, not a failure.
- State mismatch → rejected, logged as a security event.
**Validation:** State match; successful token exchange; ID token signature/claims verified.
**Success Result:** `connections` record created for `provider: "linkedin"`; identity fields stored; user routed toward manual entry for the rest.
**Failure Result:** No connection persisted; specific non-technical error with retry.
**Data Impact:** Creates/updates `connections` (encrypted token) and `sourceProfiles` (LinkedIn identity claims only).
**Authorization:** Only the authenticated user can connect LinkedIn to their own account.
**UI State:** Pre-connect disclosure screen (mandatory), Loading, Success ("Connected ✓" + prompt to add experience), Error (denial/failure banner), Disabled (button disabled mid-flow).
**Acceptance Criteria:**
- Given an authenticated user, when they complete LinkedIn's consent screen granting all requested scopes, then identity/photo/email are imported and the user is prompted to manually add experience/education/skills.
- Given the user denies the `email` scope specifically, when the flow completes, then the connection still succeeds without an email value, and no error is shown for that alone.

### FR-LINKEDIN-002 — LinkedIn OAuth Callback Validation
**Description:** Security-critical server-side validation underlying FR-LINKEDIN-001.
**Actor:** System
**Main Flow/Validation:** Mirrors FR-GITHUB-002: state validated, code exchanged server-to-server, ID token signature and claims (issuer, audience, expiry) verified before any data is persisted.
**Acceptance Criteria:** Given a callback with an invalid or expired ID token, when processed, then no connection is persisted and the user sees a generic retry-able error.

### FR-LINKEDIN-003 — Disconnect LinkedIn
**Description:** Removes the LinkedIn connection.
**Actor:** Authenticated User
**Main Flow:** Confirmation → token deleted (revoked where supported) → `connections.status = disconnected` → previously imported identity data remains in `sourceProfiles`/`unifiedProfiles` unless the user separately deletes imported data (FR-SETTINGS-002) → manually entered experience/education/etc. (never LinkedIn-sourced to begin with, per §10.2) is entirely unaffected, since it was never tied to the LinkedIn connection's lifecycle.
**Acceptance Criteria:** Given a connected LinkedIn account, when the user disconnects, then the connection shows "Not connected," and all manually entered professional history remains fully intact.

### FR-LINKEDIN-004 — LinkedIn Identity Data Fetch
**Description:** Defines exactly what is and is not retrieved from LinkedIn.
**Actor:** System
**Data classification (explicit, per PRD §10.2 — this is the most important classification in the document and must not be silently expanded):**
- **Automatically obtainable (V1):** first name, last name, profile picture URL, email address (only if `email` scope granted), LinkedIn member identifier (URN) — used internally for de-duplication, never displayed to the public portfolio visitor.
- **NOT automatically obtainable via this integration:** headline, About/summary text, work experience (companies, titles, dates, descriptions), education history, skills list, certifications, endorsements, recommendations, connection count, any activity/posts data.
- **Never attempted:** scraping the public-facing LinkedIn profile page in any form, regardless of technical feasibility, per the explicit non-negotiable constraint in the PRD.
**Success Result:** Identity fields stored; all other professional-history fields in the Unified Profile remain `source: null`/empty until the user fills them in manually (FR-PROFILE-002) or, in V1.0, imports them via the optional resume-upload convenience path (FR-LINKEDIN-005).
**Acceptance Criteria:** Given a LinkedIn connection is established, when the Unified Profile is inspected, then `experience`, `education`, `skills`, and `certifications` remain empty/manual-only unless the user has independently entered them — the system must never populate these fields from the LinkedIn connection alone.

### FR-LINKEDIN-005 — Resume/PDF Upload Import (V1.0, not MVP)
**Description:** Optional convenience feature letting the user upload their own exported LinkedIn PDF or resume to pre-fill Experience/Education/Skills as an editable draft.
**Actor:** Authenticated User
**Preconditions:** Legal review of this approach completed (see PRD §10.6); feature flag enabled.
**Trigger:** User uploads a PDF/document in the "Add experience" flow via an "Import from resume" option.
**Main Flow:** File uploaded → server-side text extraction → heuristic parsing into candidate Experience/Education/Skills entries → all candidates shown to the user as an editable, unsaved **draft** clearly labeled "Imported — please review" → user confirms, edits, or discards each entry individually → confirmed entries are saved with `source: "manual"` (not `"linkedin"`, since it was not retrieved via the LinkedIn API).
**Alternative Flows:** Parsing yields low-confidence/garbled results → entries still shown but flagged "please double-check this" rather than silently accepted; user can discard the whole import and type manually instead.
**Validation:** File type/size limits enforced; no entry is saved to the Unified Profile without explicit per-entry user confirmation.
**Success Result:** User saves time entering experience while retaining full review/edit control.
**Failure Result:** Parsing failure → clear message ("We couldn't read that file — try manual entry"), no partial/garbled data silently saved.
**Data Impact:** Creates candidate entries in a temporary import-review state; only confirmed entries persist to `unifiedProfiles`.
**Authorization:** Only the owning user; uploaded files are never shared across users and are deleted after processing (not retained as raw files beyond what's needed for the import session).
**UI State:** Uploading, Parsing (loading), Review (editable candidate list), Success (confirmed entries added), Error (parse failure).
**Acceptance Criteria:** Given a user uploads their own LinkedIn PDF export, when parsing completes, then no entry is added to their profile until they explicitly confirm it, and confirmed entries are marked as manually sourced, not LinkedIn-API-sourced.

---

## 9–10. Missing Information & Unified Profile (FR-PROFILE)

### FR-PROFILE-001 — Missing Information Detection
**Description:** Identifies which portfolio-relevant fields are absent after available syncs.
**Actor:** System
**Trigger:** Runs after any sync (GitHub/LinkedIn) or manual profile edit.
**Main Flow:** Compare the current Unified Profile against the required/optional field list (FR-PROFILE-003 defines weighting) → produce a list of missing fields, each tagged with which section it belongs to and a direct link/action to fill it.
**Validation:** N/A (derived).
**Success Result:** Accurate, current missing-field list surfaced on the dashboard and in the generation pre-check (FR-AI-001, step 1).
**Data Impact:** Read-only/derived; not persisted as its own record (computed on read, or cached with a short TTL — **[Decision Required, §37]**).
**Authorization:** User sees only their own missing-field list.
**UI State:** Empty (nothing missing → "Your profile looks complete!"), Success (list with links), Loading (skeleton while computing post-sync).
**Acceptance Criteria:** Given a user has GitHub connected but no About/summary text and no experience entered, when the missing-info check runs, then "About," "Experience" appear as missing with links to add them.

### FR-PROFILE-002 — Manual Field Entry
**Description:** Lets the user directly enter any field not automatically obtainable.
**Actor:** Authenticated User
**Trigger:** User opens a manual-entry form (from the missing-info list, dashboard, or editor).
**Main Flow:** User fills structured form fields appropriate to the section (e.g., Experience: company, title, start date, end date/current, description) → client + server validation → saved to Unified Profile with `source: "manual"`.
**Validation:** Per-field: required vs optional (see FR-PORTFOLIO §15 for the authoritative required/optional table), date validation (start ≤ end, no future start dates beyond reasonable bounds), URL validation (well-formed, https preferred), max lengths (e.g., description ≤ 2000 chars — **[Decision Required, exact limits, §37]**).
**Success Result:** Field saved; completeness recalculated (FR-PROFILE-003); missing-info list updated.
**Failure Result:** Inline validation errors; nothing saved until valid.
**Data Impact:** Updates `unifiedProfiles` (embedded array entry for experience/education/etc., or a scalar field for personal/about).
**Authorization:** Only the owning user can edit their own profile.
**UI State:** Loading (save in progress), Success (toast/inline confirmation), Error (inline field errors), Empty (form starts blank or pre-filled from an import draft per FR-LINKEDIN-005).
**Acceptance Criteria:** Given a user fills in a valid Experience entry, when they save, then it appears in their Unified Profile with `source: manual` and contributes to completeness immediately.

### FR-PROFILE-003 — Profile Completeness Calculation
**Description:** Defines how the completeness percentage is computed.
**Actor:** System
**Main Flow:** Assign weight to each field/section based on required-vs-optional classification (see FR-PORTFOLIO §15 table) → completeness = (sum of weights for populated fields) / (sum of all weights) × 100, rounded to nearest whole percent → **[Decision Required, §37]**: exact weighting table (e.g., is "Certifications" weighted the same as "About"?) needs explicit product sign-off before implementation; this FRD defines the *mechanism*, not the final weight table.
**Validation:** N/A.
**Success Result:** A single percentage plus the missing-field list (FR-PROFILE-001) derived from the same underlying check.
**Acceptance Criteria:** Given two users with identical data except one has an About section and the other doesn't, when completeness is computed, then the user with About scores strictly higher, proportional to About's defined weight.

### FR-PROFILE-004 — Unified Profile Merge/Normalization
**Description:** Combines GitHub + LinkedIn + manual data into the single Unified Profile record, applying normalization rules.
**Actor:** System
**Trigger:** Runs after any sync or manual edit.
**Main Flow:**
1. **Field normalization:** dates converted to a single internal format regardless of source format; URLs normalized (protocol added if missing, trailing slashes trimmed, validated as well-formed); text fields trimmed of leading/trailing whitespace.
2. **Skill normalization:** GitHub language names and any manually entered skills are merged into a single deduplicated `skills` list; case-insensitive matching prevents "JavaScript" and "javascript" appearing as two entries; user-entered skill names take precedence over auto-derived casing/naming.
3. **Project normalization:** GitHub-sourced projects (from featured repos) and manually entered projects are merged into one `projects` list; duplicate detection compares by repo URL/identity to avoid the same project appearing twice if a user also manually re-adds it.
4. **Experience normalization:** manual-only in V1 (per §10); stored as entered, with date-range validation applied.
5. **Source tracking:** every mergeable field retains a `source` tag (`github` | `linkedin` | `manual` | `ai`), set at write time and never silently overwritten by a lower-precedence source (see FR-DATA-001).
**Validation:** As defined per sub-field in FR-PROFILE-002 and FR-GITHUB-005.
**Success Result:** A single, internally consistent Unified Profile ready for completeness scoring and AI generation input.
**Failure Result:** If normalization fails for a specific field, that field is left in its prior state (not corrupted), and the failure is logged; the rest of the merge proceeds.
**Data Impact:** Updates `unifiedProfiles`.
**Authorization:** System-level, scoped per user.
**Acceptance Criteria:** Given a user has "React" from a GitHub repo language and manually types "react" as a skill, when normalization runs, then only one "React" skill entry exists in the Unified Profile, using the user's manually entered casing.

---

## 11. Synchronization (FR-SYNC)

### FR-SYNC-001 — Manual Sync Trigger
**Description:** Lets the user manually re-fetch data from connected providers.
**Actor:** Authenticated User
**Preconditions:** At least one provider connected.
**Trigger:** User clicks "Sync" on Connections/Dashboard.
**Main Flow:** Re-run FR-GITHUB-004/005 and/or LinkedIn identity refresh (FR-LINKEDIN-004) for connected providers → update `sourceProfiles`/`githubRepositories` → re-run normalization (FR-PROFILE-004) → **user-edited fields (source: manual, previously overridden) are never overwritten by this sync** — only fields still tagged with their original provider source are refreshed (see FR-DATA-001 for the enforcement rule).
**Alternative Flows:** No providers connected → "Sync" action is disabled/hidden with an explanatory tooltip.
**Validation:** N/A.
**Success Result:** Updated data reflected; "Last synced" timestamp updated; completeness recalculated.
**Failure Result:** Partial-failure handling per FR-GITHUB-005/FR-LINKEDIN-004; user notified which provider failed, if any, without blocking the successful provider's update.
**Data Impact:** Updates `sourceProfiles`, `githubRepositories`, `unifiedProfiles` (non-manual fields only), `connections.lastSyncedAt`.
**Authorization:** Only the owning user can trigger their own sync.
**UI State:** Loading ("Syncing..."), Success (toast + updated timestamp), Error (per-provider error banner), Disabled (rate-limited — see §28 — button shows a cooldown indicator).
**Acceptance Criteria:** Given a user has manually edited their About text, when they trigger a sync, then the About text is unchanged, while GitHub repo data still refreshes to current values.

### FR-SYNC-002 — Sync Status Display
**Description:** Shows when data was last synced and whether a sync is currently in progress.
**Actor:** Authenticated User
**Trigger:** Rendered on Connections/Dashboard.
**Main Flow:** Display "Last synced: [relative time]" per provider; if a sync/job is in progress, show a progress indicator rather than allowing a duplicate concurrent sync.
**Success Result:** Accurate status at all times.
**UI State:** Idle (timestamp shown), In-progress (spinner/progress), Error (last sync failed, with retry).
**Acceptance Criteria:** Given a sync is currently running, when the user views Connections, then the Sync button is disabled/shows progress rather than allowing a second concurrent sync to be triggered.

---

## 12. Data Priority Rules (FR-DATA)

### FR-DATA-001 — Precedence Enforcement
**Description:** The system-wide rule governing which value wins when a field could come from multiple sources.
**Actor:** System (enforced at every write path that touches `unifiedProfiles` or `portfolioDrafts`)
**Precedence order (highest to lowest):** 1) User-edited data, 2) Verified source data (GitHub/LinkedIn API, or a confirmed FR-LINKEDIN-005 import), 3) AI-generated presentation content, 4) Derived/inferred data (e.g., relevance scores, suggested-featured flags).
**Main Flow (enforcement mechanics):**
- Every field carries a `source` tag.
- A sync (FR-SYNC-001) may only overwrite a field whose current `source` is the *same provider* it's syncing from, or that has never been set. It must never overwrite a field currently tagged `manual`.
- AI generation (FR-AI-001/FR-AI-004) may only write to fields not already tagged `manual`; once the user edits an AI-generated field, its tag flips to `manual` and it becomes protected from future AI overwrites, including a full "Regenerate portfolio" action — full regeneration explicitly **skips** any field the user has touched, unless the user explicitly selects that specific field/section for regeneration (FR-AI-004).
- Derived data (relevance scores, suggestions) never writes directly into a displayed factual field — it only feeds UI suggestions the user must actively accept (e.g., checking a "featured" box).
**Validation:** Enforced at the service layer, not left to individual call sites to remember — a shared merge function is the single place this rule is implemented.
**Success Result:** A user can never lose their own edits to an automated process, and AI can never silently claim authorship over facts it didn't originate.
**Failure Result:** N/A (this is a hard invariant; a violation is treated as a bug, not a valid failure mode).
**Acceptance Criteria:**
- Given a user has edited their project description, when a full portfolio regeneration is run, then that project's description is unchanged unless the user explicitly chose to regenerate that project.
- Given a field has never been touched by the user, when AI generation runs, then AI may populate/update it.
- Given a GitHub sync runs, when it completes, then no field the user manually edited is overwritten, even if the underlying GitHub data has changed.

---

## 13–14. AI Portfolio Generation & Factuality (FR-AI)

### FR-AI-001 — Generate Portfolio
**Description:** The primary trigger that produces a first (or refreshed) AI-assisted PortfolioData draft.
**Actor:** Authenticated User
**Preconditions:** At least minimal profile data exists (system does not hard-block on a specific completeness threshold, but warns if completeness is very low — **[Decision Required, exact threshold, §37]**).
**Trigger:** User clicks "Generate Portfolio."
**Main Flow:**
1. System validates profile has at least some content to work with; if the profile is essentially empty, block with a specific message directing the user to add at least basic info first, rather than generating an empty/near-empty portfolio.
2. A `generationJobs` record is created (`status: queued`); the user is shown the job as "in progress" and can navigate away (job continues in the background — see PRD §26).
3. Job worker collects the current Unified Profile.
4. Prepares AI input (structured JSON of verified facts only — no free text prompt containing unverified claims).
5. Calls the AI provider with the factuality-constrained system instructions (FR-AI-005).
6. Receives structured JSON output.
7. Validates output against the PortfolioData schema (FR-AI-003).
8. If valid: merges into `portfolioDrafts` respecting precedence (FR-DATA-001); marks job `succeeded`.
9. If invalid: retries once with a stricter reminder; if still invalid, marks job `failed` with a specific error and does not save partial/malformed data.
10. User is notified (in-app, and optionally via FR-NOTIF) that generation completed, and is routed to the editor/review screen.
**Alternative Flows:**
- User navigates away during generation → job continues; user is notified on return or via notification when done.
- User triggers "Generate" again while a job is already in progress → blocked with "A generation is already in progress" rather than queuing a duplicate.
**Validation:** Profile non-emptiness check; AI output schema validation (FR-AI-003).
**Success Result:** `portfolioDrafts` populated/updated; user routed to review/edit.
**Failure Result:** Job marked failed with a specific, retryable reason; no malformed data saved; user sees a clear message and a "Retry" action.
**Data Impact:** Creates a `generationJobs` record; updates `portfolioDrafts` on success.
**Authorization:** Only the owning user can trigger generation for their own profile.
**UI State:** Loading ("Generating your portfolio... this can take up to a minute"), Success (redirect to review + confirmation), Error (specific failure message + retry), Disabled (Generate button disabled while a job is already running).
**Acceptance Criteria:**
- Given a user with a reasonably populated profile, when they click Generate, then a job starts, and on completion valid PortfolioData is available for review.
- Given a user with an essentially empty profile, when they click Generate, then the system blocks with guidance to add basic info first, rather than producing near-empty AI content.
- Given a generation job is already running for a user, when they click Generate again, then no second job is started.

### FR-AI-002 — Generation Job Processing (Background)
**Description:** Defines the background-worker contract underlying FR-AI-001.
**Actor:** System
**Main Flow:** Worker claims a `queued` job (lock/claim field prevents double-processing) → executes sync (if requested)/normalize/AI-call/validate/save steps → updates job status at each stage so the frontend can poll meaningful progress (`queued → syncing → generating → validating → succeeded/failed`) rather than a single opaque "processing" state.
**Failure Result:** Any stage failure marks the job failed with a stage-specific reason (e.g., `failed_at: "github_sync"` vs `failed_at: "ai_generation"`) so the user/UI can give targeted guidance (e.g., "GitHub sync failed" vs "AI generation failed").
**Acceptance Criteria:** Given a job fails specifically at the AI-generation stage after a successful sync, when the user views the failure, then the message specifically references AI generation, not a generic failure, and any successfully synced data is retained.

### FR-AI-003 — AI Output Validation
**Description:** Server-side schema validation of every AI response before it can be persisted.
**Actor:** System
**Main Flow:** Parse AI response as JSON → validate against the PortfolioData schema (required shape per FR-PORTFOLIO) → validate that no field contains a value not traceable to the input facts for fact-bearing fields (see FR-AI-005 fact-check pass) → reject if either check fails.
**Failure Result:** Malformed JSON, schema-violating output, or output that introduces untraceable "facts" is rejected outright; one automatic retry is attempted; a second failure surfaces to the user as a failed job, never as silently-saved bad data.
**Acceptance Criteria:** Given the AI returns non-JSON or JSON missing a required top-level key, when validated, then it is rejected and retried once before failing the job cleanly.

### FR-AI-004 — AI Regeneration (Section-Level)
**Description:** Lets the user regenerate a single section/field without affecting others.
**Actor:** Authenticated User
**Preconditions:** A PortfolioData draft already exists.
**Trigger:** User clicks "Regenerate" on a specific section (e.g., "About," or a specific project's description).
**Main Flow:** System scopes the AI call to only that section's relevant facts → generates a new candidate value → validates it (FR-AI-003, scoped) → **shows the user a before/after comparison and requires explicit acceptance before overwriting** (**[Decision Required, §37]** — auto-apply vs. require-confirm; this FRD recommends require-confirm to protect against surprising an already-satisfied user) → on accept, the field is saved and tagged `source: "ai"` (or `"manual"` if the user tweaks it further before accepting).
**Alternative Flows:** User rejects the candidate → prior value is retained unchanged, no data loss.
**Validation:** Same schema/factuality validation as full generation, scoped to the relevant section.
**Success Result:** Only the targeted section changes; everything else in the draft is untouched.
**Failure Result:** Failed regeneration leaves the existing section value untouched; user sees a scoped error, not a full-page failure.
**Data Impact:** Updates a single field/section in `portfolioDrafts`.
**Authorization:** Only the owning user.
**UI State:** Loading (scoped, e.g., a spinner just on that section), Success (before/after or direct update + toast), Error (scoped inline error).
**Acceptance Criteria:** Given a user regenerates only their "About" section, when the job completes, then no other section (Experience, Projects, etc.) is modified, and the prior About text remains available/recoverable until the user explicitly accepts the new version.

### FR-AI-005 — Factuality Enforcement
**Description:** The rules governing what AI is permitted to output, enforced structurally, not just via prompt instruction.
**Actor:** System
**Rules (non-negotiable, per PRD §13/§14):**
- AI may only use facts present in the Unified Profile input; it may rephrase, summarize, categorize, and select — never originate new facts.
- AI must never introduce a company, project, technology, certification, achievement, job title, metric, responsibility, or date not present in the input.
- If a field's underlying fact is missing, AI must return that field as null/omitted, never a plausible-sounding placeholder ("various technologies," "a leading company," etc. are explicitly disallowed outputs).
- A post-generation fact-check pass compares entities mentioned in AI output (company names, technology names, dates) against the known set from the Unified Profile input; any AI-introduced entity not present in that set is stripped from the output before it is shown to the user, and the event is logged for monitoring (a systemic pattern of this occurring indicates a prompt/model issue requiring attention, not a one-off acceptable error).
**Validation:** Automated fact-check pass, described above; not a manual review step (manual review is the user's own edit/review pass, which is a UX requirement, not a substitute for this system-level check).
**Acceptance Criteria:** Given the Unified Profile contains no mention of "AWS," when AI generation runs, then "AWS" (or any other unlisted technology) must not appear anywhere in the resulting PortfolioData, even if it would be a plausible guess given other listed technologies.

---

## 15. PortfolioData (FR-PORTFOLIO)

### FR-PORTFOLIO-001 — PortfolioData Structural & Validation Rules
**Description:** Defines the functional (not code-level) rules for every PortfolioData section: required/optional status, validation, and empty-value handling.

| Section | Required? | Notes / Validation |
|---|---|---|
| Personal (name, headline, avatar) | **Required**: name. Optional: headline, avatar, location. | Name: 1–100 chars. Headline: ≤120 chars. |
| Hero (tagline) | Optional | ≤200 chars; if empty, template falls back to headline only. |
| About | Optional but strongly recommended (weighted in completeness) | ≤2,000 chars (**[Decision Required, exact limit, §37]**). |
| Skills | Optional | Each skill: 1–50 chars; category optional (defaults to "Other" if AI can't categorize confidently — never a fabricated category). |
| Experience | Optional | Each entry: company + title required if the entry exists at all; dates validated (start ≤ end or "current"); description ≤1,500 chars. |
| Education | Optional | School required if entry exists; dates validated. |
| Projects | Optional | Title required if entry exists; URL validated (well-formed) if provided; description ≤1,000 chars. |
| Certifications | Optional | Name + issuer required if entry exists; credential URL validated if provided. |
| Achievements | Optional | Title required if entry exists. |
| GitHub | Optional (absent entirely if not connected) | Username, profile URL, stats, featured repo references. |
| Social Links | Optional | Each URL validated as well-formed; unrecognized/broken URLs rejected at save time with a specific error, not silently stored. |
| Contact | Optional but recommended | Email format validated if provided. |
| Services | Optional (freelancer-persona field) | Title required if entry exists. |
| Meta (SEO title/description, template, theme, visible sections, order) | System-managed, editable | SEO title ≤60 chars recommended (soft warning, not hard block); description ≤160 chars recommended. |

**Empty-value rule:** An absent/empty section is a fully valid state at every stage (draft, preview, publish) — it is never treated as an error, and templates must render it as "not present" (§16), never as an empty heading or a "no data" placeholder box.
**Acceptance Criteria:**
- Given a user has no Certifications, when the portfolio is generated, previewed, and published, then the Certifications section is absent throughout — never shown empty.
- Given a user enters a Social Link that is not a valid URL, when they attempt to save, then the save is rejected with a specific "enter a valid URL" message.

---

## 16. Templates (FR-TEMPLATE)

### FR-TEMPLATE-001 — Template Selection
**Description:** Lets the user choose which of the available templates renders their portfolio.
**Actor:** Authenticated User
**Preconditions:** A PortfolioData draft exists (template selection can happen before or after first generation — **[Decision Required, exact ordering in the flow, §37]**, though this FRD recommends allowing selection at any time since templates are purely presentational).
**Trigger:** User opens the Templates screen and selects a template.
**Main Flow:** Display the available template catalog (thumbnail, name, short description) → user selects one → `portfolioDrafts.meta.templateId` updated → preview updates immediately using the same PortfolioData (FR-PREVIEW-001).
**Validation:** Selected `templateId` must exist in the current catalog.
**Success Result:** Template applied; no PortfolioData is altered or lost by the switch (this is the core guarantee — see FR-TEMPLATE-002).
**Failure Result:** N/A (selection is a simple, low-risk operation); a failed save is retried/shows a toast error.
**Data Impact:** Updates `portfolioDrafts.meta.templateId` only.
**Authorization:** Only the owning user.
**UI State:** Loading (catalog fetch), Success (selected template highlighted + preview updates), Error (rare, retry).
**Acceptance Criteria:** Given a user has fully edited their portfolio content, when they switch templates, then all content (experience, projects, etc.) remains identical — only the visual presentation changes.

### FR-TEMPLATE-002 — Template Switching Does Not Destroy Data
**Description:** Explicit non-destructive guarantee, called out separately because it is a hard product requirement (PRD §16).
**Acceptance Criteria:** Given any two templates, when a user switches from one to the other and back, then the PortfolioData is byte-for-byte identical to before the switches (aside from `meta.templateId` itself).

### FR-TEMPLATE-003 — Theme Selection
**Description:** Lets the user pick a theme/color variant supported by the selected template (where a template offers more than one).
**Actor:** Authenticated User
**Main Flow:** If the selected template supports theme variants (e.g., light/dark), display the options → user selects → `portfolioDrafts.meta.theme` updated → preview reflects immediately.
**Alternative Flows:** Selected template supports only one theme → theme selector is hidden/disabled with an explanatory note, not shown as a broken/empty control.
**Acceptance Criteria:** Given a template with only one supported theme, when the user opens theme settings, then no non-functional theme picker is shown.

---

## 17. Editor (FR-EDITOR)

### FR-EDITOR-001 — Edit Fields
**Description:** Direct editing of any PortfolioData field.
**Actor:** Authenticated User
**Trigger:** User types into any editable field in the editor.
**Main Flow:** Field-level validation on blur/change → autosave (debounced, e.g., 1–2s after last keystroke) → on save, field's `source` is updated to `manual` if it wasn't already (see FR-DATA-001) → save confirmation shown subtly (e.g., a small "Saved" indicator, not an intrusive toast per keystroke).
**Alternative Flows:** Save fails (network) → field is retried automatically in the background; if retries are exhausted, a visible "Unsaved changes — retry" indicator appears and the user is warned before navigating away.
**Validation:** Per FR-PORTFOLIO-001 table.
**Success Result:** Field persisted; completeness recalculated if relevant.
**Failure Result:** As above — never a silent data loss.
**Data Impact:** Updates `portfolioDrafts`.
**Authorization:** Only the owning user.
**UI State:** Saving indicator, Saved confirmation, Error (retry banner), Disabled (save action disabled while a prior save for the same field is in flight, to prevent race conditions).
**Acceptance Criteria:** Given a user edits their About text and their connection drops before the save completes, when connectivity returns, then the edit is retried automatically or the user is clearly warned their change is unsaved before they can navigate away.

### FR-EDITOR-002 — Add / Delete List Items
**Description:** Add or remove entries in list-type sections (Experience, Education, Projects, Certifications, Achievements, Services).
**Actor:** Authenticated User
**Main Flow (Add):** User clicks "Add [Experience/Project/etc.]" → blank form appears → user fills required fields → save creates a new entry, `source: manual`.
**Main Flow (Delete):** User clicks delete on an entry → confirmation required for entries with substantial content (e.g., a filled experience entry), not required for an empty just-added entry the user is abandoning → entry removed.
**Validation:** Per FR-PORTFOLIO-001; an entry with only partially filled required fields cannot be saved (blocked with inline errors), but can be discarded without those errors blocking the discard action.
**Data Impact:** Adds/removes an array element in `unifiedProfiles`/`portfolioDrafts`.
**Acceptance Criteria:** Given a user deletes a fully filled Experience entry, when they confirm, then it is permanently removed from the draft; given they delete a still-blank entry they just added, then no confirmation is required.

### FR-EDITOR-003 — Reorder Sections / Items
**Description:** Drag-and-drop (or equivalent accessible control) reordering of top-level sections and of items within a list section (e.g., project order).
**Actor:** Authenticated User
**Main Flow:** User drags a section/item to a new position (or uses keyboard-accessible up/down controls — required for accessibility, see §31) → new order saved to `meta.sectionOrder` (for sections) or the array order itself (for items within a section).
**Validation:** N/A (any order is valid).
**Data Impact:** Updates `portfolioDrafts.meta.sectionOrder` and/or list array order.
**Acceptance Criteria:** Given a user reorders Projects above Experience, when they preview/publish, then Projects renders above Experience in the actual template, not just in the editor list.

### FR-EDITOR-004 — Show / Hide Sections
**Description:** Lets the user hide a section from the public portfolio without deleting its data.
**Actor:** Authenticated User
**Main Flow:** User toggles a section's visibility → `meta.visibleSections` updated → hidden section's data is retained (not deleted) so it can be re-shown later without re-entry.
**Alternative Flows:** A section with no data is automatically excluded from rendering regardless of this toggle (per FR-PORTFOLIO-001 empty-value rule) — the toggle only affects sections that *do* have data.
**Acceptance Criteria:** Given a user hides their Certifications section (which has data), when they preview, then Certifications does not render, but when they later toggle it back on, the previously entered data reappears unchanged.

### FR-EDITOR-005 — Feature / Unfeature Projects
**Description:** Cross-reference to FR-GITHUB-007 for GitHub-sourced projects; also applies to manually added projects (all projects, regardless of source, can be featured/unfeatured equally).
**Acceptance Criteria:** Given a manually added project and a GitHub-sourced project both exist, when the user features both, then both appear identically styled/treated in the template — no visual/functional distinction based on source.

### FR-EDITOR-006 — Autosave Behavior (Cross-cutting for FR-EDITOR-001–005)
**Description:** Defines the general autosave contract used throughout the editor.
**Main Flow:** Every mutating editor action autosaves without requiring an explicit "Save" button for normal edits; a manual "Save" affordance may still exist as a reassurance action but is not functionally required to persist changes.
**Acceptance Criteria:** Given a user makes several edits across different sections and closes the tab without clicking any explicit save button, when they return, then all changes made at least ~2 seconds before closing are present.

---

## 18. AI Regeneration
*(Covered fully under FR-AI-004 in §13–14 above; included here per the outline for traceability.)*

---

## 19. Preview (FR-PREVIEW)

### FR-PREVIEW-001 — Responsive Preview
**Description:** Real-time (debounced) preview of the portfolio exactly as it will publish.
**Actor:** Authenticated User
**Preconditions:** A PortfolioData draft exists.
**Trigger:** User opens the Preview pane/tab, or it is persistently visible alongside the editor.
**Main Flow:** Preview renders using the identical template-rendering pipeline used for the public route (not a separate mock) → updates on debounce as the user edits → user can switch between Desktop/Tablet/Mobile viewport simulations and Template/Theme without leaving the editor.
**Alternative Flows:** Unsaved changes exist when the user navigates away from the editor → a warning is shown if any edit hasn't yet been confirmed saved (ties to FR-EDITOR-001 failure handling).
**Validation:** N/A (read-only rendering of already-validated data).
**Success Result:** Preview accurately reflects current draft state at all times.
**Failure Result:** If a render error occurs (e.g., a template bug), a scoped error is shown in the preview pane without crashing the editor itself.
**Data Impact:** Read-only.
**Authorization:** Only the owning user can preview their own draft (the preview is never itself a publicly reachable URL).
**UI State:** Loading (initial render), Success, Error (scoped render failure), viewport-switch controls always available.
**Acceptance Criteria:** Given a user is editing and switches the preview to Mobile view, when they make an edit, then the mobile preview updates to reflect it, using the same rendering logic that will serve the actual published mobile page.

---

## 20. Publishing (FR-PUBLISH)

### FR-PUBLISH-001 — Publish Portfolio
**Description:** Makes the current draft live at a public URL.
**Actor:** Authenticated User
**Preconditions:** A PortfolioData draft exists with at least the minimum required fields (name, at minimum — see FR-PORTFOLIO-001) populated.
**Trigger:** User clicks "Publish."
**Main Flow:** System validates the draft meets minimum publish requirements → system validates/assigns a slug (auto-generated from name if not yet set, or the user's chosen custom slug) → on validation success, the current draft is snapshotted into `portfolios` (the immutable published record) → portfolio status set to `published` → public URL shown with a "View" and "Copy link" action → confirmation shown.
**Alternative Flows:**
- Draft fails minimum validation (e.g., no name set) → publish blocked with a specific message identifying what's missing.
- Chosen slug is already taken → user is offered an auto-suggested alternative (e.g., appending `-2`) or can choose a different one.
**Validation:** Minimum required fields present (FR-PORTFOLIO-001); slug format (lowercase, alphanumeric + hyphen, 3–50 chars) and uniqueness; slug not in the reserved-word blocklist.
**Success Result:** `portfolios` record created/updated (snapshot); `/p/[slug]` resolves; status = `published`.
**Failure Result:** No partial snapshot is ever saved — publish is all-or-nothing.
**Data Impact:** Creates/updates one `portfolios` document keyed by unique slug.
**Authorization:** Only the owning user can publish their own portfolio.
**UI State:** Loading ("Publishing..."), Success (URL + share options shown), Error (specific validation message), Disabled (Publish disabled while a prior publish is in flight).
**Acceptance Criteria:**
- Given a valid draft with a name set, when the user publishes, then a public URL is generated and immediately resolves to the current draft content.
- Given a user requests a slug already taken by another portfolio, when they attempt to publish, then they are offered an available alternative rather than a silent overwrite or an opaque failure.

### FR-PUBLISH-002 — Unpublish Portfolio
**Description:** Takes a published portfolio offline without deleting its data.
**Actor:** Authenticated User
**Main Flow:** User clicks "Unpublish" → confirmation → status set to `unpublished` → `/p/[slug]` now returns a "this portfolio is currently unavailable" state (not a generic 404, so it's distinguishable from "never existed" — **[Decision Required, exact copy/behavior, §37]**) → slug remains reserved to this user (not released for reuse by others) unless the portfolio is later deleted.
**Acceptance Criteria:** Given a published portfolio, when the user unpublishes it, then the public URL stops showing content but the slug remains reserved for the user if they choose to republish later.

### FR-PUBLISH-003 — Slug Management / Editing
**Description:** Lets the user view and change their portfolio's slug.
**Actor:** Authenticated User
**Main Flow:** User edits the slug field in Publish settings → same validation as FR-PUBLISH-001 → on save, if already published, the old slug stops resolving and the new slug takes over immediately (no automatic redirect from old to new in V1 — **[Decision Required, whether a redirect is needed, §37]**, flagged since this affects any previously shared links).
**Validation:** As in FR-PUBLISH-001.
**Acceptance Criteria:** Given a published portfolio, when the user changes their slug, then the old URL stops resolving and the new URL resolves to the same content, and the user is warned before confirming that previously shared links will break.

### FR-PUBLISH-004 — Delete Portfolio
**Description:** Permanently removes the published portfolio (distinct from account deletion).
**Actor:** Authenticated User
**Main Flow:** Confirmation required → `portfolios` record deleted (or soft-deleted with a grace period before slug release — **[Decision Required, §37]**) → `/p/[slug]` returns not-found → `portfolioDrafts` is **not** automatically deleted (the user may still want their draft data to republish later under this or a new portfolio) unless the user separately confirms deleting draft data too.
**Acceptance Criteria:** Given a user deletes their published portfolio, when they confirm, then the public URL stops resolving, but their editable draft content remains available for them to republish later unless they explicitly also chose to delete the draft.

---

## 21. Public Portfolio (FR-PUBLIC)

### FR-PUBLIC-001 — Public Portfolio Rendering
**Description:** Renders the published portfolio at `/p/[slug]` for any visitor, authenticated or not.
**Actor:** Guest or any user (public route)
**Preconditions:** A `portfolios` record exists with `status: published` for the requested slug.
**Trigger:** Any visitor navigates to `/p/[slug]`.
**Main Flow:** System looks up the slug → if found and published, renders the snapshot using the selected template → if not found, not published, or deleted, renders an appropriate not-found/unavailable state (distinct messaging per FR-PUBLISH-002 for "unpublished" vs. true "never existed").
**Validation:** Slug format sanity-checked before lookup (defense against malformed input causing unnecessary queries).
**Success Result:** Fast, correctly rendered public page.
**Failure Result:** Clear not-found page — never a raw error/stack trace, never a broken partial render.
**Data Impact:** Read-only public read; increments no sensitive counters visible to the visitor (any future analytics counting is out of scope per PRD Non-Goals).
**Authorization:** None required to view a public portfolio; the route must never expose non-public fields (see explicit exclusion list below) regardless of authentication state.
**Explicit exclusion — the public response must NEVER include:** OAuth access/refresh tokens, password hashes, the owner's email unless the owner explicitly chose to display it as contact info, internal database IDs beyond what's needed for the page itself, raw `sourceProfiles` data, any other user's data, or draft (unpublished/unsaved) content.
**UI State:** Loading (fast skeleton/SSR — should rarely be visibly "loading" given SSR/ISR per PRD §19), Not Found (portfolio never existed or was deleted), Unavailable (currently unpublished), Success (full render).
**Acceptance Criteria:**
- Given a published slug, when any visitor requests it, then the page renders correctly without requiring authentication and without exposing any field from the exclusion list.
- Given a slug that was unpublished, when a visitor requests it, then a distinct "currently unavailable" message is shown rather than a generic not-found.
- Given a slug that never existed, when a visitor requests it, then a standard not-found page is shown.

### FR-PUBLIC-002 — SEO Metadata
**Description:** Ensures published portfolios carry correct SEO/social metadata.
**Actor:** System
**Main Flow:** Per published portfolio, render `<title>`, meta description, Open Graph tags, Twitter card tags, canonical URL, semantic heading structure, and structured data (Person/ProfilePage) — all derived only from the PortfolioData facts already present (no fabricated metadata).
**Acceptance Criteria:** Given a published portfolio, when its page source is inspected, then title/description/OG tags accurately reflect the user's actual name/headline/summary, and the canonical URL points to the portfolio's own slug.

---

## 22. Sharing (FR-SHARE)

### FR-SHARE-001 — Copy Link
**Actor:** Authenticated User (from dashboard/editor) — Description: One-click copy of the published portfolio URL to clipboard, with a confirmation toast. **Acceptance Criteria:** Given a published portfolio, when the user clicks "Copy link," then the exact public URL is copied and a confirmation is shown.

### FR-SHARE-002 — Social Sharing
**Actor:** Authenticated User — Description: Pre-filled share links/buttons for common platforms using standard share-intent URLs (not scraping or API posting on the user's behalf without explicit action). **Acceptance Criteria:** Given a published portfolio, when the user clicks a social share button, then a pre-filled share dialog opens for that platform with the correct URL, and no post is made without the user's own explicit action on that platform.

### FR-SHARE-003 — QR Code
**Actor:** Authenticated User — Description: Generates a scannable QR code encoding the public portfolio URL, downloadable as an image. **Acceptance Criteria:** Given a published portfolio, when the user requests a QR code, then a valid QR code resolving to the correct public URL is generated and downloadable.

**Public/Private setting note:** V1 portfolios are public-only once published (per PRD §20/§5 Non-Goals — private portfolios are explicitly deferred). This FRD does not define authenticated-visitor behavior for private portfolios since that feature is out of scope for the version being built; if introduced later, FR-PUBLIC-001's authorization section would need to be revisited to add ownership/authorization checks before any content is served to a non-owner visitor.

---

## 23. Account / Profile Settings (FR-SETTINGS)

### FR-SETTINGS-001 — Settings Overview
**Description:** Central place for account info, connections, and data controls.
**Actor:** Authenticated User
**Main Flow:** Displays account email/name (editable per FR-AUTH-007 for password; email change — **[Decision Required, whether supported in V1, §37]**), connection statuses with connect/disconnect actions, and data-control actions (below).
**Acceptance Criteria:** Given a user opens Settings, when the page loads, then they see accurate current state for account info, both connections, and available data-control actions.

### FR-SETTINGS-002 — Delete Imported Data
**Description:** Purges provider-sourced data while preserving user-entered/edited data.
**Actor:** Authenticated User
**Trigger:** User clicks "Delete imported data" for a specific provider (or "all imported data").
**Main Flow:** Confirmation required → `sourceProfiles`/`githubRepositories` (or LinkedIn identity claims) for that provider deleted → corresponding fields in `unifiedProfiles` that are still tagged with that provider's source are cleared → fields already tagged `manual` (because the user edited them) are explicitly **preserved**, per the precedence rule in FR-DATA-001.
**Validation:** Confirmation required (destructive action).
**Success Result:** Provider-sourced data removed; manual data intact; completeness recalculated.
**Data Impact:** Deletes from `sourceProfiles`/`githubRepositories`; clears specific fields in `unifiedProfiles`.
**Authorization:** Only the owning user.
**Acceptance Criteria:** Given a user has a GitHub-sourced bio they never edited and a manually written About section, when they delete imported GitHub data, then the bio field is cleared but the manually written About section is untouched.

---

## 24. Admin (FR-ADMIN)

### FR-ADMIN-001 — Admin Authentication & Role-Based Access
**Description:** Restricts all admin functionality to users with `role: admin`.
**Actor:** Admin
**Main Flow:** Admin logs in through the same auth system (FR-AUTH-002); role is checked server-side on every admin route (never a frontend-only gate); non-admins attempting to access admin routes receive a generic 403, not a hint that admin routes exist at a given path beyond the standard "not found/forbidden."
**Acceptance Criteria:** Given a non-admin authenticated user, when they directly request an admin API route, then the request is rejected with a 403 regardless of any frontend routing.

### FR-ADMIN-002 — User Management
**Description:** Search/view users and their high-level status (no sensitive data exposed).
**Actor:** Admin
**Main Flow:** Search by email/name → view connection status, portfolio status, account status — never raw password hashes or OAuth tokens (excluded at the query-projection level, not just hidden in the UI).
**Acceptance Criteria:** Given an admin views a user's detail page, when the data loads, then no password hash or OAuth token value is present anywhere in the response payload, even in developer tools.

### FR-ADMIN-003 — Portfolio Moderation
**Description:** Lets admins view/flag/unpublish portfolios that violate terms (abuse handling).
**Actor:** Admin
**Main Flow:** Admin views a reported/flagged portfolio → can force-unpublish with a reason logged to `auditLogs` → owning user is notified their portfolio was unpublished by an admin, with the reason.
**Acceptance Criteria:** Given an admin force-unpublishes a portfolio, when this occurs, then the action and reason are recorded in the audit log and the owning user is notified.

### FR-ADMIN-004 — System/Job Monitoring
**Description:** Visibility into generation job health, integration failures, and system status.
**Actor:** Admin
**Main Flow:** Dashboard shows queue depth, job success/failure rates, AI failure rate, OAuth failure rates by provider, recent error summary — read-only operational visibility, no destructive actions beyond the moderation actions defined in FR-ADMIN-003.
**Acceptance Criteria:** Given a spike in AI generation failures, when an admin views the monitoring dashboard, then the failure rate and recent failure reasons are visible without needing to query the database directly.

---

## 25. Notifications (FR-NOTIF)

### FR-NOTIF-001 — Notification Events
**Description:** Defines which events produce a user-facing notification and through which channel.

| Event | In-app toast | Email |
|---|---|---|
| Registration submitted | Yes (confirmation screen) | Yes (verification email — required for the flow to function) |
| Email verified | Yes | No |
| Password reset requested | Yes (generic confirmation) | Yes (contains the reset link — required) |
| Password changed | Yes | Yes (security notice — recommended so the user is alerted if it wasn't them) |
| GitHub connected | Yes | No |
| LinkedIn connected | Yes | No |
| Generation completed | Yes | Optional (**[Decision Required, §37]** — useful if the user navigated away during a long job) |
| Generation failed | Yes | No (in-app is sufficient; the user is actively waiting) |
| Portfolio published | Yes (with link) | No |
| Admin force-unpublished a portfolio | Yes | Yes (the user should be reliably informed even if not currently active in-app) |

**Principle:** Notifications are added only for events the user needs to act on or would be concerned to miss — not for every minor state change (explicitly avoiding notification fatigue, per the PRD's "do not add unnecessary notifications" instruction).
**Acceptance Criteria:** Given a password change occurs, when it completes, then the account owner receives an email notice regardless of whether they are currently logged in on another device, so unauthorized changes are detectable.

---

## 26. Cross-Cutting: Error Handling

All user-facing errors follow these rules, applied to every FR above:
- Never expose stack traces, internal error codes, database error text, or raw provider API error payloads to the end user.
- Every error message is specific enough to be actionable ("GitHub sync failed — try again" not "An error occurred") without being technical.
- Every error state includes a next action where one exists (retry, go back, contact support) rather than a dead end.
- Server-side, full error detail (including stack traces) is logged for engineering visibility (see PRD §28), scrubbed of secrets/tokens/passwords.

---

## 27–28. Cross-Cutting: Authorization & Rate Limiting (FR-SEC)

### FR-SEC-001 — Ownership Validation (applies to every protected resource)
**Description:** Every read/write on a user-owned resource (`unifiedProfiles`, `portfolioDrafts`, `portfolios` [draft-side actions], `connections`, `generationJobs`) must verify the requester's session `userId` matches the resource's `userId` at the server layer — never inferred from a client-supplied ID, and never skipped because "the frontend wouldn't let you get here."
**Acceptance Criteria:**
- Given User A is authenticated, when User A sends a request referencing User B's `portfolioDraftId`/`generationJobId`/connection, then the request is rejected with 403/404 (whichever leaks less information — recommend 404 to avoid confirming the resource exists) regardless of whether the ID was guessed, enumerated, or copied from a prior legitimate response.
- Given User A attempts to trigger a generation job using User B's `userId` in the request body, when processed, then the server uses the authenticated session's `userId`, ignoring any client-supplied `userId`, or rejects the mismatch outright.

### FR-SEC-002 — Rate Limiting
**Description:** Defines rate limits for abuse-prone actions.

| Action | Suggested limit | Behavior on exceed |
|---|---|---|
| Login attempts | e.g., 5/15min per account+IP combo | Temporary lockout with countdown; generic message, no account-existence hint |
| Registration | e.g., 5/hour per IP | Blocked with a generic "try again later" |
| Password reset requests | e.g., 3/hour per account | Further requests silently accepted-looking (same generic confirmation) but not actually re-sent, to avoid email-bombing a victim while still not revealing the limit was hit |
| Email verification resend | e.g., 3/hour per account | Blocked with a visible cooldown |
| GitHub/LinkedIn sync | e.g., 1 per few minutes per user (cooldown) | Sync button shows cooldown timer |
| AI generation | e.g., N/day per free-tier user (**[Decision Required, exact number — ties to future billing tiers, §37]**) | Blocked with a message explaining the limit and, once billing exists, an upgrade path |
| AI regeneration (section-level) | Same pool as generation, or a separate lighter limit (**[Decision Required, §37]**) | Same pattern |
| General API requests | Standard per-IP/per-user request-rate ceiling | 429 response, generic client-facing message, exponential backoff suggested to the client |

**Exact numeric thresholds are placeholders pending product sign-off** — flagged in §37 — but the *behavioral contract* (specific, non-revealing messaging; no silent failures; no account-enumeration leakage) is a firm requirement regardless of the final numbers.

---

## 29. Cross-Cutting: Data Deletion

Summarized behavior (detailed per-feature above); this section is the single reference table.

| Action | Portfolio (published) | Portfolio (draft) | Unified Profile | Source Data (that provider) | Connection/Token | Account |
|---|---|---|---|---|---|---|
| Disconnect GitHub | Unaffected | Unaffected | GitHub-sourced fields remain (tagged) unless also deleted | Remains unless separately deleted | Token deleted, status disconnected | Unaffected |
| Disconnect LinkedIn | Unaffected | Unaffected | (Only identity fields existed; manual fields unaffected) | Remains unless separately deleted | Token deleted, status disconnected | Unaffected |
| Delete imported data (provider) | Unaffected (already-published snapshot) | Non-manual fields from that provider cleared | Non-manual fields from that provider cleared | Deleted | Unaffected (connection can remain active) | Unaffected |
| Delete portfolio | Deleted (slug stops resolving) | Unaffected unless separately chosen | Unaffected | Unaffected | Unaffected | Unaffected |
| Delete account | Deleted | Deleted | Deleted | Deleted | Deleted (revoked where possible) | Deleted/anonymized |

**Retention:** Anonymized `auditLogs` entries required for security history may persist post-account-deletion with all PII stripped, per PRD §31 — exact retention duration is an open item (§37).

---

## 30. Cross-Cutting: Loading / Empty / Error States

Applied consistently per the table below (detail already specified per-feature above; this is the consolidated reference).

| Screen/Operation | Loading | Empty | Error |
|---|---|---|---|
| Dashboard | Skeleton cards | First-time-user CTA variant (FR-DASH-001) | Per-card scoped error, not full-page |
| GitHub Connections | Spinner on connect/sync | "Not connected" state with CTA | Denial/failure banner + retry |
| LinkedIn Connections | Spinner on connect/sync | "Not connected" state with CTA + disclosure | Denial/failure banner + retry |
| Profile/Missing Info | Skeleton | "Your profile looks complete!" | "Completeness unavailable" (never a wrong number) |
| AI Generation | Staged progress ("Syncing... Generating... Validating...") | N/A (blocked before starting if profile is empty) | Stage-specific failure message + retry |
| Templates | Skeleton catalog | N/A (catalog is always non-empty by design) | Retry on fetch failure |
| Editor | Per-field save spinner | Blank list-section state with "Add" CTA | Inline field errors; unsaved-changes warning on failed save |
| Preview | Initial render skeleton | N/A (mirrors editor state) | Scoped render error, doesn't crash editor |
| Publishing | "Publishing..." | N/A | Specific validation error (missing field, slug taken) |
| Public Portfolio | Should rarely show (SSR/ISR) | N/A | Not-found vs. unavailable, distinct messaging |

---

## 31. Cross-Cutting: Accessibility

Minimum functional requirements applied across every screen in this FRD:
- All interactive elements (including drag-and-drop reordering in FR-EDITOR-003) have a keyboard-operable equivalent.
- Visible focus states on all focusable elements.
- Semantic HTML landmarks and heading hierarchy on every screen, including public portfolio templates.
- All form inputs have associated, programmatically-linked labels; error messages are associated with their field and announced to screen readers on validation failure (not just visually indicated by color).
- Color contrast meets WCAG 2.1 AA minimums across all templates and dashboard UI.
- Motion/animation respects `prefers-reduced-motion`; no essential information is conveyed by animation alone.
- Toasts/notifications are announced via an ARIA live region, not purely visual.

---

## 32. Cross-Cutting: Responsive Behavior

- Dashboard/editor: fully usable at mobile widths (edit forms stack, preview becomes a separate tab rather than a side-by-side pane below a defined breakpoint).
- Public portfolio templates: must render correctly and remain fully readable/navigable at mobile, tablet, and desktop widths for all 6 templates, with no horizontal scrolling and no overlapping/clipped content at any supported breakpoint.
- Large screens: content has a sensible max-width (not full-bleed unreadable line lengths) on both dashboard and public portfolio pages.

---

## 33. Cross-Cutting: Performance (Functional Expectations)

- Dashboard initial load: perceived-interactive quickly, with skeleton states covering any sub-second gaps rather than a blank screen.
- Public portfolio load: should feel effectively instant on repeat visits (caching per PRD §29); first visit should not require the visitor to wait on any GitHub/LinkedIn API call — public rendering only ever reads already-published, pre-generated data, never live-fetches from third-party APIs at request time.
- GitHub sync / AI generation: explicitly long-running and must never block the UI thread or leave the user staring at a frozen screen — job-based with visible, staged progress (FR-AI-002) is the functional requirement, not a specific millisecond target at this stage (exact SLAs belong in the architecture document).

---

## 34. Functional Edge Cases

| # | Edge Case | Required Behavior |
|---|---|---|
| 1 | User has no GitHub repositories | Sync succeeds with empty list; GitHub Projects section omitted or user directed to add manual projects; not an error. (FR-GITHUB-005) |
| 2 | User has hundreds of repositories | Capped fetch, relevance-ranked, "more exist" flag shown, paginated selection UI. (FR-GITHUB-005/006) |
| 3 | User has no LinkedIn data available (denied scopes or connection skipped) | Portfolio still generatable; Experience/Education driven entirely by manual entry; no error blocking generation. (FR-LINKEDIN-004, FR-AI-001) |
| 4 | User denies LinkedIn authorization | Connection remains "Not connected"; clear retry; no partial data stored. (FR-LINKEDIN-001) |
| 5 | User disconnects GitHub | Future syncs stop; existing imported/derived data and any published portfolio content remain until explicit data deletion. (FR-GITHUB-003) |
| 6 | User disconnects LinkedIn | Same pattern; since LinkedIn never supplied experience/education, this mainly affects identity/photo fields. (FR-LINKEDIN-003) |
| 7 | GitHub API rate limit reached | Sync pauses and auto-resumes after reset window; user sees "syncing" not "failed." (FR-GITHUB-005) |
| 8 | AI returns invalid JSON | Rejected by schema validation, one retry, then job fails cleanly with no data saved. (FR-AI-003) |
| 9 | AI generation fails (provider error/timeout) | Job marked failed at the specific stage; user can retry; any already-synced source data is preserved. (FR-AI-002) |
| 10 | User has no experience | Experience section omitted entirely, never shown empty; does not block generation/publish. (FR-PORTFOLIO-001) |
| 11 | User has no education | Same pattern as #10. |
| 12 | User has no certifications | Same pattern as #10. |
| 13 | User has duplicate projects (e.g., same repo as fork and original, or manual duplicate of a GitHub project) | Deduplication logic in normalization (by repo identity/URL) prevents duplicate display; forks are demoted by relevance scoring. (FR-PROFILE-004, FR-GITHUB-006) |
| 14 | User has a very long bio/About text | Enforced max length at input; if source data itself exceeds the limit (e.g., a long GitHub bio), it is truncated at normalization time with an indicator, not silently cut off mid-sentence in the rendered template. |
| 15 | User has invalid URLs (social links, project URLs) | Rejected at save time with a specific inline error; never silently stored broken. (FR-PROFILE-002, FR-PORTFOLIO-001) |
| 16 | User tries to access another user's private data (including by manipulating IDs) | Rejected server-side regardless of client behavior. (FR-SEC-001) |
| 17 | Two users request the same portfolio slug | First to publish gets it; second is offered an available alternative; no silent overwrite. (FR-PUBLISH-001) |
| 18 | User deletes their account | Full cascade per §29 table; public URL stops resolving immediately. (FR-AUTH-008) |
| 19 | User changes template after publishing | Draft-side change only; live page reflects it only on next explicit publish action (draft/published separation is intentional — PRD §19). (FR-TEMPLATE-001, FR-PUBLISH-001) |
| 20 | User modifies portfolio content after publishing | Same draft/published separation; live page unchanged until republish. |
| 21 | User attempts to generate with an essentially empty profile | Blocked with specific guidance rather than producing a near-empty AI-generated portfolio. (FR-AI-001) |
| 22 | User triggers Generate while a job is already running | Second job blocked; existing job's progress shown instead. (FR-AI-001) |
| 23 | AI output references a fact not present in the input (hallucination) | Stripped by the post-generation fact-check pass before the user ever sees it; logged for monitoring. (FR-AI-005) |
| 24 | User edits an AI-generated field, then later requests full regeneration | Edited field is skipped/preserved unless explicitly selected for regeneration. (FR-DATA-001, FR-AI-004) |
| 25 | User uploads a resume/PDF (FR-LINKEDIN-005) that parses poorly | Low-confidence entries flagged for review; nothing auto-saved without explicit per-entry confirmation. |
| 26 | Portfolio is force-unpublished by an admin | Owner notified with reason; portfolio returns to `unpublished` state, data retained. (FR-ADMIN-003) |
| 27 | A currently-featured GitHub repo is deleted/made private on GitHub itself, then a sync runs | Repo is flagged as no longer available rather than silently vanishing from a *published* snapshot; draft-side selection is updated to reflect it's no longer accessible, prompting the user to choose a replacement. **[Decision Required, exact handling, §37]** |

---

## 35. Functional Requirements Matrix

| ID | Feature | Priority | Actor | Status |
|---|---|---|---|---|
| FR-AUTH-001 | User Registration | P0 | Guest | Defined |
| FR-AUTH-002 | Login | P0 | Guest | Defined |
| FR-AUTH-003 | Logout | P0 | Authenticated User | Defined |
| FR-AUTH-004 | Forgot Password (Request) | P0 | Guest | Defined |
| FR-AUTH-005 | Reset Password | P0 | Guest | Defined |
| FR-AUTH-006 | Email Verification | P0 | Guest/User | Defined |
| FR-AUTH-007 | Change Password | P1 | Authenticated User | Defined |
| FR-AUTH-008 | Account Deletion | P0 | Authenticated User | Defined |
| FR-DASH-001 | Dashboard Overview | P0 | Authenticated User | Defined |
| FR-DASH-002 | Profile Completeness Display | P0 | Authenticated User | Defined |
| FR-GITHUB-001 | Connect GitHub | P0 | Authenticated User | Defined |
| FR-GITHUB-002 | GitHub Callback Validation | P0 | System | Defined |
| FR-GITHUB-003 | Disconnect GitHub | P0 | Authenticated User | Defined |
| FR-GITHUB-004 | GitHub Profile Sync | P0 | System | Defined |
| FR-GITHUB-005 | GitHub Repository Sync | P0 | System | Defined |
| FR-GITHUB-006 | Repository Relevance Ranking | P0 | System | Defined |
| FR-GITHUB-007 | Repository Selection (Manual Override) | P0 | Authenticated User | Defined |
| FR-LINKEDIN-001 | Connect LinkedIn | P0 | Authenticated User | Defined |
| FR-LINKEDIN-002 | LinkedIn Callback Validation | P0 | System | Defined |
| FR-LINKEDIN-003 | Disconnect LinkedIn | P0 | Authenticated User | Defined |
| FR-LINKEDIN-004 | LinkedIn Identity Data Fetch | P0 | System | Defined |
| FR-LINKEDIN-005 | Resume/PDF Upload Import | P2 | Authenticated User | Defined (V1.0) |
| FR-PROFILE-001 | Missing Information Detection | P0 | System | Defined |
| FR-PROFILE-002 | Manual Field Entry | P0 | Authenticated User | Defined |
| FR-PROFILE-003 | Profile Completeness Calculation | P0 | System | Defined |
| FR-PROFILE-004 | Unified Profile Merge/Normalization | P0 | System | Defined |
| FR-SYNC-001 | Manual Sync Trigger | P0 | Authenticated User | Defined |
| FR-SYNC-002 | Sync Status Display | P1 | Authenticated User | Defined |
| FR-DATA-001 | Precedence Enforcement | P0 | System | Defined |
| FR-AI-001 | Generate Portfolio | P0 | Authenticated User | Defined |
| FR-AI-002 | Generation Job Processing | P0 | System | Defined |
| FR-AI-003 | AI Output Validation | P0 | System | Defined |
| FR-AI-004 | AI Regeneration (Section-Level) | P1 | Authenticated User | Defined |
| FR-AI-005 | Factuality Enforcement | P0 | System | Defined |
| FR-PORTFOLIO-001 | PortfolioData Structural Rules | P0 | System | Defined |
| FR-TEMPLATE-001 | Template Selection | P0 | Authenticated User | Defined |
| FR-TEMPLATE-002 | Non-Destructive Template Switching | P0 | System | Defined |
| FR-TEMPLATE-003 | Theme Selection | P1 | Authenticated User | Defined |
| FR-EDITOR-001 | Edit Fields | P0 | Authenticated User | Defined |
| FR-EDITOR-002 | Add/Delete List Items | P0 | Authenticated User | Defined |
| FR-EDITOR-003 | Reorder Sections/Items | P1 | Authenticated User | Defined |
| FR-EDITOR-004 | Show/Hide Sections | P1 | Authenticated User | Defined |
| FR-EDITOR-005 | Feature/Unfeature Projects | P0 | Authenticated User | Defined |
| FR-EDITOR-006 | Autosave Behavior | P0 | System | Defined |
| FR-PREVIEW-001 | Responsive Preview | P0 | Authenticated User | Defined |
| FR-PUBLISH-001 | Publish Portfolio | P0 | Authenticated User | Defined |
| FR-PUBLISH-002 | Unpublish Portfolio | P0 | Authenticated User | Defined |
| FR-PUBLISH-003 | Slug Management/Editing | P1 | Authenticated User | Defined |
| FR-PUBLISH-004 | Delete Portfolio | P1 | Authenticated User | Defined |
| FR-PUBLIC-001 | Public Portfolio Rendering | P0 | Guest | Defined |
| FR-PUBLIC-002 | SEO Metadata | P0 | System | Defined |
| FR-SHARE-001 | Copy Link | P0 | Authenticated User | Defined |
| FR-SHARE-002 | Social Sharing | P1 | Authenticated User | Defined |
| FR-SHARE-003 | QR Code | P2 | Authenticated User | Defined |
| FR-SETTINGS-001 | Settings Overview | P0 | Authenticated User | Defined |
| FR-SETTINGS-002 | Delete Imported Data | P0 | Authenticated User | Defined |
| FR-ADMIN-001 | Admin Auth & RBAC | P1 | Admin | Defined |
| FR-ADMIN-002 | User Management | P1 | Admin | Defined |
| FR-ADMIN-003 | Portfolio Moderation | P2 | Admin | Defined |
| FR-ADMIN-004 | System/Job Monitoring | P1 | Admin | Defined |
| FR-NOTIF-001 | Notification Events | P1 | System | Defined |
| FR-SEC-001 | Ownership Validation | P0 | System | Defined |
| FR-SEC-002 | Rate Limiting | P0 | System | Defined |

---

## 36. MVP vs. V1 vs. Future

### MVP (proves the core product)
Register/Login/Verify/Reset (FR-AUTH-001–006, 008) · Dashboard overview + completeness (FR-DASH-001/002) · GitHub connect/sync/select (FR-GITHUB-001–007) · LinkedIn connect + identity-only fetch + manual-entry fallback (FR-LINKEDIN-001–004; **005 explicitly deferred to V1.0**) · Missing-info detection + manual entry (FR-PROFILE-001–004) · Manual sync (FR-SYNC-001/002) · Precedence enforcement (FR-DATA-001) · Generate + validate + factuality (FR-AI-001–003, 005) · PortfolioData rules (FR-PORTFOLIO-001) · **2–3 templates**, not all 6 (FR-TEMPLATE-001/002; theme selection FR-TEMPLATE-003 optional if templates are single-theme at MVP) · Core editor: edit/add/delete/feature (FR-EDITOR-001, 002, 005, 006; reorder/hide FR-EDITOR-003/004 nice-to-have but recommended for MVP given low implementation cost) · Preview (FR-PREVIEW-001) · Publish/Unpublish (FR-PUBLISH-001/002) · Public rendering + SEO (FR-PUBLIC-001/002) · Copy link (FR-SHARE-001) · Settings overview + delete imported data (FR-SETTINGS-001/002) · Ownership + rate limiting (FR-SEC-001/002) · Minimal notifications (FR-NOTIF-001, core events only).

### V1 (important, post-MVP)
Remaining templates to reach 6 (FR-TEMPLATE catalog expansion) · Section-level AI regeneration (FR-AI-004) · Slug editing, portfolio deletion (FR-PUBLISH-003/004) · Social share + QR (FR-SHARE-002/003) · Resume/PDF import (FR-LINKEDIN-005) · Full admin suite (FR-ADMIN-001–004) · Expanded notifications (email on generation-complete, etc.).

### Future (explicitly deferred)
Anything tied to PRD Non-Goals/Future Roadmap: custom domains, analytics, resume/cover-letter generation, job matching, portfolio scoring, scheduled auto-resync, version history, custom CSS/fonts, team accounts, recruiter mode, marketplace, LinkedIn Partner Program upgrade, billing/plans, private/unlisted portfolio visibility.

---

## 37. Open Questions / Decisions Required

These require explicit product/technical sign-off before or during implementation; this FRD deliberately does not resolve them silently:

1. **Session model:** JWT vs. server-side session store — affects FR-AUTH-002/003 mechanics (token invalidation approach on logout/password change).
2. **Exact password policy:** minimum length/complexity beyond the baseline stated in FR-AUTH-001.
3. **Email verification gate on login:** should a just-registered, not-yet-verified user be blocked from *any* dashboard access, or allowed limited access (e.g., viewing Settings to resend verification) — FR-AUTH-002 currently assumes a hard block.
4. **Account-deletion data model:** hard delete vs. anonymize-and-retain for `auditLogs`/compliance history (FR-AUTH-008).
5. **Repository cap and "suggested featured" count (N):** exact numbers for FR-GITHUB-005/006.
6. **Handling of a featured repo that becomes unavailable** (deleted/private) after being included in a *published* snapshot (edge case #27, §34) — does the published page keep showing stale cached info, or does it need a background check?
7. **Character/length limits** for About, experience descriptions, project descriptions, etc. — placeholder numbers given in FR-PORTFOLIO-001, need product sign-off.
8. **AI regeneration UX:** auto-apply the new AI output vs. require explicit before/after confirmation (FR-AI-004) — this FRD recommends require-confirm but flags it as a decision, not a settled fact.
9. **Profile-completeness weighting table:** exact per-field/per-section weights (FR-PROFILE-003).
10. **Minimum completeness threshold (if any) to allow triggering Generate** (FR-AI-001) — currently defined only as "not essentially empty," not a specific number.
11. **AI generation/regeneration rate limits** — exact per-day numbers, and how they interact with future billing tiers (FR-SEC-002).
12. **Email change support in V1** (FR-SETTINGS-001) — the PRD/task didn't explicitly confirm this is needed for MVP.
13. **Unpublish page messaging/behavior specifics** — exact copy/HTTP status distinguishing "unavailable" vs "not found" (FR-PUBLISH-002).
14. **Slug-change redirect behavior:** should changing a slug leave a redirect from the old slug for some grace period, given previously shared links would otherwise break (FR-PUBLISH-003)?
15. **Soft-delete grace period for deleted portfolios** before slug release (FR-PUBLISH-004).
16. **Ordering constraint between Template Selection and first Generation** — can a user pick a template before ever generating content, or is template selection only available after a first successful generation?
17. **Generation-complete notification via email** — worth the added complexity for V1, or in-app-only is sufficient (FR-NOTIF-001)?
18. **LinkedIn resume-upload (FR-LINKEDIN-005) legal review outcome** — this entire feature is contingent on confirming it doesn't run afoul of LinkedIn's terms even though the user supplies their own exported file; must be confirmed before V1.0 scoping is finalized.
19. **Exact retention duration** for anonymized audit-log entries post-account-deletion (§29).
20. **Public vs. unlisted visibility** — confirmed out of scope for MVP/V1 per the PRD, but the schema note (`visibility` field) means a decision on when to introduce it affects how early the field should be reserved in the data model, which belongs in the architecture document but is flagged here as a dependency.

---

## 38. Final FRD Summary

### Functional Scope Summary
This FRD defines behavior for 60+ discrete functional requirements spanning authentication, dashboard, GitHub integration, LinkedIn integration (deliberately scoped to what's actually available via OIDC, with manual entry as the primary path for professional history), unified profile normalization with strict source-precedence rules, job-based AI generation with hard factuality constraints, a template-agnostic PortfolioData contract, a full editor/preview/publish/share workflow, account/privacy controls, and an admin surface — plus the cross-cutting rules (authorization, rate limiting, error handling, accessibility, responsiveness, performance) that apply uniformly across all of them.

### Critical Requirements
FR-DATA-001 (precedence enforcement) and FR-AI-005 (factuality enforcement) are the two requirements the rest of the product's trustworthiness depends on — every other AI- or sync-related requirement assumes these hold. FR-SEC-001 (ownership validation) is equally critical from a security standpoint and applies to nearly every other requirement in the document.

### MVP Requirements
See §36 — auth, GitHub, LinkedIn-identity-plus-manual, unified profile, core AI generation, 2–3 templates, core editor, preview, publish, basic sharing, core security/privacy controls.

### V1 Requirements
Remaining templates, section-level regeneration, full sharing suite, resume-import convenience, admin suite, expanded notifications.

### Future Requirements
Per PRD Non-Goals/Roadmap — deliberately excluded from this FRD's detailed behavior definitions since they are not being built yet.

### Major Risks
1. LinkedIn's real data limitations (§9, FR-LINKEDIN) create UX friction that could hurt activation — this is the single most consequential constraint on the whole product's day-to-day behavior.
2. AI factuality failures are high-stakes given the product represents real professional claims — FR-AI-005's fact-check pass is a hard requirement, not a nice-to-have.
3. A significant number of exact thresholds/policies remain open (§37) — implementation should not proceed on the affected requirements until these are resolved, to avoid rework.

### Open Decisions
See §37 in full — 20 items requiring explicit sign-off.

### Recommended Next Document
Per the task instructions: the **User Flow & UX Flow Document** — mapping every screen-to-screen transition, wireframe-level layout intent, and state transition implied by the requirements above into a navigable flow, before any technical architecture document is produced. No code and no architecture decisions should be made until that document is reviewed.

---

*End of FRD. This document should be treated as the behavioral source of truth; any requirement change discovered during UX-flow design or architecture work should be reflected back into this document (with a version bump) rather than resolved silently downstream.*
