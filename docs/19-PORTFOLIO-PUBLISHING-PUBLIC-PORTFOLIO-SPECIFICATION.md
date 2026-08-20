# 19 - Portfolio Publishing & Public Portfolio Specification

## 1. Objective
Establish a secure, production-grade publishing system. Authenticated users can publish a specific version of their `PortfolioDocument` to a unique, stable public URL (`/p/[slug]`). This route safely renders the document using the template engine without exposing any internal metadata, credentials, or backend logic.

## 2. Architecture
- **Model**: Introduced `PortfolioPublication`. Links a single active `PortfolioDocument` to a user. Enforces 1 active publication per user.
- **Slug Generation**: Deterministic slugs generated from the user's name (e.g., `prince-asodariya`), gracefully handling collisions.
- **APIs**:
  - `POST /api/v1/portfolio/[id]/publish`: Authenticates, validates ownership, provisions/reuses slug, and points the publication record to the specified document ID.
  - `POST /api/v1/portfolio/[id]/unpublish`: Marks the publication as inactive.
- **Public Renderer**: `app/p/[slug]/page.tsx` resolves the slug. If the publication is active, it renders the associated `PortfolioDocument` using the `TemplateRegistry`. Unauthenticated visitors can view it. Private fields (internal IDs, OAuth states, logs) are explicitly isolated because the rendering layer only receives the validated JSON Document payload.

## 3. Core Principles
- **Separation of Concerns**: Generating a portfolio is internal. Publishing is explicit.
- **Immutability**: Publishing a document does not alter it. It merely shifts the active publication pointer to that version.
- **Security & IDOR**: Publishing requires strict ownership checks. The public renderer strips internal Prisma records, rendering strictly the Zod-validated `PortfolioDocumentDTO`.
- **Idempotency**: Publishing an already published document is safe.

## 4. Unpublish & Republish
Unpublishing removes public access (returns 404). Republishing defaults to the same stable slug.

## 5. Non-goals
Custom domains, visitor analytics, advanced SEO systems, and social sharing links are explicitly deferred to future steps.
