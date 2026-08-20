# Product Requirements Document
## AI-Powered Developer Portfolio Generation Platform

**Version:** 1.0 (Draft for Approval)
**Status:** Pre-development — Architecture & Scope Definition
**Owner:** Product/Engineering

---

## Table of Contents

1. Executive Summary
2. Product Vision
3. Problem Statement
4. Goals
5. Non-Goals
6. Personas
7. User Journeys
8. Feature Requirements
9. GitHub Integration
10. LinkedIn Integration
11. Data Architecture
12. Unified Profile
13. AI Architecture
14. PortfolioData Schema
15. Template Architecture
16. UX/UI Architecture
17. Authentication
18. Authorization
19. Publishing
20. Sharing
21. Database Design
22. Backend Architecture
23. Frontend Architecture
24. API Specification
25. Background Jobs
26. Security
27. Privacy
28. SEO
29. Performance
30. Observability
31. Admin Dashboard
32. Future Billing
33. Future Roadmap
34. Testing Strategy
35. Edge Cases
36. Acceptance Criteria
37. Development Phases
38. Technical Risks
39. Licensing Considerations
40. Final Recommended Architecture
Addenda: A. MVP Scope · B. V1.0 Scope · C. Future Roadmap · D. Critical Risks · E. Implementation Order

---

## 1. Executive Summary

This document defines the product, architecture, and delivery plan for a web platform that generates professional developer portfolios by combining legitimately obtained data from GitHub and LinkedIn with user-supplied information, then using AI to organize and write portfolio content that is rendered into one of several pre-built, data-driven templates.

The platform is explicitly **not** a scraper. It only imports data through authorized OAuth/API mechanisms, never invents facts, and always gives the user a manual-entry path for anything it cannot legitimately retrieve. The system is built as a modular monolith (Node.js/Express/TypeScript backend, Next.js/TypeScript/Tailwind frontend, MongoDB) with a strict separation between raw source data, a normalized "Unified Profile," AI-generated presentation content, and the final template-rendering data contract ("PortfolioData"). This separation is the single most important architectural decision in the product: it allows integrations, AI providers, and templates to evolve independently.

The output for the end user is simple: connect accounts → the system fetches what it can → the user fills in what it can't → AI drafts the copy → the user reviews/edits → the user picks a template → the user publishes to a shareable URL (`/p/[slug]`).

---

## 2. Product Vision

**Vision statement:** Every developer, student, and technical professional should be able to have a polished, accurate, up-to-date portfolio online in minutes — not hours — without writing copy, designing a layout, or manually re-typing information that already exists in their GitHub and LinkedIn profiles.

**Positioning:** "Connect your professional profiles. Generate your portfolio. Publish it." The product sits between a resume builder and a website builder — more automated than either, but constrained by what data sources actually allow, so it never overpromises or fabricates a user's professional history.

**Differentiation:**
- Most portfolio builders require the user to manually enter everything (Webflow, generic site builders).
- Most "auto-portfolio from GitHub" tools only use GitHub and produce developer-only content with no professional narrative.
- This product's differentiator is combining two structured, authorized data sources with an AI layer that is constrained to a strict factuality contract, feeding a template system that is decoupled from both the data sources and the AI provider.

---

## 3. Problem Statement

Building a professional portfolio today requires a person to:

1. Decide what to include (which projects, which jobs, which skills).
2. Write descriptive copy for each item, which most developers find time-consuming and are not naturally good at.
3. Design or select a visual layout.
4. Manually keep it in sync as their GitHub/LinkedIn data changes.
5. Host and maintain the site.

This is high-friction enough that most students and many working developers never build a portfolio at all, or let an old one go stale. The market gap is a tool that removes steps 1–4 almost entirely by leveraging data the user already maintains elsewhere (GitHub, LinkedIn), while being honest about the limits of what can be automatically imported and never fabricating professional claims — a serious risk for anything AI-generated attached to a person's real professional identity.

---

## 4. Goals

**Primary goals (V1):**

1. Let a user go from zero to a published, professional portfolio in under 10 minutes for a "good" GitHub/LinkedIn profile.
2. Minimize manual data entry — only ask for what cannot be legitimately imported.
3. Import professional/developer data from GitHub (OAuth + REST/GraphQL API) and from LinkedIn strictly through LinkedIn's supported OAuth/API surface.
4. Use AI only to *organize and phrase* verified data, never to originate factual claims.
5. Ship at least 6 production-quality, responsive, accessible templates sharing one data contract.
6. Provide a real preview + edit workflow before publish.
7. Provide a stable, shareable public URL per portfolio.
8. Keep portfolio data and visual templates fully decoupled (same PortfolioData renders in any template).
9. Design the backend/data model so it scales horizontally without a rewrite (stateless API layer, queue-based background jobs, indexed MongoDB).
10. Protect user data and OAuth tokens (encryption at rest, least-privilege scopes, no tokens ever sent to the frontend).

**Secondary goals (V1, lower priority but in scope):**

- SEO-friendly public portfolio pages (metadata, OG tags, sitemap).
- Basic admin visibility into system health and usage.
- Draft/published/unpublished lifecycle for portfolios.

---

## 5. Non-Goals (V1)

Explicitly **out of scope** for the first release:

- Custom domains for portfolios.
- Portfolio visitor analytics.
- Resume/cover-letter PDF generation.
- Job matching / recruiter marketplace features.
- Team/organization accounts.
- Real-time collaborative editing.
- Automatic recurring re-sync of GitHub/LinkedIn on a schedule (V1 sync is user-triggered).
- Billing/payments (architecture will allow it later; it will not be built now).
- Portfolio version history / rollback.
- Custom CSS/font upload.
- Non-English AI content generation (V1 targets English output only, though data can contain any language).
- Native mobile apps.
- Any form of LinkedIn scraping outside the official API/OAuth surface, regardless of how it is requested by any team member — this is a hard legal/product boundary, not a backlog item.

---

## 6. Personas

### Persona 1 — Student ("Aanya")
Final-year CS student, 2–4 GitHub repos (class projects + one personal project), no formal work experience, wants an internship-ready portfolio.
**Needs:** Education prominent, projects prominent, skills from repo languages, no fabricated "experience" section, low-friction so she doesn't abandon setup.
**Adaptation:** Template recommendation logic weights "Education" and "Projects" highly and de-emphasizes/hides "Experience" if empty rather than showing an empty section.

### Persona 2 — Developer ("Marco")
2–5 years professional experience, active GitHub, LinkedIn with real job history, wants a portfolio to complement his resume during a job search.
**Needs:** Experience and GitHub projects both prominent, technical skill grouping, resume-adjacent tone.
**Adaptation:** Balanced template with Experience, Projects, Skills, and GitHub stats all visible.

### Persona 3 — Freelancer ("Priya")
Independent contractor, wants a client-facing site more than a developer-facing one; needs a "Services" and "Contact" focus, less emphasis on raw GitHub activity.
**Needs:** Services section (manual input — not derivable from GitHub/LinkedIn), strong contact CTA, portfolio of client-style projects.
**Adaptation:** Services section is a manual-only field in Unified Profile; template selection favors "Creative"/"Premium Creative" templates with a contact-forward layout.

### Persona 4 — Experienced Software Engineer ("David")
10+ years experience, multiple past companies, certifications, possibly less active on public GitHub (more private/enterprise work).
**Needs:** Experience and achievements prominent, certifications section, GitHub becomes secondary supporting evidence rather than the centerpiece.
**Adaptation:** Template recommendation may favor "Classic Professional" or "Minimal Professional," with GitHub section collapsed/summarized rather than repo-grid-first.

**Adaptation mechanism (general):** The AI generation step receives the Unified Profile and outputs a `recommendedSections` (visibility/order) and `recommendedTemplate` field based on which sections have substantive verified content. This is a *recommendation* the user can override in the editor — never a silent decision.

