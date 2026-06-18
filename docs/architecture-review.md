# Architecture Review — Peak Tracker UK

> Status: Draft — awaiting approval before any application code is written.

---

## 1. Overview

Peak Tracker UK is a generic, offline-first Progressive Web Application (PWA) for tracking progress across UK hill and mountain lists. The platform is designed to support any UK hill list without code changes — Wainwrights and Munros are the initial datasets, with Corbetts, Grahams, Nuttalls, Hewitts, Marilyns, and Donalds as planned additions.

The application must work fully offline, be installable on mobile devices, and synchronise progress with a server when connectivity is restored.

---

## 2. Technology Decisions and Rationale

### 2.1 Next.js 16 (App Router)

**Decision:** Next.js 16 with the App Router and Server Components by default.

**Rationale:**

- Server Components reduce client-side JavaScript, improving performance on mobile devices.
- App Router enables fine-grained control over caching and data fetching via the new `use cache` directive and Partial Pre-rendering (PPR).
- Turbopack (default in v16) provides significantly faster local development builds.
- File-based routing with nested layouts suits the application's page hierarchy (`/`, `/peak-lists/[slug]`, auth pages).

**Trade-offs:**

- Next.js 16 is a relatively new major version; community resources and third-party compatibility are still maturing.
- `middleware.ts` has been removed — all routing and auth middleware must use `proxy.ts`. This is a breaking change from Next.js 15 that affects Clerk integration.

**Mitigation:** Verify Clerk documentation explicitly for Next.js 16 / `proxy.ts` compatibility before implementing Milestone 2.

**Practical use of `use cache`:**

- Peak list data fetched server-side uses `use cache` with a short TTL — list metadata changes infrequently.
- Computed statistics use `React.cache` scoped per request — they are cheap to recompute and must reflect the current user's progress.
- Auth-sensitive pages and progress data must never be cached at the page or component level.

---

### 2.2 React 19

**Decision:** React 19.

**Rationale:**

- Required by Next.js 16.
- Server Actions and improved Suspense primitives simplify data loading patterns.
- Compiler optimisations reduce the need for manual `useMemo` and `useCallback`.

---

### 2.3 TypeScript (Strict Mode)

**Decision:** TypeScript with `strict: true` and zero `any`.

**Rationale:**

- Catches entire classes of bugs at compile time.
- Essential for a long-lived, extensible platform that multiple contributors may work on.
- Zod schemas provide runtime safety at all external data boundaries, complementing TypeScript's compile-time guarantees.

---

### 2.4 Authentication — Clerk

**Decision:** Clerk for authentication with social login (Google, Apple, GitHub).

**Rationale:**

- Pre-built, accessible UI components eliminate the risk of shipping insecure auth flows.
- `userId` provided by Clerk flows directly into progress records in both MongoDB and Dexie.
- Free tier supports 10,000 monthly active users — sufficient for the initial launch.
- No custom session or token management required.

**Key constraint:** Clerk must be configured via `proxy.ts` in Next.js 16, not `middleware.ts` (which has been removed).

**Risk:** Clerk's Next.js 16 / `proxy.ts` integration must be explicitly verified before Milestone 2 begins. If Clerk does not yet support Next.js 16 `proxy.ts`, a compatible version or alternative approach must be evaluated.

---

### 2.5 Server State — TanStack Query

**Decision:** TanStack Query for all remote data fetching and cache management.

**Rationale:**

- Declarative, hook-based API reduces boilerplate.
- Built-in stale-while-revalidate, background refetching, and optimistic updates align with the offline-first sync model.
- All query keys are centralised in `src/lib/queryKeys.ts` — avoids cache key collisions and simplifies invalidation.

**Rules:**

- No raw `fetch` calls in components.
- Every query defines explicit `staleTime` and `gcTime`.
- Mutations invalidate relevant query keys on success.

---

### 2.6 Client State — Zustand

**Decision:** Zustand for ephemeral UI and application state.

**Rationale:**

- Minimal API with no boilerplate.
- Each concern is a separate slice (search, filters, sort, UI preferences, connectivity, sync state, progress state).
- Independently testable stores.
- `persist` middleware used only where explicitly specified.

**User preferences split — Zustand vs Dexie:**
Two layers handle persistence for different reasons:

- **Zustand `persist` (localStorage):** device-local UI state — theme, view mode (`list` | `map`), sidebar open/closed. These are fast, synchronous, and intentionally device-specific. They do not need to sync across devices.
- **Dexie (IndexedDB):** substantive user preferences — units (`metric` | `imperial`), display settings. These are slower to read but designed for future cross-device sync via the same sync engine that handles progress. They must go through the `UserPreferencesRepository`.

