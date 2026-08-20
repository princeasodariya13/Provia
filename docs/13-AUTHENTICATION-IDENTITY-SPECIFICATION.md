# 13 - Authentication & Identity Specification

## 1. Objective
Establish a secure, scalable, and production-grade authentication and identity foundation for Provia, supporting registration, login, logout, and protected routing.

## 2. Scope
- Local credentials authentication (Email & Password).
- Secure JWT-based HTTP-only cookie sessions using `jose`.
- Secure password hashing using `bcryptjs`.
- Registration, Login, Logout, and Current User (`/me`) endpoints.
- Authentication middleware and server-side utilities.
- Frontend authentication UI (Login/Register forms) and state hook (`useAuth`).
- Minimal Prisma `User` model updates for credentials and roles.

## 3. Non-goals
- GitHub / LinkedIn OAuth integration (deferred).
- Email verification / Password reset (deferred).
- Admin dashboard UI (deferred).
- AI processing / Portfolio generation (deferred).

## 4. Authentication Architecture
- **Stateless JWT via Cookies**: User identity is serialized into a signed JWT (JWS) and stored in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie.
- **Library**: `jose` (edge-compatible, fast, secure).
- **Session Expiration**: 7 days.

## 5. User Identity Model
Extended Prisma `User` model to include:
- `passwordHash`: String (nullable, for users who might only use OAuth later).
- `role`: Enum (USER, ADMIN).

## 6. Registration Flow
- `POST /api/v1/auth/register`
- Zod validates `email`, `password`, `name`.
- Check if user exists (409 Conflict if yes).
- Hash password with `bcryptjs`.
- Create user in database.
- Issue JWT cookie.
- Return sanitized user (no `passwordHash`).

## 7. Login Flow
- `POST /api/v1/auth/login`
- Zod validates `email`, `password`.
- Find user by email.
- Verify password with `bcryptjs`.
- Issue JWT cookie.
- Return sanitized user.

## 8. Logout Flow
- `POST /api/v1/auth/logout`
- Clear JWT authentication cookie.
- Return success.

## 9. Current-Session Flow
- `GET /api/v1/auth/me`
- Verify JWT cookie.
- Return authenticated user data.

## 10. Session Architecture
Cookies named `provia_session`. Secrets stored in `SESSION_SECRET` env variable (min 32 chars).

## 11. Password Security
`bcryptjs` with salt rounds = 10. Passwords never logged, never returned to client.

## 12. Cookie/Session Security
- `HttpOnly`: true
- `Secure`: `process.env.NODE_ENV === "production"`
- `SameSite`: "lax"
- `Path`: "/"

## 13. Authentication Middleware
Exported functions in `lib/auth.ts`:
- `getSession()`: Parses cookie, verifies JWT.
- `requireAuth()`: Enforces authentication for API routes.

## 14. Protected API Routes
Future APIs will wrap handlers with `requireAuth()` to extract the `userId` cleanly.

## 15. Authorization Foundation
`Role` enum added to Prisma. Admin endpoints will use a `requireRole("ADMIN")` equivalent.

## 16. User Roles
`USER` (default), `ADMIN`.

## 17. Multiple-user Data Isolation
Sessions are independent HTTP cookies; no global mutable state exists.

## 18. Validation Rules
Zod schemas for `RegisterInput` and `LoginInput` in `lib/validations/auth.ts`.

## 19. Authentication Error Handling
Uses `APIError`, `UnauthorizedError`, `ValidationError` from Step 12.

## 20. Rate Limiting Considerations
Minimal manual rate-limiting / slow-down recommendations for auth endpoints (full Redis/KV rate limit deferred to infrastructure layer).

## 21. Security Requirements
- No secrets exposed.
- `SESSION_SECRET` strictly required at startup.

## 22. API Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## 23. Request/Response Contracts
Defined via TypeScript types and standard `APIResponse<T>`.

## 24. Database Changes
Prisma schema updated with `Role` enum and `passwordHash` field. The production database architecture strictly remains PostgreSQL as established in Step 12.

## 25. Frontend Integration
- React context / hook: `hooks/useAuth.ts`.
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- Preserving Step 11 styling (sharp borders, geometric shapes).

## 26. Loading States
Handled via React `useState(isLoading)` on forms, and initial `loading` flag in `useAuth`.

## 27. Error States
Inline validation errors (Zod + React Hook Form or manual) and API error alerts.

## 28. Testing Requirements
TypeScript strict mode, ESLint, Next build, and manual API verification.

## 29. Production Considerations
Secrets must be properly provisioned. Node.js `>= 18` required.

## 30. Explicitly Deferred Features
OAuth (GitHub/LinkedIn), Account deletion, Password reset.
