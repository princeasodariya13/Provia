# 32 - Account Data Export / Portability Specification

## 1. Executive Summary
The Account Data Export system allows users to port their data (GDPR/CCPA compliance) by downloading a machine-readable JSON copy of their profile, portfolios, and history. It is implemented as a synchronous JSON API endpoint protected by strict rate limits.

## 2. Security & User Isolation
- **Identity Boundary:** Uses the existing `requireAuth()` server-side helper. 
- **Query Hardening:** Every database query explicitly enforces `where: { userId: user.id }` (or corresponding relation) via Prisma's `findUnique` on the authenticated user ID.
- **Secrets Redaction:** `passwordHash`, OAuth `accessToken`, OAuth `refreshToken`, and internal `requestId` parameters are completely omitted from the payload using explicit Prisma select field mapping and object serialization allowlisting.

## 3. Data Ownership Strategy
The following user-owned structures are bundled into a single JSON object:
- **User Metadata:** Safe identity attributes and timestamps.
- **Profile:** The `ProfessionalProfile` and all nested professional records (experiences, education, skills, projects, certifications, links).
- **Web Presence:** `PortfolioDocument` JSON content strings, template configurations, and `PortfolioPublication` records.
- **Integrations:** `Connection` metadata (no tokens) and raw imported `RawSourceSnapshot` JSON data.
- **AI Context:** `AIGeneration` outcomes, prompts, and statuses.
- **Audit Log:** The user's own `AnalyticsEvent` history.

## 4. Architecture Design
- **API Endpoint:** `GET /api/v1/account/export`
- **Format:** `application/json` returned dynamically by Next.js.
- **Delivery Mechanism:** Direct HTTP stream/response with `Content-Disposition: attachment` headers to trigger a browser download.
- **Asynchronous Processing:** Unnecessary. Data sizes (averaging under 5MB) allow Prisma to retrieve and serialize the data synchronously within standard serverless timeouts.

## 5. Rate Limiting Integration
To prevent database abuse, the endpoint uses `RateLimiterService` (Step 29):
- Implements strict Account limits.
- Validates against `AUTH_RATE_LIMIT_WINDOW_SECONDS` before allowing the serialization process to start. The limit is set to 3 requests per rate limit window.

## 6. Observability
New analytics events were recorded via `AnalyticsService`:
- `account.export_completed` (recorded immediately before returning the JSON payload)
- `account.export_rate_limited` (recorded when rate limit blocks export)

*No export contents, passwords, or tokens are logged.*

## 7. UI/UX
- Located in `app/(dashboard)/settings/page.tsx` just above Account Deletion.
- Allows users to seamlessly pull their data before permanently erasing their account.
- Triggered by a standard `window.location.href` redirect to leverage native browser file downloading without tearing down the React application state.
