# STEP 35 — JWT SESSION REVOCATION & DEVICE SECURITY SPECIFICATION

## 1. Objective
Implement global JWT session revocation and device security by enforcing a strict per-user session version check on all authenticated requests. This effectively resolves the privilege escalation vulnerability where changing a password or logging out on one device failed to terminate active 7-day sessions on other devices.

## 2. Architecture & Design

### 2.1 Schema Update
The `User` model has been updated to include a `sessionVersion` integer:
```prisma
model User {
  ...
  sessionVersion Int @default(1)
  ...
}
```
This requires a database migration.

### 2.2 JWT Payload Structure
The stateless `provia_session` JWT payload now includes `sessionVersion`. 
```typescript
export interface SessionPayload {
  userId: string;
  role: Role;
  email: string;
  sessionVersion: number;
  expiresAt: number;
}
```
During `createSession()`, the backend injects the user's current `sessionVersion` directly from the secure `User` database record into the cryptographically signed JWT.

### 2.3 Strict Validation Logic
In `lib/auth.ts`, the `getCurrentUser()` function—which already executes a `findUnique` query against the `User` table—now asserts that the `sessionVersion` inside the JWT precisely matches the `sessionVersion` in the database.
```typescript
if (!user || user.sessionVersion !== session.sessionVersion) {
  return null; // Session mathematically rejected as revoked
}
```
If a mismatch occurs, the session is treated as invalid and the user is stripped of authorization (resulting in a 401 Unauthorized cascade). This achieves global revocation with *zero* additional database latency overhead.

## 3. Implemented Endpoints

### 3.1 `POST /api/v1/auth/logout-all` (New)
Provides manual device management.
- Requires authentication via `requireAuth()`.
- Executes an atomic Prisma increment: `sessionVersion: { increment: 1 }`.
- Automatically calls `clearSession()` to erase the local device's cookie.
- Immediately invalidates all previously issued JWTs globally.

### 3.2 `POST /api/v1/auth/change-password` (Modified)
Upon successful password verification and hash update, the `User.sessionVersion` is atomically incremented. This ensures that any compromised session cookies stolen prior to the password change become instantly worthless.

### 3.3 `POST /api/v1/auth/reset-password` (Modified)
Upon successful JWT token recovery link verification, the `User.sessionVersion` is atomically incremented, ensuring that compromised accounts are thoroughly sanitized of active sessions when recovered.

## 4. UI Modifications
The Settings interface (`app/(dashboard)/settings/page.tsx`) now features a dedicated **Device Security** section. 
Users can click **"Log Out of All Devices"** which hits the new endpoint. Appropriate success/error/loading states are handled smoothly, maintaining the existing Provia design language.

## 5. Analytics & Observability
A new event `auth.sessions_revoked` has been added to the `AnalyticsEventName` union. It is strictly fired upon a successful global logout, recording only the `userId` without any sensitive JWT or IP metadata.

## 6. Backward Compatibility / Edge Cases
- Legacy JWTs lacking the `sessionVersion` field will fail the strict equality check (`undefined !== number`), forcing all users to cleanly authenticate once upon the deployment of this feature.
- Concurrent updates (e.g., clicking logout multiple times rapidly) are safely handled via Prisma's `{ increment: 1 }` atomicity, preventing race conditions.