---

## 7. User Journeys

### 7.1 Primary journey (happy path)
Landing page → Register → Verify email → Dashboard (empty state) → Connect GitHub (OAuth) → Connect LinkedIn (OAuth) → System fetches permitted data → System computes profile completeness and lists missing fields → User fills in missing/optional fields → User clicks "Generate Portfolio" → Background job runs (sync confirm → normalize → AI generate → validate) → User is notified generation is complete → User reviews AI-generated PortfolioData in the editor → User edits text, reorders/hides sections, selects featured GitHub repos → User picks a template and previews on desktop/tablet/mobile → User publishes → User receives `/p/[slug]` and sharing options.

### 7.2 GitHub-only journey
User connects GitHub but skips/declines LinkedIn. System proceeds with GitHub + manual input only for Experience/Education/Certifications (since those aren't derivable from GitHub). Portfolio can still be generated and published; "Experience" section is hidden until the user adds it manually or connects LinkedIn later.

### 7.3 Re-generation journey
User has an already-published portfolio, updates their GitHub (new repo) or LinkedIn (new job), returns to dashboard, clicks "Sync" then "Regenerate." System re-fetches source data, re-normalizes, and re-runs AI generation **only for sections not manually locked by the user** (see §12/§17 — user-edited content takes precedence and is preserved unless the user explicitly requests regeneration of that specific section).

### 7.4 Disconnection journey
User disconnects LinkedIn from Settings → Connections. System stops using LinkedIn-sourced fields for future generations, retains already-imported normalized data unless the user also requests "Delete imported data," and clearly marks the portfolio as no longer synced with LinkedIn.

### 7.5 Failure journey
GitHub OAuth fails or is revoked mid-session → user is returned to Connections with a clear, non-technical error and a retry action → no partial/corrupted state is written to the Unified Profile.

---

## 8. Feature Requirements

Grouped by area; each maps to acceptance criteria in §36.

**Account & Auth:** registration, login, logout, email verification, password reset, session management, account deletion.

**Connections:** GitHub OAuth connect/disconnect, LinkedIn OAuth connect/disconnect, connection status display, token refresh handling, re-authorization on expiry.

**Data Sync:** on-demand sync from GitHub and LinkedIn, missing-field detection, manual field entry forms, profile completeness score.

**AI Generation:** job-based generation pipeline, structured JSON output, schema validation, regeneration of individual sections, factuality constraints.

**Portfolio Editing:** full CRUD on all PortfolioData fields, section reordering, section show/hide, featured-project selection, template switching, theme switching.

**Preview:** responsive preview (desktop/tablet/mobile), template-accurate preview using the real render pipeline (not a mockup).

**Publishing:** slug assignment/validation, publish/unpublish/draft/deleted states, public route rendering, SEO metadata generation.

**Sharing:** copy link, social share links, QR code generation.

**Settings/Privacy:** disconnect integrations, delete imported data, delete account, view what data is stored.

**Admin:** user/portfolio oversight, job monitoring, system health, role-gated access.

---

## 9. GitHub Integration

### 9.1 Authorization
GitHub OAuth App (or GitHub App — see decision below) using the standard `https://github.com/login/oauth/authorize` flow. Requested scopes are minimal: `read:user` (basic profile) and `public_repo`/`repo` read-level access is **not** requested — only what's needed to read public repository metadata, which for public repos generally does not require the `repo` scope at all when using unauthenticated-equivalent read calls against the authenticated user's own repos via `read:user` + default public API access. In practice the app requests `read:user` and relies on the public GitHub REST API (`/users/{username}/repos`) for repository listings, avoiding private-repo scopes entirely in V1 since portfolios are public-facing by nature.

**OAuth App vs. GitHub App:** A GitHub App is recommended over a classic OAuth App for production because it supports finer-grained, repository-scoped permissions, higher rate limits (5,000+/hour scaling with installation), and better token lifecycle (short-lived installation tokens vs. long-lived OAuth tokens). V1 can ship with a classic OAuth App for simplicity and migrate later without changing the data model — this is purely an authorization mechanism swap behind `githubService`.

### 9.2 Data fetched (automatically obtainable)
- Public profile: username, name, avatar URL, bio, company (as self-reported string), location (self-reported string), blog/website URL, public email if set, public repo count, followers count.
- Public repositories: name, description, URL, primary language, language breakdown, topics/tags, stars, forks, is-fork flag, is-archived flag, last-pushed date, created date, license, homepage URL, open issues count.
- README content for a repo (fetched on demand, only for repos the user chooses to feature, to control API usage) — used as raw input to AI project-description generation, never displayed verbatim without user review.
- Public contribution signal available via API (e.g., public events feed) — used only in aggregate ("active in the last N months") never as a fabricated "X commits" claim unless the number is directly and reliably obtainable from the API for that call.

### 9.3 Data NOT fetched
- Private repository contents or metadata.
- Private email address.
- Organization-internal data.
- Anything requiring scopes beyond `read:user` + public repo read.

### 9.4 Pagination & rate limits
- GitHub REST API pagination via `Link` headers; `githubService` fetches all pages up to a sane cap (e.g., 300 repos) and flags "more repos exist" if the cap is hit, rather than silently truncating.
- Rate limit headers (`X-RateLimit-Remaining`, `X-RateLimit-Reset`) are checked before/after each batch; on exhaustion, the job is paused and resumed after reset, and the user sees "Sync in progress, this may take a few minutes" rather than a failure.
- Conditional requests (`ETag`/`If-None-Match`) are used on repeat syncs to reduce rate-limit consumption.

### 9.5 Repository ranking / selection (never "include everything")
A relevance score is computed per repo from: not-a-fork (strong positive), not-archived, has a description, has a README, recency of last push, star count, presence of recognizable languages/topics, and non-trivial size (excludes empty scaffolds). The top N (e.g., 6–8) by score are pre-selected as "suggested featured," but the **user makes the final selection** in the editor — the system never publishes a repo list the user hasn't confirmed at least once.

### 9.6 GitHub data model (raw → normalized)

```
GithubProfile
  username, displayName, avatarUrl, bio, company, location,
  blogUrl, publicEmail, followers, publicRepoCount, fetchedAt

GithubRepository
  repoId, name, description, htmlUrl, homepageUrl,
  primaryLanguage, languages[], topics[], stars, forks,
  isFork, isArchived, license, createdAt, pushedAt,
  openIssues, readmeExcerpt, relevanceScore, isFeatured (user-set)
```

### 9.7 Errors handled
Auth denied by user, token expired/revoked, rate limit exceeded, network timeout, user has zero public repos, API returns partial data (some fields null) — all mapped to specific, user-readable states (see §27).

---

## 10. LinkedIn Integration

This is the highest-risk integration and is designed conservatively.

### 10.1 Hard constraint
LinkedIn does **not** provide a general-purpose "read any public profile's full work history" API to third-party consumer apps. LinkedIn's Consumer Solutions Platform APIs (Sign In with LinkedIn / "Sign In with LinkedIn using OpenID Connect") grant access to **basic authenticated-member profile data only** (name, profile picture, email address if the `email` scope is granted, and LinkedIn member ID) — not detailed work history, education, skills, certifications, or connections. Full profile data (positions, education, skills, endorsements) is only available through LinkedIn's restricted **Partner Programs** (e.g., Talent Solutions, Marketing Developer Platform), which require a business application, approval, and a signed partnership agreement — not something a self-serve consumer SaaS can assume access to at launch. **The PRD does not assume Partner Program access is available.**

### 10.2 What this means for the product
LinkedIn integration in V1 is scoped to what "Sign In with LinkedIn (OpenID Connect)" actually provides:
- Verifying the user's identity (proof this LinkedIn account belongs to them).
- Retrieving: first name, last name, profile picture URL, email address (if `email` scope granted and user consents), LinkedIn member URN.

It does **not** retrieve: job history, education history, skills list, certifications, endorsements, recommendations, or headline/summary text. If/when the product later qualifies for a LinkedIn Partner Program, this can be upgraded — the Unified Profile schema already has fields for `experience`, `education`, `certifications` that are source-tagged, so a future richer integration only changes `linkedinService`, not the data contract.

### 10.3 OAuth/authorization flow
Standard OAuth 2.0 Authorization Code flow against LinkedIn's OIDC endpoints. Scopes requested: `openid`, `profile`, `email`. Access tokens are short-lived (per LinkedIn's token policy); the app does not assume long-lived refresh without re-consent, and re-prompts the user to reconnect when a token can no longer be validated, rather than silently failing.

