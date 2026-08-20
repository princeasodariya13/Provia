# STEP 11 — UI/UX Design Foundation + Design System
## Self-Contained Claude Prompt (Requirement Document)

You are creating the UI/UX Design Foundation specification for a large, production-grade web application.

**IMPORTANT:**
This is a documentation/specification task ONLY.

- DO NOT write application code.
- DO NOT create React components.
- DO NOT create Next.js files.
- DO NOT create CSS files.
- DO NOT implement the UI.

Your ONLY output must be:

**STEP-11-UI-UX-DESIGN-SPECIFICATION.md**

Do not ask for previous documents. The context below is a condensed representation of the previous project documentation and must be treated as the source of truth.

---

## 1. Project Overview

The project is a production-grade AI-powered portfolio generation platform.

The core idea:

1. A user visits the website and understands what the product does.
2. The user registers/logs in.
3. The user provides/connects their GitHub and LinkedIn accounts/URLs through supported and permitted integration mechanisms.
4. The platform collects the available professional information.
5. The system processes and normalizes the information.
6. The system creates a unified professional profile.
7. AI can use the normalized information to generate professional portfolio content.
8. The user can review/edit the generated information.
9. The user selects a portfolio template.
10. The portfolio is generated automatically.
11. The user can customize the portfolio.
12. The user can preview it.
13. The user can publish it.
14. The user receives a shareable portfolio URL.
15. Other people can open the public portfolio.

The final product should feel like a serious commercial SaaS/product, not a small student project and not an obvious AI-generated website.

---

## 2. Product Vision

The application combines two major experiences:

- **A.** A professional SaaS/product experience
- **B.** A high-quality professional portfolio experience

The product UI should feel like a real company built a polished commercial product around portfolio automation.

The generated portfolios themselves should be detailed, professional, and capable of presenting substantial professional information.

The platform should eventually support multiple portfolio templates.

**IMPORTANT:** Do NOT design or implement the final portfolio templates yet. The template system will be implemented later after suitable templates are selected. Step 11 must establish the design system and UI foundation that future templates and application screens will use.

---

## 3. Primary Design References

The following websites are visual/product-quality references.

**Reference 1:** `https://school-iq.vercel.app/`

Use this as inspiration for:
- SaaS/product presentation
- Dashboard hierarchy
- Navigation
- Information architecture
- Information density
- Product sections
- Cards
- Tables
- Dashboard organization
- Commercial product polish
- Clear visual hierarchy

**Reference 2:** `https://krishil-agrawal.vercel.app/`

Use this as inspiration for:
- Professional portfolio presentation
- Typography
- Personal branding
- Long-form portfolio structure
- Experience presentation
- Project presentation
- Skills
- Education
- Certifications
- Professional storytelling
- Detailed information presentation

**CRITICAL:**
- These websites are REFERENCES ONLY.
- DO NOT clone them.
- DO NOT reproduce their exact layouts.
- DO NOT copy their branding.
- DO NOT copy their colors.
- DO NOT copy their assets.
- DO NOT copy their content.
- DO NOT create a visual duplicate.

Instead, analyze the qualities that make them feel professionally designed and create an ORIGINAL design language for this product.

---

## 4. Most Important Visual Requirement

**The website MUST NOT LOOK AI-GENERATED.**

Avoid generic AI-generated website patterns. Do NOT automatically use:

- Excessive purple gradients
- Neon colors
- Excessive glassmorphism
- Glowing borders
- Excessive blur effects
- Random gradient blobs
- Excessive rounded cards
- Every section inside a card
- Giant oversized headings everywhere
- Excessive floating elements
- Random decorative shapes
- Unnecessary animations
- Excessive shadows
- Generic SaaS illustrations
- Repetitive 3-column card grids
- Artificially huge whitespace
- Random icons
- Excessive pill-shaped UI
- "AI sparkle" visual language everywhere
- Generic dashboard layouts copied from AI UI generators
- Excessive dark-mode styling simply because it looks modern
- Fake statistics
- Fake testimonials
- Fake users
- Fake activity
- Fake GitHub data
- Fake LinkedIn data
- Lorem ipsum in production-facing UI

The design must look intentional. Every visual element should have a purpose. The interface should feel designed by an experienced product design team.

---

## 5. Overall Design Character

The visual language should be:

Premium · Professional · Clean · Modern · Sophisticated · Information-rich · Structured · Human · Trustworthy · Editorial where appropriate · Product-oriented · Developer-friendly · Professional enough for recruiters and businesses · Visually distinctive · Original

