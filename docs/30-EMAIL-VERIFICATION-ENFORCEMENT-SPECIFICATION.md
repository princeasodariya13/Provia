# 30 - Email Verification Enforcement

## 1. Problem
Step 28 implemented the email verification flow (verification token generation, sending, and confirmation), but it explicitly did not enforce this state during login. Unverified users could still authenticate and gain a session.

## 2. Existing Step 28 Verification Architecture
- `user.emailVerified` is a `DateTime?` column in the Prisma schema.
- Verification emails are sent asynchronously via the `EMAIL_DELIVERY` background job (`VERIFY_EMAIL` template).
- The `resend-verification` endpoint allows users to request a new verification link.

## 3. Step 29 Rate-Limit Dependency
Step 29 introduced fixed-window rate limiting backed by Upstash Redis.
- The login endpoint enforces limits based on IP and account email.
- The `resend-verification` endpoint is strictly rate-limited to prevent abuse.
- This Step 30 implementation preserves the exact order of execution: Rate Limiting occurs *before* database lookups or credential verification, ensuring that the Redis protection layer is never bypassed.

## 4. Login Security Flow
The new enforcement logic is placed strictly *after* successful password verification and *before* session creation:
1. Extract IP and enforce Step 29 Rate Limiting (IP + Account limits).
2. Look up the user by email. If not found, return generic invalid credentials error.
3. Compare the provided password hash. If invalid, return generic invalid credentials error.
4. **(New)** If password is valid, check `user.emailVerified`.
5. If `emailVerified` is null, throw a 403 `APIError` with code `UNVERIFIED_EMAIL`.
6. If `emailVerified` is set, proceed to create the authenticated session cookie.

## 5. Anti-Enumeration Model
This architecture prevents account enumeration leakage:
- If an email does not exist, the attacker receives a generic "Invalid email or password" error.
- If an email exists but the password is wrong, the attacker receives the identical generic "Invalid email or password" error.
- The specific "Please verify your email" error is ONLY returned if the attacker successfully authenticates with the correct password. An attacker cannot use this to blindly scan for existing unverified accounts without possessing valid credentials.

## 6. Session Creation Boundary
No partial or temporary sessions are created. If the verification check fails, `createSession()` is never called, meaning no session token or cookie is ever issued to the unverified user.

## 7. API Behavior
The API contract for POST `/api/v1/auth/login` is updated to potentially return:
```json
{
  "success": false,
  "error": "Please verify your email before signing in.",
  "details": { "code": "UNVERIFIED_EMAIL" },
  "requestId": "..."
}
```
HTTP Status Code: 403 Forbidden.

## 8. Frontend Behavior
The login form (`app/(auth)/login/page.tsx`) intercepts the `UNVERIFIED_EMAIL` error code:
- It displays the verification requirement safely.
- It dynamically surfaces a "Resend verification email" action button below the error.
- The resend action leverages the existing, rate-limited `/api/v1/auth/resend-verification` endpoint natively, preserving background job delivery and Step 29 abuse prevention without duplicating code into the frontend.

## 9. Multi-User Isolation
Enforcement uses only the `user` object retrieved from the database via the credentials provided in the request body. No cross-user state or client-provided `userId` is trusted. The `resend-verification` endpoint relies strictly on the email associated with the credentials.

## 10. Analytics / Logging
A new structured log/analytics event is emitted when a user is blocked by verification:
- `eventName: "auth.login_failed"`
- `metadata: { reason: "unverified_email" }`

## 11. Testing & Verification
- Test: Unknown email + password → Returns generic 401.
- Test: Existing user + wrong password → Returns generic 401.
- Test: Existing user + correct password + `emailVerified: null` → Returns 403 `UNVERIFIED_EMAIL`, no session created.
- Test: Existing user + correct password + `emailVerified` set → Returns 200, session created.
- Test: Build, Lint, and Prisma validations pass locally.

## 12. Deployment Considerations
No database schema changes or migrations are required. The deployment simply updates the application logic.

## 13. Security Considerations
- JWT tokens and raw secrets remain isolated on the server.
- The background `JobProcessor` architecture safely insulates the email provider (Resend) from direct manipulation during the resend flow.

## 14. Non-Goals
This step strictly avoided modifying OAuth flows, creating new database tables, replacing the verification mechanism, or altering portfolio-related architecture.

## 15. Step 31 Boundary
Step 30 is complete. Step 31 has not been started.
