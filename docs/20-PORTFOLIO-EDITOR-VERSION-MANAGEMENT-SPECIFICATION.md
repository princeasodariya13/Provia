# 20 - Portfolio Editor & Version Management Foundation

## 1. Objective
Establish an authenticated editor allowing users to safely modify the generated `PortfolioDocument` content without rewriting history or mutating their canonical professional profile.

## 2. Architecture
- **Immutability**: `PortfolioDocument` versions are immutable snapshots. Editing and saving creates a NEW version (e.g., v1 -> v2).
- **Versioning**: Uses a unique `[userId, version]` compound index on `PortfolioDocument` to ensure sequential and collision-resistant historical tracking.
- **Publication Safety**: Creating a new version does not automatically publish it. The public URL `/p/[slug]` continues pointing to the currently active publication until the user explicitly publishes the new draft.
- **Validation**: Reuses `portfolioDocumentSchema` to rigorously parse and validate incoming editor payloads.

## 3. Scope
- List all versions via `GET /api/v1/portfolio/versions`.
- Save new version via `POST /api/v1/portfolio/versions`.
- Authenticated editor UI at `/portfolio/[id]/edit` strictly applying Provia geometric design.
- Protected from arbitrary HTML/CSS injections by relying on the native template renderer safely escaping React nodes.

## 4. Non-Goals
Real-time collaboration, auto-save mechanisms, branching/merging features, and full WYSIWYG rich text block editors are deferred.

## 5. Security & IDOR
All endpoints verify `userId: currentUser.id`. Users cannot create versions originating from or pointing to another user's documents.
