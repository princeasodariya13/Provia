# 21 - Portfolio Publishing & Deployment Hardening Specification

## 1. Objective
Harden the publication lifecycle so that drafting and publishing are strictly isolated, idempotent, and atomic. A user can freely edit and create new `PortfolioDocument` versions (drafts) without silently overwriting their live public URL. The live URL `/p/[slug]` is solely bound to explicit publication events.

## 2. Architecture & Lifecycle
- **Private Draft vs Active Publication**: Creating a new version through the editor points to the database, but does not alter `PortfolioPublication`. 
- **Publishing (Atomic Switching)**:
  - Validates ownership of the `PortfolioDocument`.
  - Transactionally upserts the user's `PortfolioPublication` to point at the target document.
  - Generates a deterministic slug (if new) resolving collisions.
  - Invokes Next.js `revalidatePath('/p/[slug]')` to instantly invalidate any CDN/cache layer ensuring correct rendering.
- **Unpublishing**:
  - Sets `isActive = false` on the `PortfolioPublication`.
  - Revalidates the path, ensuring the public route returns 404 cleanly.
  - History remains intact.

## 3. SEO & Cache
- The public route leverages Next.js `generateMetadata` properly referencing the dynamically published document without bleeding database secrets.
- Revalidation handles stale data.

## 4. UI/UX
- Explicit distinction between "Latest Version" and "Published Version" within the dashboard.
- Prompting for user confirmation before overriding an active publication with a newer draft.
