# 22 - Public Portfolio Experience & Sharing Hardening Specification

## 1. Objective
Enhance the public portfolio experience (`/p/[slug]`) to be production-ready. This includes adding a cohesive public sharing functionality, fully implementing SEO and Open Graph metadata tied to a canonical URL, and hardening the UI/link validation without altering the underlying immutable generation pipeline.

## 2. Public Rendering Boundary
- **No Internal Exposure**: The route strictly resolves the slug, asserts `isActive`, and maps the payload to `PortfolioDocumentDTO`. It never exposes OAuth tokens, database IDs, AI metadata, or private contact records.
- **Error States**: `notFound()` acts as the impenetrable boundary for non-existent, unpublished, or invalid slug requests. Stack traces are never exposed to the public.

## 3. SEO & Metadata Strategy
- **Environment Context**: Introduced `NEXT_PUBLIC_APP_URL` to establish absolute, canonical URLs for Open Graph integrations.
- **Dynamic Metadata**: Next.js `generateMetadata` constructs tailored `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:url`, and `og:type` directly mapped from the public document's validated Hero content. Fallbacks are safely generated if specific properties are missing.
- **Indexing**: Publicly active portfolios remain indexable. Unpublished documents disappear entirely behind the 404 boundary (intrinsically handled by search crawlers).

## 4. Public Sharing UX
- **Component**: Introduced a minimalist, client-side `<ShareButton>` layered gracefully onto the public layout (floating or inline) fitting the strict geometric design system.
- **Fallback Hierarchy**: Tries native `navigator.share` on supported devices, seamlessly falling back to `navigator.clipboard.writeText` with momentary visual "Copied" feedback. Gracefully ignores failure gracefully if neither is available.

## 5. Security & Links
- External anchors enforcing strict `target="_blank"` are coupled with `rel="noopener noreferrer"`.
- URL schemes are restricted (or sanitized) avoiding `javascript:` injections. Arbitrary HTML remains blocked; data flows through strictly typed React components (never `dangerouslySetInnerHTML`).

## 6. Performance
- Rendering remains primarily Server Components to minimize client JavaScript bloat. Only the micro-interaction of sharing requires client hydration.
- The route remains securely tied to the `revalidatePath` hooks created in Step 21, ensuring high CDN cache-ability and immediate invalidation on state changes.
