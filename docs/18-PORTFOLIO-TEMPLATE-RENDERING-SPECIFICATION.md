# 18 - Portfolio Template & Rendering Engine Specification

## 1. Objective
Establish the presentation layer for `PortfolioDocument`. This engine separates content (from Step 17) and presentation into a clean, reusable architecture using a Template Registry.

## 2. Scope
- Template Definition and Registry (`editorial-v1`).
- Template Component Abstraction.
- Responsive, Accessible Editorial Template implementation.
- Template assignment per `PortfolioDocument`.
- Authenticated Preview route.

## 3. Non-goals
- Public publishing or URLs.
- Visual drag-and-drop template editors.
- DB calls inside presentation templates.

## 4. Architecture
`PortfolioDocument` → `TemplateRegistry` → `TemplateComponent` → React UI.
Templates strictly consume a validated `PortfolioDocument` as a pure prop. They cannot mutate the document or perform external side effects.

## 5. Template Registry
A central registry (`lib/portfolio/templates/registry.ts`) holding metadata (id, name, version, supportedSections) and dynamically importing the Template Component.

## 6. First Template: Editorial-v1
A premium, editorial-style layout using Provia's geometric visual language, strong typography, off-whites, and controlled red accents. Uses safe semantic HTML and responsive flex/grid layouts without arbitrary Tailwind injections.

## 7. Security & Privacy
Preview is limited to the authenticated user via server-side checks. URLs and data are treated as untrusted and safely escaped by standard React rendering. `dangerouslySetInnerHTML` is strictly prohibited.

## 8. Extensibility
Future templates are added by creating a new folder in `lib/portfolio/templates/`, conforming to `TemplateComponent` and registering it in `registry.ts`.
