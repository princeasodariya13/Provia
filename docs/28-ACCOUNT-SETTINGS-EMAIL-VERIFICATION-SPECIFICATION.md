# 28 - Account Settings, Email Verification & Account Management

## 1. Objective
Implement the complete account self-service layer for Provia: email verification (FR-AUTH-006), change password (FR-AUTH-007), account deletion (FR-AUTH-008), and a Settings page. These complete the authentication lifecycle started in Steps 13 and 27.

## 2. Architectural Boundaries
- All endpoints are server-side only. No credentials, tokens, or sensitive data are exposed to the browser.
- Email verification tokens are stateless JWTs signed with `SESSION_SECRET + user.email`, mirroring the Step 27 password reset pattern. This avoids any schema migration.
- Account deletion is a cascading hard delete (leveraging Prisma's `onDelete: Cascade` relationships).
- The Settings page uses the existing dashboard layout and existing Provia design language.

## 3. Database Impact
- **No schema migration required.** The `User.emailVerified` field (DateTime?) already exists in the schema.
- Email verification marks this field with the current timestamp. No new token table is required.

## 4. API Contracts

### POST /api/v1/auth/verify-email
- Public. Accepts `{ token: string }`.
- Verifies stateless JWT. On success, sets `user.emailVerified = now()`.
- Generic safe errors (no timing leaks).

### POST /api/v1/auth/resend-verification
- Public. Accepts `{ email: string }`.
- Finds user. If found and unverified, queues EMAIL_DELIVERY job (template: VERIFY_EMAIL).
- Always returns generic response.

### POST /api/v1/auth/change-password
- Authenticated. Accepts `{ currentPassword: string, newPassword: string }`.
- Verifies current password hash. Updates to new hash. Invalidates existing sessions by clearing cookies.

### DELETE /api/v1/auth/account
- Authenticated. Accepts `{ confirmEmail: string }` to match authenticated user's email.
- Hard-deletes user record. Cascades via Prisma relationships.
- Clears session cookie before returning.

## 5. Authentication & Authorization
- `change-password` and `DELETE /auth/account` require `requireAuth()`.
- Never trust userId from request body; always derive from authenticated session.
- Account deletion confirmation requires the authenticated user's email to match the supplied `confirmEmail`.

## 6. Email Verification Flow
1. On registration, send VERIFY_EMAIL job via EMAIL_DELIVERY worker.
2. Worker generates a stateless JWT (signed with `SESSION_SECRET + user.email`).
3. JWT embeds `userId` and expires in 24 hours.
4. User clicks link: `POST /api/v1/auth/verify-email?token=...`.
5. JWT verified. If valid, `user.emailVerified` set to `now()`.
6. After email change, token is automatically invalidated because the signing key changes.

## 7. User Isolation
- `change-password` and `DELETE /auth/account` always operate on `requireAuth().id`.
- Email verification uses userId from the JWT; JWT cannot be forged without `SESSION_SECRET`.

## 8. Validation
- All inputs validated with Zod before any database access.
- Email confirmation for deletion checked case-insensitively.

## 9. Idempotency
- Re-sending verification uses the existing idempotency key pattern: `email-verify-<userId>`.
- Re-verifying an already-verified account is a no-op (returns success).

## 10. Security Requirements
- Reset tokens never logged, never in API responses.
- `confirmEmail` confirmation prevents accidental deletion.
- Account deletion fails if `confirmEmail` does not match authenticated user.
- Generic responses on `resend-verification` prevent account enumeration.

## 11. Observability
- Analytics events: `auth.email_verification_sent`, `auth.email_verified`, `auth.password_changed`, `auth.account_deleted`.
- No sensitive data in analytics metadata.

## 12. Settings Page
- Route: `/settings` (auth required).
- Sections: Account (email, name, email verification status), Change Password, Account Deletion (destructive styling, double-confirmation).

## 13. Scope Boundaries
- Step 28 implements account settings, email verification, change password, account deletion.
- Step 29 has NOT been started.
