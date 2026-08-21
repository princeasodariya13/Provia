# 33 - Production OAuth Callback Cutover Specification

## 1. Purpose
The purpose of this specification is to finalize the OAuth callback architecture for production readiness, ensuring that Google, GitHub, and LinkedIn OAuth flows securely and consistently use the deployed production application URL instead of hardcoded `localhost` URIs. This eliminates SSRF vulnerabilities associated with client-controlled redirect URIs and ensures OAuth `redirect_uri` consistency.

## 2. Production Canonical URL
The application defines its canonical production domain via the `NEXT_PUBLIC_APP_URL` environment variable, which gracefully defaults to `http://localhost:3000` during local development. All callback URIs are now derived centrally from this canonical URL in `lib/env.ts` unless explicitly overridden.

## 3. Google Callback URL
- **Role:** Authentication
- **Canonical Callback:** Derived as `${NEXT_PUBLIC_APP_URL}/api/v1/auth/google/callback` via `env.GOOGLE_CALLBACK_URL`.
- **Behavior:** The `auth/google` and `auth/google/callback` server-side endpoints inherently use the exact same variable, guaranteeing perfect redirect URI consistency.

## 4. GitHub Callback URL
- **Role:** Data-import Integration
- **Canonical Callback:** Derived as `${NEXT_PUBLIC_APP_URL}/integrations/callback?provider=github` via `env.GITHUB_CALLBACK_URL`.
- **Behavior:** The GitHub integration acts solely as a data source for the `ProfessionalProfile`. It does not perform authentication or issue sessions.

## 5. LinkedIn Callback URL
- **Role:** Data-import Integration
- **Canonical Callback:** Derived as `${NEXT_PUBLIC_APP_URL}/integrations/callback?provider=linkedin` via `env.LINKEDIN_CALLBACK_URL`.
- **Behavior:** Similar to GitHub, LinkedIn serves strictly as a data-import integration.

## 6. Environment Variables
Centralized and hardened in `lib/env.ts`:
- `NEXT_PUBLIC_APP_URL`: The canonical deployment URL.
- `GOOGLE_CALLBACK_URL`: Required, defaults safely to canonical URI.
- `GITHUB_CALLBACK_URL`: Required, defaults safely to canonical URI.
- `LINKEDIN_CALLBACK_URL`: Required, defaults safely to canonical URI.

## 7. Development vs Production Behavior
The implementation supports both seamlessly without code changes:
- In production, `NEXT_PUBLIC_APP_URL` (e.g., `https://provia.app`) dictates HTTPS-based production URIs.
- In local development, the fallback `http://localhost:3000` kicks in, ensuring seamless local testing flows.

## 8. OAuth Redirect URI Consistency
By removing the `redirectUri` parameter from the client payload (in `app/(dashboard)/integrations/page.tsx` and `app/(dashboard)/integrations/callback/page.tsx`), the server forces the same derived `env.*_CALLBACK_URL` in both the initial authorization redirect (`/connect`) and the token exchange (`/import`). This strictly satisfies provider consistency requirements.

## 9. Security Controls
- **SSRF / Open Redirect Mitigation:** By enforcing server-derived callback URLs, attackers cannot trick the server into sending OAuth authorization codes to malicious domains by tampering with the client `redirectUri` payload.
- **Provider State:** State validation (CSRF) is preserved exactly as implemented in Step 31 and Step 07.
- **Secrets Protection:** No OAuth tokens, authorization codes, or client secrets are exposed to the client or leaked in error logs.

## 10. Provider Dashboard Manual Configuration Requirements
To complete the production cutover, the following exact URIs MUST be added to the respective provider dashboards (Google Cloud Console, GitHub Developer Settings, LinkedIn Developer Portal) when deployed to the production domain (e.g., `https://provia.app`):
- **Google:** `https://provia.app/api/v1/auth/google/callback`
- **GitHub:** `https://provia.app/integrations/callback?provider=github`
- **LinkedIn:** `https://provia.app/integrations/callback?provider=linkedin`

*Note: GitHub does not permit wildcard URLs, so exact registration of the URI including the query parameter is required.*

## 11. Testing Performed
- Validated Prisma schema (no migrations needed).
- Compiled via `npx tsc`.
- Confirmed dynamic URI derivations locally without errors.
- Built via `next build`.

## 12. Deployment Requirements
Set `NEXT_PUBLIC_APP_URL` in the Vercel (or equivalent) production environment settings to the canonical domain. The three callback URLs will automatically compute correctly. No database migrations are required.

## 13. Known Limitations
- **Vercel Preview Deployments:** Due to GitHub/LinkedIn's strict redirect URI validation (no wildcards), Vercel branch previews (e.g., `https://branch-name.vercel.app`) will fail OAuth requests unless explicitly registered in the provider dashboards. This is a known, expected limitation of standard OAuth architecture.
