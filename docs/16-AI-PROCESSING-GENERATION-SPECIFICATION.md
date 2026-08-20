# 16 - AI Processing & Generation Specification

## 1. Objective
Establish a secure, provider-agnostic AI processing foundation. It consumes the effective professional profile (from Step 15) and produces a validated, structured `ProfessionalAnalysis` which will seed future portfolio generation.

## 2. Scope
- Provider abstraction (interface `AIProvider`).
- Gemini integration via `@google/generative-ai`.
- Strict input sanitization of the effective profile.
- Versioned prompts (`profile-analysis-v1`).
- Zod validation of structured JSON output.
- `AIGeneration` database model to track the generation lifecycle.

## 3. Non-goals
- Full portfolio generation.
- Vector databases, embeddings, or RAG.
- Exposing API keys to the frontend.
- Fallbacks to multiple providers.

## 4. AI Architecture
- **AIProvider Interface**: Abstraction requiring `generate(prompt, schema)`.
- **AIService**: Orchestrates fetching user profile, input sanitization, provider execution, validation, DB updates.
- **Provider Implementation**: `GeminiProvider`.

## 5. Environment Configuration
- `GEMINI_API_KEY`: Secrets, kept out of `NEXT_PUBLIC`.
- `AI_MODEL`: Defaults to `gemini-2.5-flash`.

## 6. Input Sanitization
Only essential fields are passed to the AI:
- `fullName`, `headline`, `bio`.
- Arrays: `experiences`, `education`, `skills`, `projects`.
- Internal IDs, OAuth tokens, connection states, and raw provider snapshots are rigorously omitted.
- Text is sanitized by truncating overly long fields to prevent token exhaustion.

## 7. Prompt Architecture
Located at `lib/ai/prompts/profile-analysis-v1.ts`. Distinguishes system instructions clearly from user data to mitigate prompt injection.

## 8. Structured Output
Expected output `ProfessionalAnalysis`:
- `professionalSummary` (string)
- `strengths` (string array)
- `technicalSkills` (string array)
- `experienceHighlights` (string array)
- `projectHighlights` (string array)
- `careerThemes` (string array)

## 9. Generation Lifecycle
Mapped in `AIGenerationStatus`: `PENDING -> PROCESSING -> COMPLETED/FAILED`.

## 10. Database Changes
New Model: `AIGeneration`. Tracks `provider`, `model`, `status`, `result` (validated JSON), and `usage`.

## 11. Security & Ownership
`requireAuth()` enforces generation ownership. A user cannot trigger or view generations for another user.

## 12. Explicitly Deferred
Portfolio templates, PDF generation, AI chatbots, embeddings.
