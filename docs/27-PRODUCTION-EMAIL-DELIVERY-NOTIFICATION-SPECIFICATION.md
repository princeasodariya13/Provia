# 27 - Production Email Delivery & Notification System

## 1. Objective
Establish a production-grade, secure, server-side email delivery foundation using Resend, integrated asynchronously through the existing PostgreSQL job infrastructure. This system implements password resets and notifications without compromising user privacy or application architecture.

## 2. Email Architecture & Resend Provider
- **Provider**: The application uses the `Resend` SDK to dispatch emails.
- **Location**: `lib/email/providers/resend.ts`.
- **Security Boundary**: The API key (`RESEND_API_KEY`) is only accessed server-side via the centralized `env.ts`. It is never serialized or transmitted to the client.

## 3. Email Templates
- **Design**: Minimalistic, deterministic, styled HTML templates built in `lib/email/templates/index.ts`.
- **Safety**: A centralized `escapeHtml` function is used for all dynamic properties to prevent HTML injection. Templates do not include raw internal identifiers or sensitive payloads.

## 4. Asynchronous Delivery (EMAIL_DELIVERY Job)
- The existing Job processor (`lib/jobs/processor.ts`) serves as the orchestrator.
- A new handler `EmailDeliveryHandler` takes `{ type: "EMAIL_DELIVERY" }` jobs.
- **Payload Rules**: 
  - Payloads only contain instructions (e.g., `userId`, `template: "PASSWORD_RESET"`).
  - Payloads **NEVER** contain the raw `resetToken`, API keys, or raw email addresses.
- **Idempotency**: Implemented dynamically per-user (e.g., `email-reset-<userId>`) leveraging the PostgreSQL unique constraints to prevent spam and double-queueing.

## 5. Password Reset Flow (Stateless JWT)
- To avoid migrating the database with a `PasswordResetToken` table, the system uses a **Stateless JWT approach** via `jose`.
- When the worker executes the `PASSWORD_RESET` job:
  1. It fetches the user's `passwordHash`.
  2. It generates a signed JWT combining `env.SESSION_SECRET` + `user.passwordHash` as the key.
  3. The raw JWT is emailed to the user as a link and NOT stored in the database or job payload.
- When the user resets the password, `POST /api/v1/auth/reset-password`:
  1. It decodes the JWT to find the `userId`.
  2. It dynamically reconstructs the secret using the current `passwordHash`.
  3. If the password was already changed, the hash differs, and the token verification safely fails (making it perfectly single-use).

## 6. User Isolation & Authentication Constraints
- API endpoints determining recipient data (e.g., password reset requests) only parse the supplied email, sanitize it, and rely entirely on authoritative PostgreSQL queries (`findUnique`).
- The async worker trusts only the authenticated `job.userId` to look up the recipient email when sending welcome or security emails.

## 7. Logging & Observability
- All emails log safe operational metadata (`to`, `subject`) via `pino`.
- The actual URL tokens and raw payload contents are completely omitted from logs to preserve zero-trust analytics.

## 8. Rate Limiting & Abuse Prevention
- The `forgot-password` endpoint intentionally prevents user enumeration by always returning a generic success message ("If an account with that email exists, we have sent a password reset link").

## 9. Next Steps (Explicit Boundary)
- Step 28 has NOT been started. Future steps involving webhook notifications or in-app messaging fall outside this specification.
