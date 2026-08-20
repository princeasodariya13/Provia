# STEP-06-UI-UX-DESIGN-SYSTEM.md

**AI Portfolio Generator — UI/UX & Design System Specification**
Status: Draft for engineering & design handoff · Depends on: PROJECT-CONTEXT-STEP-06.md

---

## 1. Executive Summary

This document specifies the complete interface and design system for the platform: a service that connects a user's professional sources (GitHub, LinkedIn), lets them review and complete the resulting profile, uses AI to draft portfolio content, and lets them edit, template, preview, and publish a public portfolio.

The interface has to do two things that are in tension. It must feel like software a serious professional trusts with their career data — calm, precise, unshowy. And it must sell the *outcome* — a polished portfolio — which means the product's own visual craft is itself part of the pitch. The resolution is an **editorial-operations** direction: the platform chrome (dashboard, editor, admin) behaves like precise operations software, while moments that represent the user's professional identity (profile review, preview, public portfolio) borrow structure from print editorial design — because that is the same visual language good portfolios use.

This document does not specify the six public portfolio templates. It specifies everything the templates must plug into.

---

## 2. Design Philosophy

**Direction: "Dossier, not dashboard."**

The product's core metaphor is a *professional dossier being assembled* — source material comes in, gets reviewed, gets typeset, gets published. This is different from the default SaaS metaphor of "cards on a colorful dashboard," and it is different from the three AI-generated defaults to explicitly avoid: (1) cream background + high-contrast serif + terracotta accent, (2) near-black + single acid accent, (3) hairline broadsheet columns. This system borrows *structure* from editorial design (clear type hierarchy, deliberate rules/dividers, generous margins) without borrowing any of those three literal palettes.

**Token summary (defined fully in §8–9):**
- Palette: warm paper neutrals (`#F7F6F2` background family) + near-black ink (`#1B1A17`) + a muted brass/ochre accent (`#A5713F`) for primary actions + a deep ledger-blue (`#2C4A63`) for links/info + a muted forest-green (`#3F6D57`) for success/verified states. No terracotta, no acid-green, no purple/blue AI gradient.
- Type: a text serif (**Source Serif 4**) for display/editorial moments (portfolio review, preview, public portfolio, marketing headlines) + a grotesk sans (**Inter**) for all operational UI (dashboard, editor chrome, forms, admin) + a mono (**IBM Plex Mono**) for metadata, IDs, code, and log data.
- Layout: a 12-column grid with generous, non-uniform margins; rules and hairline dividers used only where they encode real structure (e.g., separating imported data from user-entered data), never as decoration.
- Motion: quiet, short (120–240ms), used to confirm state changes (saved, published, connected) — never used to entertain.

**Non-negotiable exclusions:** gradients as a primary surface treatment, glassmorphism/blur panels, glow/neon effects, decorative blobs or abstract shapes, animated background elements, more than one accent color competing for attention on a single screen, generic purple-to-blue brand gradients, cards used as the default container for everything (tables and lists are used where they are the correct structure).

**Signature element:** a single recurring visual device — the **provenance rail**, a thin left-edge marker on any field or block of data indicating its source (imported / user-entered / AI-generated / derived) using color + a one-word label, never color alone. This device appears in profile review, the editor, and portfolio preview, and is the one place the product "shows its work." It is specified fully in §19 and §37.

---

## 3. UX Principles

1. **Show provenance, always.** Any piece of professional data visible to the user states where it came from. This is the product's core trust mechanic (see §37).
2. **Never fabricate progress.** Loading and processing states reflect real backend states only (see §21).
3. **Editing is never destructive by accident.** Autosave, versioned regeneration, and confirmation on destructive actions protect the user's work (see §24).
4. **One accent, one action.** Each screen has exactly one primary action rendered in the accent color; everything else is secondary or tertiary.
5. **Density matches expertise.** Public-facing and onboarding surfaces are spacious and low-density; dashboard, editor, and admin surfaces are information-dense once the user is oriented.
6. **State is never silent.** Saving, syncing, generating, publishing — all have a visible, named state at all times.
7. **Accessible by default, not by retrofit.** Contrast, focus, and semantics are load-bearing requirements, not polish.

---

## 4. Information Architecture

Five distinct zones, each with its own navigation shell and permission boundary.

| Zone | Who | Purpose |
|---|---|---|
| **Public** | Anonymous visitors | Convert visitors into registered users; explain the product. |
| **Authenticated User** | Logged-in users | Manage sources, data, generation, portfolios, account. |
| **Editor** | Logged-in users, portfolio-scoped | Focused content-editing workspace; a sub-mode of Authenticated User, not a separate app. |
| **Admin** | Staff/operators | Operate the platform: users, jobs, integrations, logs, health. |
| **Public Portfolio** | Anonymous visitors | The published, shareable output — visually and technically independent of the platform shell. |

**Why separate:** Public and Public Portfolio share no chrome, because a portfolio must never look like it's "inside" a SaaS product — it must look like the user's own site. Editor is nested under Authenticated User (not a peer) because it is a task the user drops into and out of, not a destination. Admin is fully separate because its density, information priorities, and audience are unrelated to the end-user product.

**Navigation hierarchy:**
```
Public
 ├─ Landing
 ├─ Login / Register / Forgot / Reset / Verify email
 └─ (view of) Public Portfolio

Authenticated User            [Top nav: Dashboard · Portfolios · Connections · Account]
 ├─ Dashboard
 ├─ Connections (GitHub, LinkedIn)
 ├─ Data Review
 ├─ Portfolios (list)
 │   └─ Portfolio detail
 │       ├─ Editor
 │       │   ├─ Section editing
 │       │   ├─ Template selection
 │       │   └─ Preview
 │       └─ Publish
 └─ Account/Settings (profile, security, sessions, danger zone)

Admin                          [Top nav: Overview · Users · Portfolios · Jobs · Integrations · Logs]
 ├─ Overview
 ├─ Users
 ├─ Portfolios
 ├─ Generation Jobs (+ Failed)
 ├─ Integrations
 ├─ Logs
 ├─ Audit Log
 └─ System Health

Public Portfolio               [No platform chrome — template-owned]
 └─ {slug}
```

---

## 5. User Journey UX

Each journey is specified as Entry → Action → Feedback → Next state.

**1. New user.** Entry: landing page CTA. Action: registers (email or OAuth). Feedback: inline validation, then a one-line "verify your email" banner that doesn't block dashboard access. Next: empty-state dashboard, primary action "Connect GitHub."

**2. Returning user.** Entry: login. Feedback: brief skeleton dashboard while data loads, never a blank screen. Next: dashboard reflecting last-known state (never re-triggers sync automatically).

**3. Connect GitHub.** Entry: dashboard or Connections page. Action: OAuth consent, scopes shown before redirect. Feedback: status chip flips `NOT CONNECTED → CONNECTING` immediately, then `CONNECTED` on return. Next: prompts sync.

**4. Connect LinkedIn.** Same pattern as GitHub; permission copy is specific to LinkedIn's data (profile, positions, education — not messages/connections).

**5. Synchronize data.** Entry: "Sync now" or auto-triggered after first connect. Action: async job starts. Feedback: status chip `SYNCING`, progress line with real sub-status if backend provides one, otherwise a single indeterminate state (see §21 — no invented steps). Next: `SYNCED` with a summary ("Imported 14 repositories, 3 positions") or `FAILED` with retry.

