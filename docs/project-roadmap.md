# Project Roadmap — Peak Tracker UK

> Status: Draft — awaiting approval before any application code is written.

---

## Delivery Philosophy

- One ticket at a time. Explicit approval required between tickets.
- No code written until Phase 0 is complete and approved.
- All quality gates must pass before a milestone is closed.
- Branch from `develop`. PR to `develop`. Never commit directly to `main` or `develop`.

---

## Delivery Phases

The project is organised into five delivery phases. Each phase has a clear outcome and a defined set of milestones.

| Phase | Milestones | Outcome |
|---|---|---|
| **Phase 1 — Infrastructure** | M1, M2, M3 | Working project, auth, database with seeded data |
| **Phase 2 — Offline & State** | M4, M5 | Local persistence, state management, offline-first foundation |
| **Phase 3 — Core Product** | M6 | Full working UI — browse, search, filter, sort, toggle progress |
| **Phase 4 — Sync & PWA** | M7, M8 | Cloud sync, offline install, service worker |
| **Phase 5 — Quality** | M9 | 80% test coverage, full E2E suite, production-ready |

No phase may begin until the previous phase's milestones are fully closed and approved.

---

## Milestone Overview

| # | Milestone | Focus | Complexity |
|---|---|---|---|
| 1 | Foundation | Project setup, tooling, CI, environment config | Medium |
| 2 | Authentication | Clerk, proxy.ts, protected routes, userId | Medium |
| 3 | Database | MongoDB, repositories, seed scripts, data sourcing | High |
| 4 | Offline Architecture | Dexie, IndexedDB repositories, schema migrations | High |
| 5 | State Management | Zustand stores, TanStack Query setup | Medium |
| 6 | Core UI | Layout, navigation, search, filters, sorting, statistics | High |
| 7 | Synchronisation | API routes, sync engine, conflict resolution | High |
| 8 | PWA | Service worker, offline support, install prompt | Medium |
| 9 | Testing | 80% unit coverage, E2E suite passing | Medium |

---

## Milestone Dependencies

```
Milestone 1 (Foundation)
    └─► Milestone 2 (Auth)
            └─► Milestone 3 (Database)
                    └─► Milestone 4 (Offline)
                            └─► Milestone 5 (State)
                                    └─► Milestone 6 (Core UI)
                                            └─► Milestone 7 (Sync)
                                                    └─► Milestone 8 (PWA)
                                                            └─► Milestone 9 (Testing)
```

Each milestone is a hard prerequisite for the next. No milestone may begin until the previous one is closed and approved.

---

## Milestone 1 — Foundation

**Focus:** Project setup, tooling, CI, environment configuration.

**Goal:** A working Next.js 16 project with TypeScript strict mode, Tailwind, shadcn/ui, linting, type checking, and a CI pipeline that enforces all quality gates.

**Tickets:**
- `[Foundation]` Initialise Next.js 16 project with TypeScript strict mode
- `[Foundation]` Configure Tailwind CSS and shadcn/ui
- `[Foundation]` Configure ESLint and Prettier
- `[Foundation]` Set up `npm run typecheck`, `npm run lint`, `npm run build` scripts
- `[Foundation]` Create `.env.example` with all required environment variable keys
- `[Foundation]` Set up GitHub Actions CI pipeline (typecheck, lint, build on every PR)
- `[Foundation]` Create `develop` branch and branch protection rules
- `[Foundation]` Set up Vitest and React Testing Library
- `[Foundation]` Set up Playwright
- `[Foundation]` Set up logger (`src/lib/logger/`)

**Estimated tickets:** 10
**Complexity:** Medium
**Dependencies:** None

**Done when:**
- `npm run typecheck` — zero errors
- `npm run lint` — zero errors
- `npm run build` — passing
- CI pipeline runs and passes on a test PR

---

## Milestone 2 — Authentication

**Focus:** Clerk setup, `proxy.ts`, protected routes, `userId` integration.

**Pre-requisite check:** Before writing any auth code, verify Clerk's documentation for Next.js 16 / `proxy.ts` compatibility and confirm the integration pattern. Document findings.

**Goal:** Users can sign in with Google, Apple, or GitHub. All progress-related routes require authentication. `userId` is available server-side for use in repositories.

**Tickets:**
- `[Auth]` Verify Clerk + Next.js 16 `proxy.ts` compatibility — document findings
- `[Auth]` Install and configure Clerk
- `[Auth]` Implement `proxy.ts` for Clerk auth and route protection
- `[Auth]` Create `/sign-in` and `/sign-up` pages using Clerk hosted components
- `[Auth]` Protect progress-related routes — reject unauthenticated requests
- `[Auth]` Surface `userId` in server-side context for repository use

**Estimated tickets:** 6
**Complexity:** Medium
**Dependencies:** Milestone 1

**Done when:**
- Sign in / sign up flows work with Google, Apple, and GitHub
- Unauthenticated requests to progress routes return 401/redirect
- `userId` is available server-side

---

## Milestone 3 — Database