It should balance:

**Professional SaaS + Developer tooling + Premium portfolio presentation**

Avoid making it feel like:
- A generic AI startup landing page
- A generic admin template
- A generic developer portfolio
- A student project
- A template marketplace
- A flashy design experiment

---

## 6. Design Philosophy

Define a complete design philosophy. The specification must explain:

- Visual hierarchy
- Information hierarchy
- Content density
- Whitespace
- Alignment
- Grid usage
- Typography hierarchy
- Component consistency
- Interaction hierarchy
- Visual emphasis
- Progressive disclosure
- Accessibility
- Responsive behavior
- Motion principles

Design decisions must be justified. Do not simply list generic UI terms.

---

## 7. Brand Direction

The product name has NOT been finalized. Therefore: DO NOT invent a permanent brand name. Use `[PRODUCT NAME]` as a temporary placeholder where necessary.

The design system must be brand-flexible so the final name/logo can be introduced later without redesigning the application.

Define:
- Brand personality
- Visual personality
- Trust signals
- Professional tone
- Product tone
- Portfolio tone

---

## 8. Color System

Create a professional color system. Define:

Primary · Secondary · Accent · Background · Surface · Elevated surface · Border · Text primary · Text secondary · Muted text · Success · Warning · Error · Info · Focus state · Disabled state

Do NOT force a generic purple/blue AI palette.

The colors should be restrained and professional.

Explain:
- Where colors should be used
- Where colors should NOT be used
- Contrast requirements
- Dark/light considerations
- Semantic colors
- Interactive states

The final color values may be defined as design tokens/placeholders, but the rationale must be clear.

---

## 9. Typography

Define a complete typography system, including: font strategy, display typography, H1–H4, body, small text, labels, captions, navigation, buttons, data/table typography, code/developer content typography where appropriate.

Define: font sizes, weight, line height, letter spacing, responsive behavior.

Typography should feel premium and intentional. Avoid excessive oversized typography.

---

## 10. Spacing System

Define: base spacing scale, section spacing, component spacing, card padding, form spacing, dashboard spacing, mobile spacing, desktop spacing.

Use a consistent spacing system. Do not allow every page to invent its own spacing.

---

## 11. Grid and Layout System

Define: desktop grid, tablet grid, mobile grid, max content width, page gutters, section widths, dashboard content width, sidebar width principles, header height principles, container behavior.

Explain how layouts should adapt across screen sizes.

---

## 12. Border Radius

Define a restrained radius system. Do not make every element extremely rounded.

Differentiate: small controls, inputs, buttons, cards, modals, large surfaces.

Explain when sharp/subtle corners are preferable.

---

## 13. Shadows and Depth

Define a restrained elevation system. Avoid excessive shadows.

Define: flat, subtle, elevated, modal, popover.

Explain when elevation should be used.

---

## 14. Iconography

Define icon rules, including: icon style, stroke/fill consistency, sizes, alignment, button icons, navigation icons, empty-state icons, status icons.

Do not use random icon styles.

---

## 15. Button System

Define: primary, secondary, tertiary, ghost, destructive, link, icon button.

For each define: purpose, hierarchy, states, size, spacing, loading state, disabled state, hover, focus, active.

Avoid making every action a primary button.

---

## 16. Form System

Define: input, textarea, select, search, checkbox, radio, switch, file input, URL input, password input, validation states.

Define: labels, helper text, error messages, success messages, required indicators, focus states, disabled states, loading states.

Forms must feel professional and easy to understand.

---

## 17. Card System

Cards should NOT be the default container for everything.

Define when to use: cards, flat sections, dividers, tables, lists, panels, full-width sections.

Create a hierarchy of surfaces. Avoid the "everything is a rounded card" AI-generated look.

---

## 18. Navigation

Define the application navigation. The authenticated product should support a professional application shell.

Potential navigation: Overview, Profile, GitHub, LinkedIn, Sources, AI Generation, Portfolio, Templates, Editor, Analytics, Settings.

Final navigation may be refined later.

Define: sidebar, top navigation, breadcrumbs where useful, mobile navigation, active state, collapsed state, user menu, notifications where required.

Do not overcrowd navigation.

---

## 19. Landing Page Direction

Define the landing page structure.

Potential sections: Navigation, Hero, Product explanation, Product visual/demo, How it works, GitHub + LinkedIn workflow, Automatic portfolio generation, Portfolio examples, Feature explanation, Benefits, Trust/product credibility, FAQ, CTA, Footer.

