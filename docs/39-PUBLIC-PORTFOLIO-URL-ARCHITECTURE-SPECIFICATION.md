# Step 39 — Public Portfolio URL Architecture Specification

## Overview

The previous Step 38 Custom Domain Mapping system has been safely removed and replaced with a simpler, highly secure Provia-hosted public URL architecture.
The new portfolio URL structure guarantees unpredictability while remaining human-readable by utilizing a combined `{username}/{publicCode}` pattern.

## Core Structure

**URL Format**: `https://provia-developer.vercel.app/[username]/[32-character-code]`

**Example**: `https://provia-developer.vercel.app/prince-asodariya/a8f31c9e72d14b6fa29c8e51d4f9072a`

This structure ensures that:
1. It is user-friendly and clearly branded with the user's name.
2. It prevents enumeration or brute-forcing by requiring a 32-character cryptographically random code.
3. The server requires both parameters to resolve a portfolio, eliminating any chance of accidental collisions across accounts.

## Code Generation Implementation

The `publicCode` is strictly a 32-character hexadecimal string. 
- **Generator**: `crypto.randomBytes(16).toString("hex")`.
- **Validation (Server/Routing)**: `^[a-f0-9]{32}$`. 
- **Validation (Username)**: `^[a-z0-9]+(?:-[a-z0-9]+)*$` (3-30 chars, lowercase, URL-safe).

Math.random(), timestamps, or user IDs are strictly prohibited for generating this code.

## Database Schema Changes

A Prisma migration (`20260824120000_public_portfolio_url`) was executed with the following modifications:

1. **User Model**: Added `username String? @unique` to hold the URL-safe display name.
2. **PortfolioPublication Model**: Added `publicCode String? @unique` to hold the 32-character hex ID.
3. **Removals**: `CustomDomain` model, `DomainStatus` enum, and their foreign key constraints were fully purged.

## Public Portfolio Resolution

The resolution logic resides entirely in the new Next.js App Router dynamic route: `app/[username]/[publicCode]/page.tsx`.
- The server validates the format of `username` and `publicCode` before making any database queries. If the format fails, a `404 Not Found` response is sent immediately.
- The `PortfolioPublication` is queried utilizing `where: { publicCode, isActive: true }` and includes the related user.
- A final safety check confirms `publication.user.username === username` and `publication.portfolioDocument.status === "PUBLISHED"`.

## Security & IDOR Protection

1. **Not Authentication**: The `publicCode` is an identifier, strictly read-only, and never utilized as a session credential or authorization token for mutating APIs.
2. **Read-only**: Visitors of the `/[username]/[publicCode]` route can only view public details. All Dashboard / Settings APIs remain protected by `requireAuth()` requiring a valid HTTP session cookie.
3. **Data Scrubbing**: The portfolio route merely renders a statically safe `PortfolioDocumentDTO`. It does not expose `userId`, raw profile settings, or any internal credentials.

## Migration Strategy & Backward Compatibility

- **User Migrations**: An internal script `scripts/migrate-public-urls.ts` gracefully iterated over all existing users without a username or `publicCode`, safely generating unique normalized usernames (e.g. `prince-asodariya`, `prince-asodariya-1`) and 32-character codes.
- **Backward Compatibility**: The legacy `/p/[slug]` route continues to exist but acts as a permanent redirect (308) forwarding traffic to the new canonical URL when a `publicCode` is available.

## Analytics Compatibility

The new `/[username]/[publicCode]` route integrates seamlessly with `AnalyticsService.record()`. It logs the `portfolio.public_viewed` event using a fire-and-forget promise, guaranteeing that telemetry failure will never prevent the public portfolio from rendering.

## Regeneration Behavior

Users are provided with a "Regenerate Link" capability inside the Portfolio Dashboard:
- Users are warned that generating a new link inherently breaks the old URL.
- When confirmed, `POST /api/v1/portfolio/regenerate-link` generates a brand new cryptographically random `publicCode`, verifies its uniqueness in the database, and updates the active publication. The new URL immediately becomes canonical.

## Deployment / Environment Variables

- **Vercel Domains API Dependencies**: Completely removed. The platform natively functions on `.vercel.app` out-of-the-box.
- **Middleware Changes**: The overly complex `middleware.ts` host-rewriting router has been fully deleted since multi-tenant routing is no longer necessary. All requests flow natively through the Next.js App Router.
