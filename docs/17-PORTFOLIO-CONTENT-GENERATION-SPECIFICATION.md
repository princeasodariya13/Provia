# 17 - Portfolio Content Generation Specification

## 1. Objective
Establish the Portfolio Content Generation Engine that securely transforms the user's Canonical Effective Profile and validated AI Professional Analysis into a strongly-typed, template-independent, factual `PortfolioDocument`.

## 2. Scope
- Definition of `PortfolioDocument` Zod schema.
- Database persistence via `PortfolioDocument` model (versioned).
- Deterministic extraction of factual data (experiences, education, skills).
- Optional AI refinement mapping from `ProfessionalAnalysis`.
- Idempotency and user-isolation.
- `/api/v1/portfolio/generate` endpoint.

## 3. Non-goals
- Portfolio templates, themes, styling, or CSS.
- Public URLs or publishing engine.
- Scraping new data.

## 4. Architecture
The architecture strictly enforces:
\`Effective Profile + AI Analysis => Deterministic Rules => PortfolioDocument\`.
The `PortfolioContentService` reads the latest canonical profile and the latest `COMPLETED` `AIGeneration`.

## 5. Source of Truth
Canonical data (Step 15) is the absolute factual source of truth. The engine never invents metrics, dates, roles, URLs, or certificates. The AI Analysis (Step 16) is purely interpretive (themes, strengths) and is used to enrich the `about` and `hero` sections deterministically.

## 6. Portfolio Document Schema
Includes structured segments:
- `metadata`: version, generatedAt
- `hero`: name, headline, short intro (derived from analysis)
- `about`: long form summary
- `experience`: factual array mapping
- `education`: factual array mapping
- `skills`: grouped skills based on analysis
- `projects`: factual projects + highlights
- `certifications`, `links`, `contact`

## 7. Versioning
Every generation creates a new `PortfolioDocument` record with an incrementing version number, preserving historical snapshots safely.

## 8. Generation Lifecycle
The generation operation is synchronous for deterministic mapping. If AI refinement is needed, it goes through `PENDING -> PROCESSING -> COMPLETED`. Since Step 16 already ran the Heavy AI analysis, Step 17 primarily uses deterministic mapping of the Step 15 + Step 16 data, making it fast and factual.

## 9. API Contracts
- `POST /api/v1/portfolio/generate`: Validates prerequisites (Profile + Analysis), constructs the document, validates via Zod, and persists it.
- `GET /api/v1/portfolio`: Fetches the user's latest portfolio document.

## 10. Security & Ownership
`requireAuth()` enforces that User A can only trigger generations from User A's profile and analysis, and can only read User A's documents. No client IDs are trusted.
