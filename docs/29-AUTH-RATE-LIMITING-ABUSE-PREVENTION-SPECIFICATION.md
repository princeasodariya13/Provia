# 29 - Authentication Rate Limiting & Abuse Prevention

## 1. Objective
Protect authentication-adjacent endpoints from automated abuse (credential stuffing, brute-forcing, queue flooding, email bombing) using a server-side rate limiter backed by Upstash Redis, while preserving the existing database and job system architecture.

## 2. Architecture & Algorithm
- **Algorithm**: Fixed window rate limiting implemented via atomic Redis pipelines (`INCR` + `EXPIRE`).
- **State Store**: Upstash Redis via `@upstash/redis`. Redis is treated as ephemeral. No business data is moved to Redis.
- **Fail-Open Policy**: If Redis is unreachable or credentials are not configured, the `RateLimiterService` explicitly fails open and allows the request. This prevents a Redis outage from breaking core authentication flows.

## 3. IP Extraction Strategy
- Client IPs are securely extracted via `lib/ip.ts`.
- The extractor checks for `x-real-ip` (Vercel standard) and `cf-connecting-ip` (Cloudflare).
- It falls back to parsing `x-forwarded-for` and taking the leftmost (original client) IP, being mindful that this requires trusting the edge proxy to properly populate/overwrite it (as Vercel does).

## 4. Redis Key Strategy
Keys are deterministic, namespaced, and avoid secrets:
- Format: `ratelimit:auth:<endpoint>:<keyType>:<identifier>:<windowId>`
- `endpoint`: `login`, `register`, `forgot-password`, `resend-verification`, `verify-email`
- `keyType`: `ip` or `account`
- Account identifiers (emails) are SHA-256 hashed before being used in Redis keys to prevent storing plaintext PII/emails in the Redis cache.

## 5. Endpoint Policies
By default, the rate-limit window is 15 minutes (900 seconds).
- **POST /api/v1/auth/login**: IP limit (10) + Account limit (5). Prevents distributed attacks on one account and single-IP attacks on many accounts.
- **POST /api/v1/auth/register**: IP limit (3). Prevents mass account creation.
- **POST /api/v1/auth/forgot-password**: IP limit (5) + Account limit (3). Protects Resend and the EMAIL_DELIVERY job queue. Limits applied *before* user lookup to prevent timing attacks.
- **POST /api/v1/auth/resend-verification**: IP limit (5) + Account limit (3). Protects the email queue.
- **POST /api/v1/auth/verify-email**: IP limit (10). Protects the JWT verification endpoint.

## 6. Observability
- When a rate limit is exceeded, an `auth.rate_limited` event is recorded in the `AnalyticsService` containing the endpoint and `keyType` that triggered it.
- If Redis fails, a warning is logged via `logger.warn` before failing open.

## 7. Environment Variables
Added the following to `lib/env.ts` with sensible defaults:
- `AUTH_RATE_LIMIT_WINDOW_SECONDS`
- `AUTH_LOGIN_IP_LIMIT` / `AUTH_LOGIN_ACCOUNT_LIMIT`
- `AUTH_REGISTER_IP_LIMIT`
- `AUTH_FORGOT_PASSWORD_IP_LIMIT` / `AUTH_FORGOT_PASSWORD_ACCOUNT_LIMIT`
- `AUTH_RESEND_VERIFICATION_IP_LIMIT` / `AUTH_RESEND_VERIFICATION_ACCOUNT_LIMIT`
- `AUTH_VERIFY_EMAIL_IP_LIMIT`

## 8. Security Considerations
- **No Enumeration Leakage**: `forgot-password` still returns a generic success message even when rate limiting is not hit, and a generic 429 when it is hit, preventing account enumeration.
- **No Secrets in Keys**: Only IP strings and SHA-256 hashes of emails are sent to Redis.
- **No Schema Changes**: No database migrations were required.
- **No Exposed Secrets**: Redis credentials are not exposed to the client.

## 9. Rollback Strategy
If rate limiting causes issues, it can be disabled simply by unseting `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in the environment. The `RateLimiterService` will automatically detect the absence of credentials and fail open for all requests.
