# Portfolio Studio 2.0 Specification

## Architecture
The Portfolio Studio replaces the basic portfolio view with a professional, full-screen editing workspace. It acts as the primary presentation layer over canonical user data. The architecture consists of a `StudioShell`, `StudioSidebar` (for navigation), `StudioPreview` (for live responsive rendering), and `StudioInspector` (for property editing). 

## API Contracts
- `GET /api/v1/portfolio/studio`: Fetches the active draft portfolio, latest versions, and publication status.
- `POST /api/v1/portfolio/studio`: Saves changes. If the current version is already published, a new DRAFT version is created automatically. Otherwise, it updates the existing draft.
- `POST /api/v1/portfolio/versions/:id/restore`: Creates a new DRAFT version populated with the contents of the historical version.
- `POST /api/v1/portfolio/:id/publish`: Upserts publication status and ensures the 32-character `publicCode` is generated and returned securely.

## Database Changes
No new tables were introduced, adhering to the requirement to extend the existing architecture. `PortfolioDocumentDTO` schema in Zod was enhanced to include a `configuration` and `seo` object, which is safely serialized into the existing `content` JSON column of `PortfolioDocument`.

## Versioning & Concurrency
Versioning relies on the `PortfolioDocument` table, which serves as both the document storage and version history table. Autosave is debounced (2s). If a user attempts to edit a portfolio that was already published, the API gracefully forks it into a new version to prevent mutating live data. 

## Publishing & Public URL
Publishing relies on the existing `PortfolioPublication` table and securely validates ownership. It generates a cryptographic `publicCode` and preserves the Canonical URL `/{username}/{publicCode}` exactly as specified in Step 39.

## Editor State & Live Preview
The editor state lives entirely within `PortfolioStudioPage` using React's `useState`. The `StudioPreview` mounts the actual Next.js template components (`editorial-v1`, etc.) feeding them the real-time debounced draft state, allowing immediate 1:1 previews across Desktop, Tablet, and Mobile simulated viewports without round-tripping to the server.

## Security & Isolation
All APIs check `requireAuth()` and enforce `userId === user.id` during operations to prevent IDOR attacks. XSS is mitigated since templates render React components (which auto-escape HTML) and do not use `dangerouslySetInnerHTML` for the standard text fields.