**6. Review imported information.** Entry: post-sync CTA or Data Review nav item. Action: scroll/scan by section, each field showing a provenance rail. Feedback: none needed to view; edits show inline "unsaved" state. Next: proceeds to completeness view.

**7. Complete missing data.** Entry: completeness panel "X items missing." Action: fills targeted fields via a short form, not the full profile at once. Feedback: field turns from `missing` to `user-entered` provenance immediately. Next: returns to completeness view, updated percentage.

**8. Generate portfolio.** Entry: "Generate" CTA, enabled once minimum completeness is met. Action: confirms scope (which sections to generate). Feedback: processing state (§15/§21). Next: generated draft opens in Editor, or failure state (§9).

**9. Generation failure.** Entry: automatic, from #8. Feedback: plain-language failure banner, data preserved, retry button. Next: retry re-enters processing, or user edits source data first.

**10. Edit portfolio.** Entry: from Portfolios list or post-generation. Action: edits in the Editor (§23). Feedback: autosave indicator. Next: continues editing, previews, or publishes.

**11. Select template.** Entry: Editor → Template tab. Action: browses cards, opens preview, selects. Feedback: current template marked; confirmation only if switching would drop unsupported content (§25). Next: content re-flows into new template, editor returns.

**12. Preview.** Entry: Editor "Preview" or Portfolios list. Action: toggles device width. Feedback: instant re-render, no reload. Next: back to editor or straight to publish.

**13. Publish.** Entry: "Publish" CTA. Action: pre-publish checklist (§27) then confirms. Feedback: success state with public URL. Next: portfolio is live; user can share.

**14. Share.** Entry: post-publish success state or Portfolios list. Action: copy link / open / native share sheet on mobile. Feedback: "Copied" toast. Next: no state change to portfolio.

**15. Manage portfolio.** Entry: Portfolios list. Action: rename, duplicate, unpublish, delete. Feedback: destructive actions use the standard confirmation pattern (§32). Next: list updates.

**16. Account/session management.** Entry: Account/Settings. Action: change password, view active sessions, revoke a session, delete account. Feedback: revoking a session shows immediate removal from the list; deleting the account requires typed confirmation. Next: settings persist; session revocation may log the user out of that device only.

---

## 6. Page Inventory

Format per page: Purpose · Primary user · Main actions · Key info · Components · States (Loading/Empty/Error/Success) · Responsive · Accessibility.

### Public

**Landing**
- Purpose: explain the product, convert to signup. Primary user: anonymous visitor.
- Main actions: Sign up, Log in, scroll to sections (how it works, integrations, templates teaser, trust/security).
- Key info: value proposition, three-step process, example outcome.
- Components: nav, hero, step list, testimonial/proof block (if available), footer.
- Loading: static page, no async dependency. Empty: n/a. Error: n/a (static). Success: n/a.
- Responsive: hero copy and step list stack vertically under 768px; nav collapses to a menu button.
- Accessibility: skip-to-content link; all CTAs reachable by keyboard in visual order.

**Public Portfolio** — see §28 (template-independent rules only; templates out of scope).

**Login**
- Purpose: authenticate. Main actions: submit credentials, OAuth login, go to register/forgot password.
- Key info: none beyond form. Components: form, OAuth buttons, inline alert.
- Loading: button loading state on submit. Empty: n/a. Error: invalid credentials (generic message, §10), account locked, network failure. Success: redirect to dashboard.
- Responsive: single-column form at all widths, max-width 400px, centered.
- Accessibility: labeled inputs, error text linked via `aria-describedby`, no color-only error indication.

**Register**
- Purpose: create account. Main actions: submit form, OAuth signup.
- Key info: password requirements shown proactively, not only on error.
- Components: form, password-strength meter, OAuth buttons, terms checkbox.
- Loading/Empty/Error/Success: as Login, plus "email already registered" (does not leak whether via OAuth or password).
- Responsive/Accessibility: as Login.

### Authentication

**Forgot password** — form (email only) → success state is identical regardless of whether the email exists (prevents enumeration), stated plainly: "If an account exists for that email, we've sent a reset link."

**Reset password** — token from URL; invalid/expired token shows a clear message with a "request a new link" action, not a generic error.

**Email verification** — a status page reached via emailed link: verifying (spinner, brief) → verified (success, CTA to dashboard) → invalid/expired (resend action).

**OAuth connection states** — used both for auth (login via provider) and for source connections (§18); the auth variant redirects to dashboard on success, the connection variant returns to Connections page.

### User

**Dashboard**
- Purpose: orient the user, surface next best action. Main actions: connect source, resume sync review, generate, resume editing, publish.
- Key info: completeness, connection status, portfolio status, recent activity (see §17).
- Components: status summary row, activity list, quick-action buttons — not a generic KPI card grid.
- Loading: skeleton rows. Empty: first-run state, single CTA "Connect GitHub." Error: partial-load banner if one data source fails, rest of dashboard still renders. Success: populated view.
- Responsive: status row stacks to a vertical list under 768px.
- Accessibility: landmark regions (`nav`, `main`), heading hierarchy starts at H1 once per page.

**Connections**
- Purpose: manage GitHub/LinkedIn. Main actions: connect, sync, disconnect, reauthorize.
- Key info: connection state, last sync time, scopes granted. Components: connection card per source (not a generic card grid — two fixed, well-specified rows), state chip, sync log.
- States: see §18 state machine in full. Responsive: stacks single column always (only two items). Accessibility: state changes announced via `aria-live="polite"`.

**Sync** — typically a modal/panel over Connections or Dashboard, not a standalone route; see §12/§21.

**Profile / Data Review**
- Purpose: review and correct imported + entered data before generation. Main actions: edit field, mark section reviewed.
- Key info: provenance per field (§37), section-by-section layout (Personal, About, Skills, Experience, Education, Projects, Certifications, Achievements, Social).
- Components: section list nav, field rows with provenance rail, inline edit.
- Loading: skeleton per section. Empty: section-level empty state ("No education found — add manually"). Error: sync-failed banner per source, doesn't block editing other sections. Success: all required sections reviewed, "Generate" unlocked.
- Responsive: section nav becomes a top scrollable tab bar under 1024px.
- Accessibility: each field is a labeled form control, not read-only text with a pencil icon only — icon-only affordances always paired with a visible or `aria-label` text alternative.

**Profile completeness** — see §20; usually a panel within Dashboard and Data Review, not a separate route.

**Portfolio list**
- Purpose: manage all portfolios (multiple portfolios may exist per user). Main actions: create, open, duplicate, unpublish, delete.
- Key info: status (draft/published), last edited, template in use.
- Components: table on desktop, stacked list-cards on mobile (not a generic card grid — this is a real management table).
- Loading: skeleton rows. Empty: "Create your first portfolio." Error: load failure with retry. Success: populated table.
- Responsive: table collapses to key-value stacked rows under 768px. Accessibility: table has proper `<th>` scoping; row actions reachable via keyboard menu.

**Portfolio creation** — a short flow: name → source content set (which reviewed profile data to draw from, if multiple exist) → straight into generation or editor.

**Portfolio editor** — see §23 in full.

**Template selection** — see §25 in full.

**Preview** — see §26 in full.

**Publish** — see §27 in full.

**Settings** — grouped: Profile (name, avatar, contact), Notifications, Danger zone (delete account).

**Account/security** — email/password change, connected OAuth logins, active sessions with device/location/last-active and per-session revoke, 2FA if in scope.

### Admin

**Admin overview** — key operational counts (active users, portfolios published today, jobs in queue, jobs failed in last 24h, integration health) as a compact status row, plus a recent-events feed. Not a decorative KPI wall — every number links to its filtered detail view.

