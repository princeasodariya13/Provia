# 15 - Professional Profile Data Management Specification

## 1. Objective
Establish a robust, user-owned Canonical Professional Profile architecture where imported data from integrations (Step 14) can be reviewed, manually overridden, and enriched by the user.

## 2. Scope
- Fully editable Professional Profile UI matching the Step 11 visual system.
- Relational schema for Experience, Education, Projects, Skills, Certifications, and Links.
- Differentiating Imported Data vs User Overrides to ensure safe re-syncing.
- Single atomic API endpoint for saving profile changes safely.
- Profile Completeness deterministic scoring.
- Comprehensive Zod validation and safe error handling.

## 3. Non-goals
- AI generation, AI rewriting, or embeddings.
- Portfolio templates or publishing.
- Scraping external data.
- Over-engineered distributed locking or concurrent CRDTs.

## 4. Profile Architecture
- **Canonical Profile (`ProfessionalProfile`)**: Stores scalar identity info (name, bio, location). Uses a JSON `userEdits` map to track which fields the user has manually overridden.
- **Relational Sections**: Collections of user's professional history.

## 5. Canonical Profile Model
Extended from Step 14 to include:
- `userEdits`: `Json` (e.g. `{ "headline": true }`).

## 6. User Ownership
- Strictly enforced via `requireAuth()`. Database filters explicitly require `userId: currentUser.id`.

## 7. Imported Data vs User Overrides
- When Step 14 normalization runs, it checks `userEdits[fieldName]`. If `true`, the imported value is ignored.
- For related records (e.g. Experience), each record tracks `source` (`GITHUB`, `LINKEDIN`, `MANUAL`), `externalId`, and `isManuallyEdited`.
- If an imported record is manually edited, `isManuallyEdited` becomes `true`, preventing subsequent syncs from fully replacing it.

## 8. Profile Sections
1. **Basic Info**: Name, Location, Website.
2. **Headline & Summary**: Free-form text fields.
3. **Experience**: `ProfessionalExperience` (title, company, dates, description).
4. **Education**: `ProfessionalEducation` (institution, degree, field, dates).
5. **Skills**: `ProfessionalSkill` (name). Deduplicated by name.
6. **Projects**: `ProfessionalProject` (name, desc, urls, tech).
7. **Certifications**: `ProfessionalCertification` (name, org, dates, credential info).
8. **Professional Links**: `ProfessionalLink` (title, url).

## 9. Validation
- Strictly executed by Zod in the API. 
- Date rules: `startDate` must be <= `endDate` unless `isCurrent` is true.
- URL rules: Validated with `z.string().url()`, explicitly blocking `javascript:` schemas via standard protocol constraints.

## 10. Profile Completeness
- A deterministic function `calculateCompleteness(profile)` returns `[0-100]`.
- Checks presence of name, headline, bio, and at least one item in experience, education, and skills.

## 11. API Contracts
- `GET /api/v1/profile` - Fetches the full profile including all relations.
- `PUT /api/v1/profile` - Performs a transactional Upsert/Replace for the entire profile (except external IDs and source attributions which are preserved).

## 12. Database Changes
Added models to `prisma/schema.prisma`:
- `ProfessionalExperience`
- `ProfessionalEducation`
- `ProfessionalSkill`
- `ProfessionalProject`
- `ProfessionalCertification`
- `ProfessionalLink`

## 13. Frontend Architecture
- Route: `/profile`.
- Reuses existing UI system (Button, Card, Input).
- Minimalist, warm off-white aesthetics.
- Loading: Skeleton states.
- Empty: Subtle "Add your first..." prompts.
- Save: Distinct save button with loading indicator.

## 14. Security
- Multi-user isolation through authenticated database queries.
- No client-controlled IDs are trusted for operations.

## 15. Deferred Features
- AI Generation.
- Background Jobs for massive data fetching.