This boundary is non-negotiable. Zustand `persist` must never be used for preferences that need to sync.

---

### 2.7 Offline Storage — Dexie (IndexedDB)

**Decision:** Dexie as the IndexedDB abstraction layer.

**Rationale:**

- Clean, Promise-based API over the raw IndexedDB API.
- Built-in schema versioning and migrations.
- All Dexie access is behind a repository pattern — no direct table access in components or hooks.

**Three Dexie tables:**

| Table             | Repository                  | Purpose                                                         |
| ----------------- | --------------------------- | --------------------------------------------------------------- |
| `progress`        | `LocalProgressRepository`   | Peak completion records, `dirty` flag, sync timestamps          |
| `userPreferences` | `UserPreferencesRepository` | Units, display settings — designed for future cross-device sync |
| `syncMetadata`    | `SyncMetadataRepository`    | Last sync timestamp, pending change tracking                    |

**Key constraint:** The `dirty` flag lives in Dexie only and must never be persisted to MongoDB. It is a sync concern, not a domain concern.

---

### 2.8 Database — MongoDB

**Decision:** MongoDB with the database name `peakTracker`.

**Rationale:**

- Document model suits the peak and progress data shapes.
- Local development uses a local MongoDB instance; production uses Atlas. Toggle is via `MONGODB_URI` only — no code changes required.
- All MongoDB access is behind a repository pattern — no raw queries in route handlers or business logic.

**Collections:** `peakLists`, `peaks`, `progress`.

---

### 2.9 Validation — Zod

**Decision:** Zod for all external data boundaries.

**Rationale:**

- Runtime type safety at API responses, seed data ingestion, and form inputs.
- Integrates naturally with TypeScript — infer types from schemas.
- Seed scripts must validate every record against Zod schemas before insertion.

---

### 2.10 Styling — Tailwind CSS + shadcn/ui

**Decision:** Tailwind CSS v4 for utility-first styling; shadcn/ui for accessible, composable components.

**Rationale:**

- Tailwind's utility classes are well-suited to mobile-first, responsive design.
- shadcn/ui components are unstyled at their core and fully customisable — no vendor lock-in.
- Components are copied into the codebase, so upgrades are controlled and explicit.
- WCAG 2.1 AA accessibility is built into shadcn/ui's base components.