**Users** — searchable/filterable table: id, email, status, sign-up date, connected sources, portfolio count. Row action: view detail, suspend, impersonate-for-support (if in scope, heavily audited).

**Portfolios** — table: owner, status, template, published URL, last generated, flags. Filter by status/template.

**Generation jobs** — table: job id, user, status (queued/running/succeeded/failed/partial), duration, retry count. Failed jobs sub-view with error detail (redacted) and re-run action.

**Logs** — see §24.

**Audit logs** — append-only table of admin/security-relevant actions: actor, action, target, timestamp, IP (partially masked). No delete/edit UI — audit logs are immutable by design.

**Integrations** — GitHub/LinkedIn app-level health (not per-user): API rate-limit status, webhook status, last incident.

**System health** — service status per backend component, uptime, queue depth, error rate charts (real metrics only, no decorative sparklines without data).

### Additional pages required by the journey but not explicitly listed in the brief

**403 / Not Found (404)** — global, on-brand, with a way back (not a bare framework default page).
**Offline** — a persistent, dismissible banner (not a full-page takeover) shown app-wide when connectivity drops; queued actions where feasible (e.g., editor autosave queues locally, see §24).
**Session expired** — modal, not a silent redirect: explains what happened, offers re-login without losing the current page context where technically feasible.

---

## 7. Navigation Architecture

- **Public nav:** logo, Product/How it works (anchor links on landing), Log in, Sign up (primary button). Sticky, transparent-to-solid on scroll (a restrained, purposeful motion moment, not decorative).
- **Authenticated nav:** logo, Dashboard, Portfolios, Connections, avatar menu (Account, Admin link if privileged, Log out). Persistent left rail on desktop ≥1024px (icons + labels), becomes a bottom tab bar on mobile for the 4 primary destinations (Dashboard, Portfolios, Connections, Account).
- **Editor nav:** replaces the primary nav with a focused editor header (portfolio name, save status, Preview, Publish, Exit-to-Portfolios). The main app rail is intentionally hidden — editing is a distinct mode, and hiding global nav reduces accidental navigation-away data loss risk.
- **Admin nav:** separate top nav bar (not the left rail) with a visibly different color treatment (see §9) so staff always know they're in the operations surface, plus a one-click "View as user" is explicitly *not* provided unless a documented impersonation flow exists (§ Admin above).
- **Public Portfolio:** no platform navigation at all; only template-owned navigation (e.g., in-page section links), by design (§4).

Location is always legible via: nav item active-state, breadcrumb in Editor/Admin detail views, and document `<title>`.

---

## 8. Design Tokens

Tokens are the single source of truth; components consume tokens, never raw values.

```
tokens/
  color.tokens.json
  typography.tokens.json
  spacing.tokens.json
  radius.tokens.json
  shadow.tokens.json
  border.tokens.json
  breakpoint.tokens.json
  motion.tokens.json
```

Naming convention: `{category}.{role}.{variant?}.{state?}`, e.g. `color.surface.raised`, `color.text.muted`, `color.action.primary.hover`.

---

## 9. Color System

**Palette (base hues):**

| Token | Hex | Use |
|---|---|---|
| `color.ink.900` | `#1B1A17` | Primary text, high-emphasis icons |
| `color.ink.700` | `#4A473F` | Secondary text |
| `color.ink.500` | `#78746A` | Muted/tertiary text, placeholders |
| `color.paper.100` | `#FCFBF9` | App background |
| `color.paper.200` | `#F7F6F2` | Surface (cards, panels) |
| `color.paper.300` | `#EFEDE6` | Elevated surface / hover surface |
| `color.line.200` | `#E4E1D8` | Default border |
| `color.line.400` | `#C9C4B6` | Emphasized border / divider |
| `color.brass.600` | `#A5713F` | Primary action, focus accents |
| `color.brass.700` | `#8A5C31` | Primary action hover/pressed |
| `color.ledger.600` | `#2C4A63` | Links, informational accents |
| `color.ledger.700` | `#203849` | Link hover |
| `color.forest.600` | `#3F6D57` | Success, "verified"/connected states |
| `color.forest.100` | `#E7F0EA` | Success surface (banners, badges) |
| `color.amber.600` | `#B0791C` | Warning |
| `color.amber.100` | `#FBF0DA` | Warning surface |
| `color.rust.600` | `#B34433` | Error/destructive |
| `color.rust.100` | `#F8E7E3` | Error surface |

**Semantic tokens (map to base palette; components reference these, never base tokens directly):**

| Semantic token | Light value |
|---|---|
| `color.bg.app` | `paper.100` |
| `color.bg.surface` | `paper.200` |
| `color.bg.surface-elevated` | `#FFFFFF` (with `shadow.100`) |
| `color.text.primary` | `ink.900` |
| `color.text.secondary` | `ink.700` |
| `color.text.muted` | `ink.500` |
| `color.text.on-accent` | `#FFFFFF` |
| `color.border.default` | `line.200` |
| `color.border.strong` | `line.400` |
| `color.action.primary` | `brass.600` |
| `color.action.primary-hover` | `brass.700` |
| `color.action.secondary` | transparent, `border.strong` |
| `color.link` | `ledger.600` |
| `color.status.success` | `forest.600` |
| `color.status.warning` | `amber.600` |
| `color.status.error` | `rust.600` |
| `color.status.info` | `ledger.600` |

**Admin surface variant:** Admin reuses the same palette but shifts `color.bg.app` to a slightly cooler, darker neutral (`#F2F1ED` → header bar `#20242B` with `paper.100` text) so the operations surface is visually distinct at a glance without inventing a second brand.

**Dark mode:** not committed for v1. The product's trust proposition (professional, editorial, print-adjacent) is stronger in light mode, and portfolio content (photos, project screenshots) previews more accurately against a light canvas. Dark mode is deferred as a post-launch enhancement; tokens are structured (semantic layer above base palette) so a dark set can be added without component rewrites.

**Contrast requirement:** all text/background pairs meet WCAG 2.1 AA (4.5:1 body, 3:1 large text/UI components) verified against the semantic tokens above.

---

## 10. Typography System

- **Display/editorial face:** Source Serif 4 — used for the landing page hero, section headers in Data Review/Preview, and public portfolio defaults. Conveys "typeset," not "generated."
- **UI/body face:** Inter — used for all operational chrome: nav, buttons, forms, tables, dashboard, admin.
- **Mono face:** IBM Plex Mono — used for metadata: request IDs, job IDs, timestamps in logs, code snippets (GitHub project descriptions, technical skills lists where relevant).

| Token | Face | Size / Line-height | Weight | Use |
|---|---|---|---|---|
| `type.display` | Source Serif 4 | 48/56 (mobile 32/40) | 600 | Landing hero, publish success headline |
| `type.h1` | Source Serif 4 | 32/40 (mobile 26/34) | 600 | Page titles |
| `type.h2` | Inter | 24/32 | 600 | Section headers |
| `type.h3` | Inter | 19/28 | 600 | Subsection headers, card titles |
| `type.h4` | Inter | 16/24 | 600 | Component-level headers |
| `type.body` | Inter | 16/24 | 400 | Default body/UI text |
| `type.body-sm` | Inter | 14/20 | 400 | Secondary UI text, table cells |
| `type.caption` | Inter | 13/18 | 400 | Helper text, timestamps |
| `type.label` | Inter | 13/16 | 600, uppercase, 0.02em tracking | Form labels, status chips |
| `type.metadata` | IBM Plex Mono | 13/18 | 400 | IDs, log data, code |

