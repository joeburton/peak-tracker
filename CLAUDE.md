# CLAUDE.md — Peak Tracker UK

> This file is the single source of truth for all implementation decisions.
> It is read automatically by Claude Code at the start of every session.
> Every rule here is non-negotiable unless explicitly overridden by the user in chat.

---

## CRITICAL CONSTRAINTS

```
DO NOT write any application code until Phase 0 deliverables are complete and explicitly approved.
DO NOT commit directly to `main` or `develop`.
DO NOT move to the next ticket without explicit review approval.
DO NOT access MongoDB or Dexie directly from components or route handlers.
DO NOT hardcode Wainwright-specific logic anywhere in the application.
DO NOT create placeholder or stub implementations.
DO NOT assume a single peak list. Design every feature generically.
DO NOT use middleware.ts — Next.js 16 uses proxy.ts instead.
DO NOT alter any MongoDB database other than `peakTracker` unless explicitly instructed by the user.
DO NOT create `__tests__` directories — all tests are colocated with their source files.
```

---

## PROJECT OVERVIEW

**Peak Tracker UK** is an offline-first Progressive Web Application (PWA) for tracking progress across UK hill and mountain lists.

The application is a **generic peak-tracking platform**. It must support any UK hill list without code changes.

**GitHub Repository:** https://github.com/joeburton/peak-tracker

### Initial Datasets

| List        | Count |
| ----------- | ----- |
| Wainwrights | 214   |
| Munros      | 282   |

### Future Datasets (architecture must support without code changes)

- Corbetts
- Grahams
- Nuttalls
- Hewitts
- Marilyns
- Donalds
- Any future UK hill list

---

## CORE PRINCIPLES

1. Offline-first — the app must work without internet connectivity
2. Mobile-first — design and test on mobile viewports first
3. Accessibility-first — WCAG 2.1 AA minimum
4. Type-safe — TypeScript strict mode, zero `any`
5. Testable — repository pattern, dependency injection, no direct DB access in components
6. Extensible — generic platform, no hardcoded list logic
7. Production-ready — all quality gates must pass before a feature is considered done
8. Progressive Web App — installable, offline-capable, service worker
9. Feature-based architecture — colocate related code in feature folders
10. Server Components by default — use Client Components only where interactivity requires it

---

## TECHNOLOGY STACK

### Frontend

- **Next.js 16** (current stable: 16.2.x, App Router, Server Components by default)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui**

### Authentication

- **Clerk** — social login (Google, Apple, GitHub), pre-built UI components
- Clerk must be configured using **`proxy.ts`** — not `middleware.ts` (removed in Next.js 16)
- Free tier: 10,000 monthly active users
- Clerk `userId` flows directly into the progress repository and MongoDB progress collection

### Server State

- **TanStack Query** — all remote data fetching and cache management

### URL State

- **nuqs** — URL search param state for search, filter, and sort (typed, validated, debounced)

### Client State

- **Zustand** — ephemeral UI and application state with no URL representation (connectivity, sync, UI preferences, optimistic progress)

### Offline Storage

- **Dexie** (IndexedDB) — offline-first persistence

### Database

- **MongoDB** — database name `peakTracker` (both local and Atlas)
- Toggle between environments via `MONGODB_URI` only — no code changes required

### Validation

- **Zod** — all external data boundaries

### Testing

- **Vitest** — unit and integration tests
- **React Testing Library** — component tests
- **Playwright** — end-to-end tests

### PWA

- **next-pwa**
- **Service Worker**

---

## TESTING CONVENTIONS

### Colocation rule (Non-Negotiable)

Test files must live next to the source file they test. Never use a top-level `__tests__` directory.

```
src/app/page.tsx                                    → src/app/page.test.tsx
src/lib/logger/index.ts                             → src/lib/logger/index.test.ts
src/features/peaks/services/statistics.ts           → src/features/peaks/services/statistics.test.ts
src/features/peaks/repositories/peak-repository.ts  → src/features/peaks/repositories/peak-repository.test.ts
```

