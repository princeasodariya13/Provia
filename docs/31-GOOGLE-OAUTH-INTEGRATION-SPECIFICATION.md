# 31 - Google OAuth Integration

## 1. Existing Architecture Discovered
- The `Provider` enum inside the Prisma schema only contained `GITHUB` and `LINKEDIN`.
- Existing GitHub and LinkedIn OAuth logic is dedicated entirely to the `SourceConnector` pattern (data importing for professional profiles), NOT authentication.
- The `User` model lacks a `googleId` column or similar OAuth identifier mapping.
- However, `User` uses `email` as a unique identifier, and `passwordHash` is naturally optional (`String?`).

## 2. Google OAuth Architecture
- Google OAuth is strictly implemented for **Authentication (Login/Signup)**, not as a `SourceConnector`.
- Because `email` is enforced as unique and Google guarantees verification status, the implementation uses **email-based account linking**.
- No database migrations were required. Users authenticated via Google who don't exist are created with `passwordHash: null`.
- If a user authenticated by Google already exists, they are seamlessly logged in (and their `emailVerified` timestamp is populated if it was previously null, given Google's strong email verification guarantees).

## 3. OAuth Flow
1. User clicks "Continue with Google" on the login or register page.
2. `GET /api/v1/auth/google` generates a secure random `state`, sets it in an `HttpOnly` `oauth_state` cookie, and redirects the user to Google.
3. User authenticates on Google and is redirected back to `GET /api/v1/auth/google/callback`.
4. The callback extracts `code` and `state`, verifies the CSRF state cookie, and exchanges the code for an `access_token` and `id_token`.
5. The callback fetches the user's profile from `googleapis.com/oauth2/v3/userinfo` to confirm the email is `email_verified: true`.
6. The user is looked up by email. If they don't exist, a new user is created.
7. A session is created using the existing `createSession` standard, and the user is redirected to `/dashboard`.

## 4. Security Model
- **No Client Secrets Exposed**: `GOOGLE_CLIENT_SECRET` is used exclusively server-side.
- **CSRF Protection**: Verified using a random hex string stored in an `HttpOnly`, `SameSite=Lax` cookie.
- **Identity Trust**: The implementation rejects unverified Google emails.
- **Account Linking**: Implicitly relies on the verified email address to merge identities safely.

## 5. Session Behavior
The standard `/lib/auth.ts` `createSession` helper is reused entirely. The Google user receives the exact same session JWT properties as a password-authenticated user, preserving session logic globally.

## 6. Email Verification Behavior
Step 30 email verification enforcement natively applies to password logins. However, since Google login guarantees the email is verified (we check `googleUser.email_verified`), we explicitly update `user.emailVerified = new Date()` if it's missing during the callback, automatically resolving the Step 30 blockade without duplicate work.

## 7. Rate Limiting Behavior
Step 29 rate limiting (`RateLimiterService`) was integrated into both `/api/v1/auth/google` (initiation) and `/api/v1/auth/google/callback` (resolution) endpoints, using the `AUTH_LOGIN_IP_LIMIT` parameters to prevent endpoint spam.

## 8. Analytics & Logging
- Logged safe OAuth errors internally using Pino `logger`.
- Added `auth.google_login_success` event tracking.

## 9. Environment Variables
Added to `lib/env.ts` validation:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

## 10. Deployment Requirements
- Ensure `GOOGLE_CALLBACK_URL` matches the deployed domain (e.g., `https://provia.app/api/v1/auth/google/callback`).

## 11. Database/Migration Status
**ZERO migrations required.** 

## 12. Testing Performed
- Validated Typescript types (`npx tsc --noEmit`).
- Validated Linter (`npm run lint`).
- Validated Build (`npm run build`).
- Inspected session isolation and rate limiter integration logically.

## 13. Manual Production Verification Steps
- Configure Google Cloud Platform OAuth credentials.
- Add authorized redirect URI matching `GOOGLE_CALLBACK_URL`.
- Click "Continue with Google", complete flow, verify redirection to `/dashboard`.