Type scale ratio ≈ 1.25 (major third), anchored at 16px body. Line lengths capped at ~72ch for long-form editorial text (About sections, landing copy); UI text is unconstrained within its container.

---

## 11. Spacing / Grid System

**Spacing scale (4px base unit):** `space.0` 0 · `space.1` 4 · `space.2` 8 · `space.3` 12 · `space.4` 16 · `space.5` 20 · `space.6` 24 · `space.8` 32 · `space.10` 40 · `space.12` 48 · `space.16` 64 · `space.20` 80 · `space.24` 96.

**Radius:** `radius.none` 0 (tables, admin surfaces) · `radius.sm` 4px (inputs, buttons, badges) · `radius.md` 8px (cards, modals) · `radius.lg` 12px (large panels, template preview frames) · `radius.full` (avatars, status dots). Radius is used sparingly and consistently — never a stylistic default applied to everything to look "friendly."

**Shadow (elevation):** `shadow.0` none (flat surfaces) · `shadow.100` subtle (1px hairline + 2px 0px 4px rgba(27,26,23,.06)) for elevated surfaces/cards · `shadow.200` (0px 4px 12px rgba(27,26,23,.10)) for dropdowns/popovers · `shadow.300` (0px 12px 32px rgba(27,26,23,.16)) for modals. No colored/glow shadows.

**Border:** `border.hairline` 1px `color.border.default`; `border.emphasis` 1px `color.border.strong`; used to separate, never to decorate (e.g. tables, provenance rail, section dividers).

**Grid:** 12-column, 24px gutter, max content width 1200px for platform UI, 1440px for landing. Margins: 24px mobile, 40px tablet, 64px+ desktop (non-uniform, generous — not edge-to-edge cards).

---

## 12. Responsive System

**Breakpoints:** `xs` <480 · `sm` 480–767 · `md` 768–1023 · `lg` 1024–1439 · `xl` ≥1440.

General rule: layouts are re-composed at each breakpoint (columns become tabs, tables become stacked rows, side panels become sheets) rather than uniformly scaled. Full behavior matrix in §38.

---

## 13. Component Library

Each component ships with: purpose, variants, sizes, states, behavior, accessibility notes, responsive behavior. Full matrix in §39; representative specs below for the components with non-obvious behavior.

**Button**
- Variants: primary (`color.action.primary` fill), secondary (outline), tertiary (text-only), destructive (`color.status.error` fill).
- Sizes: sm (32px), md (40px, default), lg (48px, used only for single primary CTAs like Publish/Generate).
- States: default, hover, focus (visible 2px ring, `color.action.primary` at 40% opacity, offset 2px), active/pressed (slight scale/darken, no bounce), disabled (50% opacity, no pointer events, tooltip explains why if non-obvious), loading (spinner replaces label, width preserved to prevent layout shift).
- Behavior: only one primary button per view/section. Loading buttons are disabled to prevent double-submit.

**Input / Textarea**
- Variants: text, email, password (with show/hide toggle), search, number.
- States: default, focus (2px accent ring), filled, invalid (red border + icon + message), disabled, read-only (used for imported data pending edit — visually distinct from disabled: read-only looks like text, disabled looks greyed).
- Behavior: labels always visible (never placeholder-as-label); help text below input; character count for length-capped fields appears only near the limit (last 20%) to reduce noise.

**Select / Dropdown / Combobox** — native `<select>` on mobile for OS-native picker benefits; custom listbox on desktop with full keyboard support (arrow navigation, type-ahead, Esc to close).

**Checkbox / Radio / Switch** — Switch used only for immediate-effect binary settings (e.g., "Portfolio visible to search engines"); Checkbox for form selections requiring explicit Save; never used interchangeably for the same semantic action.

**Avatar** — sizes xs(24)/sm(32)/md(40)/lg(64)/xl(96); fallback to initials on `color.ledger.600` background when no image.

**Badge** — status vocabulary only (Draft, Published, Connected, Syncing, Failed, etc.), never decorative; color maps 1:1 to the semantic status tokens (§9) with a text label always present, never color-only.

**Card** — used only for genuinely discrete, browsable items (template cards, portfolio list on mobile). Not used as a default wrapper for every content block — sections in Data Review, for instance, use hairline-divided rows, not nested cards, to avoid the "repetitive card grid" default.

**Modal** — reserved for focused decisions requiring the user's full attention (confirmations, publish checklist). Max width 560px for confirmations, 720px for content modals. Focus trapped; `Esc` closes unless the action is destructive-in-progress.

**Drawer** — used for supplementary detail that benefits from page context remaining visible (e.g., log entry detail in Admin, section settings in Editor). Slides from the right, 400–480px wide on desktop, full-screen sheet on mobile.

**Dropdown menu** — row actions (table rows, list items); closes on selection, outside click, or `Esc`.

**Tooltip** — supplementary only, never required to understand a control (nothing is tooltip-only); 300ms show delay, no delay on hide.

**Tabs** — used for peer views of the same object (Section nav in Data Review; Template categories). Underline-style, not pill/rounded-button style, to match the editorial restraint direction.

**Accordion** — used sparingly, only for genuinely optional/advanced detail (e.g., "Advanced SEO settings" in Publish).

**Table** — the default for admin and portfolio-list data. Sticky header on scroll, sortable columns where meaningful, row hover state, zebra-striping avoided (relies on hairline row dividers instead, consistent with the editorial-ledger direction).

**Pagination** — numbered + prev/next for admin tables (predictable page count); "Load more" for activity feeds.

**Toast** — see §29.

**Alert (inline banner)** — page or section-scoped persistent messages (e.g., "Email not verified," "3 fields missing"). Dismissible only if not blocking.

**Progress** — determinate bar when backend reports percentage; indeterminate bar/pulse when it does not (see §21 — never fake determinate progress).

**Skeleton** — mirrors the real content's layout (line lengths, block shapes) rather than generic shimmering boxes, to reduce perceived layout shift.

**Empty state** — icon/illustration (simple, single-color line style — not decorative gradients), one-sentence explanation, one primary action. Copy pattern defined in §29/§27 of the context doc equivalent — see §31 below.

**Confirmation dialog** — see §32 (destructive action pattern).

---

## 14. Component States

Every interactive component defines, at minimum: **Default, Hover, Focus, Active/Pressed, Disabled, Loading, Error, Success.**

Communication rules (never color alone):
- **Hover:** background/border shift only, no layout shift.
- **Focus:** always a visible ring (2px, accent color, 2px offset); never suppressed, including for mouse users — focus rings are removed only when a component implements a documented alternative focus indicator.
- **Active/Pressed:** slight darken/scale (button: 98% scale, 80ms).
- **Disabled:** 50% opacity + `cursor: not-allowed`; disabled controls that block progress must be accompanied by visible text explaining the blocker (never a mystery-disabled button).
- **Loading:** spinner or skeleton, label text preserved via `aria-live` region for screen readers, layout dimensions preserved.
- **Error:** border color + icon + adjacent text message; the message is specific ("GitHub username not found" not "Error").
- **Success:** icon + optionally a brief (≤1.5s) color pulse on the affected element, then returns to default — success is confirmed, not celebrated with heavy animation.

---

## 15. Form System