- Unit and integration tests: `.test.tsx` / `.test.ts` colocated with their source file
- E2E tests only: `e2e/` directory at the project root (Playwright)
- The `src/__tests__/` directory is **excluded from vitest discovery** — never add files there

---

## NEXT.JS 16 — KEY CHANGES FROM 15

These are breaking or significant changes that affect implementation decisions.

| Change                  | Detail                                                                          |
| ----------------------- | ------------------------------------------------------------------------------- |
| `middleware.ts` removed | Replaced by `proxy.ts` — all routing and auth middleware must use this          |
| Cache Components        | New explicit caching model using `use cache` directive and PPR                  |
| Turbopack               | Now the default bundler — no configuration required                             |
| `proxy.ts`              | New network boundary entry point — Clerk and any request interception goes here |

Before implementing the Auth milestone, review the Clerk documentation for Next.js 16 / `proxy.ts` compatibility and confirm the integration approach.

---

## YOUR ROLE

At the start of every project you are acting simultaneously as:

- **Solution Architect** — owns the technical vision and key decisions
- **Technical Lead** — ensures quality, consistency, and long-term maintainability
- **Senior Engineer** — writes production-quality code, tests, and documentation

Optimise for **long-term maintainability**, not short-term delivery speed.

---

## PHASE 0 — PLANNING (MANDATORY BEFORE ANY CODE)

### Required Deliverables

You must produce all three documents before writing a single line of application code.

#### 1. `docs/architecture-review.md`

- Architectural overview
- Technology decisions and rationale
- Risks and mitigations
- Assumptions (including those listed below)
- Trade-offs
- Recommendations

#### 2. `docs/project-roadmap.md`

- Milestones (mapped to GitHub Milestones)
- Dependencies between milestones
- Delivery phases
- Estimated complexity per milestone

#### 3. `docs/github-tickets.md`

- Full ticket breakdown (see Ticket Format below)
- Updated with real GitHub issue URLs once issues are created

### Phase 0 also includes

- Create the **GitHub Project board** on https://github.com/joeburton/peak-tracker
- Create all **GitHub Milestones** before creating any issues
- Create all **GitHub Issues** and assign to milestones and project board

### Phase 0 Checklist

- [ ] Architecture review written and approved
- [ ] Roadmap written and approved
- [ ] Ticket breakdown written and approved
- [ ] Risks documented
- [ ] Assumptions documented
- [ ] GitHub Project board created
- [ ] GitHub Milestones created
- [ ] GitHub Issues created and added to project board
- [ ] Explicit approval received from the user

---

## KNOWN ASSUMPTIONS (document all in architecture-review.md)

1. **Auth is in scope via Clerk** — `userId` must be present on all progress records. Clerk is configured via `proxy.ts` in Next.js 16. Unauthenticated access to progress routes must be rejected.

2. **`dirty` flag is client-only** — `dirty` lives in Dexie only. It must never be stored in MongoDB. This is intentional — it is a sync concern, not a domain concern.

3. **Statistics are computed server-side** — derived data computed in a service layer on the server, not in repositories or client components.

4. **`peakListSlug` as foreign key** — peaks reference their list by slug. Known trade-off: renaming a list would require updating all associated peaks. Documented as a known limitation.

5. **Last Write Wins conflict resolution** — based on `updatedAt` and `version`. No event sourcing, CQRS, operation queues, or distributed locking.

6. **API routes undefined in initial spec** — must be designed and approved before Milestone 7 begins.

7. **Data sourced from DoBIH** — the Database of British and Irish Hills (DoBIH) is the canonical public source for Wainwright and Munro data. Claude Code must fetch, clean, validate against Zod schemas, and produce seed scripts. `verify-seed.ts` must exit non-zero if counts or validation fail.

8. **Clerk + Next.js 16 proxy.ts** — before implementing Milestone 2, verify Clerk's current documentation for Next.js 16 compatibility and confirm the correct `proxy.ts` integration pattern.