**Focus:** MongoDB setup, repository pattern, seed scripts, data sourcing from DoBIH.

**Goal:** MongoDB is connected, all collections have the correct indexes, and seed scripts populate the database with validated Wainwright and Munro data sourced from DoBIH.

**Tickets:**
- `[Database]` Set up MongoDB connection (toggle local/Atlas via `MONGODB_URI`)
- `[Database]` Implement `PeakListRepository`
- `[Database]` Implement `PeakRepository`
- `[Database]` Implement `ProgressRepository`
- `[Database]` Define and create all required MongoDB indexes
- `[Database]` Fetch and clean Wainwright data from DoBIH
- `[Database]` Fetch and clean Munro data from DoBIH
- `[Database]` Write Zod schemas for `PeakList`, `Peak`, and `UserProgress`
- `[Database]` Write `seed-peak-lists.ts` (idempotent)
- `[Database]` Write `seed-wainwrights.ts` (idempotent)
- `[Database]` Write `seed-munros.ts` (idempotent)
- `[Database]` Write `verify-seed.ts` — exits non-zero on failure
- `[Database]` Write `reset-db.ts`
- `[Database]` Write `export-progress.ts` and `import-progress.ts`
- `[Database]` Add `verify-seed.ts` to CI pipeline

**Estimated tickets:** 15
**Complexity:** High
**Dependencies:** Milestone 2

**Done when:**
- `verify-seed.ts` exits zero: 214 Wainwrights, 282 Munros, all slugs unique, all coordinates and heights valid
- All repositories are independently unit-testable with mock adapters
- No raw MongoDB queries exist outside repository files

---

## Milestone 4 — Offline Architecture

**Focus:** Dexie setup, IndexedDB repositories, schema migrations.

**Goal:** All user progress is persisted to IndexedDB via Dexie. The `dirty` flag correctly marks unsynced records. Schema is versioned and migratable.

**Tickets:**
- `[Offline]` Set up Dexie with initial schema version
- `[Offline]` Implement `LocalProgressRepository` (Dexie)
- `[Offline]` Implement `UserPreferencesRepository` (Dexie)
- `[Offline]` Implement sync metadata table (last sync timestamp, pending changes)
- `[Offline]` Implement schema migration strategy (versioned)
- `[Offline]` Unit test Dexie repositories with mock adapters
- `[Offline]` Verify `dirty` flag never reaches MongoDB

**Estimated tickets:** 7
**Complexity:** High
**Dependencies:** Milestone 3

**Done when:**
- Progress records are written to and read from Dexie
- `dirty: true` is set on local changes; `dirty: false` after sync
- `dirty` is confirmed absent from all MongoDB documents
- User preferences can be read and written via `UserPreferencesRepository`
- Repositories are independently unit-testable

---

## Milestone 5 — State Management

**Focus:** Zustand stores, TanStack Query setup, centralised query keys.

**Goal:** All server state flows through TanStack Query. All client UI state flows through Zustand. Query keys are centralised. No raw `fetch` calls in components.

**Tickets:**
- `[State]` Set up TanStack Query provider
- `[State]` Create `src/lib/queryKeys.ts` with all query key definitions
- `[State]` Create Zustand store — search (term, debounced value)
- `[State]` Create Zustand store — filters (completion status, region)
- `[State]` Create Zustand store — sort (field, direction)
- `[State]` Create Zustand store — UI preferences (theme, view mode, sidebar)
- `[State]` Create Zustand store — connectivity state (online/offline, connection quality)
- `[State]` Create Zustand store — sync state (in progress, last synced, error)
- `[State]` Create Zustand store — progress state (local progress before sync confirmation)
- `[State]` Unit test all Zustand stores independently

**Estimated tickets:** 10
**Complexity:** Medium
**Dependencies:** Milestone 4

**Done when:**
- All Zustand stores independently unit-testable
- TanStack Query provider configured with sensible defaults
- `src/lib/queryKeys.ts` contains all query keys used in the application
- No raw `fetch` calls in any component

---

## Milestone 6 — Core UI

**Focus:** Layout, navigation, home page, peak list page, search, filters, sorting, statistics.

**Goal:** The application is navigable and functional. Users can view all peak lists, browse peaks in a list, search, filter, sort, and see statistics. Progress toggling works (optimistically, offline-first).

**Tickets:**
- `[Domain]` Implement statistics service (`src/features/peaks/services/statistics.service.ts`)
- `[UI]` Implement root layout (header, navigation, footer)
- `[UI]` Implement home page — list all peak lists dynamically
- `[UI]` Implement peak list page — `/peak-lists/[slug]`
- `[UI]` Implement statistics component (total, completed, remaining, percentage)
- `[UI]` Implement regional statistics component
- `[UI]` Implement search component (debounced, case-insensitive)
- `[UI]` Implement completion status filter (All / Complete / Incomplete)
- `[UI]` Implement region filter (dynamic from dataset — never hardcoded)
- `[UI]` Implement sorting (name, height metres, height feet, region, completion — asc/desc)
- `[UI]` Implement peak list item component
- `[UI]` Implement progress toggle (optimistic, Dexie-first)
- `[UI]` Mobile-first responsive design across all pages
- `[UI]` WCAG 2.1 AA accessibility audit and fixes
- `[UI]` Offline fallback page (`/offline`)