Do not force every section into the final page.

The specification must explain: what each section communicates, visual hierarchy, CTA hierarchy, content density, product screenshots/mockups, animation principles, responsive behavior.

The landing page must feel like a real commercial product website.

---

## 20. Authentication UI

Define the UI direction for: login, register, forgot password, reset password, email verification, session expiration, logout, authentication errors, loading states.

Authentication pages should feel part of the same product. Do not make them generic auth templates.

---

## 21. Onboarding Experience

Define the first-time user flow visually.

Potential: Welcome → Basic profile → Connect GitHub → Connect LinkedIn → Data import → Review information → Generate portfolio → Preview → Customize → Publish.

Define: progress indicator, step hierarchy, skip options where appropriate, loading states, error recovery, empty states, success states.

The onboarding must not overwhelm the user.

---

## 22. Dashboard UI

Define the authenticated dashboard. It should have a professional SaaS dashboard feel inspired by the organizational quality of the SchoolIQ reference.

Potential dashboard information: portfolio status, profile completeness, GitHub connection, LinkedIn connection, last synchronization, AI generation status, portfolio status, recent activity, quick actions, completion recommendations.

Do not use fake statistics. The UI must be designed around real data states.

---

## 23. Data States

Every important screen must define: loading, empty, partial, success, error, retry, offline where applicable, permission denied, not found, expired session, processing, completed, failed.

Do not only design the "perfect data loaded" state.

---

## 24. GitHub UI

Define the interface for: connect GitHub, connected state, syncing, sync completed, sync failed, repository overview, profile information, contributions where available, languages, projects, import/review data.

Do not invent data. The UI should gracefully handle users with: many repositories, few repositories, no public repositories, limited available information.

---

## 25. LinkedIn UI

Define the interface for: LinkedIn connection, connection state, importing, imported data, sync status, missing data, permission limitations, errors.

Do not promise data that the official API cannot provide. The UI should clearly communicate what was successfully imported.

---

## 26. Profile Review UI

The user must be able to review the unified professional profile before portfolio generation.

Define UI for: personal information, summary, experience, education, skills, projects, certifications, achievements, social links, additional professional information.

Where data comes from multiple sources, show source attribution appropriately. Provide a clear way to resolve conflicts.

---

## 27. AI Generation Experience

Define the UI for AI generation. It must NOT look like a generic chatbot. The AI experience should feel like a professional productivity tool.

Define: generate, processing, progress, completed, failed, regenerate, regenerate section, review, accept, edit, retry.

Do not use excessive AI-themed visual effects.

---

## 28. Portfolio Builder Experience

Define the future portfolio builder UI. It should eventually support: portfolio preview, sections, section ordering, visibility, content editing, theme, template, typography, colors, social links, SEO, publish settings.

The builder should feel powerful without becoming confusing.

---

## 29. Portfolio Template System

**IMPORTANT:** DO NOT IMPLEMENT FINAL TEMPLATES IN STEP 11. Only define the UI/UX requirements that future templates must follow.

Templates must eventually support: different visual identities, different layouts, different content densities, different professional styles, responsive behavior, accessibility, real user data, optional sections.

The portfolio engine should remain separate from template presentation.

---

## 30. Generated Portfolio Quality

The generated portfolio should be capable of being detailed and substantial.

Possible sections: Hero, About, Experience, Education, Projects, Skills, Certifications, Achievements, GitHub, Writing, Social links, Contact, Additional professional sections.

Sections should be based on available user information. Never show empty sections unnecessarily. The UI should dynamically adapt to the user's data.

---

## 31. Public Portfolio

Define the UX requirements for public portfolios. The public portfolio should feel independent and premium. It should not look like an admin dashboard.

Define: public navigation, hero, content hierarchy, social links, projects, experience, skills, contact, footer, responsive behavior, SEO considerations, share behavior.

---

## 32. Admin UI

The future admin dashboard should use the same design system but have a distinct operational purpose.

Potential sections: Overview, Users, Portfolios, AI jobs, Sync jobs, Integrations, Errors, Audit logs, Analytics, System health.

The admin interface should prioritize: information density, search, filters, tables, status indicators, logs, diagnostics.

Do not design it like a consumer-facing page.

---

## 33. Tables

Define professional table behavior, including: header, row, hover, selection where appropriate, pagination, sorting, filtering, empty state, loading, error, mobile behavior.

Do not force tables onto mobile when they become unusable.

---

## 34. Modals / Drawers