- **Labels:** always visible, above the field, `type.label` style.
- **Help text:** below the field, `type.caption`, muted color; explains format or consequence, not restates the label.
- **Required/Optional:** mark the minority. If most fields are required, mark "(optional)" on the few that aren't, and vice versa — reduces visual noise.
- **Validation:** inline, on blur for format errors, on submit for cross-field/server errors; never only on submit for simple format issues (wastes the user's time).
- **Error messages:** specific, actionable, non-technical ("Enter a valid URL, e.g. https://example.com" not "Invalid input: regex mismatch").
- **Success messages:** field-level check icon on valid blur for fields with non-obvious validity (e.g., slug availability); form-level toast on submit.
- **Character count:** shown once within 20% of the limit; over-limit shows count in error color and disables submit (not truncates silently).
- **Loading:** submit button loading state; form fields disabled during submit to prevent conflicting edits.
- **Disabled:** fields disabled with a stated reason (e.g., "Email can't be changed while verification is pending").
- **Unsaved changes:** a persistent, non-blocking indicator (see §24); navigating away with unsaved changes in a non-autosaved form prompts confirmation.

Progressive disclosure: long forms (e.g., manual profile entry) are broken into sections with clear headers rather than one long scroll, and support save-per-section so partial completion is never lost.

---

## 16. Authentication UX

- **Login/Register:** see §6 page specs. Errors never distinguish "wrong password" from "no such account" (generic: "That email or password isn't right").
- **Forgot/Reset:** enumeration-safe messaging (§6); reset links expire (stated on the reset page, with a resend action if expired).
- **Email verification:** non-blocking — unverified users can use the dashboard with a persistent, dismissible-per-session reminder banner; publishing a portfolio requires verification (stated clearly at the point of blocking, in Publish's pre-flight checklist, §27).
- **Session expiration:** modal (§6 "Additional pages"), not a silent redirect; preserves the current route to return to post-login where the action was non-destructive.
- **Logout:** immediate, with a confirmation only if there are unsaved editor changes (routed through the same unsaved-changes guard as navigation).
- **OAuth connection:** distinct copy from auth OAuth — always explains what data will be read, never reuses login-OAuth copy verbatim (§18).
- **Never expose technical errors:** raw error codes/stack traces are never shown to end users; every error surface maps to a plain-language message with an internal reference ID users can quote to support if needed.

---

## 17. Dashboard UX

Information hierarchy, top to bottom:

1. **Next best action** — a single, prominent module reflecting the user's actual furthest incomplete step (Connect a source → Review data → Complete profile → Generate → Publish). Only one is shown at a time; this replaces a generic "quick actions" grid with a directed one.
2. **Status summary row** — three or four compact stats: connections (n/2 connected), completeness (%), portfolio status (Draft/Published), last activity time. Each stat links to its detail page.
3. **Recent activity** — a short reverse-chronological list of real events (synced, generated, edited, published) — not a decorative log.
4. **Portfolios** — up to 3 most recently touched, with a link to the full list.

Rationale: a meaningless card grid presents five equally-weighted, mostly-empty widgets on day one. This hierarchy instead always answers "what should I do right now," which matters most for a multi-step onboarding-heavy product.

---

## 18. Source Connection UX

**State machine (GitHub and LinkedIn share this model):**

`NOT_CONNECTED → CONNECTING → CONNECTED → SYNCING → SYNCED`
side states: `FAILED` (from CONNECTING or SYNCING), `REAUTH_REQUIRED` (from CONNECTED/SYNCED, e.g. token expired), `DISCONNECTED` (user-initiated, from any connected state).

| State | Visual | Copy pattern |
|---|---|---|
| NOT_CONNECTED | neutral chip, outline "Connect" button | "Connect your GitHub to import repositories and contributions." |
| CONNECTING | chip pulses, button shows spinner | "Connecting…" |
| CONNECTED | success chip (`forest`) | "Connected as {username}" |
| SYNCING | info chip with progress | "Syncing… {n} items found so far" if backend streams counts, else "Syncing…" |
| SYNCED | success chip + timestamp | "Synced 2 hours ago · 14 repositories" |
| FAILED | error chip | "Couldn't connect. {reason if safe to show}. Try again." |
| REAUTH_REQUIRED | warning chip, "Reconnect" button | "GitHub access expired. Reconnect to keep syncing." |
| DISCONNECTED | neutral chip, same as NOT_CONNECTED visually, but retains historical sync data in a collapsed note | "Disconnected. Previously imported data is kept until you delete it." |

**Permission explanation** is shown *before* the OAuth redirect, not after: a short modal/panel listing exactly what will be read (e.g., "Public repositories, profile info, contribution activity — we never access private repos or write to your account").

**Disconnect** requires confirmation (§32) and states plainly what happens to already-imported data (kept, not silently deleted, unless the user separately chooses to delete it).

---

## 19. Data Review UX

Data Review is organized by profile section (Personal, About, Skills, Experience, Education, Projects, Certifications, Achievements, Social). Each field renders with a **provenance rail** — a 3px left border + small label:

| Provenance | Rail color | Label |
|---|---|---|
| Imported | `color.ledger.600` | "From GitHub" / "From LinkedIn" |
| User-entered | `color.ink.700` (neutral) | "You entered this" |
| Missing | `color.rust.600`, dashed | "Missing" |
| AI-generated/derived | `color.brass.600` | "AI-generated" |

All fields are directly editable in place (click/tap to edit, not a separate "edit mode" toggle for the whole page) — editing an imported field converts its provenance to "user-entered" and the rail updates immediately, so the user always knows what they've overridden.

Sections with missing required data show a badge count in the section nav so users can jump directly to gaps.

---

## 20. Profile Completeness UX

Completeness is shown as a percentage **plus** a concrete, prioritized checklist — never a bare number.

```
Profile completeness: 78%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Still missing (portfolio generation works better with these):
  • Education history — helps establish credibility        [Add]
  • 2 project descriptions — used to write case studies     [Review]
  • Certifications — optional, adds authority if relevant   [Add]
```

Each missing item states **why it matters** (not just that it's missing) and whether it's required to proceed or simply improves output quality — items that block Generate are visually distinguished (rust-colored) from items that are merely recommended (amber-colored, with an explicit "optional" label). This prevents completeness from reading as an arbitrary gamified number.

---

## 21. AI Generation UX

Flow: `Ready → Generate (confirm scope) → Processing → Review/Generated` (or `Failed`).

**Processing state — real-states-only rule:** the UI queries the backend's actual job status. If the backend exposes discrete phases (e.g., `preparing`, `structuring`, `writing`, `finalizing`), the UI displays them as a determinate step list. **If the backend only exposes a single generic "processing" state, the UI shows one honest indeterminate state** ("Generating your portfolio… this usually takes under a minute") — it does not invent a fake multi-step sequence for theatrical effect. This is a hard product rule, not a style preference.

- **Loading:** indeterminate or determinate progress per above; cancel is not offered mid-generation unless the backend supports safe cancellation.
- **Success:** transitions directly into the Editor with generated content, plus a one-time dismissible callout: "We drafted this from your profile — review and edit anything before publishing."
- **Failure:** plain-language banner, all source data untouched, single "Try again" action; if the failure is attributable to a specific data problem (e.g., a field too short to generate from), the message names it and links to the field.
- **Retry:** re-uses the same scope confirmation, pre-filled with the prior selection.
- **Partial success:** if some sections generate and others fail, the editor opens with generated sections populated and failed sections marked with an inline "Regenerate this section" affordance rather than blocking the whole draft.

---

## 22. AI Trust UX

Persistent, low-noise signals (not a one-time disclaimer modal that gets dismissed and forgotten):
- Every AI-generated block carries the brass provenance rail and an "AI-generated" label (§19), visible in both Editor and Data Review.
- The first time a user views AI-generated content, a dismissible inline note states plainly: content is a draft based on the user's own data, may contain mistakes, and the user has final control.
- Every AI-generated section has an explicit **"Regenerate this section"** action, scoped narrowly (not just a whole-portfolio regenerate) so fixing one paragraph doesn't require discarding the rest.
- Nothing generated is described with certainty language ("Facts extracted" etc.) in the UI — copy consistently uses "drafted," "suggested," "generated," never "verified" or "confirmed" for AI output.

---

## 23. Portfolio Editor

**Layout decision.** The brief suggests left-nav / center-edit / right-preview as a default. Alternatives considered:

- *A — Left/Center/Right (three-pane):* section nav, edit form, live preview simultaneously visible. Strongest for desktop power users; weak below 1280px (panels get cramped) and fails entirely on mobile.
- *B — Center edit with preview-on-demand (two-pane + toggle):* section nav + edit form take the full working area; preview opens as a full-screen overlay/second tab rather than a permanent third column.
- *C — Single linear document editor* (like a word processor, sections scroll in one column, preview is a separate route entirely): simplest to build, but loses the "structured sections" mental model that matches how portfolios are actually organized (Experience, Projects, etc. are discrete, reorderable units, not free-flowing prose).

**Decision: B, with an optional persistent right preview pane on very large viewports (≥1440px) that degrades gracefully to on-demand preview below that.** Rationale: a always-on third column at typical laptop widths (1280–1440px) forces every element to be cramped simultaneously — the edit form, the nav, and the preview all suffer. Content quality (the actual writing/data) benefits more from the edit form having full room to breathe than from a live shrink-to-fit preview always being visible. Users who want simultaneous preview (large external monitors) get it; everyone else gets a focused editing surface with preview one click away, matching how most professional editing tools (not website builders specifically) are structured.

**Editor structure:**
- **Header:** portfolio name (editable inline), save status indicator (§24), Preview button, Publish button, Exit.
- **Left:** section navigation — fixed list (About, Experience, Projects, Skills, Education, Certifications, Achievements, Contact) with per-section status dots (complete / needs attention / hidden) and drag-handles for reordering; a section can be hidden (toggled off) without deleting its content.
- **Center:** the active section's edit form — field-level editing matching Data Review's provenance-rail pattern, plus AI regenerate affordance per generated block (§22).
- **Right (≥1440px only):** live scaled preview of the current template with the active section highlighted/scrolled-to; below 1440px, "Preview" opens this same view full-screen.

**Reordering:** drag handles in the left nav, with visible keyboard alternative (move up/down buttons, always present, not drag-only).

**Show/hide:** a switch per section in the nav; hidden sections are visually dimmed in the nav and excluded from preview/publish, but content is retained (not deleted) so re-enabling restores it exactly.

---

## 24. Autosave UX

States, shown as a small persistent indicator in the editor header:

`Saved` (default, checkmark, muted) → on edit → `Saving…` (spinner) → `Saved` (checkmark, brief highlight) | `Save failed` (error icon, "Retry" inline action, edits remain in the browser and are not lost) | `Offline` (edits queue locally, indicator states "Changes will save when you're back online," retries automatically on reconnect).

**Conflict** (e.g., same portfolio edited in two tabs/devices): detected on save; the UI does not silently overwrite — it surfaces a lightweight resolution prompt naming what changed and letting the user choose which version to keep, or merge manually for structured fields. Never a silent last-write-wins for user-authored content.

Debounce: saves trigger ~1.5s after the user stops typing, or immediately on blur/section-switch — balances save frequency against typing performance.

---

## 25. Template Selection

Out of scope: the actual template designs. In scope: the selection experience they must plug into.

- **Template cards** (grid, 2–3 per row desktop, 1 per row mobile): thumbnail preview image, name, one-line description, tags (e.g., "Minimal," "Visual-heavy," "Best for developers"), current-template badge if applicable.
- **Preview:** clicking a card opens a full preview (same component as §26) rendered with the *user's actual content*, not lorem ipsum — this is essential so the choice is informed.
- **Responsive preview:** within the template preview, the same desktop/tablet/mobile toggle as §26.
- **Template metadata:** sections supported/unsupported by this template are explicitly listed (e.g., "Does not include a Certifications section") so the user knows before switching.
- **Select/Apply:** immediate for a portfolio with no unsupported-content conflict. If switching would hide content the new template doesn't support, a confirmation dialog explains exactly what will be hidden (not deleted) and lets the user proceed or cancel.
- **Current template indicator:** persistent badge on the active card, plus surfaced in the Editor header.

---

## 26. Portfolio Preview

- **Device modes:** Desktop / Tablet / Mobile toggle (segmented control), each rendering at a real representative width (1280, 768, 390) inside a neutral device frame — no decorative browser-chrome skeuomorphism beyond a minimal frame.
- **Fidelity:** preview renders the *actual* template component tree used in production, not a simplified approximation — this is a technical requirement, not just a UX one, to guarantee "what you see is what gets published."
- **Fullscreen preview:** available as an escape from the editor chrome entirely, useful for final review before publishing; includes only a small floating "Back to editor" control.

---

## 27. Publishing UX

**Pre-publish checklist** (shown before the final confirm, as a modal or dedicated step):
- Required sections complete (link to fix if not).
- Email verified (link to verify if not, per §16).
- Slug chosen and available (real-time availability check as the user types, debounced).
- Visibility setting: Public / Unlisted (link works but not indexed) / Private draft.
- Basic SEO: title and description fields, pre-filled from profile data but editable, with a live character-count against typical search-result truncation.

**Publish confirmation:** a single explicit action; not silently triggered by any other action.

**Success state:** headline confirmation ("Your portfolio is live"), the public URL prominently displayed and copyable, "Open portfolio" and native share actions, and a subtle preview thumbnail.

**Re-publishing** (editing an already-published portfolio): changes are staged in the editor (draft) and require a separate "Publish update" action — edits never go live instantly without explicit confirmation, so a user never accidentally publishes a half-finished edit.

---

## 28. Public Portfolio UX

Principles the (future, out-of-scope) templates must satisfy:

- **Professional hierarchy:** name/role/summary read first, in under 3 seconds of scanning; template-level typography must establish this without relying on the platform's own type tokens (portfolios are visually independent, §44/§4).
- **Readability:** body text sized ≥16px equivalent, line length capped, sufficient contrast regardless of the template's own palette choices (a template-level accessibility floor is a hard requirement, not a nice-to-have, enforced at template-approval time even though template design itself is out of scope here).
- **Responsive:** every template must support the same three device modes previewed in the editor; mobile is not an afterthought given portfolios are frequently shared via mobile messaging.
- **Accessibility:** semantic HTML (headings in order, landmark regions, alt text sourced from user-provided project descriptions/media captions), keyboard-navigable if any interactive elements exist (project filters, lightboxes).
- **SEO:** server-rendered/crawlable content, meta title/description from Publish settings (§27), Open Graph image (auto-generated or user-chosen).
- **Social/contact info, projects, experience, skills:** presence and prominence are template-configurable, but every template must be able to render every profile section the platform supports (or explicitly state it doesn't, per §25's template metadata) — the platform's data model, not the template, is the source of truth.

---

## 29. Admin UX

Admin optimizes for operational clarity: density is high, motion is minimal-to-none, and every screen answers "what needs my attention" first.

- **Overview:** status row + recent-events feed, every number is a link to its filtered view (§6).
- **Users / Portfolios / Jobs / Integrations:** dense, sortable, filterable tables (§13 Table spec); row-level detail via Drawer (§13), not full page navigation, to keep list context.
- **Failed jobs:** a dedicated filtered view of Generation Jobs, surfaced prominently from Overview when count > 0.
- **Logs / Audit / System health:** see §30/§24 (context doc) below.

No decorative charts without underlying real data; no card-grid dashboard clichés — tables and lists are the primary admin idiom, consistent with the operations-tool framing (§9's Admin surface variant).

---

## 30. Logging UX

**Log table columns:** timestamp, severity, event, module, user/resource reference (linked), request ID (mono, copyable), job ID (linked to job detail if applicable), status.

**Filters:** search (free text over event/message), severity (multi-select), date range (presets: 1h/24h/7d/30d + custom), user, module, request ID, job ID — filters combine (AND), each shown as a removable chip above the table.

**Pagination:** cursor-based "Load more" for high-volume logs (offset pagination degrades at scale); page size selectable (25/50/100).

**Redaction:** any field flagged sensitive at the data layer (tokens, secrets, full email in some contexts, IP beyond first two octets where policy requires) renders as `••••••` in the table with a "Reveal" action gated by an additional permission check and itself logged to the audit trail — redaction is enforced in the UI as a second layer, not solely relied upon from the backend.

---

## 31. Error / Empty / Loading States

Standard system applied per page (see §6 for page-specific instances):

| State | Pattern |
|---|---|
| Loading | Skeleton matching real content shape; indeterminate progress only when duration is unknown and content shape can't be predicted. |
| Empty | Icon (simple line style) + one-sentence explanation + one primary action. Never blank. |
| Error | Plain-language message naming what happened + one recovery action (retry/contact support) + internal reference ID for support. |
| Success | Confirmation via icon/color/copy change, brief (≤1.5s) emphasis, then settles to default — no persistent celebratory UI. |
| Partial success | Explicitly labeled as partial ("3 of 4 sections generated"); succeeded parts are usable immediately, failed parts have a scoped retry. |
| Permission denied | States what's missing (role/plan/verification) and, where applicable, the path to obtain access — never a bare "403." |
| Not found | Distinguished from permission-denied in copy (doesn't leak existence of a resource the user can't access — for private resources, Not Found and Permission Denied render identically to avoid enumeration). |
| Offline | Persistent dismissible banner, queues safe actions locally where feasible (autosave, §24), never a full-page blocker for read-only views. |

---

## 32. Accessibility

- **Keyboard navigation:** full app operable without a mouse; logical tab order matching visual order; no keyboard traps (modals/drawers trap focus internally but Esc always exits).
- **Focus management:** focus moves to the opened modal/drawer's first focusable element; returns to the trigger element on close; route changes move focus to the new page's H1.
- **Semantic HTML:** landmarks (`header`, `nav`, `main`, `footer`), one H1 per page, heading levels never skipped, real `<button>`/`<a>` elements (not `div` with click handlers) for interactive controls.
- **Labels:** every form control has a programmatic label; icon-only buttons have `aria-label`.
- **Screen readers:** live regions (`aria-live="polite"`) for async state changes (save status, connection status, toast notifications); tables have proper header association.
- **Color contrast:** AA minimum across all semantic token pairs (§9); status is never color-only (badge/chip always paired with text/icon).
- **Reduced motion:** all non-essential motion respects `prefers-reduced-motion: reduce` — transitions collapse to instant or minimal-duration fades.
- **Accessible errors:** error text programmatically associated with its field (`aria-describedby`), announced via live region on submit.
- **Accessible dialogs:** `role="dialog"`, `aria-modal="true"`, labeled by their heading, focus-trapped.
- **Accessible forms:** grouped related fields with `fieldset`/`legend` where appropriate (e.g., date ranges), required state conveyed both visually and via `aria-required`.

---

## 33. Motion Design

Motion confirms state, never decorates.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion.instant` | 0–80ms | linear | Hover background shifts |
| `motion.fast` | 120ms | ease-out | Button press, toggle |
| `motion.base` | 200ms | ease-in-out | Modal/drawer enter, tab switch |
| `motion.slow` | 320ms | ease-in-out | Page-level transitions (rare) |

- **Hover/entry/exit:** background/opacity/transform only; no bounce, no overshoot.
- **Loading:** skeleton pulse (subtle opacity 0.6↔1, 1.2s loop) or spinner rotation — never a novelty loader.
- **Success:** one-shot color/icon transition, no repeat, no confetti-style effects (out of keeping with the trust-first tone).
- **Error:** a single restrained shake is avoided (can read as alarming/gimmicky); border/color change plus icon is sufficient.
- **Modal/drawer:** fade + slight translate (8–16px) on enter/exit, `motion.base`.
- **Reordering (drag):** dragged item lifts with `shadow.200`, other items reflow with `motion.fast`; drop settles with `motion.base`.
- **Reduced motion:** all of the above collapse to instant appearance/opacity-only transitions.

---

## 34. Notification System

| Channel | When to use |
|---|---|
| **Toast** | Confirmation of a just-completed user action with no further decision needed (Saved, Copied, Published). Auto-dismiss ~4s, one at a time (queued, not stacked), manually dismissible. |
| **Inline alert (banner)** | Page/section-scoped, persistent-until-resolved condition (email unverified, sync failed for one source, 3 fields missing). Placed directly above the relevant content. |
| **Modal** | Requires a decision before proceeding (destructive confirmation, publish pre-flight, session-expired). Never used for passive information. |
| **Drawer** | Detail attached to a specific record the user is already looking at (log entry, job detail) — not really a "notification" but shares the non-blocking-detail role. |

Anti-spam rules: no more than one toast visible at a time; system never issues a toast for background/automatic events the user didn't directly trigger (those go to the activity feed or an inline alert instead, quietly).

---

## 35. Frontend Design-System Architecture

Recommended conceptual organization for Next.js + TypeScript + Tailwind (structure only, no code):

```
app/                     — route segments per §4/§6 (public, (auth), (user), (admin), portfolio/[slug])
design-system/
  tokens/                — §8 token files, consumed by Tailwind theme config
  primitives/             — Button, Input, Badge, Avatar, etc. (§13/§39) — unopinionated about business logic
patterns/                — composed, product-aware patterns: ProvenanceField, StatusChip, ConfirmDialog,
                            AutosaveIndicator, ConnectionCard — built from primitives, reused across areas
layouts/                 — shell layouts: PublicShell, AppShell (left rail), EditorShell, AdminShell
forms/                   — form-level compositions and shared validation/error patterns (§15)
editor/                  — editor-specific composition: SectionNav, SectionForm, PreviewFrame (§23)
dashboard/                — dashboard-specific composition (§17)
admin/                   — admin-specific tables/drawers (§29/§30)
public/                  — landing + public portfolio *rendering shell* (not the templates themselves,
                            which are a separate, independently-versioned system per §44)
```

Principle: `primitives` know nothing about the product; `patterns` encode product concepts (provenance, save state) once so they're never reimplemented per-area; `layouts` own navigation/chrome per zone (§4/§7); area folders (`editor/`, `dashboard/`, `admin/`) compose patterns and primitives into the page inventory in §6. Public portfolio *templates* remain outside this tree entirely, per §44 non-negotiable separation.

---

## 36. UI Consistency Rules

1. **Same action → same visual treatment.** "Publish," "Save," "Generate," "Connect" always use the same button variant/position pattern across every screen they appear on.
2. **Same error → same pattern.** Field-level errors always render the same way (border + icon + message); no screen invents its own error style.
3. **Same save state → same indicator.** The autosave indicator (§24) is the only save-status UI in the product; no screen shows a bespoke "saving" spinner elsewhere.
4. **Same destructive action → same confirmation.** Delete/disconnect/unpublish all route through one Confirmation Dialog pattern (§13/§32) with consistent copy structure: "This will {consequence}. This can't be undone." + explicit action-verb confirm button (never a bare "OK").
5. **Same form validation → same pattern.** Inline-on-blur + submit-time summary, everywhere forms appear (§15).
6. **Same status vocabulary → same chip.** Connection states, job states, portfolio states all use the Badge component with the same color-to-meaning mapping (§9/§13) — "Failed" is always `rust`, "Connected/Synced/Published" always `forest`, regardless of which subsystem it describes.

---

## 37. User Trust & Privacy UX

The provenance rail (§2/§19) is the product's core trust mechanic, and it is applied consistently everywhere data appears: Data Review, Editor, and — at a summary level — Preview (a small "AI-assisted" indicator in preview/publish flows, without cluttering the actual public portfolio itself, which is the user's to present as their own).

Additional trust surfaces:
- **What's public vs. private:** every field in Data Review/Editor that will appear on the published portfolio carries a small "Public" indicator; fields never published (raw email unless explicitly added to a Contact section, internal notes) are marked "Private" — visibility is never ambiguous.
- **Active permissions:** Connections page (§18) always shows current scopes granted per source, with a link to review/revoke at the provider level.
- **Data deletion:** Account/Settings exposes a clear path to delete imported data per-source (independent of disconnecting) and to delete the account entirely, with typed confirmation and a plain statement of what is and isn't immediately removed.

---

## 38. Responsive Behavior Matrix

| Area | Desktop (≥1024) | Tablet (768–1023) | Mobile (<768) |
|---|---|---|---|
| Navigation | Left icon+label rail | Left icon-only rail, expandable | Bottom tab bar (4 items) |
| Dashboard | Status row (4 across) | Status row (2x2) | Stacked list |
| Forms | Single column, max 640px | Single column | Single column, full width |
| Editor | Nav + edit (+ preview ≥1440) | Nav + edit, preview on demand | Nav as top sheet, edit full-screen, preview full-screen on demand |
| Preview | Frame with device toggle | Frame with device toggle | Defaults to mobile frame, others via toggle |
| Tables | Full table | Full table, horizontal scroll if needed | Stacked key-value rows per record |
| Modals | Centered, fixed max-width | Centered, fixed max-width | Full-screen sheet |
| Drawers | Right-side panel, 400–480px | Right-side panel, 360px | Full-screen sheet |
| Public Portfolio | Template-defined | Template-defined | Template-defined (mandatory support, §28) |

---

## 39. Component Matrix

| Component | Variants | Key states beyond default | Notes |
|---|---|---|---|
| Button | primary/secondary/tertiary/destructive | loading, disabled-with-reason | One primary per view (§13) |
| Input/Textarea | text/email/password/search/number | invalid, read-only (imported) | Labels always visible |
| Select/Combobox | native (mobile), custom listbox (desktop) | invalid, disabled | Full keyboard support required |
| Checkbox/Radio | — | indeterminate (checkbox, for partial multi-select) | — |
| Switch | — | — | Immediate-effect settings only |
| Avatar | xs–xl, image/initials | — | Fallback uses `ledger.600` |
| Badge | status-mapped colors | — | Always paired with text |
| Card | template card, list-card (mobile) | selected/current | Not a default wrapper |
| Modal | confirmation, content | — | Focus-trapped |
| Drawer | detail, settings | — | Right-side, full-screen mobile |
| Dropdown menu | row actions | — | Closes on Esc/outside click |
| Tooltip | — | — | Never sole source of required info |
| Tabs | section nav, template categories | — | Underline style |
| Accordion | — | expanded/collapsed | Sparingly, advanced/optional content only |
| Table | admin, portfolio list | sortable, empty, loading | Sticky header |
| Pagination | numbered (admin), load-more (feeds) | — | — |
| Toast | success/info/warning/error | — | One at a time, queued |
| Alert (banner) | info/warning/error/success | dismissible/persistent | Section/page scoped |
| Progress | determinate/indeterminate | — | Determinate only if backend reports it |
| Skeleton | per-content-shape | — | Never generic shimmer blocks |
| Empty state | per-page | — | Icon + sentence + one action |
| Confirmation dialog | destructive | — | Standard copy structure (§36) |

---

## 40. Page-State Matrix

| Page | Loading | Empty | Error | Success | Notes |
|---|---|---|---|---|---|
| Dashboard | Skeleton rows | First-run single CTA | Partial-load banner (per source) | Populated | §17 |
| Connections | Chip pulse | n/a (fixed 2 rows) | FAILED / REAUTH chip | CONNECTED/SYNCED | §18 |
| Data Review | Skeleton per section | Per-section empty ("Add manually") | Sync-failed banner (non-blocking) | All sections reviewed | §19 |
| Portfolio list | Skeleton rows | "Create your first portfolio" | Load failure + retry | Populated table | §6 |
| Editor | Skeleton form | n/a (always has scaffold) | Save-failed indicator (§24) | Saved indicator | §23 |
| Template selection | Skeleton cards | n/a (fixed catalog) | Load failure + retry | Selected/applied | §25 |
| Preview | Skeleton frame | n/a | Render failure fallback | Rendered | §26 |
| Publish | Checklist loading | n/a | Validation errors inline | Success + URL | §27 |
| Admin tables | Skeleton rows | "No results for these filters" | Load failure + retry | Populated, filtered | §29 |

---

## 41. Open Design Questions

These require product/business decisions beyond this document's scope and should be resolved before high-fidelity visual design begins:

1. Does the platform support multiple portfolios per user in v1, or exactly one? (This spec assumes multiple; simplifies to one list-item if not.)
2. Is impersonation-for-support in scope for Admin, and if so, what audit/consent requirements apply?
3. Is 2FA in scope for v1 Account/security, or a fast-follow?
4. What is the actual set of discrete backend job phases (if any) for generation — determines whether §21's determinate step list or indeterminate state applies?
5. Is dark mode a committed roadmap item, and on what timeline (affects whether to invest in the dark token set now vs. later, §9)?
6. What is the real character/length limit for AI-generated section copy, needed to finalize character-count UI in the editor (§15)?
7. Are portfolio analytics (views, visitor sources) in scope for the user-facing product? Not currently represented in the page inventory.

---

## 42. Final Design-System Summary

The system is built around one governing idea — **provenance and trust made visible** — expressed through a single recurring device (the provenance rail) rather than scattered disclaimers. Visually, it commits to an editorial-operations direction (warm paper neutrals, brass/ledger/forest accent trio, serif-for-editorial + grotesk-for-operational type pairing) specifically chosen to avoid the three clustered AI-generated defaults, and grounded in the product's actual subject matter: assembling a professional dossier from real source data. Every component, state, and page in this document maps back to real backend states (§21), a real information hierarchy (§17), and a real permission/zone model (§4) — nothing here invents functionality unsupported by the Step 1–5 documentation. No portfolio templates were designed; this document defines only the system they must plug into (§25, §28, §44 non-goal preserved throughout).