### 10.4 Token handling
- Access tokens encrypted at rest (AES-256-GCM, key from a secrets manager/env, never hardcoded).
- Tokens never sent to the frontend; all LinkedIn API calls happen server-side.
- Explicit revocation path: disconnecting in Settings deletes the stored token server-side immediately.

### 10.5 Fallback system (core design requirement)
Because LinkedIn cannot supply Experience/Education/Skills/Certifications automatically, the product presents these clearly as **manual-input sections** from the start — not as a "failed sync." UI copy: *"LinkedIn sign-in confirms your identity and photo, but LinkedIn doesn't allow apps like this to automatically import your work history. Add your experience below — it only takes a minute, and you can also paste from your resume."* A "paste your resume / LinkedIn PDF export" convenience path (§10.6) exists to reduce this friction without violating LinkedIn's API terms (the user is uploading their own exported document, not the app scraping LinkedIn).

### 10.6 Optional resume-import convenience (user-initiated, not scraping)
LinkedIn allows a member to export their own profile as a PDF ("Save to PDF") or download their data archive. The product may optionally let the user **upload that file themselves**; the backend parses the uploaded document text (standard document/PDF text extraction) to pre-fill Experience/Education/Skills as a *proposed* draft, clearly marked as user-provided-import (not "verified from LinkedIn API") and always editable/removable. This is legally distinct from scraping because the user supplies their own exported data voluntarily; it is documented in this PRD as an optional V1.0 (not MVP) convenience feature, contingent on legal review of LinkedIn's terms at implementation time.

### 10.7 Privacy considerations
- Only `openid/profile/email` scopes; no attempt to request broader scopes not granted to the app type.
- Clear consent screen before redirecting to LinkedIn, explaining exactly what will and won't be imported.
- Data retention and deletion controls identical to GitHub (§31).

### 10.8 Failure cases
User denies consent, token invalid/expired, LinkedIn API downtime, email scope denied (user can still connect for identity/photo only, portfolio proceeds without LinkedIn email) — each mapped to a specific non-technical message.

---

## 11. Data Architecture

Four distinct layers, never merged into one blob:

1. **Raw source data** — exact structures returned by GitHub/LinkedIn APIs (or user document upload), stored as-is for traceability and re-normalization without re-fetching (`sourceProfiles`, `githubRepositories`).
2. **Normalized data (Unified Profile)** — cleaned, deduplicated, source-tagged fields in the application's own schema, merging GitHub + LinkedIn + manual input with clear provenance per field.
3. **AI-generated content** — presentation-layer text/organization produced from the Unified Profile, stored separately with an `isAiGenerated: true` flag and a pointer back to the source facts it was derived from.
4. **PortfolioData** — the final, template-consumable contract, built from Unified Profile + AI content + user edits, with user edits always taking precedence (§13).

This layering is what makes "AI must never override verified user information" enforceable in code rather than just in a prompt: the merge step is explicit application logic, not something the AI model itself is trusted to guarantee.

---

## 12. Unified Profile

`UnifiedProfile` is the canonical merged record for a user, independent of any template or AI output.

```
UnifiedProfile
  personal        { name, headline, avatarUrl, location, email, phone? }
  hero            { tagline, summaryShort }          // AI-assisted, user-editable
  about           { longSummary }                     // AI-assisted, user-editable
  skills          [ { name, category, source } ]
  experience      [ { company, title, startDate, endDate, description, source } ]
  education       [ { school, degree, field, startDate, endDate, source } ]
  projects        [ { title, description, repoRef?, url, techStack[], source } ]
  github          { profile: GithubProfile, repositories: GithubRepository[] }
  certifications  [ { name, issuer, date, credentialUrl, source } ]
  achievements    [ { title, description, date, source } ]
  services        [ { title, description } ]           // manual-only (freelancer persona)
  socialLinks     { github, linkedin, twitter, website, other[] }
  contact         { email, phone?, preferredMethod }
  resume          { fileUrl?, parsedAt? }
  preferences     { visibleSections[], sectionOrder[], theme, template }
```

Every leaf field that can originate from more than one source carries a `source` tag: `"github" | "linkedin" | "manual" | "ai"`. This tag is what drives precedence (§13) and is also surfaced in the UI (e.g., a small "from GitHub" / "you added this" label) so the user always knows why a field says what it says.

**Raw vs. normalized vs. AI vs. user-edited**, concretely:
- Raw: GitHub's exact repo JSON as returned by the API.
- Normalized: `{ title: "Task Tracker CLI", techStack: ["TypeScript","Node.js"], repoRef: "user/task-tracker" }` derived from that JSON.
- AI-generated: a 2-sentence project description written from the README + normalized metadata.
- User-edited: the user rewrites that description; from that point, the stored value is `source: "manual"` (originally AI, now user-owned) and AI regeneration will not silently overwrite it again unless the user explicitly clicks "Regenerate this section."

---

## 13. Data Source Priority

Precedence, highest to lowest:

1. **User-edited data** — anything the user has explicitly typed or approved-and-modified. Immutable by any future AI run unless the user opts into regeneration for that specific field/section.
2. **Verified source data** — direct, unmodified facts from GitHub/LinkedIn APIs or user-uploaded documents (company names, dates, repo stats).
3. **AI-generated presentation** — wording/organization built on top of verified data (summaries, phrased descriptions), only used where the user hasn't yet edited it.
4. **Derived/inferred data** — system-computed signals like relevance score or suggested featured projects; used to *suggest*, never to silently populate a factual field a user would see as a claim about themselves.

**Non-negotiable AI rules:**
- AI never invents employment, education, certifications, technologies, achievements, job titles, metrics, responsibilities, companies, or projects.
- If information is unavailable, the corresponding field is `null`/omitted — the UI shows "Not provided — add this" rather than any generated placeholder text.
- AI may only *rephrase, summarize, categorize, or select from* facts already present in the Unified Profile.

---

## 14. AI Architecture

### 14.1 Input/Output contract
**Input:** the current `UnifiedProfile` (facts only) plus a small amount of generation context (target tone: e.g., "student" vs "experienced engineer," derived from persona signals like presence/absence of experience entries).
**Output:** a structured `PortfolioData` JSON object matching a fixed schema (§14, §... see §14 "PortfolioData Schema" section below) — never free-form prose, never HTML, never a full "website."

### 14.2 AI responsibilities
- Write a professional `hero.tagline` and `about.longSummary` grounded only in Unified Profile facts.
- Improve project descriptions from README + metadata (still grounded — no invented outcomes/metrics).
- Group technologies into skill categories (e.g., "Frontend," "Backend," "DevOps") from the raw skill/language list.
- Write concise experience-description bullets *rephrasing* user-provided responsibilities — never adding new responsibilities.
- Recommend section visibility/order and a template (a suggestion the user can override).
- Generate SEO metadata (title/description) from the same facts.
- Select which pre-scored GitHub repos to suggest as "featured" (still user-confirmed).

