# Provia - Production Environment Readiness

This document outlines the environment configuration and infrastructure boundaries established for Provia production deployments (Vercel + Neon).

## 1. Environment Variables Inventory

| Variable | Scope | Required / Optional | Usage |
|---|---|---|---|
| `NODE_ENV` | Server | Required | Framework environment (`production`, `development`) |
| `DATABASE_URL` | Server | Required | Prisma PostgreSQL pooled connection (Neon) |
| `DIRECT_URL` | Server | Required (Prisma) | Prisma PostgreSQL direct connection (Neon) |
| `SESSION_SECRET` | Server | Required | AES-256-GCM / HS256 secret for JWT sessions |
| `NEXT_PUBLIC_APP_URL` | Both | Required | Canonical URL for SEO, metadata, Open Graph |
| `GITHUB_CLIENT_ID` | Server | Optional | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | Server | Optional | GitHub OAuth |
| `GITHUB_CALLBACK_URL` | Server | Optional | GitHub OAuth (`/api/v1/integrations/github/callback`) |
| `LINKEDIN_CLIENT_ID` | Server | Optional | LinkedIn OAuth |
| `LINKEDIN_CLIENT_SECRET` | Server | Optional | LinkedIn OAuth |
| `LINKEDIN_CALLBACK_URL` | Server | Optional | LinkedIn OAuth (`/api/v1/integrations/linkedin/callback`) |
| `GOOGLE_CLIENT_ID` | Server | Optional | Google OAuth (Foundation prepared) |
| `GOOGLE_CLIENT_SECRET` | Server | Optional | Google OAuth (Foundation prepared) |
| `INTEGRATION_TOKEN_ENCRYPTION_KEY` | Server | Optional | AES-256-GCM key for encrypting OAuth tokens (Must be exactly 32 chars) |
| `GEMINI_API_KEY` | Server | Optional | Google Gemini Generative AI API Key |
| `AI_MODEL` | Server | Optional | Model identifier (Default: `gemini-2.5-flash`) |
| `RESEND_API_KEY` | Server | Optional | Email Delivery (Foundation prepared) |
| `EMAIL_FROM` | Server | Optional | Sender address, e.g. `Provia <noreply@provia.app>` |
| `CLOUDINARY_CLOUD_NAME` | Server | Optional | Image CDN (Foundation prepared) |
| `CLOUDINARY_API_KEY` | Server | Optional | Image CDN (Foundation prepared) |
| `CLOUDINARY_API_SECRET` | Server | Optional | Image CDN (Foundation prepared) |
| `SENTRY_DSN` | Server | Optional | Application Observability (Foundation prepared) |
| `UPSTASH_REDIS_REST_URL` | Server | Optional | Cache / Locks (Foundation prepared) |
| `UPSTASH_REDIS_REST_TOKEN` | Server | Optional | Cache / Locks (Foundation prepared) |
| `JOB_POLL_INTERVAL_MS` | Server | Optional | Worker polling rate (Default: `3000`) |
| `JOB_PROCESSING_TIMEOUT_MS` | Server | Optional | Worker timeout (Default: `300000`) |

## 2. Development vs Production Configurations

### Development Placeholders
- `.env.example` contains all the keys mapped above as `""` (empty string) placeholders.
- `SESSION_SECRET` has a hardcoded safe fallback strictly enforced *only* when missing locally.

### Production Requirements
- A valid PostgreSQL URL is required.
- `SESSION_SECRET` must be set.
- `INTEGRATION_TOKEN_ENCRYPTION_KEY` must be exactly 32 characters in length.
- `NEXT_PUBLIC_APP_URL` must point to the real Vercel URL (e.g., `https://provia.app`).

## 3. OAuth Callback URLs

All external OAuth platforms (GitHub, LinkedIn) are strict about callback validation. When deploying to Vercel, replace `localhost:3000` with your domain:

- **GitHub:** `https://<YOUR_DOMAIN>/api/v1/integrations/github/callback`
- **LinkedIn:** `https://<YOUR_DOMAIN>/api/v1/integrations/linkedin/callback`

These are managed securely via `GITHUB_CALLBACK_URL` and `LINKEDIN_CALLBACK_URL`.

## 4. PostgreSQL DATABASE_URL vs DIRECT_URL

Provia utilizes a Prisma serverless deployment architecture:
- `DATABASE_URL` is for query pooling (Neon connection pool string, e.g., ending with `?pgbouncer=true`).
- `DIRECT_URL` is used strictly for database migrations by Prisma `db push` or `migrate deploy`. It bypasses the pool.

## 5. Vercel Deployment Notes

- **Background Jobs:** Vercel functions cannot run long-polling background worker loops. The `npm run worker` script must run in a persistent container (e.g., Railway, Render, Fly.io) with access to the same PostgreSQL `DATABASE_URL`.
- **Stateless Edge:** The application is architected without local filesystem reliance, perfectly suiting Vercel's stateless functions.

## 6. Secrets That Must NEVER Be Committed

Ensure the following `.gitignore` boundaries are respected:
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- `dev.db`

The `.env.example` file is intentionally tracked as the master template.

## 7. Final Pre-Deployment Checklist

- [ ] All 23 production variables are configured in the Vercel Dashboard.
- [ ] `NEXT_PUBLIC_APP_URL` is set to the final assigned Vercel URL.
- [ ] OAuth apps in GitHub and LinkedIn are updated with the new callback domains.
- [ ] A 32-byte encryption key is securely generated for `INTEGRATION_TOKEN_ENCRYPTION_KEY`.
- [ ] The `worker` process is deployed to a secondary host.
- [ ] `npx prisma migrate deploy` is run against the production database (or automatically via Vercel build script).