**Implementation note:** `create-next-app@16` installs Tailwind v4 by default (using `@tailwindcss/postcss` and `@import "tailwindcss"` in `globals.css`). This differs from Tailwind v3 — there is no `tailwind.config.js` in v4; configuration is done in CSS via `@theme`. shadcn/ui compatibility with Tailwind v4 must be verified before Milestone 2 (ticket #2).

---

### 2.11 Testing

**Decision:** Vitest (unit/integration), React Testing Library (component tests), Playwright (E2E).

**Rationale:**

- Vitest is fast and has native ESM support — ideal for a Next.js 16 project.
- React Testing Library encourages testing behaviour over implementation.
- Playwright covers cross-browser E2E scenarios including offline PWA behaviour.

**Quality gate:** ≥ 80% unit test coverage; all E2E tests passing; zero type errors; zero lint errors; production build passing.

---

### 2.12 PWA — next-pwa + Service Worker

**Decision:** next-pwa with a custom Service Worker.

**Rationale:**

- next-pwa integrates cleanly with Next.js and handles the Workbox configuration.
- Offline-first caching strategy (cache-first for static assets, network-first for API responses).
- Install prompt support for mobile home screen installation.

---

## 3. Architectural Patterns

### 3.1 Repository Pattern (Non-Negotiable)

All data access — MongoDB and Dexie — must go through repository interfaces. UI components, hooks, and route handlers never import from `mongodb.ts` or Dexie tables directly.

```
src/lib/db/                          ← MongoDB (concrete implementations)
├── mongodb.ts
└── repositories/
    ├── peak-list-repository.ts
    ├── peak-repository.ts
    └── progress-repository.ts

src/lib/constants/                   ← App-wide constants (slugs, limits, config values)

src/db/                              ← Dexie / IndexedDB (concrete implementations)
├── dexie.ts
├── schema.ts
└── repositories/
    ├── local-progress-repository.ts
    ├── user-preferences-repository.ts
    └── sync-metadata-repository.ts

src/features/peaks/repositories/     ← Repository interfaces (TypeScript only — no DB code)
```

### 3.2 Feature-Based Architecture

Related code is co-located in feature folders:

```
src/features/peaks/
├── components/     ← peak-specific UI components
├── hooks/          ← TanStack Query hooks and custom hooks
├── services/       ← server-side services (e.g. statistics service)
├── repositories/   ← repository interfaces only (not concrete implementations)
├── types/          ← feature-specific TypeScript types
└── utils/          ← pure utility functions
```

**Important distinction:** `src/features/peaks/repositories/` holds repository **interfaces** (TypeScript `interface` definitions). Concrete implementations live in:

- `src/lib/db/repositories/` — MongoDB implementations
- `src/db/repositories/` — Dexie implementations

This separation enables dependency injection and allows tests to swap implementations without touching feature code.

### 3.3 Server Components by Default

Client Components are used only where interactivity requires it (search input, filters, sort controls, progress toggles). Everything else is a Server Component.

### 3.4 Statistics Computed Server-Side

Derived statistics (total, completed, remaining, percentage, regional breakdown) are computed in a service layer on the server. They are never computed in repositories or client components.

The statistics service lives at `src/features/peaks/services/statistics.service.ts`. It accepts a list of peaks and a set of completed peak IDs and returns a `PeakListStatistics` object and a regional breakdown. It is a pure function — no database access, independently unit-testable.

---

### 3.5 Mobile-First Architecture

Mobile-first is Core Principle #2. In practice:

- All Tailwind CSS classes are written mobile-first — default styles target mobile viewports, breakpoints scale up
- The primary use case is a hiker in the field with poor or intermittent connectivity — the offline-first sync model is designed for this
- Server Components by default keeps the client-side JavaScript bundle lean, which is critical for slow mobile networks
- All pages must be tested at 375px (iPhone SE) before wider viewports are considered
- The PWA install prompt and Service Worker are designed to function as a native-like app on iOS and Android

---

### 3.6 Accessibility Architecture

Accessibility-first is Core Principle #3. WCAG 2.1 AA is the minimum bar:

- shadcn/ui provides accessible component foundations — custom overrides must not regress accessibility
- All interactive elements must be keyboard navigable and have visible focus indicators
- axe-core is integrated into the Playwright E2E suite — zero violations are required on every page before Milestone 6 closes
- Colour contrast ratios: ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- Skip-to-content links, landmark roles (`<main>`, `<nav>`, `<header>`), and ARIA labels on all interactive controls are required from the first UI ticket

---

### 3.7 Performance Considerations

The peak list page renders 282+ items with concurrent client-side search, filter, and sort:

- **Client-side filtering/sorting:** Applied in memory to the full peak collection. At 282 items this is acceptable without virtualisation. If future lists grow to thousands of peaks, TanStack Virtual can be introduced without architectural change — the repository and state layers require no modification.
- **Statistics computation:** Computed server-side once per request via `React.cache`. Not re-derived on every render.
- **Search debounce:** 300ms debounce on the search input prevents excessive re-renders per keystroke.
- **Bundle size:** Server Components by default keeps heavy computation server-side. Client Components are limited to interactive controls only.
- **Image loading:** Peak detail pages (future) should use Next.js `<Image>` with lazy loading. No impact on the initial list page.

---

### 3.8 Future Feature Extensibility

CLAUDE.md documents five future feature shapes the architecture must support without redesign:

| Feature      | Shape                                   | Architectural implication                                                            |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------------ |
| Notes        | `{ userId, peakId, notes: string }`     | New MongoDB collection + Dexie table + repository pair. No changes to existing code. |
| Walk History | `{ userId, peakId, completedAt: Date }` | Time-series data. New collection. May require pagination for prolific walkers.       |
| Photos       | `{ userId, peakId, imageUrl: string }`  | Object storage (S3/R2) for files; URL reference in MongoDB. New feature folder.      |
| Routes       | `{ userId, peakId, gpxFile: string }`   | File storage + GPX parsing service. New feature folder.                              |
| Achievements | Computed from progress data             | Server-side service only. No new storage required initially.                         |

All future features are `userId`-scoped and `peakId`-scoped — consistent with the existing pattern. Each will get its own feature folder (`src/features/<feature>/`), its own repository pair (MongoDB + Dexie), and its own sync behaviour. No changes to the peaks or progress layers are required.

---

## 4. Synchronisation Model

### Strategy: Snapshot Sync — Last Write Wins

Conflict resolution is based on `updatedAt` timestamp and `version` number.

**Explicitly excluded:**

- Event sourcing
- CQRS
- Operation queues
- Distributed locking

### Sync Workflow

1. User action → update Dexie immediately
2. Update UI optimistically
3. Mark local record as `dirty: true`
4. When online: push dirty records to server
5. Pull latest server state
6. Resolve conflicts (last write wins)
7. Mark `dirty: false`, update `lastSyncedAt`

---

## 5. Data Seeding

**Source:** Database of British and Irish Hills (DoBIH) — the canonical public reference for UK hill data.

All seed scripts must be:

- Idempotent (safe to run multiple times)
- Validated against Zod schemas before insertion
- Verified with `verify-seed.ts`

`verify-seed.ts` must confirm:

- 214 Wainwrights present
- 282 Munros present
- All slugs unique
- All heights valid (metres and feet)
- All coordinates present and valid
- All required fields present
- Exits with non-zero status on any failure

---

## 6. Risks and Mitigations

| Risk                                                             | Likelihood | Impact | Mitigation                                                                   |
| ---------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------- |
| Clerk does not yet fully support Next.js 16 `proxy.ts`           | Medium     | High   | Verify Clerk docs before Milestone 2. Evaluate alternative auth if needed.   |
| DoBIH data quality issues (missing coordinates, invalid heights) | Medium     | Medium | Zod validation in seed scripts; `verify-seed.ts` exits non-zero on failure.  |
| IndexedDB storage limits on mobile devices                       | Low        | Medium | Monitor storage usage; implement storage quota warnings.                     |
| Service Worker cache invalidation issues on PWA updates          | Medium     | Medium | Version the SW cache; implement update-on-reload strategy.                   |
| next-pwa compatibility with Next.js 16 / Turbopack               | Medium     | High   | Verify compatibility before Milestone 8; consider Serwist as an alternative. |
| `peakListSlug` rename requiring bulk peak updates                | Low        | Low    | Documented as a known limitation. Admin tooling can handle if needed.        |

---

## 7. Assumptions

1. **Auth is in scope via Clerk** — `userId` must be present on all progress records. Unauthenticated access to progress routes must be rejected.
2. **`dirty` flag is client-only** — lives in Dexie only; never stored in MongoDB.
3. **Statistics are computed server-side** — in a service layer, not in repositories or client components.
4. **`peakListSlug` as foreign key** — peaks reference their list by slug. Renaming a list would require updating all associated peaks. Known limitation.
5. **Last Write Wins conflict resolution** — based on `updatedAt` and `version`. No event sourcing, CQRS, or operation queues.
6. **API routes undefined in initial spec** — must be designed and approved before Milestone 7 begins.
7. **Data sourced from DoBIH** — fetched, cleaned, validated against Zod schemas, and used to produce idempotent seed scripts.
8. **Clerk + Next.js 16 `proxy.ts`** — compatibility must be confirmed before Milestone 2 begins.

---

## 8. Trade-offs

| Decision                        | Trade-off                                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapshot Sync (Last Write Wins) | Simple to implement; does not handle fine-grained conflict resolution. Acceptable for a progress-tracking use case where data loss risk is low. |
| `peakListSlug` as foreign key   | Simple joins; renaming a list requires updating all peaks. Documented known limitation.                                                         |
| shadcn/ui (copied components)   | Upgrades are manual and controlled. No automatic updates from upstream.                                                                         |
| Server Components by default    | Requires careful identification of Client Component boundaries. Increases developer discipline requirement.                                     |
| MongoDB (document model)        | No relational joins; any aggregation across collections requires application-layer assembly. Acceptable given the data shapes.                  |
| Dexie for IndexedDB             | Adds a dependency; however, raw IndexedDB API is too verbose and error-prone for production use.                                                |

---

## 9. Recommendations

1. **Verify Clerk + Next.js 16 `proxy.ts` compatibility before writing any auth code.** This is the highest-risk integration. If Clerk's documentation does not yet cover Next.js 16, consider pinning to Next.js 15 until it does, or evaluate Auth.js as an alternative.

2. **Design and approve API routes before Milestone 7.** The sync engine depends on well-defined contracts. Define and document API route shapes after Milestone 6 is complete.

3. **Establish CI from Milestone 1.** All quality gates (typecheck, lint, test, build) should run on every PR from the first commit. This prevents quality debt accumulating.

4. **Run `verify-seed.ts` as a CI step.** Seed integrity must be machine-verified, not manually checked.

5. **Use feature flags for PWA install prompt.** Controlled via `NEXT_PUBLIC_ENABLE_PWA` — allows disabling in development without code changes.

---

## 10. Approval Checklist

- [ ] Architecture review read and understood
- [ ] Technology stack approved
- [ ] Risks acknowledged
- [ ] Assumptions confirmed
- [ ] Recommendations noted
- [ ] **Explicit approval given to proceed to `docs/project-roadmap.md`**