---

## GITHUB INTEGRATION

**Repository:** https://github.com/joeburton/peak-tracker

### Project Board

- Create the GitHub Project board during Phase 0
- All tickets must be created as **GitHub Issues**
- All issues must be added to the **GitHub Project board**
- Issue titles must include the category tag: e.g. `[Foundation] Setup Next.js project`
- Use GitHub auto-numbering as the canonical ticket reference: `#1`, `#2`, etc.
- Update `docs/github-tickets.md` with real issue URLs after creation
- Assign issues to the correct **GitHub Milestone**

### Branching Strategy

| Branch                                       | Purpose                                      |
| -------------------------------------------- | -------------------------------------------- |
| `main`                                       | Stable, production-ready code only           |
| `develop`                                    | Integration branch — all features merge here |
| `feature/<issue-number>-<short-description>` | One branch per ticket                        |

**Branch naming examples:**

```
feature/12-setup-nextjs-project
feature/23-mongodb-connection
feature/34-dexie-offline-store
```

**Rules:**

- Always branch from `develop`
- Never commit directly to `main` or `develop`
- Open a Pull Request to `develop` on ticket completion
- PR title must reference the issue: e.g. `Fix #12 — Setup Next.js project`
- Squash merge into `develop`
- PRs must pass type check, lint, and build before merge

---

## TICKET FORMAT

Every ticket must contain all of the following sections.

```markdown
### [Category] Short description

**GitHub Issue:** #<number> <url once created>
**Milestone:** Milestone N — <name>
**Branch:** feature/<issue-number>-<short-description>

**Description:**
Business and technical context. Why does this ticket exist?

**Acceptance Criteria:**

- [ ] Criterion one
- [ ] Criterion two
- [ ] Criterion three

**Dependencies:**
Depends on: #1, #4

**Testing Requirements:**

- [ ] Unit tests added
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes
```

---

## TICKET CATEGORIES

| Category       | Scope                                                            |
| -------------- | ---------------------------------------------------------------- |
| `[Foundation]` | Project setup, tooling, CI, linting, environment config          |
| `[Auth]`       | Clerk setup, proxy.ts, protected routes, userId integration      |
| `[Database]`   | MongoDB setup, repository pattern, indexes, seed scripts         |
| `[Offline]`    | Dexie setup, IndexedDB repositories, schema migrations           |
| `[State]`      | nuqs parsers, Zustand stores, TanStack Query setup, query keys   |
| `[Domain]`     | Peak lists, peak models, progress models, statistics service     |
| `[UI]`         | Layout, navigation, search, filtering, sorting, statistics views |
| `[Sync]`       | Synchronisation engine, API routes, conflict resolution          |
| `[PWA]`        | Service worker, offline support, install prompt                  |
| `[Testing]`    | Unit tests, integration tests, Playwright E2E                    |

---

## MILESTONE PLAN

Create all milestones in GitHub before creating any issues.

| Milestone   | Focus                                                              |
| ----------- | ------------------------------------------------------------------ |
| Milestone 1 | Foundation — project setup, tooling, CI                            |
| Milestone 2 | Authentication — Clerk setup, proxy.ts, protected routes           |
| Milestone 3 | Database — MongoDB, repositories, seed scripts, data sourcing      |
| Milestone 4 | Offline Architecture — Dexie, IndexedDB repositories               |
| Milestone 5 | State Management — Zustand stores, TanStack Query                  |
| Milestone 6 | Core UI — layout, navigation, search, filters, sorting, statistics |
| Milestone 7 | Synchronisation — API routes, sync engine, conflict resolution     |
| Milestone 8 | PWA — service worker, offline support, install prompt              |
| Milestone 9 | Testing — coverage to 80%, E2E suite passing                       |

---

## DOMAIN MODEL

### PeakList

```ts
export interface PeakList {
  id: string;
  slug: string;
  name: string;
  description?: string;
  peakCount: number;
}
```

### Peak

