# Step 38 — Custom Domain Mapping System Specification

## 1. Problem & Goals
**Problem**: The platform previously only supported subpath-based public portfolios (`/p/[slug]`). For a professional SaaS, users need to present their portfolio under their own personal custom domain (e.g., `portfolio.example.com` or `johndoe.com`).
**Goals**: Build a production-grade Custom Domain Mapping system supporting DNS verification, activation, secure routing, Vercel dynamic provisioning, and multi-tenant isolation.
**Non-goals**: DNS hosting, email hosting, and SSL purchasing.

## 2. Architecture
The architecture comprises:
- **Database**: A `CustomDomain` model mapped to `PortfolioPublication`.
- **Domain Normalization**: Sanitizes input (removing protocols, ports, IP addresses).
- **DNS Verification**: Verifies ownership via a cryptographically secure, randomized TXT record.
- **Vercel Provisioning**: A degraded-graceful integration with the Vercel API for domain mapping.
- **Middleware Routing**: A Next.js `middleware.ts` that intercepts requests to unknown hostnames and rewrites them to a dynamically handled `app/custom-domain/[domain]/page.tsx` route.

## 3. Database Model
Added `CustomDomain` model to `prisma/schema.prisma` with:
- `id`, `userId`, `publicationId`, `domain`, `normalizedDomain` (unique)
- `status` (`DomainStatus` enum)
- `verificationToken`, `verificationMethod`
- `verifiedAt`, `lastCheckedAt`, `lastError`

## 4. Domain State Machine
Transitions explicitly managed in `DomainService`:
1. `PENDING`: Initial state upon creation.
2. `VERIFYING`: Transitioned when DNS verification is triggered.
3. `VERIFIED` / `FAILED`: Outcome of DNS TXT check.
4. `ACTIVE`: User activated the verified domain.
5. `DISCONNECTED`: Domain mapping deleted by the user.

## 5. Verification Flow & DNS Strategy
- Uses Node.js `dns/promises` to look up TXT records on `_provia-verification.[domain]`.
- Checks for matching value: `provia-domain-verification=[token]`.
- Differentiates `ENOTFOUND` (propagation delay), `ETIMEOUT`, and general resolver errors.

## 6. Vercel Integration
`VercelDomainService` wraps the Vercel Domains API.
- Only executes if `VERCEL_PROJECT_ID` and `VERCEL_API_TOKEN` are in `.env`.
- If missing, it gracefully logs and allows manual operator addition, avoiding hard application crashes.

## 7. APIs
Protected by `requireAuth()`, returning clean `NextResponse` JSON.
- `POST /api/v1/domains`: Add domain.
- `GET /api/v1/domains`: List domains.
- `GET /api/v1/domains/[id]`: Retrieve single domain.
- `POST /api/v1/domains/[id]/verify`: Trigger DNS verification.
- `POST /api/v1/domains/[id]/activate`: Activate routing.
- `DELETE /api/v1/domains/[id]`: Remove domain.

## 8. Security & Tenant Isolation
- **SSRF Prevention**: Strict domain normalization explicitly rejects IPs, localhost, and invalid formats.
- **Tenant Isolation**: Every API endpoint queries `prisma.customDomain` with `{ id, userId }`. A user can never read/mutate another user's domain.
- **Host Routing**: `middleware.ts` rewrites to `/custom-domain/[domain]`. The page renderer explicitly queries the database for `normalizedDomain` AND `status: "ACTIVE"`. Unknown/unauthorized hosts result in `404 Not Found`.

## 9. SEO & Analytics
- **Canonical URLs**: Automatically added in metadata as `https://[custom-domain]`. OpenGraph tags inherit this URL.
- **Analytics**: Extended `AnalyticsEventName` with `domain.created`, `domain.verification_started`, `domain.verified`, `domain.verification_failed`, `domain.activated`, `domain.disconnected`.

## 10. Dashboard UI
- Integrated under `app/(dashboard)/settings/domains`.
- Matches the Provia aesthetic (Cards, Badges, Tabler Icons).
- Dynamic DNS instructions based on the current domain state.

## 11. Testing & Validation
- Verified with `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
- Local verification covers normalization, database structure, and middleware routing strategy. True DNS TXT validation must be QA'd on a live publicly resolvable domain.