Define: modal, confirmation dialog, drawer, popover, tooltip.

Rules should prevent overuse. Important actions such as delete, disconnect, unpublish, etc. should have appropriate confirmation patterns.

---

## 35. Notifications

Define: toast, inline notification, banner, alert, success, warning, error, informational messages.

Do not use toasts for information that requires persistent visibility.

---

## 36. Search

Define search UX where appropriate, including: search field, keyboard behavior, empty results, loading, filters, clear search, responsive behavior.

---

## 37. Responsive Design

Define responsive behavior for: desktop, laptop, tablet, mobile.

Do not simply shrink desktop layouts. Define how: sidebar transforms, navigation changes, cards reflow, tables transform, forms stack, portfolio sections adapt, editor behaves, typography scales.

---

## 38. Accessibility

The design system must support accessible implementation.

Define requirements for: keyboard navigation, focus visibility, color contrast, semantic hierarchy, form labels, error messaging, screen readers, reduced motion, touch targets, accessible dialogs, accessible navigation.

Target WCAG 2.2 AA principles where practical.

---

## 39. Motion and Animation

Motion must be subtle and purposeful.

Allowed examples: page transitions, hover feedback, loading transitions, progress transitions, expand/collapse, toast entrance, modal transitions.

Avoid: constant floating animations, excessive parallax, continuous decorative motion, large distracting transitions, animation simply to make the site look "AI".

Define duration and easing principles.

---

## 40. Micro-interactions

Define subtle feedback for: buttons, inputs, navigation, copy actions, save, sync, generate, publish, delete, connection status.

Every interaction should communicate state clearly.

---

## 41. Professional Content Style

The UI content should use: clear language, professional terminology, concise labels, helpful descriptions, human-readable errors, no exaggerated marketing language, no fake claims.

Avoid generic copy such as "Supercharge your career with AI magic!" unless deliberately rewritten into a credible product voice.

---

## 42. Design System Component Inventory

Create a complete component inventory.

**Foundation:** Typography, Colors, Spacing, Grid, Icons, Motion

**Actions:** Buttons, Icon buttons, Links

**Forms:** Inputs, Select, Checkbox, Radio, Switch, Textarea, Search

**Feedback:** Toast, Alert, Banner, Progress, Skeleton, Spinner

**Layout:** Container, Stack, Grid, Section, Sidebar, Header, Footer

**Data:** Card, Table, List, Badge, Status, Avatar

**Overlay:** Modal, Drawer, Popover, Tooltip, Dropdown

**Navigation:** Tabs, Breadcrumb, Sidebar navigation, Pagination

Define usage rules for each.

---

## 43. Design Tokens

Create a token architecture for: colors, typography, spacing, radius, shadows, breakpoints, z-index, motion.

Use semantic tokens rather than hardcoding every component independently.

---

## 44. Design Consistency Rules

Define strict rules preventing: random spacing, random colors, random radius, random typography, inconsistent buttons, inconsistent cards, inconsistent icon sizes, different loading patterns, different error patterns, different navigation patterns.

All future screens must use the established design system.

---

## 45. Performance-Aware UI

The design must consider: image optimization, lazy loading, skeleton states, progressive rendering, avoiding unnecessary animation, avoiding massive client-side UI bundles, responsive images, efficient portfolio rendering.

Do not sacrifice performance for visual effects.

---

## 46. SEO-Aware UI

Define UX considerations for: landing page metadata, public portfolio metadata, Open Graph, social previews, semantic headings, accessible links, public portfolio URLs.

---

## 47. Security-Aware UI

UI must never assume that frontend restrictions equal security.

Sensitive actions should have: confirmation, clear consequences, appropriate authorization states.

Never display: OAuth secrets, password hashes, internal tokens, sensitive system information.

---

## 48. Design Anti-Patterns

Create a detailed "DO NOT DO THIS" section. Explicitly prohibit:

- Generic AI landing pages
- Excessive gradients
- Excessive glassmorphism
- Excessive rounded cards
- Random blobs
- Neon/glowing UI
- Fake metrics
- Fake testimonials
- Fake users
- Fake data
- Excessive animations
- Copying reference websites
- Generic dashboard templates
- Inconsistent components
- Overly sparse pages
- Overly dense unreadable pages
- Poor mobile layouts
- Inaccessible forms
- Decorative UI without purpose

---

## 49. Reference Analysis

Analyze the two supplied references conceptually.