```ts
export interface Peak {
  id: string;
  peakListSlug: string;
  slug: string;
  name: string;
  region: string;
  heightMetres: number;
  heightFeet: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}
```

### UserProgress

```ts
export interface UserProgress {
  userId: string; // Clerk userId — required
  completedPeakIds: string[];
  updatedAt: string;
  dirty: boolean; // client-only — never persisted to MongoDB
  version: number;
}
```

### Statistics (computed, not stored)

```ts
export interface RegionalStatistics {
  region: string;
  total: number;
  completed: number;
  remaining: number;
  percentageComplete: number;
}

export interface PeakListStatistics {
  total: number;
  completed: number;
  remaining: number;
  percentageComplete: number;
  byRegion: RegionalStatistics[]; // sorted alphabetically by region name
}
```

Regional statistics are derived from the same computation as the overall stats and sorted alphabetically by region name.

---

## FUTURE FEATURE SHAPES (architecture must support without redesign)

```ts
// Notes
{
  userId: string;
  peakId: string;
  notes: string;
}

// Walk History
{
  userId: string;
  peakId: string;
  completedAt: Date;
}

// Photos
{
  userId: string;
  peakId: string;
  imageUrl: string;
}

// Routes
{
  userId: string;
  peakId: string;
  gpxFile: string;
}

// Achievements
// Examples: First Peak, 10 Peaks, First Munro, All Eastern Fells, All Munros
```

---

## MONGODB COLLECTIONS

Database name: `peakTracker` (local and Atlas)

### peakLists

```ts
{
  _id: ObjectId;
  slug: string;          // index: unique
  name: string;
  description?: string;
  peakCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### peaks

```ts
{
  _id: ObjectId;
  peakListSlug: string; // index
  slug: string; // index: unique
  name: string;
  region: string; // index
  heightMetres: number; // index
  heightFeet: number;
  latitude: number; // required — validated in seed
  longitude: number; // required — validated in seed
  createdAt: Date;
  updatedAt: Date;
}
```

### progress

```ts
{
  _id: ObjectId;
  userId: string;        // Clerk userId — required, index
  completedPeakIds: string[];
  updatedAt: Date;
  version: number;
  // NOTE: dirty is NOT stored here — it is a client-only Dexie concern
}
```

---

## DEXIE SCHEMA (IndexedDB)

```ts
interface LocalProgress {
  userId: string; // Clerk userId
  completedPeakIds: string[];
  updatedAt: string;
  lastSyncedAt?: string;
  dirty: boolean; // true = has unsynced local changes
  version: number;
}
```

---

## ENVIRONMENT VARIABLES

```env
# MongoDB — swap URI only to toggle between local and Atlas. No code changes required.
MONGODB_URI=mongodb://localhost:27017/peakTracker

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# App
NEXT_PUBLIC_APP_NAME=Peak Tracker UK
NEXT_PUBLIC_ENABLE_PWA=true
```

Provide `.env.example` in the repository root with all keys present and values empty.

---

## STATE MANAGEMENT ARCHITECTURE

### TanStack Query — Server State

All remote data fetching, caching, and sync must go through TanStack Query.

| Domain               | Responsibility                                      |
| -------------------- | --------------------------------------------------- |
| Peak Lists           | Fetch, cache, and invalidate peak list data         |
| Peaks                | Fetch individual peaks and collections              |
| Statistics           | Fetch computed statistics from server service layer |
| Synchronisation APIs | Trigger and monitor client-server sync operations   |

**Rules:**

- No raw `fetch` calls in components — use TanStack Query hooks only
- Every query must define explicit `staleTime` and `gcTime`
- Mutations must invalidate relevant query keys on success
- All query keys must be centralised in `src/lib/queryKeys.ts`

---

### nuqs — URL Search Param State

Search, filter, and sort state lives in the URL. `nuqs` is the library that manages this layer. It provides typed, validated URL params with zero manual sync boilerplate.

**Why nuqs, not Zustand, for search/filter/sort:**

URL params are the correct home for search, filter, and sort state because they provide browser history, page-refresh persistence, and shareable links for free. Mirroring URL state into a separate Zustand store requires a per-page mount ritual (read `useSearchParams()` → call init actions) and a per-interaction write-back ritual (`router.replace`). With `nuqs`, the URL param IS the state — no mirror, no ritual, no divergence risk.

**Setup:**

`NuqsAdapter` wraps the app in `src/app/layout.tsx`. This is required for `nuqs` to function in Next.js App Router.

**Centralised parsers — `src/lib/nuqs/parsers.ts`:**

All URL param keys and parsers are defined in one file. Never use raw URL param name strings in components — always import from this file.

| Export            | Param      | Type             | Default  |
| ----------------- | ---------- | ---------------- | -------- |
| `SEARCH_PARAM`    | `?search=` | `string`         | `''`     |
| `COMPLETION_PARAM`| `?completion=` | `CompletionFilter` | `'all'` |
| `REGION_PARAM`    | `?region=` | `string`         | `''`     |
| `SORT_PARAM`      | `?sort=`   | `SortField`      | `'name'` |
| `DIR_PARAM`       | `?dir=`    | `SortDirection`  | `'asc'`  |

Enum parsers (`completionParser`, `sortParser`, `dirParser`) derive their valid values directly from the Zod schemas (`CompletionFilterSchema.options`, `SortFieldSchema.options`, `SortDirectionSchema.options`) — adding a new value to a schema automatically makes it a valid URL param value.

**Usage in components:**

```ts
import { useQueryState, useQueryStates } from 'nuqs'
import {
  SEARCH_PARAM, searchParser,
  COMPLETION_PARAM, completionParser,
  REGION_PARAM, regionParser,
} from '@/lib/nuqs/parsers'

