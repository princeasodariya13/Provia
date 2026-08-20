# 23 - Analytics & Observability Foundation Specification

## 1. Objective
Establish a unified, privacy-conscious first-party analytics and observability foundation. This infrastructure tracks application health, API request correlations, core product events (authentication, portfolio lifecycle, AI tracking), and aggregate public portfolio views, without compromising the security or privacy of Provia users or their guests.

## 2. Event Architecture
- **Model**: Prisma `AnalyticsEvent` mapping `eventName`, optional `userId`, optional `requestId`, and sanitized `metadata` (JSON).
- **Service**: A centralized `AnalyticsService` handles non-blocking database writes. If event insertion fails, the error is swallowed and logged, guaranteeing that analytics outages never disrupt core business functionality.

## 3. Request Correlation & API Observability
- **Correlation**: API handlers dynamically generate a `requestId` using `crypto.randomUUID()`. This ID is injected into Pino structured logs and attached to outbound API error payloads, aiding debugging across async boundaries.
- **Timing**: Core services (AI, document generation, integrations) measure `durationMs` utilizing native `performance.now()`.

## 4. Instrumentation Map
- **Auth**: `auth.registered`, `auth.login_succeeded`, `auth.login_failed`, `auth.logout`
- **Integrations**: `integration.connect_started`, `integration.import_succeeded`, `integration.import_failed`
- **AI**: `ai.analysis_started`, `ai.analysis_completed`, `ai.analysis_failed`
- **Portfolio**: `portfolio.generated`, `portfolio.version_created`, `portfolio.published`, `portfolio.unpublished`
- **Public Views**: `portfolio.public_viewed`

## 5. Privacy & Data Minimization Constraints
- Never stores full IP addresses, persistent browser fingerprints, or tracking cookies.
- Never records raw user input, passwords, OAuth tokens, or JWTs.
- Never halts a transaction upon analytics failure.
- A public visitor is completely anonymized (`userId` is strictly null).