**Estimated tickets:** 15
**Complexity:** High
**Dependencies:** Milestone 5

**Note:** API route design is the gate ticket that opens Milestone 7 — it must be documented and approved before any sync implementation begins.

**Done when:**
- Statistics service is implemented and independently unit-tested
- Home page lists all peak lists
- Peak list page shows all peaks with working search, filters, sort, and statistics
- Progress toggle works offline
- Mobile-first layout on all pages
- WCAG 2.1 AA on all interactive components

---

## Milestone 7 — Synchronisation

**Focus:** API routes, sync engine, conflict resolution.

**Pre-requisite:** API route design is the gate ticket that opens Milestone 7 — it must be approved before any remaining Milestone 7 tickets begin.

**Goal:** Dirty local records sync to the server when the device is online. Conflict resolution (Last Write Wins) is correct. Sync state is surfaced in the UI.

**Tickets:**
- `[Sync]` Design and document API routes (approved before remaining tickets begin)
- `[Sync]` Implement progress GET API route
- `[Sync]` Implement progress PUT/PATCH API route
- `[Sync]` Implement sync engine — push dirty records to server
- `[Sync]` Implement sync engine — pull latest server state
- `[Sync]` Implement Last Write Wins conflict resolution (based on `updatedAt` + `version`)
- `[Sync]` Implement online/offline detection and automatic sync trigger
- `[Sync]` Integrate sync state Zustand store with sync engine
- `[Sync]` Unit and integration tests for sync engine
- `[Sync]` E2E test — sync while offline, reconnect, verify sync

**Estimated tickets:** 10
**Complexity:** High
**Dependencies:** Milestone 6

**Done when:**
- Dirty records are pushed to server on reconnection
- Server state is pulled and conflicts resolved correctly
- Sync status is visible in the UI
- E2E sync test passes

---

## Milestone 8 — PWA

**Focus:** Service Worker, offline support, install prompt.

**Pre-requisite:** Verify next-pwa compatibility with Next.js 16 / Turbopack before beginning. Consider Serwist as an alternative if next-pwa is incompatible.

**Goal:** The application is installable on mobile devices, works fully offline, and handles SW cache updates gracefully.

**Tickets:**
- `[PWA]` Verify next-pwa + Next.js 16 / Turbopack compatibility
- `[PWA]` Configure next-pwa (or Serwist) with offline-first caching strategy
- `[PWA]` Implement Web App Manifest (`manifest.json`)
- `[PWA]` Implement install prompt (controlled via `NEXT_PUBLIC_ENABLE_PWA`)
- `[PWA]` Implement SW cache versioning and update-on-reload strategy
- `[PWA]` Verify offline functionality — navigate, view, and toggle progress without connectivity
- `[PWA]` Playwright E2E test — offline mode

**Estimated tickets:** 7
**Complexity:** Medium
**Dependencies:** Milestone 7

**Done when:**
- App installs on iOS and Android
- Core functionality works with no network connection
- Service Worker updates are handled gracefully
- Playwright offline E2E test passes

---

## Milestone 9 — Testing

**Focus:** Bring unit test coverage to ≥ 80%. Full E2E suite passing.

**Goal:** All quality gates pass. The project is production-ready.

**Tickets:**
- `[Testing]` Audit and fill unit test coverage gaps to reach ≥ 80%
- `[Testing]` Write missing component tests (React Testing Library)
- `[Testing]` Complete Playwright E2E suite — auth, peak list browsing, progress toggle, sync, offline
- `[Testing]` Final quality gate run — typecheck, lint, test, build, E2E
- `[Testing]` Address any issues found during final quality gate

**Estimated tickets:** 5
**Complexity:** Medium
**Dependencies:** Milestone 8

**Done when:**
- `npm run test` — ≥ 80% coverage, all passing
- `npm run test:e2e` — all passing
- `npm run typecheck` — zero errors
- `npm run lint` — zero errors
- `npm run build` — passing

---

## Summary

| Milestone | Tickets (est.) | Complexity | Depends on |
|---|---|---|---|
| 1 — Foundation | 10 | Medium | — |
| 2 — Authentication | 6 | Medium | M1 |
| 3 — Database | 15 | High | M2 |
| 4 — Offline | 7 | High | M3 |
| 5 — State | 10 | Medium | M4 |
| 6 — Core UI | 15 | High | M5 |
| 7 — Sync | 10 | High | M6 |
| 8 — PWA | 7 | Medium | M7 |
| 9 — Testing | 5 | Medium | M8 |
| **Total** | **85** | | |

---

## Approval Checklist

- [ ] Roadmap read and understood
- [ ] Milestone scope and sequencing approved
- [ ] Estimated ticket counts noted
- [ ] **Explicit approval given to proceed to `docs/github-tickets.md`**
