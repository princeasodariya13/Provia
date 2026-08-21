# 34 - Portfolio Analytics Specification

## 1. Purpose
This specification documents the implementation of the basic Portfolio Analytics dashboard for PROVIA. It provides authenticated users with a secure, aggregated view of their public portfolio traffic without exposing raw event data, tracking cookies, or compromising user privacy. 

## 2. Actual Existing Analytics Architecture
The project already utilizes an asynchronous `AnalyticsService` built on a Prisma `AnalyticsEvent` schema. The model efficiently indexes `userId`, `eventName`, and `createdAt`.

Prior to this step, `app/p/[slug]/page.tsx` was correctly emitting a `portfolio.public_viewed` event.

## 3. Events Used
- **`portfolio.public_viewed`**: This existing event is the source of truth for all public portfolio traffic.
- **Modification**: `app/p/[slug]/page.tsx` was updated to include the `userId` and `entityId` in the `AnalyticsService.record()` call. This allows the backend to perform highly efficient indexed database queries on `userId` rather than executing slow, expensive JSON-metadata lookups across the entire database.

## 4. Ownership & Isolation Model
- The API endpoint (`/api/v1/portfolio/analytics`) forces authentication via `requireAuth()`.
- **User Isolation**: All Prisma queries for events strictly filter by `where: { userId: user.id }`.
- **Result Scoping**: No client-supplied IDs are trusted. It is mathematically impossible for User A to retrieve User B's analytics, as the query is hard-bound to the session's JWT `id`.

## 5. API Contract
**GET `/api/v1/portfolio/analytics`**
Returns sanitized, aggregated analytics.

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalViews": 150,
      "publishedPortfolios": 1,
      "recentViews": 45
    },
    "trend": [
      {
        "date": "2026-08-20",
        "views": 5
      }
    ],
    "portfolios": [
      {
        "portfolioId": "clx...",
        "slug": "johndoe",
        "recentViews": 45
      }
    ]
  }
}
```

## 6. Metrics Available
- **Total Views:** All-time views across all portfolios owned by the user.
- **Recent Views:** Total views over the bounded 30-day window.
- **Active Publications:** Number of currently active portfolios.
- **Views Over Time (Trend):** A continuous 30-day timeline array, pre-filled with zero-days where no views occurred to ensure stable chart rendering.
- **Traffic Breakdown:** Views scoped to individual portfolio slugs over the last 30 days.

## 7. Metrics Intentionally Unavailable
- **Unique Visitors:** IP addresses and fingerprinting are actively stripped/not collected by `AnalyticsService`. Fabricating unique visitor counts without real data would be misleading.
- **Geographic/Device Data:** Not currently collected by the infrastructure.
- **Referrers:** Referrer tracking is highly unreliable without explicit client-side JS beacons, which PROVIA avoids to maintain maximal performance and privacy on the public portfolio.

## 8. Privacy & Security Rules
- No raw IP addresses, user-agent strings, or request IDs are returned to the client.
- The `AnalyticsEvent.metadata` is parsed safely server-side, extracting only the `slug` for the table.
- The API is rate-limited using the existing `RateLimiterService` to prevent query-exhaustion attacks.
- The public portfolio rendering (`app/p/[slug]/page.tsx`) uses a fire-and-forget promise for the analytics service, ensuring a database failure can never break the public page rendering.

## 9. Performance Approach
- **Bounded Queries:** The trend and breakdown aggregations strictly bound the database fetch to `createdAt: { gte: thirtyDaysAgo }`.
- **Query Optimization:** Prisma only `select`s the necessary fields (`id`, `createdAt`, `entityId`, `metadata`), dropping heavy fields if they exist.
- **Aggregation:** 30-day grouping is performed in memory. For an individual user's 30-day view window, this guarantees sub-millisecond aggregation while sidestepping complex raw SQL cross-database syntax.

## 10. User Interface (UI)
The feature is mounted at `app/(dashboard)/analytics/page.tsx`.
- Matches the existing Provia UI system (vibrant colors, stark shapes, Lucide icons).
- **CSS-Based Visualization:** Implements a dynamic vertical bar chart for the 30-day trend purely using HTML flexbox and percentage heights (`height: (views/max) * 100%`). This provides a beautiful visualization without introducing heavy dependencies like Recharts or Chart.js.
- Handles empty states natively if the user has no recent views.

## 11. Testing & Validation
- **Prisma Validate:** Passed. No schema migrations were required.
- **TypeScript:** Compiled cleanly without errors.
- **Build:** Completed successfully.
- **Rate Limiting:** Generic API rate-limit applied (`30 requests / 60 seconds`).

## 12. Deployment Requirements
- No database migrations required. The new feature relies entirely on the existing `AnalyticsEvent` schema.