// Single param — with debounce for search
const [search, setSearch] = useQueryState(SEARCH_PARAM, searchParser.withOptions({ throttleMs: 300 }))

// Multiple params at once
const [{ completion, region }, setFilters] = useQueryStates({
  [COMPLETION_PARAM]: completionParser,
  [REGION_PARAM]: regionParser,
})
```

**Rules:**

- Never import raw URL param name strings — always use the key constants from `src/lib/nuqs/parsers.ts`
- Never use `useSearchParams()` directly — use `useQueryState` / `useQueryStates` from `nuqs`
- All parsers must be defined in `src/lib/nuqs/parsers.ts` — never inline a parser in a component
- For search, merge throttle into the parser with `.withOptions({ throttleMs: 300 })` to debounce URL writes — `useQueryState` takes two arguments, not three
- Use `{ history: 'replace' }` (the nuqs default for App Router) — filter changes must not create browser history entries
- `nuqs` hooks are Client Component hooks — only call them from files with `'use client'`

---

### Zustand — Client State

Manages ephemeral UI and application state that has **no URL representation**. Search, filter, and sort state are handled by `nuqs` — not Zustand.

| Store              | Responsibility                                       |
| ------------------ | ---------------------------------------------------- |
| UI Preferences     | Theme, view mode (list/map), sidebar state           |
| Connectivity State | Online/offline status, connection quality            |
| Sync State         | Sync in progress, last synced timestamp, error state |
| Progress State     | Locally tracked progress before sync confirmation    |

**Rules:**

- Each concern must be a **separate Zustand slice or store**
- All stores must be independently testable
- Use `persist` middleware only where explicitly specified
- Connectivity and sync state must stay consistent with Dexie and TanStack Query
- Add `'use client'` at the top of every store file

---

### Dexie — Offline Persistence

Manages all client-side IndexedDB storage for offline-first capability.

| Table            | Responsibility                                               |
| ---------------- | ------------------------------------------------------------ |
| Progress         | Peak completion records, timestamps, notes                   |
| User Preferences | Persisted settings (units, display preferences)              |
| Sync Metadata    | Last sync timestamp, pending changes queue, conflict records |

**Rules:**

- All Dexie access must go through a **repository pattern** — no direct table access in components or hooks
- Schema migrations must be versioned
- Sync metadata must track dirty records for upload on reconnection
- Repositories must be unit testable with mock adapters

---

### MongoDB — Persistent Storage

The authoritative server-side data store.

| Collection    | Responsibility                               |
| ------------- | -------------------------------------------- |
| Peak Lists    | Curated collections of peaks                 |
| Peaks         | Individual peak records                      |
| User Progress | Server-confirmed completion records per user |

**Rules:**

- All MongoDB access must go through a **repository pattern** — no raw queries in route handlers or business logic
- Define required indexes at collection setup — not lazily
- Provide seed scripts for all reference data

---

## REPOSITORY PATTERN (Non-Negotiable)

```text
src/lib/db/
├── mongodb.ts
├── repositories/
│   ├── peak-list-repository.ts
│   ├── peak-repository.ts
│   └── progress-repository.ts
```

UI components and route handlers must never import from `mongodb.ts` directly.
All data access goes through a repository interface.

---

## SYNCHRONISATION MODEL

### Strategy: Snapshot Sync

Do NOT implement:

- Event sourcing
- CQRS
- Operation queues
- Distributed locking

### Conflict Resolution: Last Write Wins

Based on `updatedAt` timestamp and `version` number.

### Sync Workflow

1. User action → update Dexie immediately
2. Update UI optimistically
3. Mark local record as `dirty: true`
4. When online: push dirty records to server
5. Pull latest server state
6. Resolve conflicts (last write wins)
7. Mark `dirty: false`, update `lastSyncedAt`

---

## DATA SEEDING

**Data source:** Database of British and Irish Hills (DoBIH) — the canonical public reference for UK hill data.

Claude Code must:

1. Fetch data from DoBIH
2. Clean and transform to match the Peak schema
3. Validate every record against the Zod schema
4. Write idempotent seed scripts
5. Run `verify-seed.ts` to confirm counts and data integrity

All seed scripts must be:

- Idempotent (safe to run multiple times)
- Validated against Zod schemas before insertion
- Verified with `verify-seed.ts`

### verify-seed.ts must confirm

- 214 Wainwrights present
- 282 Munros present
- All slugs unique
- All heights valid (metres and feet)
- All coordinates present and valid
- All required fields present
- Exits with non-zero status on any failure

### Scripts required

```text
scripts/
├── seed-peak-lists.ts
├── seed-wainwrights.ts
├── seed-munros.ts
├── verify-seed.ts
├── reset-db.ts
├── export-progress.ts
└── import-progress.ts
```

---

## APPLICATION STRUCTURE

```text
src/
├── app/
│   ├── page.tsx                        # Home — list all peak lists
│   ├── page.test.tsx                   # Colocated unit test
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx                    # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/
│   │   └── page.tsx                    # Clerk sign-up
│   ├── peak-lists/
│   │   └── [slug]/
│   │       └── page.tsx                # Peak list detail page
│   ├── offline/
│   │   └── page.tsx
│   └── api/
│       └── ...                         # API routes (defined before Milestone 7)
│
├── proxy.ts                            # Next.js 16 — replaces middleware.ts
│                                       # Clerk auth and route protection goes here
│
├── components/
│   ├── peak-list/
│   ├── peak/
│   ├── progress/
│   ├── filters/
│   ├── search/
│   └── ui/
│
├── features/
│   └── peaks/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── repositories/
│       ├── types/
│       └── utils/
│
├── db/
│   ├── dexie.ts
│   ├── schema.ts
│   └── repositories/
│
├── stores/                             # Zustand stores — one file per concern
│   ├── ui-preferences.ts               # search/filter/sort handled by nuqs, not Zustand
│   ├── connectivity.ts
│   ├── sync.ts
│   └── progress.ts
│
└── lib/
    ├── db/
    ├── queryKeys.ts
    ├── logger/
    ├── validation/
    └── constants/