### 14.3 Provider recommendation
Anthropic's Claude (Sonnet-class model) is recommended as the primary generation provider, called through the standard Messages API with **structured/JSON output enforced via a strict system prompt + schema validation on the response** (Claude does not need a bespoke "function calling for generation" pattern here — a system prompt instructing "respond only with JSON matching schema X, no prose" combined with server-side JSON-schema validation is sufficient and keeps the integration provider-agnostic). Because the architecture in §11 fully decouples "AI-generated content" from the rest of the system, the specific provider is an implementation detail behind `aiService`; a swap to another JSON-capable LLM later requires no changes to normalization, PortfolioData, or templates.

### 14.4 Prompting strategy (architecture-level, not literal prompt text)
- System instructions enumerate the factuality rules from §13 explicitly (no invention, omit-don't-fabricate, output must be valid JSON only).
- The Unified Profile is passed as structured JSON in the user turn, not prose, to reduce the model's temptation to "fill in the gaps" narratively.
- Each generation call is scoped as small as practical (e.g., "generate `about` and `hero` only" or "generate descriptions for these 6 projects") rather than one giant call, both for reliability of JSON output and to support the "regenerate this section only" UX from §17.

---

## 15. PortfolioData Schema

`PortfolioData` is the single contract every template renders from. It is derived server-side from `UnifiedProfile` + AI output + user edits at generation/edit time, and is what's actually stored per portfolio (draft and published versions).

```
PortfolioData
├── personal        { name, headline, avatarUrl, location }
├── hero             { tagline, ctaText? }
├── about             { summary }
├── skills            [ { category, items[] } ]
├── experience        [ { company, title, startDate, endDate, bullets[] } ]
├── education         [ { school, degree, field, startDate, endDate } ]
├── projects          [ { title, description, url, repoUrl?, techStack[], featured: bool } ]
├── certifications    [ { name, issuer, date, credentialUrl } ]
├── achievements      [ { title, description, date } ]
├── github            { username, profileUrl, stats: { publicRepos, followers }, featuredRepoIds[] }
├── socialLinks       { github?, linkedin?, twitter?, website? }
├── contact           { email?, phone?, preferredMethod? }
├── services          [ { title, description } ]     // present only for personas that filled it in
├── meta              { seoTitle, seoDescription, ogImageUrl?, templateId, theme, visibleSections[], sectionOrder[] }
└── audit             { generatedAt, lastEditedAt, aiGeneratedFields[] }
```

**Optional-field rule:** every array/object above may be empty or absent. Templates must render conditionally — a template component for a section receives `null`/`[]` and returns nothing (not an empty heading, not a placeholder card). This is enforced by a shared `SectionGate` wrapper component in the template renderer (§16) rather than left to each template to reimplement.

---

## 16. Template Architecture

### 16.1 Principle
One data contract (`PortfolioData`), many renderers. Templates are pure presentation — they contain **zero** data-fetching or business logic.

```
PortfolioData
    ↓
Template Renderer (selects component tree by templateId)
    ↓
Selected Template (pure UI components, Tailwind-styled)
    ↓
Rendered Portfolio (SSR/ISR page at /p/[slug])
```

### 16.2 Initial template set (6)
1. **Modern Developer** — dark, code-forward, GitHub-stat-prominent. Best fit: students/developers with strong repos.
2. **Minimal Professional** — light, typography-led, resume-adjacent. Best fit: experienced engineers.
3. **Modern Minimal** — light, generous whitespace, balanced sections.
4. **Classic Professional** — traditional resume-website hybrid, experience-first.
5. **Creative Developer** — more visual/illustrative, project-imagery forward. Best fit: freelancers.
6. **Premium Creative** — the most visually distinctive, animated but restrained, contact-forward. Best fit: freelancers/senior engineers wanting a stronger personal brand.

### 16.3 Next.js structure
Each template lives under a common `templates/` namespace as a self-contained component package exporting one root component with the signature `Template(props: { data: PortfolioData; theme: Theme })`. A `TemplateRegistry` maps `templateId → component`, used both by the editor's live preview and the public `/p/[slug]` route, guaranteeing preview and published output are pixel-identical (§18). Shared primitives (section gating, image handling, typography scale, spacing tokens) live in a `templates/shared/` package all six templates import, so structural fixes (e.g., accessibility, section-hiding logic) aren't duplicated six times.

### 16.4 Requirements per template
Responsive/mobile-first, WCAG 2.1 AA-minded (color contrast, semantic headings, alt text from GitHub repo descriptions), fast (no template-specific heavy JS; motion via CSS/lightweight libraries only), SEO-friendly (semantic HTML, single H1), and fully data-driven (no hardcoded example content anywhere in a shipped template).

---

## 17. UX/UI Architecture

### 17.1 Editor workflow
Generate → Review → Edit → Preview → Publish, implemented as a persistent left-nav editor (Personal, Hero, About, Skills, Experience, Education, Projects, Certifications, Achievements, GitHub, Social/Contact, Template/Theme) with a live preview pane on the right (desktop) or a "Preview" tab (mobile editor).

### 17.2 Editing capabilities
Edit any field in PortfolioData; reorder sections (drag-and-drop, persisted to `meta.sectionOrder`); hide/show sections (`meta.visibleSections`); feature/unfeature GitHub projects; switch template (non-destructive — PortfolioData is template-agnostic so switching is instant); switch theme (light/dark or accent variants per template, defined per-template in §16); update social links; and **regenerate** any single AI-eligible section (hero, about, a specific project description, experience bullets) without touching other sections or discarding other user edits.

### 17.3 Persistence
Every edit auto-saves (debounced) to the `portfolioDrafts` collection; publishing copies the current draft into an immutable `portfolios` published snapshot (§19) so further draft edits don't affect the live page until re-published.

---

## 18. Portfolio Preview

The preview pane renders using the **exact same** `TemplateRegistry` + `PortfolioData` that the public route uses — it is not a separate mock. Desktop/tablet/mobile are implemented as constrained-width iframes (or CSS container-query viewport simulation) around that same render, so what the user sees while editing is guaranteed to match what publishes. Preview updates on debounce as the user types; template/theme switch is instant since it's a pure client-side prop change against already-loaded PortfolioData.

---

## 19. Publishing System

- Public URL: `/p/[uniqueSlug]`. Slug defaults to a sanitized username, with automatic disambiguation (`jane-doe`, `jane-doe-2`) on collision.
- Slug validation: lowercase, alphanumeric + hyphen, 3–50 chars, reserved-word blocklist (`admin`, `api`, `login`, etc.), uniqueness enforced at the database level (unique index).
- States: `draft` (never published), `published` (live at slug), `unpublished` (was live, now hidden — slug reserved, page returns 404/"currently unavailable"), `deleted` (soft-deleted, slug released after a grace period).
- Publishing snapshots the current draft PortfolioData into the `portfolios` collection; the public route always reads from this snapshot, never from the live-editable draft, so in-progress edits never leak to visitors.
- SEO: per-portfolio `<title>`, meta description, Open Graph tags (title/description/image), canonical URL pointing to the slug's own URL.
- `sitemap.xml` includes published portfolio URLs; `robots.txt` allows indexing of published portfolios and disallows draft/editor/API routes.
- Single scalable renderer: one Next.js dynamic route (`/p/[slug]`) using Incremental Static Regeneration or on-demand SSR with caching — **not** a per-user deployment/build.

---

## 20. Sharing

Copy-link button, native share sheet where supported, direct social share links (LinkedIn/Twitter/X pre-filled share URLs — using their standard share-intent URLs, not their content APIs), and a generated QR code (server-side QR generation from the public URL, cached).

**Public/private:** V1 defaults to public-only portfolios (this is the core product — a portfolio you can't share isn't useful yet), but the schema includes a `visibility: "public" | "unlisted"` field so an "unlisted" (link-only, not sitemap-indexed) option can ship without a data-model change. If a private/authenticated-only mode is added later: every portfolio read must verify either public/unlisted status or ownership/authorization server-side (never trust a client-supplied "isOwner" flag), object IDs must not be sequentially guessable (use slugs/UUIDs, not incrementing IDs, exactly to prevent IDOR), and public API responses must never include fields like raw OAuth tokens or internal user IDs regardless of visibility setting.

---

## 21. User Data Security

- Passwords hashed with bcrypt/argon2 (argon2id recommended), never reversible.
- Session cookies: `httpOnly`, `secure`, `sameSite=lax` (or `strict` where compatible with OAuth redirect flows).
- CSRF protection on all state-changing routes (double-submit token or same-site cookie strategy appropriate to the session model chosen in §17/§23).
- XSS: all user-generated text rendered through React's default escaping; any rich-text fields sanitized server-side before storage.
- Input validation on every API route via a schema library (e.g., Zod) shared between request validation and, where useful, AI-output validation.
- Rate limiting on auth endpoints (login, register, password reset) and on generation-trigger endpoints, to prevent brute force and AI-cost abuse.
- Every data-access query is scoped to the authenticated user's ownership (`userId` match) at the query level, not just the route level.
- MongoDB query safety: all inputs passed through the schema validator before touching a query; no raw string concatenation into queries; Mongoose (or equivalent) parameterization used throughout.
- OAuth tokens (GitHub, LinkedIn) encrypted at rest (AES-256-GCM), decrypted only in-memory server-side when a call to that provider is needed, never returned in any API response.
- Secrets (DB URI, encryption keys, OAuth client secrets, AI API key) only in environment variables / secrets manager — never committed, never logged.
- Tokens are never stored in frontend `localStorage`/`sessionStorage`; session identifiers use httpOnly cookies.
- Logging excludes passwords, tokens, and full PII payloads — logs reference `userId`, not raw personal data.
- Error responses to the client are generic and safe ("Something went wrong, please try again") while full detail goes to server-side structured logs/error tracking only.

---

## 22. Database Design (MongoDB)

**Collections:**

- `users` — auth identity, profile basics, role, account status. Embeds nothing large; referenced by everything else via `userId`.
- `connections` — one doc per (user, provider) pair: provider, encrypted tokens, scopes granted, connected/disconnected status, last sync timestamp. Referenced, not embedded in `users`, because tokens have their own security/lifecycle handling.
- `sourceProfiles` — raw normalized-ish snapshot per provider (GitHub profile JSON, LinkedIn OIDC claims), for traceability and re-normalization without re-fetching.
- `githubRepositories` — one doc per repo per user, indexed by `userId` + `repoId`; kept separate from `sourceProfiles` because it's a growing list queried/filtered independently (featured toggles, relevance sort).
- `unifiedProfiles` — one doc per user, the merged/normalized profile (§12). Embedded sub-documents for skills/experience/education/etc. since these are always read/written together with the profile and bounded in size.
- `portfolioDrafts` — one doc per user (or per portfolio, if multi-portfolio is ever allowed later), the editable `PortfolioData` plus edit metadata (`aiGeneratedFields`, `lastEditedAt`).
- `portfolios` — the **published snapshot**, keyed by unique `slug`, immutable until re-published; this is what the public route reads — separated from `portfolioDrafts` specifically so editing never affects the live page mid-edit.
- `templates` — metadata about the 6 templates (id, name, thumbnail, description) for the template picker; template *code* itself lives in the codebase, not the DB.
- `generationJobs` — job records (status: queued/running/succeeded/failed, timestamps, error detail, which sections were requested) for the background generation pipeline (§25).
- `sessions` — only needed if using server-side session storage rather than stateless JWT (see §17 recommendation); stores session id, userId, expiry.
- `auditLogs` — security-relevant events (login, connection added/removed, account deletion, publish/unpublish) for admin/observability, never storing full request bodies.

**Embedding vs. referencing rule of thumb:** embed when data is always read together and bounded (skills/experience arrays inside `unifiedProfiles`); reference when data has independent lifecycle, security handling, or unbounded growth (`connections` tokens, `githubRepositories` list, `generationJobs` history).

**Key indexes:** `users.email` (unique), `connections.{userId, provider}` (unique compound), `githubRepositories.{userId, repoId}` (unique compound), `portfolios.slug` (unique), `generationJobs.{userId, status}`, `auditLogs.{userId, createdAt}`.

---

## 23. Backend Architecture

**Stack:** Node.js, Express, TypeScript, modular monolith (explicitly **not** microservices for V1 — the operational overhead of separate services isn't justified until scale/team size demands it, and a modular monolith with clean service boundaries can be split later without a rewrite).

**Modules (services), each with a clear boundary and its own internal repository layer:**

- `authService` — registration, login, sessions/tokens, password reset, email verification.
- `githubService` — OAuth handling, GitHub API calls, pagination/rate-limit handling, raw→normalized repo mapping.
- `linkedinService` — OIDC flow, token handling, claim mapping, resume-upload parsing (§10.6).
- `profileService` — owns `unifiedProfiles`; merge logic implementing the precedence rules in §13.
- `normalizationService` — pure transforms from raw source docs to Unified Profile shape (called by github/linkedin services, kept separate so it's independently testable).
- `aiService` — the only module that talks to the AI provider; enforces the JSON-schema contract, retries, and the factuality-instruction system prompt.
- `portfolioService` — owns `portfolioDrafts`/`portfolios`; edit operations, merge of AI output + user edits.
- `templateService` — template metadata/listing; template *rendering* actually happens in the frontend, this service just exposes catalog info.
- `publishingService` — slug management, publish/unpublish/delete lifecycle.
- `sharingService` — QR code generation, share-link construction.

Each service exposes a narrow internal interface consumed by route controllers; services do not directly import each other's database models — cross-service needs go through the service's public function, keeping future extraction into separate deployables realistic.

---

## 24. Frontend Architecture

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS.

**Route groups:**
- `(marketing)` — landing page and public marketing routes, statically generated.
- `(auth)` — login/register/forgot-password/reset-password/verify-email.
- `(dashboard)` — authenticated app shell: Overview, Profile, Connections, Generate, Editor, Templates, Settings.
- `p/[slug]` — public portfolio render route, SSR/ISR, no dashboard chrome.
- `(admin)` — role-gated admin routes.

**Component architecture:** a shared `ui/` primitives layer (buttons, cards, form fields — used by dashboard, not by templates, to keep template packages self-contained per §16.3); a `dashboard/` layer of feature components (ConnectionCard, CompletenessMeter, SectionEditor, PreviewFrame); and the isolated `templates/` package described in §16. Data fetching in the dashboard uses server components/route handlers for initial load and client-side mutation calls (with optimistic UI for edits) for the interactive editor.

---

## 25. API Specification

All authenticated routes require a valid session; ownership is re-checked server-side on every resource access (never inferred from the URL alone).

```
POST   /auth/register            public   — body: {email, password, name}
POST   /auth/login                public   — body: {email, password}
POST   /auth/logout               auth
GET    /auth/me                   auth
POST   /auth/verify-email         public   — body: {token}
POST   /auth/forgot-password      public   — body: {email}
POST   /auth/reset-password       public   — body: {token, newPassword}
DELETE /auth/account              auth     — deletes user + cascades per §31

GET    /connections               auth     — status of github/linkedin connections
GET    /connections/github/start  auth     — redirect to GitHub OAuth
GET    /connections/github/callback auth   — OAuth callback, creates/updates connection
DELETE /connections/github        auth
GET    /connections/linkedin/start auth
GET    /connections/linkedin/callback auth
DELETE /connections/linkedin      auth

POST   /profile/sync              auth     — triggers re-fetch from connected providers
GET    /profile                   auth     — returns UnifiedProfile + completeness score
PATCH  /profile                   auth     — manual field updates (validated per field)

POST   /portfolio/generate        auth     — body: {sections?: string[]} — starts generationJob
GET    /portfolio/generation/:id  auth     — job status/result, ownership-checked

GET    /portfolio                 auth     — current draft PortfolioData
PATCH  /portfolio                 auth     — partial edits (field-level), marks source: "manual"
POST   /portfolio/regenerate      auth     — body: {section} — AI regenerate one section only
POST   /portfolio/publish         auth     — validates completeness, assigns/confirms slug
POST   /portfolio/unpublish       auth

GET    /templates                 public   — catalog listing (id, name, thumbnail)

GET    /p/:slug                   public   — rendered public portfolio (frontend route, not raw API)
GET    /api/public/portfolio/:slug public  — JSON for the public render (no auth fields exposed)
```

Every mutating route validates its body against a schema before touching the database; every route returning a resource re-checks that the resource's `userId` matches the session (or that it's the public/published variant with sensitive fields stripped).

---

## 26. Background Jobs

Long-running work (multi-page GitHub fetch, AI generation, normalization) never blocks an HTTP request.

```
User clicks Generate
  → POST /portfolio/generate creates a `generationJobs` doc (status: queued), returns jobId immediately
  → Worker picks up the job:
      sync GitHub/LinkedIn (if requested) → normalize → merge into UnifiedProfile
      → call aiService for requested sections → validate JSON against schema
      → merge AI output into PortfolioData respecting §13 precedence
      → mark job succeeded (or failed with a specific error code)
  → Frontend polls GET /portfolio/generation/:id (or subscribes via SSE/WebSocket later)
```

**V1 recommendation — simplest reliable implementation:** an in-process job runner backed by a `generationJobs` MongoDB collection acting as the queue (status field + polling worker loop with a lock/claim field to avoid double-processing), which is sufficient at V1 scale and requires no new infrastructure.

**Scaling path (no rewrite required):** because the worker's contract is "read a queued job doc, process it, write status," swapping the queue backend to Redis/BullMQ later is a change inside the job-dispatch layer only — the job schema, the service functions each job calls (`githubService`, `aiService`, etc.), and the API contract (`POST /generate` → `jobId` → poll/subscribe) all stay the same.

---

## 27. Error Handling

| Failure | Handling |
|---|---|
| GitHub API failure/timeout | Retry with backoff (bounded), then mark job failed with "GitHub is temporarily unavailable, try again shortly." |
| LinkedIn authorization failure | Return to Connections with "LinkedIn sign-in didn't complete — please try again." |
| OAuth token expired | Mark connection `needs_reauth`, prompt reconnect, do not silently drop data already imported. |
| API rate limiting | Pause/resume job automatically (GitHub); surface "Sync in progress" rather than an error where possible. |
| Missing data | Never an error — surfaced as "Add this" in the completeness UI. |
| AI failure (provider error) | Retry once with backoff; on repeat failure, mark job failed, preserve any already-generated sections, let user retry just the failed section. |
| Invalid AI JSON | Reject at schema-validation layer, retry generation once with a stricter reminder in the prompt, then fail gracefully rather than saving malformed data. |
| Database failure | Return generic 500, log full detail server-side, never write partial documents (use transactions where multi-doc consistency matters, e.g., publish). |
| Generation timeout | Job marked `timed_out` after a max duration; user can retry. |
| Duplicate slug | Caught at the unique-index level, user is offered the next available suggested slug. |
| Unauthorized access | 403 with generic message; logged to `auditLogs`. |
| Network failure (client) | Frontend shows retry affordance, preserves unsaved edit state client-side until save succeeds. |
| User disconnects an integration mid-sync | In-flight job is cancelled/marked failed cleanly; no orphaned partial data written. |

All user-facing errors are plain-language; stack traces/internal codes never reach the client response body.

---

## 28. Observability

- Structured JSON logging (request id, userId reference, route, status, duration) — no raw PII or tokens.
- Error tracking (e.g., Sentry-class tool) capturing exceptions with scrubbed context.
- API request monitoring (latency, error rate per route).
- Generation job monitoring: queue depth, success/failure rate, average duration, AI-call failure rate specifically broken out.
- OAuth failure monitoring (GitHub/LinkedIn) broken out by provider so a provider-side outage is immediately visible.
- Basic performance metrics (p50/p95 latency on key routes, public portfolio render time).

---

## 29. Performance

- Cache GitHub responses (per-user, short TTL + ETag-based conditional refresh) to avoid redundant calls on repeated dashboard visits.
- Paginate all list UIs (repos) rather than rendering hundreds of items at once.
- Lazy-load below-the-fold template sections and images.
- Next.js image optimization for avatars/repo social-preview images.
- Next.js ISR/caching for public portfolio pages so repeat visits don't hit the database on every request.
- MongoDB indexes per §22 to keep dashboard/editor queries fast at scale.
- Avoid unnecessary AI calls: regeneration is section-scoped (§14.4), and a full regenerate is never triggered by an unrelated edit.
- Avoid repeated synchronization: sync is user-triggered (button) or job-triggered, never polled automatically in V1.

**Target:** public portfolio page interactive in under ~2s on a typical connection; dashboard/editor interactions feel instant (<300ms) for anything not requiring a network round trip.

---

## 30. SEO

Per-published-portfolio: `<title>`, meta description, Open Graph (title/description/image), Twitter card tags, canonical URL self-referencing the slug, semantic HTML (single H1 = name, proper heading hierarchy per section), JSON-LD `Person`/`ProfilePage` structured data built from the same PortfolioData facts (never inventing structured-data claims beyond what's in the contract), a generated `sitemap.xml` including all published slugs, and a `robots.txt` allowing indexing of `/p/*` while disallowing `/dashboard/*`, `/api/*`, and auth routes.

---

## 31. Privacy

Users can see, at any time, in Settings: which providers are connected, what data was imported from each, and what they've added manually. Controls provided:

- **Disconnect GitHub** — stops future syncing; existing imported data remains unless "Delete imported data" is also used.
- **Disconnect LinkedIn** — same pattern.
- **Delete imported data** — purges `sourceProfiles`/`githubRepositories` and clears provider-sourced fields from `unifiedProfiles` (fields with `source: "manual"` or already user-edited are preserved, per §13).
- **Delete account** — cascades: deletes `users`, `connections` (tokens revoked where the provider supports revocation, then deleted), `sourceProfiles`, `githubRepositories`, `unifiedProfiles`, `portfolioDrafts`, `portfolios` (public slug immediately 404s), retains only anonymized `auditLogs` entries required for security/compliance history, with PII stripped from those retained entries.

A plain-language privacy explanation is present at (a) the LinkedIn/GitHub consent screens, (b) the landing page privacy section, and (c) Settings — not buried only in a legal document.

---

## 32. Admin Dashboard

Role-gated (`role: "admin"` on `users`, enforced server-side on every admin route — never a frontend-only check).

Sections: platform overview (user/portfolio counts, growth), user list (search, view connection/status — never raw tokens or password hashes), portfolios list (status, slug, flagging capability for abuse), templates catalog management, generation job monitor (queue depth, failures, retry), AI usage (call volume/cost proxy, failure rate), API usage, error log summary, system health (job worker status, DB connectivity), audit log viewer. Admin views of user data are read-only where possible and exclude sensitive fields (tokens, password hashes) at the query-projection level, not just the UI level.

---

## 33. Future Billing

Not built in V1, but the schema anticipates it: `users` includes a `plan: "free"` field from day one (even though only "free" exists), and usage-relevant counters (`generationJobs` per user, `portfolios` count) are already tracked as a byproduct of normal operation, so a future limits/billing layer reads existing data rather than requiring new instrumentation. Likely future tiers: **Free** (capped generations/month, limited templates), **Pro** (more generations, all templates, priority AI queue), **Premium** (custom domain, analytics, advanced customization) — to be scoped in a future PRD once usage data exists to inform real limits.

---

## 34. Future Roadmap

Deferred beyond V1 (see also §5 Non-Goals): custom domains, portfolio visitor analytics, resume/cover-letter generation, job matching, AI career recommendations, portfolio scoring, automatic scheduled GitHub re-sync, portfolio version history, custom CSS/fonts, team accounts, recruiter mode, portfolio marketplace, LinkedIn Partner Program integration (richer experience/education/skills import, pending business approval), additional templates beyond the initial 6.

---

## 35. Testing Strategy

- **Unit tests:** normalization functions, precedence-merge logic (§13), slug generation/validation, relevance-score calculation, schema validators.
- **Integration tests:** service-to-service flows (e.g., generate job → normalization → AI → portfolio save) using mocked provider responses.
- **API tests:** every route in §25, including auth/authorization failure paths.
- **OAuth tests:** GitHub and LinkedIn flows against sandbox/mocked provider endpoints, including denial, expiry, and revocation.
- **GitHub integration tests:** pagination edge cases, rate-limit backoff behavior, fork/archive filtering, zero-repo and 500+-repo cases.
- **LinkedIn integration tests:** OIDC claim mapping, missing-email-scope case, resume-upload parsing edge cases.
- **AI schema validation tests:** malformed JSON rejection, retry behavior, section-scoped regeneration not touching other sections.
- **Portfolio rendering tests:** each of the 6 templates against a matrix of PortfolioData states (fully populated, minimal, empty-optional-sections) — snapshot/visual regression where practical.
- **Authorization tests:** cross-user access attempts on every ownership-scoped route (must fail).
- **Security tests:** injection attempts on all inputs, session fixation, CSRF token enforcement, rate-limit enforcement.
- **End-to-end tests:** the full happy-path journey (§7.1) and the GitHub-only journey (§7.2) via browser automation.
- **Mobile/responsive tests:** preview and public-page rendering at defined breakpoints per template.
- **Performance tests:** public portfolio render time under load, generation-job throughput.

---

## 36. Acceptance Criteria

**GitHub integration**
- User can connect GitHub; OAuth completes successfully.
- Repository pagination retrieves all public repos (or clearly flags the cap).
- Rate limits are handled without user-facing failure under normal usage.
- User can select/deselect featured repositories.
- No private-repo or private-scope data is ever fetched or exposed.

**LinkedIn integration**
- User can sign in with LinkedIn; identity/photo/email (if granted) import correctly.
- No experience/education/skills/certifications are fabricated when unavailable; UI clearly routes the user to manual entry instead.
- Disconnection immediately stops future use of the token and removes it from storage.

**AI generation**
- Generates valid `PortfolioData` JSON conforming to schema on the first or retried attempt.
- Does not invent facts not present in the Unified Profile (verified via test fixtures with known-missing fields).
- Handles missing fields by omission, not placeholder fabrication.
- User can edit any generated content, and edits persist across regeneration of other sections.
- Invalid AI output is rejected and never saved to `portfolioDrafts`/`portfolios`.

**Portfolio**
- Uses the selected template consistently between preview and publish.
- Responsive across desktop/tablet/mobile for all 6 templates.
- Empty/absent sections never render broken layout or empty headings.
- Publish/unpublish/draft/delete states behave as specified in §19.
- Every published portfolio has a unique, valid `/p/[slug]` URL.

---

## 37. Edge Cases

Explicitly handled:

- Zero GitHub repositories → GitHub project section hidden, portfolio still generatable from other sections.
- 500+ repositories → capped fetch with "showing top N by relevance, sync flagged more exist," selection UI paginated.
- Exactly one repository → still runs through relevance scoring, is auto-suggested as featured.
- GitHub username changes → next sync detects and updates `sourceProfiles`/`unifiedProfiles`; historical `portfolios` snapshot is unaffected until republish.
- GitHub connection revoked externally → next API call fails auth, connection marked `needs_reauth`, user prompted, previously imported data retained.
- LinkedIn connection revoked externally → same pattern.
- LinkedIn provides limited data (no email scope) → portfolio generation proceeds without LinkedIn-sourced email; identity/photo still usable if granted.
- No experience/education/certifications at all → those sections omitted entirely from PortfolioData and hidden in every template, not shown as empty.
- AI returns invalid JSON → rejected by schema validator, one retry, then job fails with a specific, retryable error state (never partially saved).
- AI appears to invent information → caught by a post-generation fact-check pass comparing AI output entities (company names, technologies, dates) against the Unified Profile's known set; mismatches are stripped/flagged rather than saved silently.
- Duplicate projects (e.g., same repo appears twice due to fork+original) → dedup logic in normalization keyed on repo identity, with fork variants demoted by the relevance scorer.
- Very long project descriptions → AI generation is instructed with a length constraint; editor also enforces a max character count with a live counter.
- Non-English content → stored/rendered as-is (Unicode-safe throughout); V1 AI generation targets English output only, documented as a known limitation, not silently mistranslated.
- User deletes account → full cascade per §31, public slug 404s immediately.
- User changes template after publishing → draft change only; live page updates on next explicit publish action (or immediately, per a decision made in §19 implementation — documented behavior either way, but never silently mid-edit).
- User changes profile after publishing → same pattern: draft/published separation means the live page is stable until republish.
- Two users request the same slug → uniqueness enforced at the DB index; second requester is offered an auto-suggested alternative.

---

## 38. Technical Risks

1. **LinkedIn data availability is the single biggest product risk.** The consumer OIDC scope does not provide work history. If the manual-entry fallback creates too much friction, activation/completion rates could suffer. Mitigation: resume/PDF-upload convenience import (§10.6), and strong UX messaging that sets expectations before the user connects, not after a disappointing sync.
2. **GitHub rate limits at scale.** A classic OAuth App's per-user rate limit is workable for V1 but could become a bottleneck; migrating to a GitHub App (§9.1) mitigates this and should be planned, not assumed unnecessary.
3. **AI hallucination risk on a product where facts represent real professional claims** is higher-stakes than typical AI-content products (a fabricated job title is a real-world harm to the user, not just a bad UX). Mitigation: strict schema validation, source-grounded generation, and the post-generation fact-check pass (§37) — all defense-in-depth rather than trusting a single prompt.
4. **Template/data-contract coupling drift.** If any template quietly starts depending on a field shape not in the official `PortfolioData` schema, template portability breaks. Mitigation: shared `SectionGate`/typed props (§16.3) and contract tests that render all 6 templates against a canonical fixture set.
5. **OAuth token security.** Any lapse in encryption-at-rest or accidental logging of tokens is a severe incident given tokens grant access to real GitHub/LinkedIn accounts. Mitigation: encryption enforced at the schema/service layer (never optional), and log-scrubbing tested explicitly (§35 security tests).
6. **Slug/URL squatting or impersonation.** A public `/p/[slug]` system without domain-level identity verification could be used to impersonate. Mitigation: reserved-word blocklist, report/abuse flagging in the admin dashboard (§32), and terms-of-service enforcement.
7. **Third-party template/component licensing.** Using open-source design inspiration without license verification is a legal risk to a commercial SaaS (§39).

---

## 39. Licensing Considerations

Any open-source portfolio design or UI component considered as a technical starting point must be checked before use:

- Verify the actual license file in the source repository (not assumed from a README claim).
- "Free to download" or "free on a template marketplace" does **not** imply free commercial redistribution rights inside a paid SaaS product.
- Prefer **MIT** or **Apache-2.0** licensed components/design references, which permit commercial use, modification, and redistribution with attribution as required.
- Avoid **GPL/AGPL**-licensed frontend code being bundled into a proprietary product without legal review, since copyleft obligations can extend to the combined work depending on how it's integrated.
- Explicitly avoid any resource marked **non-commercial (NC)** or **personal-use-only** for anything shipped in the product, even as a visual reference implemented from scratch — if a design was used as direct inspiration for a distinctive, recognizable layout under an NC license, treat it as unsafe to ship without permission and rebuild the visual direction from first principles instead.
- Where a reference design is used only as inspiration for general layout concepts (a hero-then-grid pattern, for instance) rather than copied component code, treat the actual implementation as an original rewrite in this codebase's own component style/tokens (§16), not a derivative work — but document the reference source internally for traceability.
- Maintain a simple internal `THIRD_PARTY_NOTICES` record of any code/asset with license obligations of any kind (MIT/Apache included), since attribution requirements still apply even for permissive licenses.

---

## 40. Final Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js (TS, Tailwind) — marketing / auth / dashboard / editor  │
│  Public route: /p/[slug]  (SSR/ISR, template renderer)           │
└───────────────────────────────┬─────────────────────────────────┘
                                 │ REST API (session-authenticated)
┌───────────────────────────────▼─────────────────────────────────┐
│  Node.js + Express + TypeScript — modular monolith                │
│  authService · githubService · linkedinService · profileService   │
│  normalizationService · aiService · portfolioService              │
│  templateService · publishingService · sharingService             │
│  Job runner (DB-backed queue, upgrade path → Redis/BullMQ)        │
└───────┬───────────────┬───────────────┬───────────────┬─────────┘
        │               │               │                │
   GitHub API      LinkedIn OIDC     AI Provider       MongoDB
   (OAuth App/     (Sign In w/      (Claude, JSON-    (users, connections,
    GitHub App)     LinkedIn)        constrained)       sourceProfiles,
                                                          githubRepositories,
                                                          unifiedProfiles,
                                                          portfolioDrafts,
                                                          portfolios,
                                                          templates,
                                                          generationJobs,
                                                          sessions, auditLogs)
```

**Why this shape, briefly, for each major decision:**
- *Modular monolith over microservices:* lower operational overhead at V1 scale; service boundaries (§23) already make a future split mechanical rather than a rewrite.
- *Job-based generation over long synchronous requests:* GitHub sync + AI calls are inherently variable-latency and occasionally rate-limited; a synchronous request would time out or feel broken. A DB-backed queue is the simplest thing that works now, with a clear, non-rewrite path to Redis/BullMQ.
- *Strict layering (raw → normalized → AI → PortfolioData):* the only way to make "AI must never override verified facts" an enforceable engineering rule instead of a hopeful prompt instruction; also what makes provider-swapping and template-adding safe.
- *LinkedIn scoped to OIDC only, with manual-entry-first UX:* the alternative (assuming broader access, or scraping) is both against LinkedIn's terms and a direct violation of this project's explicit non-negotiable requirement never to invent or improperly obtain professional data.
- *One template renderer, six template packages, one shared contract:* the only design that lets templates 7+ be added later without touching data/AI/backend code at all.

---

## Addenda

### A. Final MVP Scope

Build first, nothing more:
- Email/password auth (register, login, verify email, forgot/reset password, logout).
- GitHub OAuth connect/disconnect + repo fetch/normalize + relevance scoring + user-selected featured repos.
- LinkedIn Sign-In (OIDC) connect/disconnect (identity/photo/email only) + manual-entry forms for experience/education/skills/certifications.
- Unified Profile with completeness scoring and missing-field detection.
- Job-based AI generation (DB-backed queue) producing schema-validated PortfolioData, with the factuality/precedence rules fully enforced.
- Editor: edit all fields, hide/reorder sections, feature/unfeature projects, section-level regenerate.
- 2–3 templates at launch (not all 6) sharing the full PortfolioData contract, to validate the renderer architecture before investing in the remaining templates.
- Preview (desktop/tablet/mobile) using the real render pipeline.
- Publish/unpublish with unique slugs, basic SEO metadata, sitemap/robots.
- Copy-link sharing.
- Basic settings: disconnect providers, delete imported data, delete account.
- Minimal observability (structured logs + error tracking) — enough to operate safely, not a full admin dashboard yet.

### B. V1.0 Scope (post-MVP)

- Remaining templates to reach the full set of 6.
- QR-code sharing and social share-link buttons.
- Resume/LinkedIn-PDF upload convenience-import (§10.6), pending legal review.
- Full admin dashboard (§32).
- Unlisted (link-only) visibility option.
- Expanded observability/monitoring dashboards for generation jobs and AI usage.
- Hardened rate limiting and abuse/report handling for public slugs.

### C. Future Roadmap (explicitly deferred)

Custom domains, visitor analytics, resume/cover-letter generation, job matching/AI career recommendations, portfolio scoring, scheduled auto-resync, version history, custom CSS/fonts, team accounts, recruiter mode, portfolio marketplace, LinkedIn Partner Program upgrade, billing/plans, queue infrastructure upgrade (Redis/BullMQ) — triggered by real load, not built preemptively.

### D. Critical Risks

1. LinkedIn data limitations may create more manual-entry friction than users tolerate — the single biggest product-market risk (§38.1).
2. AI hallucination on real professional facts is higher-stakes than typical AI content risk and requires defense-in-depth, not a single safeguard (§38.3).
3. GitHub rate limits/OAuth App constraints could bottleneck growth if not migrated to a GitHub App in time (§38.2).
4. OAuth token security is a severe-incident-class risk if encryption or logging discipline lapses (§38.5).
5. Third-party design/license exposure could create legal liability if not checked before any code/asset reuse (§38.7, §39).
6. Slug-based public URLs create impersonation/squatting surface that needs moderation tooling before real growth (§38.6).

### E. Recommended Implementation Order

1. Project setup (monorepo structure, TS config, lint/test scaffolding, env/secrets handling).
2. Authentication (register/login/verify/reset/sessions) + account deletion skeleton.
3. Database models for `users`, `connections`, `sourceProfiles`, `githubRepositories`, `unifiedProfiles` with indexes.
4. GitHub OAuth + fetch/normalize/relevance-score pipeline; Connections dashboard UI.
5. LinkedIn OIDC connect flow + manual-entry forms for experience/education/skills/certifications; profile completeness UI.
6. Unified Profile merge logic implementing precedence rules (§13), fully unit-tested.
7. AI service integration: schema definition, prompt/system-instruction design, JSON validation, retry logic, section-scoped calls.
8. Job runner (DB-backed queue) wiring `generate → sync → normalize → AI → validate → save`.
9. PortfolioData contract finalized; `portfolioDrafts`/`portfolios` collections and merge-with-precedence logic.
10. Template Renderer + shared template primitives (`SectionGate`, tokens) + Template 01 (Modern Developer) end-to-end, including public `/p/[slug]` route.
11. Editor UI (all field edits, reorder/hide, featured-project selection, regenerate-section) wired to Template 01 preview.
12. Publishing lifecycle (slug assignment/validation, publish/unpublish/draft/delete states, SEO metadata, sitemap/robots).
13. Templates 02–06 built against the now-proven contract and shared primitives.
14. Sharing (copy link, QR, social links).
15. Security hardening pass (encryption verification, rate limiting, CSRF/XSS review, ownership-check audit across every route).
16. Settings/privacy controls (disconnect, delete imported data, delete account cascade) fully tested.
17. Testing pass across §35 categories, focused especially on AI factuality tests and template-contract snapshot tests.
18. Observability wiring (structured logs, error tracking, job/AI monitoring).
19. Deployment (frontend + backend + MongoDB + job worker) to a production environment with secrets management.
20. Post-launch: admin dashboard, remaining V1.0 items from Addendum B.

---

*End of PRD. This document is intended to remain the single source of truth for scope and architecture through implementation; changes to data contracts (Unified Profile, PortfolioData) or the LinkedIn data-access assumptions in §10 should trigger a revision of this document before code changes, since most downstream sections depend on those two decisions holding.*
