# 14 - Professional Identity Data Integration Specification

## 1. Objective
Establish a robust, scalable, and provider-neutral foundation for importing, storing, and normalizing professional identity data from external sources (e.g., GitHub, LinkedIn) into a canonical professional profile belonging to a single authenticated user.

## 2. Scope
- Provider-neutral connector architecture (`SourceConnector` abstraction).
- GitHub integration foundation.
- LinkedIn integration foundation (using official APIs, explicitly forbidding scraping).
- Database models for connections, raw source snapshots, and canonical professional profiles.
- Deterministic normalization pipeline mapping raw data to the canonical model.
- Import lifecycle and state machine (NOT_CONNECTED, CONNECTED, IMPORTING, SYNCED, FAILED).
- API endpoints for managing integrations and triggering syncs.
- Clean authenticated UI matching Step 11 for integration management.

## 3. Non-goals
- Building a full OAuth flow if credentials are unavailable (we provide the foundation and configuration).
- Actually executing AI processing or AI normalization.
- Portfolio generation, templates, or analytics.
- Web scraping LinkedIn profiles.

## 4. Architecture
The architecture follows a strict, unidirectional data pipeline:
`External Source` → `Source Connector` → `Raw Imported Data` → `Normalization` → `Canonical Professional Profile`.

## 5. Source Connector Abstraction
Defined in `lib/integrations/connector.ts`.
A generic interface `SourceConnector` enforces consistent methods:
- `getProviderId()`
- `isConfigured()`
- `getAuthUrl()`
- `exchangeToken(code)`
- `fetchProfile(token)`
- `fetchAdditionalData(token)`

## 6. GitHub Integration
- Reads `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
- If missing, returns `PROVIDER_NOT_CONFIGURED` cleanly.
- Collects public professional data (username, bio, location, public repos, languages) using standard GitHub REST APIs.

## 7. LinkedIn Integration Strategy
- Reads `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.
- Strictly utilizes official LinkedIn OIDC APIs (`/v2/userinfo`).
- Uses scopes `openid profile email`.
- Explicitly rejects undocumented scraping endpoints, browser cookies, or Puppeteer.
- If credentials are null, returns `PROVIDER_NOT_CONFIGURED`.

## 8. Raw Source Data
- Stored as JSON in a `RawSourceSnapshot` database record.
- Ensures traceability and allows future deterministic re-normalization without unnecessary external API hits.

## 9. Canonical Professional Profile
- A structured, provider-neutral representation containing:
  - Identity (name, headline, bio, location, avatar, website).
  - Professional (current company, job title).
  - Developer (languages, repos, github username).
- Stored in the `ProfessionalProfile` database record.

## 10. Normalization
- A dedicated `NormalizationService` deterministically maps specific raw JSON shapes (e.g., GitHub's user response) to the canonical fields.
- Tracks attribution (which provider contributed which field).

## 11. Source Attribution
- The `ProfessionalProfile` tracks its primary sources using a `sources` array enum or relation.

## 12. Import Lifecycle
`Connection` records maintain explicit status enums:
`NOT_CONNECTED` → `CONNECTED` → `IMPORTING` → `SYNCED` | `FAILED`.

## 13. API Contracts
- `GET /api/v1/integrations` - Returns all configured integration statuses for the user.
- `POST /api/v1/integrations/:provider/connect` - Initiates OAuth or returns configuration error.
- `POST /api/v1/integrations/:provider/import` - Triggers a sync/import job and updates canonical profile.

## 14. Database Model Changes
- `Connection`: Tracks OAuth tokens and sync status per provider per user.
- `RawSourceSnapshot`: Tracks raw JSON payloads.
- `ProfessionalProfile`: The canonical normalized user data.

## 15. User Ownership/Isolation
- Strictly validated via `requireAuth()`. All DB queries scope where `userId = currentUser.id`. Client-provided `userId` parameters are completely rejected.

## 16. Security
- Tokens are symmetrically encrypted using AES-256-GCM before saving to the database.
- Uses `INTEGRATION_TOKEN_ENCRYPTION_KEY`.
- Tokens NEVER leave the backend via JSON responses.
- API endpoints strictly require authentication.

## 17. Token/Credential Handling
- Stored on the `Connection` record (encrypted access token, encrypted refresh token).
- Will not persist in logs or be visible to the frontend.
- OAuth flow uses a secure frontend CSRF state validation.

## 18. Rate Limiting & Error Handling
- Respects 403 / 429 status codes from GitHub/LinkedIn.
- Fails the import gracefully into the `FAILED` state.
- Normalized through `APIError` classes.

## 19. Environment Configuration
Requires:
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (optional).
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` (optional).
- `INTEGRATION_TOKEN_ENCRYPTION_KEY` (required 32-byte key).

## 20. Deferred Features
- Full async background worker queue for huge repo histories.
- AI normalization.
- Portfolio templates.