scripts/
docs/
├── architecture-review.md
├── project-roadmap.md
└── github-tickets.md

e2e/                                    # Playwright E2E tests only
```

---

## PAGES

### Home Page `/`

Display all available peak lists dynamically. Future lists must appear automatically — no hardcoding.

```text
Wainwrights    214 peaks
Munros         282 peaks
```

### Peak List Page `/peak-lists/[slug]`

Contains:

- Statistics (total, completed, remaining, percentage, regional breakdown)
- Search (by name, debounced, case insensitive)
- Filters (completion status: All / Complete / Incomplete; region: dynamic from dataset — never hardcoded)
- Sorting (name, height metres, height feet, region, completion status — asc/desc)
- Peak list

### Auth Pages

- `/sign-in` — Clerk hosted sign-in component
- `/sign-up` — Clerk hosted sign-up component

---

## QUALITY GATES

The application is not complete until all of the following pass with zero errors.

| Gate             | Command             | Requirement    |
| ---------------- | ------------------- | -------------- |
| Type check       | `npm run typecheck` | Zero errors    |
| Lint             | `npm run lint`      | Zero errors    |
| Unit tests       | `npm run test`      | ≥ 80% coverage |
| E2E tests        | `npm run test:e2e`  | All passing    |
| Production build | `npm run build`     | Passing        |

---

## DEVELOPMENT WORKFLOW

### Per-Ticket Steps (in order)

1. Create feature branch from `develop`: `feature/<issue-number>-<short-description>`
2. Implement the acceptance criteria
3. Write tests
4. Run `npm run typecheck`
5. Run `npm run lint`
6. Run `npm run build`
7. Open Pull Request to `develop` referencing the issue number
8. Write a clear summary of changes made

**Stop after step 8. Wait for explicit review approval before starting the next ticket.**

---

## DEFINITION OF READY

A ticket is ready when:

- [ ] Requirements understood
- [ ] All dependencies complete
- [ ] Acceptance criteria defined
- [ ] GitHub Issue created and on the project board
- [ ] Assigned to correct GitHub Milestone
- [ ] Feature branch created from `develop`

## DEFINITION OF DONE

A ticket is done when:

- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `npm run build` — passing
- [ ] Documentation updated where relevant
- [ ] Pull Request opened to `develop`
- [ ] GitHub Issue linked in PR and closed on merge

---

## ARCHITECTURAL REVIEW TRIGGERS

Before implementing any major feature, pause and review:

- Existing architecture — does this change fit without breaking the pattern?
- Future extensibility — will this constrain the platform later?
- Performance implications — any bottlenecks for large datasets (282+ peaks)?
- Offline implications — does this work without a connection?
- Auth implications — does this correctly scope data to `userId`?
- Testing implications — is this independently testable?

Recommend and seek approval for changes before proceeding.

---

## QUICK REFERENCE

```
Phase 0 first. Always.
One ticket at a time. Wait for approval between tickets.
One branch per ticket. Branch from develop. PR to develop.
No direct MongoDB or Dexie access in components or route handlers.
No hardcoded list logic. Every feature is generic.
dirty flag lives in Dexie only — never in MongoDB.
Statistics are computed server-side in a service layer.
All query keys in src/lib/queryKeys.ts.
nuqs handles search/filter/sort URL state — not Zustand.
All nuqs parser keys and parsers centralised in src/lib/nuqs/parsers.ts.
Never use raw URL param name strings — always import from parsers.ts.
Separate Zustand store per concern (UI preferences, connectivity, sync, progress only).
userId (Clerk) on every progress record — in MongoDB and Dexie.
Clerk configured via proxy.ts — not middleware.ts (removed in Next.js 16).
Seed data sourced from DoBIH. Validated. Idempotent.
Toggle local/Atlas via MONGODB_URI only. No code changes.
All quality gates must pass before a milestone is closed.
Tests are colocated — src/app/page.tsx tests at src/app/page.test.tsx. Never use __tests__ directories.
```