**For SchoolIQ, identify:**
- What works visually
- What works structurally
- What makes it feel like a product
- What information hierarchy is useful
- What should be adapted
- What should NOT be copied

**For Krishil Agrawal, identify:**
- What works visually
- What makes the portfolio feel substantial
- How professional information is presented
- What should be adapted
- What should NOT be copied

Then define the original design direction for this project.

---

## 50. Page/Surface Inventory

Create a complete future UI inventory.

**Public:** Landing, Login, Register, Forgot password, Reset password, Verification, Public portfolio, Error pages

**Authenticated:** Dashboard, Onboarding, Profile, GitHub, LinkedIn, Sources, Sync, AI generation, Portfolio, Templates, Editor, Preview, Publish, Analytics, Settings

**Admin:** Admin dashboard, Users, Portfolios, Jobs, Sync, Errors, Logs, Analytics, System health

Do not implement these pages now. Define their UI/UX direction so later development remains consistent.

---

## 51. UI Implementation Readiness

The final document must be detailed enough that another developer/tool can implement the UI without making major visual decisions independently.

For major surfaces define: purpose, user goal, layout, hierarchy, components, states, responsive behavior, accessibility, interaction behavior.

---

## 52. Step 11 Implementation Boundary

**Step 11 should establish:**
- Design system
- UI rules
- Visual language
- Application shell direction
- Landing page direction
- Core reusable component direction

**Step 11 must NOT implement:**
- GitHub integration
- LinkedIn integration
- AI generation
- Database logic
- Authentication backend
- Portfolio generation engine
- Final portfolio templates
- Publishing backend
- Admin backend
- Real external API integrations

Those will happen in later development steps.

---

## 53. Quality Standard

The final design must aim for: production quality, premium appearance, professional information architecture, original visual identity, consistent components, responsive behavior, accessibility, realistic content states, no fake data, no AI-generated visual clichés, scalable design system, easy future template integration.

---

## 54. Required Output

Create exactly one file: **STEP-11-UI-UX-DESIGN-SPECIFICATION.md**

The document must contain:

1. Executive Summary
2. Product Design Vision
3. Reference Analysis
4. Original Visual Direction
5. Design Principles
6. Brand Direction
7. Color System
8. Typography System
9. Spacing System
10. Grid System
11. Radius System
12. Elevation System
13. Iconography
14. Buttons
15. Forms
16. Cards
17. Navigation
18. Landing Page
19. Authentication UI
20. Onboarding
21. Dashboard
22. GitHub UI
23. LinkedIn UI
24. Profile Review
25. AI Generation UI
26. Portfolio Builder
27. Template Architecture UI Requirements
28. Public Portfolio
29. Admin UI
30. Tables
31. Modals and Drawers
32. Notifications
33. Search
34. Responsive Design
35. Accessibility
36. Motion
37. Micro-interactions
38. Content Style
39. Component Inventory
40. Design Tokens
41. Consistency Rules
42. Performance-aware UI
43. SEO-aware UI
44. Security-aware UI
45. Anti-patterns
46. Page Inventory
47. Implementation Guidelines
48. Step 11 Boundary
49. Quality Checklist
50. Future UI Roadmap

---

## 55. Final Quality Gate

Before producing the final document, verify:

- The design is original.
- The references are treated only as inspiration.
- The UI does not look AI-generated.
- The design is not overly flashy.
- The design is not overly minimal to the point of being empty.
- The application UI has professional SaaS information hierarchy.
- The portfolio experience supports detailed professional information.
- The system supports future 5–6+ templates.
- Templates are not prematurely implemented.
- The design system is reusable.
- Responsive behavior is defined.
- Accessibility is defined.
- Loading/empty/error states are defined.
- Real data states are considered.
- No fake data is required.
- Authentication UI is defined.
- Dashboard UI is defined.
- Integration UI is defined.
- AI UI is defined without excessive AI visual clichés.
- Public portfolio UI is defined.
- Admin UI is defined.
- Components are standardized.
- Design tokens are defined.
- Future developers can implement the UI without guessing major design decisions.

---

## Final Instruction

Generate ONLY: **STEP-11-UI-UX-DESIGN-SPECIFICATION.md**

- Do not generate code.
- Do not generate React components.
- Do not generate CSS.
- Do not generate HTML.
- Do not generate screenshots.
- Do not implement the website.
- Do not ask for previous documents.
- Do not ask to upload Steps 1–10.

Use the project context in this prompt as the source of truth.

The output must be a detailed, professional, implementation-ready UI/UX design specification for a large production-grade product.
