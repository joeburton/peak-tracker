# GitHub Tickets — Peak Tracker UK

> Status: Active — GitHub issues created. URLs populated below.

---

## Milestone 1 — Foundation

---

### [Foundation] Initialise Next.js 16 project with TypeScript strict mode

**GitHub Issue:** [#1](https://github.com/joeburton/peak-tracker/issues/1)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/1-init-nextjs-project`

**Description:**
Bootstrap the Next.js 16 project using `create-next-app@16` with the App Router, TypeScript, Tailwind CSS, ESLint, and the `src/` directory layout. TypeScript must be configured in strict mode with `noImplicitAny`, `strictNullChecks`, and `noUncheckedIndexedAccess` enabled. Turbopack is the default bundler in Next.js 16 — no additional configuration required. Establish the base directory structure as defined in CLAUDE.md. Add Vitest and Playwright as devDependencies.

> **Implementation note:** `create-next-app@16` was used as the scaffold base rather than manual config. This installed Tailwind CSS v4 (with `@tailwindcss/postcss`) — see ticket #2.

**Acceptance Criteria:**

- [x] Next.js 16 project initialised with App Router via `create-next-app@16`
- [x] TypeScript strict mode enabled (`strict: true`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`)
- [x] Base directory structure in place (`src/app`, `src/components`, `src/features`, `src/db`, `src/lib`, `src/lib/constants`)
- [x] `proxy.ts` placeholder in place (Clerk integration in Milestone 2)
- [x] `npm run build` passes
- [x] `npm run typecheck` passes
- [x] `.env.example` committed with all required keys
- [x] `src/lib/queryKeys.ts` created (centralised TanStack Query key registry)

**Dependencies:**
None

**Testing Requirements:**

- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Foundation] Configure Tailwind CSS and shadcn/ui

**GitHub Issue:** [#2](https://github.com/joeburton/peak-tracker/issues/2)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/2-tailwind-shadcn`

**Description:**
Tailwind CSS v4 is already installed by `create-next-app@16` (via `@tailwindcss/postcss`). This ticket covers initialising shadcn/ui and installing the core components required by the application (Button, Input, Select, Badge, Card, Separator). Use `npx shadcn@latest init` to initialise. Verify components render correctly and are accessible.

> **Implementation note:** Tailwind v4 uses `@import "tailwindcss"` in `globals.css` instead of the v3 `@tailwind base/components/utilities` directives. shadcn/ui must be confirmed compatible with Tailwind v4 before initialising — check shadcn docs for v4 support.

**Acceptance Criteria:**

- [ ] Tailwind CSS v4 confirmed working (already installed — verify with a utility class)
- [ ] shadcn/ui initialised via `npx shadcn@latest init`
- [ ] Core components installed: Button, Input, Select, Badge, Card, Separator
- [ ] A basic smoke-test page confirms Tailwind and shadcn/ui render correctly
- [ ] `npm run build` passes

**Dependencies:**
Depends on: `[Foundation] Initialise Next.js 16 project with TypeScript strict mode`

**Testing Requirements:**

- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Foundation] Configure ESLint and Prettier

**GitHub Issue:** [#3](https://github.com/joeburton/peak-tracker/issues/3)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/<issue-number>-eslint-prettier`

**Description:**
Configure ESLint with Next.js and TypeScript rules. Configure Prettier for consistent formatting. Both tools must enforce zero errors on the codebase before any feature code is written.

**Acceptance Criteria:**

- [ ] ESLint configured with `eslint-config-next` and TypeScript rules
- [ ] Prettier configured with a `.prettierrc`
- [ ] `npm run lint` passes with zero errors
- [ ] ESLint and Prettier are compatible (no conflicting rules)
- [ ] `.eslintignore` and `.prettierignore` in place

**Dependencies:**
Depends on: `[Foundation] Initialise Next.js 16 project with TypeScript strict mode`

**Testing Requirements:**

- [ ] Lint passes
- [ ] Build passes
- [ ] Type check passes

---

### [Foundation] Set up npm scripts

**GitHub Issue:** [#4](https://github.com/joeburton/peak-tracker/issues/4)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/<issue-number>-npm-scripts`

**Description:**
Ensure all required npm scripts are defined and functional in `package.json`.

**Acceptance Criteria:**

- [ ] `npm run dev` — starts development server
- [ ] `npm run build` — production build
- [ ] `npm run start` — starts production server
- [ ] `npm run typecheck` — runs `tsc --noEmit`, zero errors required
- [ ] `npm run lint` — runs ESLint, zero errors required
- [ ] `npm run test` — runs Vitest
- [ ] `npm run test:e2e` — runs Playwright

**Dependencies:**
Depends on: `[Foundation] Initialise Next.js 16 project with TypeScript strict mode`, `[Foundation] Configure ESLint and Prettier`

**Testing Requirements:**

- [ ] All scripts execute without error on a clean checkout
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Foundation] Create .env.example

**GitHub Issue:** [#5](https://github.com/joeburton/peak-tracker/issues/5)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/<issue-number>-env-example`

**Description:**
Create `.env.example` in the repository root with all required environment variable keys present, values empty, and inline comments explaining each variable's purpose. This file is committed to the repository and serves as the canonical reference for configuration.

**Acceptance Criteria:**

- [ ] `.env.example` exists at the repository root
- [ ] All required keys present with inline comments: `MONGODB_URI`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_ENABLE_PWA`
- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] `README.md` references `.env.example`

**Dependencies:**
Depends on: `[Foundation] Initialise Next.js 16 project with TypeScript strict mode`

**Testing Requirements:**

- [ ] Build passes with example values stubbed
- [ ] Lint passes
- [ ] Type check passes

---

### [Foundation] Set up GitHub Actions CI pipeline

**GitHub Issue:** [#6](https://github.com/joeburton/peak-tracker/issues/6)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/<issue-number>-ci-pipeline`

**Description:**
Create a GitHub Actions workflow that runs on every pull request to `develop` and `main`. The pipeline must enforce all quality gates: type check, lint, and build. Test steps will be added in later milestones as test suites are written.

**Acceptance Criteria:**

- [ ] `.github/workflows/ci.yml` exists
- [ ] CI runs on every PR to `develop` and `main`
- [ ] CI runs `npm run typecheck`
- [ ] CI runs `npm run lint`
- [ ] CI runs `npm run build`
- [ ] CI fails if any step returns a non-zero exit code
- [ ] Pipeline passes on a test PR

**Dependencies:**
Depends on: `[Foundation] Set up npm scripts`

**Testing Requirements:**

- [ ] CI pipeline passes on the feature branch PR
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Foundation] Configure branch protection rules

**GitHub Issue:** [#7](https://github.com/joeburton/peak-tracker/issues/7)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/<issue-number>-branch-protection`

**Description:**
Configure GitHub branch protection rules for `main` and `develop`. Direct commits to either branch must be blocked. PRs must pass CI before merging.

**Acceptance Criteria:**

- [ ] `main` requires PR and passing CI before merge
- [ ] `develop` requires PR and passing CI before merge
- [ ] Direct commits to `main` and `develop` are blocked
- [ ] Squash merge is the default merge strategy

**Dependencies:**
Depends on: `[Foundation] Set up GitHub Actions CI pipeline`

**Testing Requirements:**

- [ ] Attempt to push directly to `develop` is rejected
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Foundation] Set up Vitest and React Testing Library

**GitHub Issue:** [#8](https://github.com/joeburton/peak-tracker/issues/8)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/<issue-number>-vitest-rtl`

**Description:**
Install and configure Vitest and React Testing Library. Write a trivial smoke test to confirm the test runner works. Configure coverage reporting.

**Acceptance Criteria:**

- [ ] Vitest installed and configured
- [ ] React Testing Library installed
- [ ] `npm run test` executes the test suite
- [ ] Coverage reporting configured (lcov and text)
- [ ] A passing smoke test exists (e.g., renders a simple component)
- [ ] CI pipeline runs `npm run test` (update CI workflow)

**Dependencies:**
Depends on: `[Foundation] Initialise Next.js 16 project with TypeScript strict mode`, `[Foundation] Set up GitHub Actions CI pipeline`

**Testing Requirements:**

- [ ] `npm run test` passes
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Foundation] Set up Playwright

**GitHub Issue:** [#9](https://github.com/joeburton/peak-tracker/issues/9)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/<issue-number>-playwright`

**Description:**
Install and configure Playwright. Create a trivial E2E smoke test (navigate to home page, assert page loads). Add E2E to CI pipeline.

**Acceptance Criteria:**

- [ ] Playwright installed and configured
- [ ] `npm run test:e2e` executes the E2E suite
- [ ] A passing smoke test exists (home page loads)
- [ ] CI pipeline runs `npm run test:e2e` (update CI workflow)

**Dependencies:**
Depends on: `[Foundation] Set up Vitest and React Testing Library`

**Testing Requirements:**

- [ ] `npm run test:e2e` passes
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Foundation] Set up logger

**GitHub Issue:** [#10](https://github.com/joeburton/peak-tracker/issues/10)
**Milestone:** Milestone 1 — Foundation
**Branch:** `feature/<issue-number>-logger`

**Description:**
Implement a structured logger at `src/lib/logger/`. The logger must be usable in both server and client contexts. It must support log levels (debug, info, warn, error) and be silenced in test environments. No `console.log` calls should remain in application code — all logging goes through this module.

**Acceptance Criteria:**

- [ ] `src/lib/logger/` implemented with `debug()`, `info()`, `warn()`, `error()` methods
- [ ] Logger silenced in test environments (`NODE_ENV=test`)
- [ ] Logger is importable in Server Components, API routes, and client-side code
- [ ] No bare `console.log` calls remain in the codebase (ESLint rule enforced)

**Dependencies:**
Depends on: `[Foundation] Configure ESLint and Prettier`

**Testing Requirements:**

- [ ] Unit test: logger outputs at correct levels
- [ ] Unit test: logger is silent in test environment
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

## Milestone 2 — Authentication

---

### [Auth] Verify Clerk + Next.js 16 proxy.ts compatibility

**GitHub Issue:** [#11](https://github.com/joeburton/peak-tracker/issues/11)
**Milestone:** Milestone 2 — Authentication
**Branch:** `feature/<issue-number>-clerk-nextjs16-compatibility`

**Description:**
Before writing any auth code, review Clerk's official documentation for Next.js 16 and `proxy.ts` compatibility. Document the correct integration pattern. If Clerk does not yet support Next.js 16, evaluate alternatives and seek approval before proceeding.

**Acceptance Criteria:**

- [ ] Clerk documentation reviewed for Next.js 16 / `proxy.ts` support
- [ ] Integration pattern documented in `docs/clerk-integration-notes.md`
- [ ] If incompatible: alternative approach documented and approved before proceeding
- [ ] Decision approved before any auth code is written

**Dependencies:**
Depends on: Milestone 1 complete

**Testing Requirements:**

- [ ] Document exists and is approved
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Auth] Install and configure Clerk

**GitHub Issue:** [#12](https://github.com/joeburton/peak-tracker/issues/12)
**Milestone:** Milestone 2 — Authentication
**Branch:** `feature/<issue-number>-clerk-install`

**Description:**
Install the Clerk Next.js SDK. Add Clerk environment variables to `.env.local` (not committed). Update `.env.example` with Clerk keys (empty values). Wrap the root layout with `ClerkProvider`.

**Acceptance Criteria:**

- [ ] `@clerk/nextjs` installed
- [ ] Clerk environment variables documented in `.env.example`
- [ ] `ClerkProvider` wrapping the root layout
- [ ] `npm run build` passes

**Dependencies:**
Depends on: `[Auth] Verify Clerk + Next.js 16 proxy.ts compatibility`

**Testing Requirements:**

- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Auth] Implement proxy.ts for Clerk auth and route protection

**GitHub Issue:** [#13](https://github.com/joeburton/peak-tracker/issues/13)
**Milestone:** Milestone 2 — Authentication
**Branch:** `feature/<issue-number>-proxy-ts`

**Description:**
Implement `src/proxy.ts` as the Next.js 16 replacement for `middleware.ts`. Configure Clerk route protection via `proxy.ts`. All progress-related routes must reject unauthenticated requests.

**Acceptance Criteria:**

- [ ] `src/proxy.ts` exists and is correctly configured
- [ ] Unauthenticated requests to progress routes are redirected or rejected
- [ ] Public routes (home, peak list pages) remain accessible without auth
- [ ] `npm run build` passes

**Dependencies:**
Depends on: `[Auth] Install and configure Clerk`

**Testing Requirements:**

- [ ] Unit test: unauthenticated request to a protected route returns 401 or redirects
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Auth] Create /sign-in and /sign-up pages

**GitHub Issue:** [#14](https://github.com/joeburton/peak-tracker/issues/14)
**Milestone:** Milestone 2 — Authentication
**Branch:** `feature/<issue-number>-auth-pages`

**Description:**
Implement `/sign-in/[[...sign-in]]/page.tsx` and `/sign-up/[[...sign-up]]/page.tsx` using Clerk's hosted UI components. Redirect URLs must use environment variables.

**Acceptance Criteria:**

- [ ] `/sign-in` renders Clerk `<SignIn />` component
- [ ] `/sign-up` renders Clerk `<SignUp />` component
- [ ] After sign-in, user is redirected to `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- [ ] After sign-up, user is redirected to `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- [ ] Pages are mobile-responsive

**Dependencies:**
Depends on: `[Auth] Install and configure Clerk`

**Testing Requirements:**

- [ ] Playwright E2E: user can sign in and is redirected correctly
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Auth] Protect progress routes — reject unauthenticated requests

**GitHub Issue:** [#15](https://github.com/joeburton/peak-tracker/issues/15)
**Milestone:** Milestone 2 — Authentication
**Branch:** `feature/<issue-number>-protect-progress-routes`

**Description:**
Ensure all API routes and server actions that access or modify progress data require an authenticated Clerk session. `userId` must be present; requests without it must be rejected with 401.

**Acceptance Criteria:**

- [ ] All progress-related API routes check for a valid Clerk session
- [ ] Requests without a valid session return 401
- [ ] `userId` is extracted from the Clerk session and available for repository calls

**Dependencies:**
Depends on: `[Auth] Implement proxy.ts for Clerk auth and route protection`

**Testing Requirements:**

- [ ] Unit test: unauthenticated request to progress route returns 401
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Auth] Surface userId server-side for repository use

**GitHub Issue:** [#16](https://github.com/joeburton/peak-tracker/issues/16)
**Milestone:** Milestone 2 — Authentication
**Branch:** `feature/<issue-number>-userid-server`

**Description:**
Implement a utility that extracts the Clerk `userId` in Server Components and API route handlers for use in repository calls. The `userId` must never be trusted from the client.

**Acceptance Criteria:**

- [ ] A server-side utility extracts `userId` from the Clerk session
- [ ] `userId` is passed to repository calls (not sourced from request body/query)
- [ ] Type is `string` (non-nullable) — callers must handle the unauthenticated case before reaching this utility

**Dependencies:**
Depends on: `[Auth] Protect progress routes — reject unauthenticated requests`

**Testing Requirements:**

- [ ] Unit test: utility returns `userId` for an authenticated session
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

## Milestone 3 — Database

---

### [Database] Set up MongoDB connection

**GitHub Issue:** [#17](https://github.com/joeburton/peak-tracker/issues/17)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-mongodb-connection`

**Description:**
Implement `src/lib/db/mongodb.ts` — a singleton MongoDB client that connects to the URI specified in `MONGODB_URI`. Toggle between local and Atlas by changing `MONGODB_URI` only. No code changes required to switch environments.

**Acceptance Criteria:**

- [ ] `src/lib/db/mongodb.ts` implements a singleton client
- [ ] Connection string sourced exclusively from `MONGODB_URI`
- [ ] Connection is reused across requests in development (hot-reload safe)
- [ ] No raw MongoDB client imported outside `mongodb.ts` and the repository layer

**Dependencies:**
Depends on: Milestone 2 complete

**Testing Requirements:**

- [ ] Unit test: client connects and returns a db reference
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Implement PeakListRepository

**GitHub Issue:** [#18](https://github.com/joeburton/peak-tracker/issues/18)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-peak-list-repository`

**Description:**
Implement `src/lib/db/repositories/peak-list-repository.ts` with methods: `findAll()`, `findBySlug(slug: string)`. All methods must use the repository interface — no raw MongoDB access outside this file.

**Acceptance Criteria:**

- [ ] `findAll()` returns all peak lists
- [ ] `findBySlug(slug)` returns a single peak list or null
- [ ] Repository is independently unit-testable with a mock MongoDB adapter
- [ ] Return types match the `PeakList` TypeScript interface
- [ ] MongoDB `_id` (ObjectId) is mapped to `id: string` in all returned documents — the `_id` field must never leak into the TypeScript interface

**Dependencies:**
Depends on: `[Database] Set up MongoDB connection`

**Testing Requirements:**

- [ ] Unit tests for `findAll()` and `findBySlug()`
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Implement PeakRepository

**GitHub Issue:** [#19](https://github.com/joeburton/peak-tracker/issues/19)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-peak-repository`

**Description:**
Implement `src/lib/db/repositories/peak-repository.ts` with methods: `findByListSlug(peakListSlug: string)`, `findBySlug(slug: string)`, `findByRegion(peakListSlug: string, region: string)`.

**Acceptance Criteria:**

- [ ] `findByListSlug(peakListSlug)` returns all peaks for a list
- [ ] `findBySlug(slug)` returns a single peak or null
- [ ] `findByRegion(peakListSlug, region)` returns peaks for a list filtered by region
- [ ] Repository is independently unit-testable with a mock adapter
- [ ] Return types match the `Peak` TypeScript interface
- [ ] MongoDB `_id` (ObjectId) is mapped to `id: string` in all returned documents — the `_id` field must never leak into the TypeScript interface

**Dependencies:**
Depends on: `[Database] Set up MongoDB connection`

**Testing Requirements:**

- [ ] Unit tests for all methods
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Implement ProgressRepository

**GitHub Issue:** [#20](https://github.com/joeburton/peak-tracker/issues/20)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-progress-repository`

**Description:**
Implement `src/lib/db/repositories/progress-repository.ts` with methods: `findByUserId(userId: string)`, `upsert(userId: string, data: ProgressUpdate)`. The `dirty` field must never be written to or read from MongoDB.

**Acceptance Criteria:**

- [ ] `findByUserId(userId)` returns the user's progress or null
- [ ] `upsert(userId, data)` creates or updates the progress record
- [ ] `dirty` field is explicitly excluded from all reads and writes
- [ ] `version` is incremented on every upsert
- [ ] Repository is independently unit-testable with a mock adapter

**Dependencies:**
Depends on: `[Database] Set up MongoDB connection`

**Testing Requirements:**

- [ ] Unit tests confirming `dirty` is never written to MongoDB
- [ ] Unit tests for `findByUserId()` and `upsert()`
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Define and create MongoDB indexes

**GitHub Issue:** [#21](https://github.com/joeburton/peak-tracker/issues/21)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-mongodb-indexes`

**Description:**
Create all required MongoDB indexes at collection setup. Indexes must not be created lazily. Write a script or migration that creates indexes idempotently.

**Acceptance Criteria:**

- [ ] `peakLists.slug` — unique index
- [ ] `peaks.slug` — unique index
- [ ] `peaks.peakListSlug` — index
- [ ] `peaks.region` — index
- [ ] `peaks.heightMetres` — index
- [ ] `progress.userId` — index
- [ ] Index creation script is idempotent

**Dependencies:**
Depends on: `[Database] Set up MongoDB connection`

**Testing Requirements:**

- [ ] Index creation script runs without error on a clean database
- [ ] Index creation script is idempotent (safe to run twice)
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Write Zod schemas for all domain models

**GitHub Issue:** [#22](https://github.com/joeburton/peak-tracker/issues/22)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-zod-schemas`

**Description:**
Write Zod schemas for `PeakList`, `Peak`, and `UserProgress`. TypeScript types must be inferred from Zod schemas — not defined separately. These schemas are used in seed scripts and API boundaries.

**Acceptance Criteria:**

- [ ] `PeakListSchema` — matches the `PeakList` domain model
- [ ] `PeakSchema` — matches the `Peak` domain model; `latitude` and `longitude` required and validated
- [ ] `UserProgressSchema` — matches the `UserProgress` domain model; `dirty` field excluded
- [ ] TypeScript types inferred from schemas via `z.infer<>`
- [ ] `PeakListStatistics` TypeScript interface defined (computed type — no Zod schema required): `{ total: number; completed: number; remaining: number; percentageComplete: number }`
- [ ] Schemas and interfaces exported from `src/lib/validation/`

**Dependencies:**
Depends on: `[Database] Set up MongoDB connection`

**Testing Requirements:**

- [ ] Unit tests: valid and invalid data against each schema
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Fetch and clean Wainwright data from DoBIH

**GitHub Issue:** [#23](https://github.com/joeburton/peak-tracker/issues/23)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-dobih-wainwrights`

**Description:**
Fetch Wainwright data from the Database of British and Irish Hills (DoBIH). Clean and transform to match the `Peak` schema. All 214 Wainwrights must be present with valid coordinates, heights, names, and regions.

**Acceptance Criteria:**

- [ ] All 214 Wainwrights fetched from DoBIH
- [ ] Data cleaned and transformed to match the `Peak` schema
- [ ] Every record validates against `PeakSchema`
- [ ] `slug` generated for each peak (URL-safe, unique, derived from name)
- [ ] `region` mapped from DoBIH region data
- [ ] `createdAt` and `updatedAt` set on every record (ISO 8601 string)
- [ ] Cleaned data stored as a JSON seed file at `scripts/data/wainwrights.json`

**Dependencies:**
Depends on: `[Database] Write Zod schemas for all domain models`

**Testing Requirements:**

- [ ] All 214 records validate against `PeakSchema`
- [ ] All slugs are unique
- [ ] All coordinates are present and valid
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Fetch and clean Munro data from DoBIH

**GitHub Issue:** [#24](https://github.com/joeburton/peak-tracker/issues/24)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-dobih-munros`

**Description:**
Fetch Munro data from DoBIH. Clean and transform to match the `Peak` schema. All 282 Munros must be present with valid coordinates, heights, names, and regions.

**Acceptance Criteria:**

- [ ] All 282 Munros fetched from DoBIH
- [ ] Data cleaned and transformed to match the `Peak` schema
- [ ] Every record validates against `PeakSchema`
- [ ] `slug` generated for each peak (URL-safe, unique, derived from name)
- [ ] `region` mapped from DoBIH region data
- [ ] `createdAt` and `updatedAt` set on every record (ISO 8601 string)
- [ ] Cleaned data stored at `scripts/data/munros.json`

**Dependencies:**
Depends on: `[Database] Write Zod schemas for all domain models`

**Testing Requirements:**

- [ ] All 282 records validate against `PeakSchema`
- [ ] All slugs are unique
- [ ] All coordinates are present and valid
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Write seed-peak-lists.ts

**GitHub Issue:** [#25](https://github.com/joeburton/peak-tracker/issues/25)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-seed-peak-lists`

**Description:**
Write `scripts/seed-peak-lists.ts` — an idempotent script that inserts or updates the `peakLists` collection. Must insert Wainwrights and Munros list records.

**Acceptance Criteria:**

- [ ] Script is idempotent (safe to run multiple times)
- [ ] Inserts or upserts `wainwrights` and `munros` peak list records
- [ ] Each record validates against `PeakListSchema`
- [ ] Script exits zero on success, non-zero on failure

**Dependencies:**
Depends on: `[Database] Write Zod schemas for all domain models`, `[Database] Define and create MongoDB indexes`

**Testing Requirements:**

- [ ] Script runs on a clean database — correct records inserted
- [ ] Script runs on a populated database — no duplicates
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Write seed-wainwrights.ts

**GitHub Issue:** [#26](https://github.com/joeburton/peak-tracker/issues/26)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-seed-wainwrights`

**Description:**
Write `scripts/seed-wainwrights.ts` — an idempotent script that inserts or updates the `peaks` collection with all 214 Wainwright records from `scripts/data/wainwrights.json`.

**Acceptance Criteria:**

- [ ] Script is idempotent
- [ ] All 214 Wainwrights upserted into `peaks` collection
- [ ] Each record validates against `PeakSchema` before insertion
- [ ] Script exits zero on success, non-zero on validation failure

**Dependencies:**
Depends on: `[Database] Fetch and clean Wainwright data from DoBIH`, `[Database] Write seed-peak-lists.ts`

**Testing Requirements:**

- [ ] Script runs on a clean database — 214 records inserted
- [ ] Script runs twice — no duplicates, record count unchanged
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Write seed-munros.ts

**GitHub Issue:** [#27](https://github.com/joeburton/peak-tracker/issues/27)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-seed-munros`

**Description:**
Write `scripts/seed-munros.ts` — an idempotent script that inserts or updates the `peaks` collection with all 282 Munro records from `scripts/data/munros.json`.

**Acceptance Criteria:**

- [ ] Script is idempotent
- [ ] All 282 Munros upserted into `peaks` collection
- [ ] Each record validates against `PeakSchema` before insertion
- [ ] Script exits zero on success, non-zero on validation failure

**Dependencies:**
Depends on: `[Database] Fetch and clean Munro data from DoBIH`, `[Database] Write seed-peak-lists.ts`

**Testing Requirements:**

- [ ] Script runs on a clean database — 282 records inserted
- [ ] Script runs twice — no duplicates
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Write verify-seed.ts

**GitHub Issue:** [#28](https://github.com/joeburton/peak-tracker/issues/28)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-verify-seed`

**Description:**
Write `scripts/verify-seed.ts` — a verification script that exits non-zero if any integrity check fails. Run as part of the CI pipeline after seed scripts.

**Acceptance Criteria:**

- [ ] Confirms 214 Wainwrights in `peaks` collection
- [ ] Confirms 282 Munros in `peaks` collection
- [ ] Confirms all slugs are unique across the collection
- [ ] Confirms all heights (metres and feet) are valid positive numbers
- [ ] Confirms all `latitude` and `longitude` values are present and within valid ranges
- [ ] Confirms all required fields are present on every record
- [ ] Exits with code 0 on success
- [ ] Exits with code 1 on any failure, with a descriptive error message

**Dependencies:**
Depends on: `[Database] Write seed-wainwrights.ts`, `[Database] Write seed-munros.ts`

**Testing Requirements:**

- [ ] `verify-seed.ts` passes on a correctly seeded database
- [ ] `verify-seed.ts` fails (non-zero) on a database missing records
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Write reset-db.ts

**GitHub Issue:** [#29](https://github.com/joeburton/peak-tracker/issues/29)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-reset-db`

**Description:**
Write `scripts/reset-db.ts` — drops all collections and re-runs seed scripts. Development use only. Must refuse to run if `MONGODB_URI` points to Atlas (contains `atlas` or `mongodb.net`).

**Acceptance Criteria:**

- [ ] Drops all collections and re-seeds on a local database
- [ ] Refuses to run if `MONGODB_URI` contains `atlas` or `mongodb.net`
- [ ] Script exits zero on success, non-zero on failure
- [ ] Script is idempotent (leaves the database in a clean, seeded state)

**Dependencies:**
Depends on: `[Database] Write verify-seed.ts`

**Testing Requirements:**

- [ ] Script clears and re-seeds correctly on a local database
- [ ] Script refuses and exits non-zero against an Atlas URI
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Write export-progress.ts and import-progress.ts

**GitHub Issue:** [#30](https://github.com/joeburton/peak-tracker/issues/30)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-export-import-progress`

**Description:**
Write `scripts/export-progress.ts` and `scripts/import-progress.ts`. Export writes a given user's progress to a JSON file. Import reads from that file and upserts it for the given `userId`.

**Acceptance Criteria:**

- [ ] `export-progress.ts` accepts a `userId` argument and writes progress to `scripts/data/progress-<userId>.json`
- [ ] `import-progress.ts` accepts a `userId` and a JSON file path, and upserts the progress record via `ProgressRepository`
- [ ] Export/import round-trip preserves all progress fields (`completedPeakIds`, `updatedAt`, `version`)
- [ ] Both scripts exit zero on success, non-zero on failure

**Dependencies:**
Depends on: `[Database] Write verify-seed.ts`

**Testing Requirements:**

- [ ] Export/import round-trip preserves all data
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Database] Add verify-seed.ts to CI pipeline

**GitHub Issue:** [#31](https://github.com/joeburton/peak-tracker/issues/31)
**Milestone:** Milestone 3 — Database
**Branch:** `feature/<issue-number>-verify-seed-ci`

**Description:**
Add `verify-seed.ts` as a step in the GitHub Actions CI pipeline. The pipeline must run seed scripts on a test database and then run `verify-seed.ts`. CI fails if `verify-seed.ts` exits non-zero.

**Acceptance Criteria:**

- [ ] CI pipeline runs `seed-peak-lists.ts`, `seed-wainwrights.ts`, `seed-munros.ts`, then `verify-seed.ts` in order
- [ ] CI fails if `verify-seed.ts` exits non-zero
- [ ] CI uses a local MongoDB instance (not Atlas)
- [ ] Pipeline passes on a clean run

**Dependencies:**
Depends on: `[Database] Write reset-db.ts`, `[Foundation] Set up GitHub Actions CI pipeline`

**Testing Requirements:**

- [ ] CI pipeline passes on the feature branch PR
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

## Milestone 4 — Offline Architecture

---

### [Offline] Set up Dexie with initial schema

**GitHub Issue:** [#32](https://github.com/joeburton/peak-tracker/issues/32)
**Milestone:** Milestone 4 — Offline Architecture
**Branch:** `feature/<issue-number>-dexie-setup`

**Description:**
Install Dexie and define the initial schema version. Create `src/db/dexie.ts` and `src/db/schema.ts`. Schema must be versioned for future migrations.

**Acceptance Criteria:**

- [ ] Dexie installed
- [ ] `src/db/dexie.ts` exports the Dexie instance
- [ ] `src/db/schema.ts` defines the schema with version 1
- [ ] Schema includes `progress` table with all required fields
- [ ] `dirty` field is present in the schema

**Dependencies:**
Depends on: Milestone 3 complete

**Testing Requirements:**

- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Offline] Implement LocalProgressRepository

**GitHub Issue:** [#33](https://github.com/joeburton/peak-tracker/issues/33)
**Milestone:** Milestone 4 — Offline Architecture
**Branch:** `feature/<issue-number>-local-progress-repository`

**Description:**
Implement `src/db/repositories/local-progress-repository.ts` with methods: `get(userId: string)`, `upsert(userId: string, data)`, `markDirty(userId: string)`, `markClean(userId: string)`.

**Acceptance Criteria:**

- [ ] `get(userId)` returns the local progress record or undefined
- [ ] `upsert(userId, data)` creates or updates the local record
- [ ] `markDirty(userId)` sets `dirty: true`
- [ ] `markClean(userId)` sets `dirty: false` and updates `lastSyncedAt`
- [ ] Repository is independently unit-testable with a fake Dexie adapter
- [ ] No direct Dexie table access outside this file

**Dependencies:**
Depends on: `[Offline] Set up Dexie with initial schema`

**Testing Requirements:**

- [ ] Unit tests for all methods
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Offline] Set up userPreferences Dexie table and UserPreferencesRepository

**GitHub Issue:** [#34](https://github.com/joeburton/peak-tracker/issues/34)
**Milestone:** Milestone 4 — Offline Architecture
**Branch:** `feature/<issue-number>-user-preferences-dexie`

**Description:**
Add a `userPreferences` table to the Dexie schema for substantive user preferences that are designed for future cross-device sync (e.g. units: `metric` | `imperial`, display settings). This is distinct from device-local UI state (theme, viewMode, sidebar) which is handled by Zustand `persist`. Implement `UserPreferencesRepository`.

**Acceptance Criteria:**

- [ ] `userPreferences` table added to Dexie schema (versioned migration)
- [ ] `UserPreferencesRepository` implemented with `get(userId)` and `upsert(userId, prefs)` methods
- [ ] Schema migration is non-destructive
- [ ] Boundary documented: Zustand `persist` handles device-local UI state (theme, viewMode, sidebar); Dexie handles syncable preferences (units, display settings)
- [ ] No syncable preferences stored in Zustand `persist`

**Dependencies:**
Depends on: `[Offline] Set up Dexie with initial schema`

**Testing Requirements:**

- [ ] Unit tests for `get()` and `upsert()`
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Offline] Implement sync metadata table

**GitHub Issue:** [#35](https://github.com/joeburton/peak-tracker/issues/35)
**Milestone:** Milestone 4 — Offline Architecture
**Branch:** `feature/<issue-number>-sync-metadata`

**Description:**
Add a `syncMetadata` table to the Dexie schema. This stores the last sync timestamp and any pending change metadata. Implement `SyncMetadataRepository`.

**Acceptance Criteria:**

- [ ] `syncMetadata` table added to Dexie schema (version 3 migration — v1: progress, v2: userPreferences, v3: syncMetadata)
- [ ] `SyncMetadataRepository` with `get()`, `setLastSynced(timestamp)` methods
- [ ] Schema migration from version 2 to version 3 is correct and non-destructive

**Dependencies:**
Depends on: `[Offline] Set up userPreferences Dexie table and UserPreferencesRepository`

**Testing Requirements:**

- [ ] Unit tests for `SyncMetadataRepository`
- [ ] Migration test: v2 → v3 preserves existing data
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Offline] Implement schema migration strategy

**GitHub Issue:** [#36](https://github.com/joeburton/peak-tracker/issues/36)
**Milestone:** Milestone 4 — Offline Architecture
**Branch:** `feature/<issue-number>-dexie-migrations`

**Description:**
Document and implement the Dexie schema migration strategy. Each schema version must have a corresponding migration. Migrations must be non-destructive. A test confirms that migrating from the previous version preserves all data.

**Acceptance Criteria:**

- [ ] Migration strategy documented in `src/db/README.md`
- [ ] Schema version history documented: v1 (progress), v2 (userPreferences), v3 (syncMetadata)
- [ ] Each schema version has a corresponding Dexie `version().upgrade()` block
- [ ] Migration from any prior version is non-destructive

**Dependencies:**
Depends on: `[Offline] Set up userPreferences Dexie table and UserPreferencesRepository`, `[Offline] Implement sync metadata table`

**Testing Requirements:**

- [ ] Migration tests: upgrading from version N to N+1 preserves existing records
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Offline] Unit test Dexie repositories

**GitHub Issue:** [#37](https://github.com/joeburton/peak-tracker/issues/37)
**Milestone:** Milestone 4 — Offline Architecture
**Branch:** `feature/<issue-number>-dexie-repo-tests`

**Description:**
Ensure all Dexie repositories have comprehensive unit tests using fake/mock Dexie adapters. Tests must run without a real browser environment.

**Acceptance Criteria:**

- [ ] `LocalProgressRepository` unit tests cover all methods and edge cases
- [ ] `UserPreferencesRepository` unit tests cover all methods and edge cases
- [ ] `SyncMetadataRepository` unit tests cover all methods
- [ ] Tests run in Vitest without a browser environment (using `fake-indexeddb` or equivalent)

**Dependencies:**
Depends on: `[Offline] Implement schema migration strategy`

**Testing Requirements:**

- [ ] All tests pass
- [ ] Coverage for Dexie repositories ≥ 80%
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Offline] Verify dirty flag never reaches MongoDB

**GitHub Issue:** [#38](https://github.com/joeburton/peak-tracker/issues/38)
**Milestone:** Milestone 4 — Offline Architecture
**Branch:** `feature/<issue-number>-dirty-flag-guard`

**Description:**
Add a safeguard — in the `ProgressRepository` (MongoDB) — that explicitly strips or rejects the `dirty` field if it is ever accidentally passed. Add a unit test that confirms `dirty` is absent from all MongoDB writes.

**Acceptance Criteria:**

- [ ] `ProgressRepository` (MongoDB) strips `dirty` field on every write
- [ ] Unit test confirms `dirty` is never present in a MongoDB write
- [ ] TypeScript type for MongoDB progress document excludes `dirty`

**Dependencies:**
Depends on: `[Offline] Implement LocalProgressRepository`

**Testing Requirements:**

- [ ] Unit test: `dirty` field is stripped from MongoDB write
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

## Milestone 5 — State Management

---

### [State] Set up TanStack Query provider

**GitHub Issue:** [#39](https://github.com/joeburton/peak-tracker/issues/39)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-tanstack-query`

**Description:**
Install TanStack Query and wrap the application with `QueryClientProvider`. Configure sensible defaults for `staleTime` and `gcTime`.

**Acceptance Criteria:**

- [ ] `@tanstack/react-query` installed
- [ ] `QueryClientProvider` wraps the root layout
- [ ] Default `staleTime` and `gcTime` configured
- [ ] React Query Devtools enabled in development only

**Dependencies:**
Depends on: Milestone 4 complete

**Testing Requirements:**

- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [State] Create src/lib/queryKeys.ts

**GitHub Issue:** [#40](https://github.com/joeburton/peak-tracker/issues/40)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-query-keys`

**Description:**
Create `src/lib/queryKeys.ts` as the single source of truth for all TanStack Query keys. No query key strings may be defined inline in hooks or components.

**Acceptance Criteria:**

- [ ] `src/lib/queryKeys.ts` exists and exports all query key factories
- [ ] Keys defined for: peak lists, peaks by list slug, peak by slug, statistics, progress
- [ ] No inline query key strings anywhere in the codebase

**Dependencies:**
Depends on: `[State] Set up TanStack Query provider`

**Testing Requirements:**

- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [State] Create Zustand store — search

**GitHub Issue:** [#41](https://github.com/joeburton/peak-tracker/issues/41)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-store-search`

**Description:**
Implement the search Zustand store with `searchTerm` (raw input) and `debouncedSearchTerm` (debounced, 300ms).

**Acceptance Criteria:**

- [ ] Store exposes `searchTerm`, `debouncedSearchTerm`, `setSearchTerm()`
- [ ] `debouncedSearchTerm` updates 300ms after `searchTerm` changes
- [ ] Store is independently unit-testable

**Dependencies:**
Depends on: `[State] Set up TanStack Query provider`

**Testing Requirements:**

- [ ] Unit tests for `setSearchTerm()` and debounce behaviour
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [State] Create Zustand store — filters

**GitHub Issue:** [#42](https://github.com/joeburton/peak-tracker/issues/42)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-store-filters`

**Description:**
Implement the filters Zustand store. Filters: completion status (`all` | `complete` | `incomplete`) and region (string, dynamic — never hardcoded).

**Acceptance Criteria:**

- [ ] Store exposes `completionFilter`, `regionFilter`, `setCompletionFilter()`, `setRegionFilter()`, `resetFilters()`
- [ ] Defaults: `completionFilter: 'all'`, `regionFilter: null`
- [ ] Store is independently unit-testable

**Dependencies:**
Depends on: `[State] Set up TanStack Query provider`

**Testing Requirements:**

- [ ] Unit tests for filter actions and reset
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [State] Create Zustand store — sort

**GitHub Issue:** [#43](https://github.com/joeburton/peak-tracker/issues/43)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-store-sort`

**Description:**
Implement the sort Zustand store. Sort fields: `name`, `heightMetres`, `heightFeet`, `region`, `completionStatus`. Direction: `asc` | `desc`.

**Acceptance Criteria:**

- [ ] Store exposes `sortField`, `sortDirection`, `setSort()`, `toggleDirection()`
- [ ] Default: `sortField: 'name'`, `sortDirection: 'asc'`
- [ ] Store is independently unit-testable

**Dependencies:**
Depends on: `[State] Set up TanStack Query provider`

**Testing Requirements:**

- [ ] Unit tests for sort field and direction changes
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [State] Create Zustand store — UI preferences

**GitHub Issue:** [#44](https://github.com/joeburton/peak-tracker/issues/44)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-store-ui-prefs`

**Description:**
Implement the UI preferences Zustand store for device-local UI state: theme (`light` | `dark` | `system`), view mode (`list` | `map`), and sidebar state (`open` | `closed`). These are fast, synchronous, and intentionally device-specific — they do not sync across devices.

**Important boundary:** Zustand `persist` (localStorage) is for device-local UI state only. Substantive user preferences that need cross-device sync (e.g. units: `metric` | `imperial`) belong in Dexie via `UserPreferencesRepository` (see `[Offline] Set up userPreferences Dexie table`). This boundary must never be crossed.

**Acceptance Criteria:**

- [ ] Store exposes `theme`, `viewMode`, `sidebarOpen`, and setters
- [ ] `theme` and `viewMode` persisted via Zustand `persist` middleware (localStorage — device-local only)
- [ ] `sidebarOpen` not persisted (resets on page load)
- [ ] No syncable preferences (e.g. units) stored in this store — those belong in Dexie

**Dependencies:**
Depends on: `[State] Set up TanStack Query provider`

**Testing Requirements:**

- [ ] Unit tests for all actions
- [ ] Persistence test: theme survives a store reset
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [State] Create Zustand store — connectivity state

**GitHub Issue:** [#45](https://github.com/joeburton/peak-tracker/issues/45)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-store-connectivity`

**Description:**
Implement the connectivity Zustand store. Tracks `isOnline` (boolean) and `connectionQuality` (`good` | `slow` | `unknown`). `isOnline` must stay in sync with the browser's `navigator.onLine` and online/offline events.

**Acceptance Criteria:**

- [ ] Store exposes `isOnline`, `connectionQuality`, and setters
- [ ] `isOnline` initialised from `navigator.onLine`
- [ ] Online/offline browser events update `isOnline` automatically
- [ ] Store is independently unit-testable (events mockable)

**Dependencies:**
Depends on: `[State] Set up TanStack Query provider`

**Testing Requirements:**

- [ ] Unit tests for online/offline transitions
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [State] Create Zustand store — sync state

**GitHub Issue:** [#46](https://github.com/joeburton/peak-tracker/issues/46)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-store-sync`

**Description:**
Implement the sync state Zustand store. Tracks `isSyncing`, `lastSyncedAt`, `syncError`.

**Acceptance Criteria:**

- [ ] Store exposes `isSyncing`, `lastSyncedAt`, `syncError`, `setSyncing()`, `setSyncComplete()`, `setSyncError()`
- [ ] Store is independently unit-testable

**Dependencies:**
Depends on: `[State] Set up TanStack Query provider`

**Testing Requirements:**

- [ ] Unit tests for all sync state transitions
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [State] Create Zustand store — progress state

**GitHub Issue:** [#47](https://github.com/joeburton/peak-tracker/issues/47)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-store-progress`

**Description:**
Implement the progress Zustand store. Tracks locally toggled peak completions before sync confirmation. Used for optimistic UI updates.

**Acceptance Criteria:**

- [ ] Store exposes `pendingCompletions` (Set of peakIds), `addCompletion()`, `removeCompletion()`, `clearPending()`
- [ ] Store is independently unit-testable

**Dependencies:**
Depends on: `[State] Set up TanStack Query provider`

**Testing Requirements:**

- [ ] Unit tests for add, remove, and clear operations
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [State] Unit test all Zustand stores

**GitHub Issue:** [#48](https://github.com/joeburton/peak-tracker/issues/48)
**Milestone:** Milestone 5 — State Management
**Branch:** `feature/<issue-number>-store-tests`

**Description:**
Ensure all Zustand stores have comprehensive unit tests. Each store must be testable in isolation without requiring a DOM or browser environment.

**Acceptance Criteria:**

- [ ] All stores have unit tests covering all actions and edge cases
- [ ] Tests run in Vitest without a browser environment
- [ ] Coverage for all store files ≥ 80%

**Dependencies:**
Depends on: `[State] Create Zustand store — search`, `[State] Create Zustand store — filters`, `[State] Create Zustand store — sort`, `[State] Create Zustand store — UI preferences`, `[State] Create Zustand store — connectivity state`, `[State] Create Zustand store — sync state`, `[State] Create Zustand store — progress state`

**Testing Requirements:**

- [ ] All tests pass
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

## Milestone 6 — Core UI

---

### [Domain] Implement statistics service

**GitHub Issue:** [#49](https://github.com/joeburton/peak-tracker/issues/49)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-statistics-service`

**Description:**
Implement the statistics service at `src/features/peaks/services/statistics.service.ts`. This is a pure server-side service that computes derived statistics from a list of peaks and a set of completed peak IDs. It must not access the database directly and must be independently unit-testable.

**Acceptance Criteria:**

- [ ] `computeStatistics(peaks: Peak[], completedPeakIds: string[]): PeakListStatistics` implemented
- [ ] `computeRegionalStatistics(peaks: Peak[], completedPeakIds: string[]): Record<string, PeakListStatistics>` implemented
- [ ] Returns correct `total`, `completed`, `remaining`, `percentageComplete`
- [ ] Regional breakdown derived dynamically from peak data — no regions hardcoded
- [ ] Service is a pure function (no database access, no side effects)
- [ ] `PeakListStatistics` interface used as the return type (defined in `src/lib/validation/`)
- [ ] Statistics are never computed in repositories or client components

**Dependencies:**
Depends on: Milestone 5 complete, `[Database] Write Zod schemas for all domain models`

**Testing Requirements:**

- [ ] Unit tests: correct statistics for zero completed, some completed, all completed
- [ ] Unit tests: regional breakdown is correct for mock data
- [ ] Unit tests: handles empty peak list without error
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement root layout

**GitHub Issue:** [#50](https://github.com/joeburton/peak-tracker/issues/50)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-root-layout`

**Description:**
Implement `src/app/layout.tsx` with a header (app name, navigation links, auth state), main content area, and footer. Mobile-first. WCAG 2.1 AA.

**Acceptance Criteria:**

- [ ] Header shows app name and navigation
- [ ] Authenticated state shows user avatar/sign-out; unauthenticated shows sign-in link
- [ ] Layout is responsive (mobile-first)
- [ ] WCAG 2.1 AA: skip-to-content link, landmark roles, keyboard navigation

**Dependencies:**
Depends on: Milestone 5 complete

**Testing Requirements:**

- [ ] Component tests for header states (authenticated / unauthenticated)
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement home page

**GitHub Issue:** [#51](https://github.com/joeburton/peak-tracker/issues/51)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-home-page`

**Description:**
Implement `src/app/page.tsx`. Fetch all peak lists via `PeakListRepository` and render them dynamically. Future lists must appear automatically — no hardcoding.

**Acceptance Criteria:**

- [ ] Renders all peak lists from `PeakListRepository.findAll()`
- [ ] Each list shows name and peak count
- [ ] Each list links to `/peak-lists/[slug]`
- [ ] No list names or slugs hardcoded
- [ ] Mobile-responsive

**Dependencies:**
Depends on: `[UI] Implement root layout`

**Testing Requirements:**

- [ ] Component test: renders the correct number of list items for mock data
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement peak list page

**GitHub Issue:** [#52](https://github.com/joeburton/peak-tracker/issues/52)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-peak-list-page`

**Description:**
Implement `src/app/peak-lists/[slug]/page.tsx`. Fetches peaks for the given slug and renders the full peak list. Composes statistics, search, filter, sort, and peak list components.

**Acceptance Criteria:**

- [ ] Page fetches peaks via `PeakRepository.findByListSlug(slug)`
- [ ] Returns 404 for unknown slugs
- [ ] Renders statistics, search, filters, sort controls, and peak list
- [ ] Mobile-responsive

**Dependencies:**
Depends on: `[UI] Implement home page`

**Testing Requirements:**

- [ ] Component test: correct peaks rendered for mock data
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement statistics component

**GitHub Issue:** [#53](https://github.com/joeburton/peak-tracker/issues/53)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-statistics`

**Description:**
Implement a statistics component showing total, completed, remaining, and percentage complete. Statistics are computed server-side in a service layer.

**Acceptance Criteria:**

- [ ] Displays: total, completed, remaining, percentage complete
- [ ] Statistics computed server-side (never in the component)
- [ ] Accessible (WCAG 2.1 AA)

**Dependencies:**
Depends on: `[UI] Implement peak list page`

**Testing Requirements:**

- [ ] Unit test: statistics service computes correctly for various inputs
- [ ] Component test: renders correct values
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement regional statistics component

**GitHub Issue:** [#54](https://github.com/joeburton/peak-tracker/issues/54)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-regional-statistics`

**Description:**
Implement a regional statistics breakdown. Regions are derived dynamically from the dataset — never hardcoded.

**Acceptance Criteria:**

- [ ] Shows completed/total per region
- [ ] Regions derived from data (not hardcoded)
- [ ] Accessible

**Dependencies:**
Depends on: `[UI] Implement statistics component`

**Testing Requirements:**

- [ ] Unit test: regional statistics computed correctly for mock data
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement search component

**GitHub Issue:** [#55](https://github.com/joeburton/peak-tracker/issues/55)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-search`

**Description:**
Implement the search component. Uses the search Zustand store. Debounced (300ms). Case-insensitive. Filters the peak list client-side.

**Acceptance Criteria:**

- [ ] Input updates `searchTerm` in the search store
- [ ] Peak list filters based on `debouncedSearchTerm`
- [ ] Search is case-insensitive
- [ ] Accessible (label, ARIA attributes)

**Dependencies:**
Depends on: `[UI] Implement peak list page`

**Testing Requirements:**

- [ ] Component test: typing filters peaks correctly
- [ ] Component test: debounce delays filter application
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement completion status filter

**GitHub Issue:** [#56](https://github.com/joeburton/peak-tracker/issues/56)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-completion-filter`

**Description:**
Implement the completion status filter (All / Complete / Incomplete). Uses the filters Zustand store.

**Acceptance Criteria:**

- [ ] Three options: All, Complete, Incomplete
- [ ] Selection updates `completionFilter` in the filters store
- [ ] Peak list updates immediately on filter change
- [ ] Accessible (keyboard navigable)

**Dependencies:**
Depends on: `[UI] Implement search component`

**Testing Requirements:**

- [ ] Component test: each filter option shows correct peaks
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement region filter

**GitHub Issue:** [#57](https://github.com/joeburton/peak-tracker/issues/57)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-region-filter`

**Description:**
Implement the region filter. Options derived dynamically from the current peak list dataset. No regions hardcoded.

**Acceptance Criteria:**

- [ ] Region options generated from dataset (not hardcoded)
- [ ] Selection updates `regionFilter` in the filters store
- [ ] Peak list updates immediately on selection
- [ ] "All regions" option to clear filter

**Dependencies:**
Depends on: `[UI] Implement completion status filter`

**Testing Requirements:**

- [ ] Component test: region options match the dataset
- [ ] Component test: selecting a region filters peaks correctly
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement sorting

**GitHub Issue:** [#58](https://github.com/joeburton/peak-tracker/issues/58)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-sorting`

**Description:**
Implement sort controls. Sort fields: name, height metres, height feet, region, completion status. Direction: asc/desc. Uses the sort Zustand store.

**Acceptance Criteria:**

- [ ] All five sort fields available
- [ ] Direction toggle (asc/desc) for each field
- [ ] Peak list reorders immediately on sort change
- [ ] Accessible

**Dependencies:**
Depends on: `[UI] Implement region filter`

**Testing Requirements:**

- [ ] Component test: peaks are correctly ordered for each sort field and direction
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement peak list item component

**GitHub Issue:** [#59](https://github.com/joeburton/peak-tracker/issues/59)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-peak-list-item`

**Description:**
Implement a peak list item component showing peak name, height (metres and feet), region, and completion status indicator.

**Acceptance Criteria:**

- [ ] Displays: name, height (m and ft), region, completion status
- [ ] Completion status is visually distinct (e.g. tick/badge)
- [ ] Accessible (ARIA attributes for completion state)
- [ ] Mobile-responsive

**Dependencies:**
Depends on: `[UI] Implement peak list page`

**Testing Requirements:**

- [ ] Component test: renders all fields for a mock peak
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement progress toggle

**GitHub Issue:** [#60](https://github.com/joeburton/peak-tracker/issues/60)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-progress-toggle`

**Description:**
Implement the progress toggle on each peak list item. Optimistic update: update Dexie immediately, update UI instantly, mark `dirty: true`, sync to server when online.

**Acceptance Criteria:**

- [ ] Toggling a peak updates Dexie immediately
- [ ] UI updates optimistically (no loading state)
- [ ] `dirty: true` is set on the local progress record
- [ ] Statistics update immediately to reflect the change
- [ ] Requires authenticated user (toggle disabled/hidden for unauthenticated users)

**Dependencies:**
Depends on: `[UI] Implement peak list item component`, `[Offline] Implement LocalProgressRepository`

**Testing Requirements:**

- [ ] Component test: toggling updates the completion state
- [ ] Unit test: Dexie record is marked dirty after toggle
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Mobile-first responsive design

**GitHub Issue:** [#61](https://github.com/joeburton/peak-tracker/issues/61)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-responsive`

**Description:**
Audit and fix all pages for mobile-first responsive design. Test on 375px, 768px, and 1280px viewports.

**Acceptance Criteria:**

- [ ] All pages are usable on 375px viewport (iPhone SE)
- [ ] All pages are usable on 768px viewport (tablet)
- [ ] All pages are usable on 1280px viewport (desktop)
- [ ] No horizontal overflow at any tested viewport

**Dependencies:**
Depends on: `[UI] Implement root layout`, `[UI] Implement home page`, `[UI] Implement peak list page`, `[UI] Implement statistics component`, `[UI] Implement regional statistics component`, `[UI] Implement search component`, `[UI] Implement completion status filter`, `[UI] Implement region filter`, `[UI] Implement sorting`, `[UI] Implement peak list item component`, `[UI] Implement progress toggle`

**Testing Requirements:**

- [ ] Playwright visual tests at all three viewport widths
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] WCAG 2.1 AA accessibility audit

**GitHub Issue:** [#62](https://github.com/joeburton/peak-tracker/issues/62)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-accessibility`

**Description:**
Audit all pages and components against WCAG 2.1 AA. Fix all failures. Use axe-core in tests to automate detection.

**Acceptance Criteria:**

- [ ] axe-core reports zero violations on all pages
- [ ] All interactive elements keyboard navigable
- [ ] All form controls have visible labels
- [ ] Colour contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] All images have alt text

**Dependencies:**
Depends on: `[UI] Mobile-first responsive design`

**Testing Requirements:**

- [ ] axe-core integrated into Playwright E2E suite
- [ ] Zero axe violations on all pages
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [UI] Implement offline fallback page

**GitHub Issue:** [#63](https://github.com/joeburton/peak-tracker/issues/63)
**Milestone:** Milestone 6 — Core UI
**Branch:** `feature/<issue-number>-offline-page`

**Description:**
Implement `src/app/offline/page.tsx` — shown when the user navigates to a page that is not cached and there is no network connection.

**Acceptance Criteria:**

- [ ] Page renders correctly with no network connection
- [ ] Clear messaging explaining the offline state
- [ ] Link to return to the home page (if cached)

**Dependencies:**
Depends on: `[UI] Implement root layout`

**Testing Requirements:**

- [ ] Playwright E2E: navigating offline shows the offline page
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

## Milestone 7 — Synchronisation

---

### [Sync] Design and document API routes

**GitHub Issue:** [#64](https://github.com/joeburton/peak-tracker/issues/64)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-api-route-design`

**Description:**
Design all API routes required for the sync engine. Document request/response shapes, authentication requirements, and error responses. This is the gate ticket for Milestone 7 — all remaining sync tickets depend on this being approved.

**Acceptance Criteria:**

- [ ] API routes documented in `docs/api-routes.md`
- [ ] Each route specifies: method, path, auth requirement, request body, response body, error codes
- [ ] Document approved before remaining Milestone 7 tickets begin

**Dependencies:**
Depends on: Milestone 6 complete

**Testing Requirements:**

- [ ] Document exists and is approved
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Sync] Implement progress GET API route

**GitHub Issue:** [#65](https://github.com/joeburton/peak-tracker/issues/65)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-progress-get-api`

**Description:**
Implement the GET `/api/progress` route. Returns the authenticated user's progress from MongoDB via `ProgressRepository`. Requires Clerk auth.

**Acceptance Criteria:**

- [ ] Returns 401 for unauthenticated requests
- [ ] Returns progress for the authenticated `userId`
- [ ] Returns 200 with empty progress if no record exists
- [ ] Response validated against `UserProgressSchema` (without `dirty`)

**Dependencies:**
Depends on: `[Sync] Design and document API routes`

**Testing Requirements:**

- [ ] Unit test: authenticated request returns correct progress
- [ ] Unit test: unauthenticated request returns 401
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Sync] Implement progress PUT/PATCH API route

**GitHub Issue:** [#66](https://github.com/joeburton/peak-tracker/issues/66)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-progress-put-api`

**Description:**
Implement the PUT/PATCH `/api/progress` route. Accepts updated progress from the client and upserts via `ProgressRepository`. Requires Clerk auth.

**Acceptance Criteria:**

- [ ] Returns 401 for unauthenticated requests
- [ ] Validates request body against `UserProgressSchema`
- [ ] Returns 400 for invalid request body
- [ ] Upserts progress for the authenticated `userId`
- [ ] `dirty` field rejected if present in request body

**Dependencies:**
Depends on: `[Sync] Implement progress GET API route`

**Testing Requirements:**

- [ ] Unit test: valid request upserts correctly
- [ ] Unit test: `dirty` field is rejected
- [ ] Unit test: unauthenticated request returns 401
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Sync] Implement sync engine — push dirty records

**GitHub Issue:** [#67](https://github.com/joeburton/peak-tracker/issues/67)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-sync-push`

**Description:**
Implement the push phase of the sync engine. When the device is online and the local progress record is `dirty: true`, push the local record to the server via the progress PUT API route.

**Acceptance Criteria:**

- [ ] Sync engine reads dirty records from `LocalProgressRepository`
- [ ] Pushes dirty records to the server via the progress API
- [ ] On success: marks record as `dirty: false` and updates `lastSyncedAt`
- [ ] On failure: retains `dirty: true` and records the error in sync state
- [ ] Sync state store is updated throughout

**Dependencies:**
Depends on: `[Sync] Implement progress PUT/PATCH API route`

**Testing Requirements:**

- [ ] Unit tests for push flow (success and failure)
- [ ] Unit test: `dirty` is false after successful push
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Sync] Implement sync engine — pull latest server state

**GitHub Issue:** [#68](https://github.com/joeburton/peak-tracker/issues/68)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-sync-pull`

**Description:**
Implement the pull phase of the sync engine. After pushing, fetch the latest server state and update the local Dexie record if the server version is newer.

**Acceptance Criteria:**

- [ ] Pulls latest progress from server via GET API route
- [ ] Compares `updatedAt` and `version` (Last Write Wins)
- [ ] Updates local Dexie record if server version is newer
- [ ] Invalidates relevant TanStack Query keys after pull

**Dependencies:**
Depends on: `[Sync] Implement sync engine — push dirty records`

**Testing Requirements:**

- [ ] Unit tests for pull flow and conflict resolution
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Sync] Implement Last Write Wins conflict resolution

**GitHub Issue:** [#69](https://github.com/joeburton/peak-tracker/issues/69)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-conflict-resolution`

**Description:**
Implement the Last Write Wins conflict resolution strategy. Based on `updatedAt` timestamp and `version` number. The record with the higher `version` (or more recent `updatedAt` if versions are equal) wins.

**Acceptance Criteria:**

- [ ] Conflict resolution logic is in a pure function (independently testable)
- [ ] Server wins if server `version` > local `version`
- [ ] Local wins if local `version` > server `version`
- [ ] `updatedAt` used as tiebreaker if versions are equal

**Dependencies:**
Depends on: `[Sync] Implement sync engine — pull latest server state`

**Testing Requirements:**

- [ ] Unit tests for all conflict scenarios (server wins, local wins, tiebreaker)
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Sync] Implement online/offline detection and auto-sync

**GitHub Issue:** [#70](https://github.com/joeburton/peak-tracker/issues/70)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-auto-sync`

**Description:**
When the device comes online, automatically trigger a sync cycle for any dirty local records. Uses the connectivity Zustand store.

**Acceptance Criteria:**

- [ ] Sync is triggered automatically when `isOnline` transitions from false to true
- [ ] Sync is not triggered on page load if no dirty records exist
- [ ] Sync state store reflects the sync in progress

**Dependencies:**
Depends on: `[Sync] Implement Last Write Wins conflict resolution`

**Testing Requirements:**

- [ ] Unit test: sync triggered on online transition
- [ ] Unit test: sync not triggered when no dirty records
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Sync] Integrate sync state store with sync engine

**GitHub Issue:** [#71](https://github.com/joeburton/peak-tracker/issues/71)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-sync-state-integration`

**Description:**
Ensure the sync state Zustand store accurately reflects the sync engine state throughout the sync lifecycle (idle, syncing, success, error).

**Acceptance Criteria:**

- [ ] `isSyncing: true` during sync
- [ ] `lastSyncedAt` updated on success
- [ ] `syncError` set on failure, cleared on success
- [ ] UI component surfaces sync state (e.g. "Last synced: 2 minutes ago")

**Dependencies:**
Depends on: `[Sync] Implement online/offline detection and auto-sync`

**Testing Requirements:**

- [ ] Unit tests for all sync state transitions
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Sync] Sync unit and integration tests

**GitHub Issue:** [#72](https://github.com/joeburton/peak-tracker/issues/72)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-sync-tests`

**Description:**
Comprehensive unit and integration tests for the entire sync engine. Tests cover push, pull, conflict resolution, auto-trigger, and error handling.

**Acceptance Criteria:**

- [ ] Push tests: success, failure, retry
- [ ] Pull tests: server newer, local newer, equal versions
- [ ] Conflict resolution tests: all scenarios
- [ ] Auto-trigger tests: online transition, no dirty records

**Dependencies:**
Depends on: `[Sync] Integrate sync state store with sync engine`

**Testing Requirements:**

- [ ] All tests pass
- [ ] Sync engine coverage ≥ 80%
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Sync] E2E test — offline sync round trip

**GitHub Issue:** [#73](https://github.com/joeburton/peak-tracker/issues/73)
**Milestone:** Milestone 7 — Synchronisation
**Branch:** `feature/<issue-number>-sync-e2e`

**Description:**
Playwright E2E test: toggle a peak while offline → verify local state updated → restore connectivity → verify record syncs to server → verify `dirty: false`.

**Acceptance Criteria:**

- [ ] Test toggles a peak while offline (network intercepted)
- [ ] Verifies local Dexie record is updated and `dirty: true`
- [ ] Restores network connectivity
- [ ] Verifies sync completes and `dirty: false`
- [ ] Verifies server-side record matches local

**Dependencies:**
Depends on: `[Sync] Sync unit and integration tests`

**Testing Requirements:**

- [ ] E2E test passes
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

## Milestone 8 — PWA

---

### [PWA] Verify next-pwa + Next.js 16 compatibility

**GitHub Issue:** [#74](https://github.com/joeburton/peak-tracker/issues/74)
**Milestone:** Milestone 8 — PWA
**Branch:** `feature/<issue-number>-pwa-compatibility`

**Description:**
Verify next-pwa compatibility with Next.js 16 and Turbopack. Document findings. If incompatible, evaluate Serwist as an alternative and seek approval before proceeding.

**Acceptance Criteria:**

- [ ] Compatibility verified and documented
- [ ] Alternative (Serwist) evaluated if next-pwa is incompatible
- [ ] Decision approved before remaining PWA tickets begin

**Dependencies:**
Depends on: Milestone 7 complete

**Testing Requirements:**

- [ ] Document exists and is approved
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [PWA] Configure next-pwa with offline-first caching

**GitHub Issue:** [#75](https://github.com/joeburton/peak-tracker/issues/75)
**Milestone:** Milestone 8 — PWA
**Branch:** `feature/<issue-number>-pwa-config`

**Description:**
Configure next-pwa (or Serwist) with an offline-first caching strategy. Static assets use cache-first. API responses use network-first with offline fallback.

**Acceptance Criteria:**

- [ ] next-pwa (or Serwist) installed and configured
- [ ] Static assets cached (cache-first)
- [ ] API responses network-first with offline fallback
- [ ] `npm run build` produces a valid Service Worker

**Dependencies:**
Depends on: `[PWA] Verify next-pwa + Next.js 16 compatibility`

**Testing Requirements:**

- [ ] Build passes
- [ ] Service Worker registers correctly in the browser
- [ ] Lint passes
- [ ] Type check passes

---

### [PWA] Implement Web App Manifest

**GitHub Issue:** [#76](https://github.com/joeburton/peak-tracker/issues/76)
**Milestone:** Milestone 8 — PWA
**Branch:** `feature/<issue-number>-manifest`

**Description:**
Implement `public/manifest.json` with all required fields for PWA installation on iOS and Android.

**Acceptance Criteria:**

- [ ] `manifest.json` present at `/manifest.json`
- [ ] Fields: `name`, `short_name`, `icons` (192px, 512px), `theme_color`, `background_color`, `display: standalone`, `start_url`
- [ ] Icons provided in PNG format
- [ ] Manifest linked in `<head>`

**Dependencies:**
Depends on: `[PWA] Configure next-pwa with offline-first caching`

**Testing Requirements:**

- [ ] Lighthouse PWA audit passes installability check
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [PWA] Implement install prompt

**GitHub Issue:** [#77](https://github.com/joeburton/peak-tracker/issues/77)
**Milestone:** Milestone 8 — PWA
**Branch:** `feature/<issue-number>-install-prompt`

**Description:**
Implement the PWA install prompt. Controlled via `NEXT_PUBLIC_ENABLE_PWA` — disabled in development if set to `false`. Shows a banner or button when the browser fires `beforeinstallprompt`.

**Acceptance Criteria:**

- [ ] Install prompt shown when browser fires `beforeinstallprompt`
- [ ] Prompt is dismissable and does not re-appear for 30 days after dismissal
- [ ] Prompt disabled if `NEXT_PUBLIC_ENABLE_PWA=false`
- [ ] Accessible

**Dependencies:**
Depends on: `[PWA] Implement Web App Manifest`

**Testing Requirements:**

- [ ] Component test: prompt renders when `beforeinstallprompt` fires
- [ ] Component test: prompt hidden after dismissal
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [PWA] Implement SW cache versioning and update strategy

**GitHub Issue:** [#78](https://github.com/joeburton/peak-tracker/issues/78)
**Milestone:** Milestone 8 — PWA
**Branch:** `feature/<issue-number>-sw-update`

**Description:**
Implement Service Worker cache versioning. On SW update, show a notification prompting the user to reload. Handle the update gracefully without data loss.

**Acceptance Criteria:**

- [ ] SW cache is versioned (cache name includes build hash)
- [ ] On new SW activation, old caches are deleted
- [ ] User is notified of an available update and prompted to reload
- [ ] No data loss on SW update

**Dependencies:**
Depends on: `[PWA] Implement install prompt`

**Testing Requirements:**

- [ ] Playwright test: SW update prompts reload notification
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [PWA] Verify offline functionality

**GitHub Issue:** [#79](https://github.com/joeburton/peak-tracker/issues/79)
**Milestone:** Milestone 8 — PWA
**Branch:** `feature/<issue-number>-offline-verify`

**Description:**
Manually and automatically verify that core functionality works with no network connection: navigate to the home page, view a peak list, and toggle progress.

**Acceptance Criteria:**

- [ ] Home page loads offline (served from SW cache)
- [ ] Peak list page loads offline
- [ ] Progress toggle works offline (Dexie-first)
- [ ] Offline fallback page shown for uncached routes

**Dependencies:**
Depends on: `[PWA] Implement SW cache versioning and update strategy`

**Testing Requirements:**

- [ ] Playwright E2E offline test passes
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [PWA] Playwright E2E — offline mode

**GitHub Issue:** [#80](https://github.com/joeburton/peak-tracker/issues/80)
**Milestone:** Milestone 8 — PWA
**Branch:** `feature/<issue-number>-pwa-e2e`

**Description:**
Playwright E2E test covering: install app → go offline → navigate to peak list → toggle progress → verify offline fallback page for uncached route.

**Acceptance Criteria:**

- [ ] E2E test passes with network intercepted
- [ ] All offline scenarios covered

**Dependencies:**
Depends on: `[PWA] Verify offline functionality`

**Testing Requirements:**

- [ ] E2E test passes
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

## Milestone 9 — Testing

---

### [Testing] Audit and fill unit test coverage gaps

**GitHub Issue:** [#81](https://github.com/joeburton/peak-tracker/issues/81)
**Milestone:** Milestone 9 — Testing
**Branch:** `feature/<issue-number>-coverage-audit`

**Description:**
Run the full test suite, generate a coverage report, and identify any files or modules below 80% coverage. Write tests to fill all gaps.

**Acceptance Criteria:**

- [ ] Coverage report generated
- [ ] All files at or above 80% coverage
- [ ] `npm run test` — all passing

**Dependencies:**
Depends on: Milestone 8 complete

**Testing Requirements:**

- [ ] `npm run test` — ≥ 80% coverage
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Testing] Write missing component tests

**GitHub Issue:** [#82](https://github.com/joeburton/peak-tracker/issues/82)
**Milestone:** Milestone 9 — Testing
**Branch:** `feature/<issue-number>-component-tests`

**Description:**
Identify and write any missing React Testing Library component tests for all UI components not already covered.

**Acceptance Criteria:**

- [ ] All UI components have at least one component test
- [ ] Tests cover key user interactions (search, filter, toggle, sort)

**Dependencies:**
Depends on: `[Testing] Audit and fill unit test coverage gaps`

**Testing Requirements:**

- [ ] All component tests pass
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Testing] Complete Playwright E2E suite

**GitHub Issue:** [#83](https://github.com/joeburton/peak-tracker/issues/83)
**Milestone:** Milestone 9 — Testing
**Branch:** `feature/<issue-number>-e2e-suite`

**Description:**
Complete the Playwright E2E suite covering: auth (sign in, sign out), home page, peak list browsing, search, filters, sort, progress toggle, sync round-trip, and offline mode.

**Acceptance Criteria:**

- [ ] Auth: sign in and sign out
- [ ] Home page: all peak lists visible
- [ ] Peak list: search, filter, sort all work
- [ ] Progress toggle: peak marked complete and statistics update
- [ ] Sync: offline toggle syncs on reconnection
- [ ] Offline: core pages load without network

**Dependencies:**
Depends on: `[Testing] Write missing component tests`

**Testing Requirements:**

- [ ] `npm run test:e2e` — all passing
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Testing] Final quality gate run

**GitHub Issue:** [#84](https://github.com/joeburton/peak-tracker/issues/84)
**Milestone:** Milestone 9 — Testing
**Branch:** `feature/<issue-number>-final-quality-gate`

**Description:**
Run all quality gates on the `develop` branch in sequence. Fix any issues found. All gates must pass before the project is considered production-ready.

**Acceptance Criteria:**

- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `npm run test` — ≥ 80% coverage, all passing
- [ ] `npm run test:e2e` — all passing
- [ ] `npm run build` — passing

**Dependencies:**
Depends on: `[Testing] Complete Playwright E2E suite`

**Testing Requirements:**

- [ ] All five quality gates pass
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

### [Testing] Address final quality gate issues

**GitHub Issue:** [#85](https://github.com/joeburton/peak-tracker/issues/85)
**Milestone:** Milestone 9 — Testing
**Branch:** `feature/<issue-number>-quality-gate-fixes`

**Description:**
Fix any remaining issues identified during the final quality gate run. This ticket may be a no-op if all gates pass first time.

**Acceptance Criteria:**

- [ ] All issues from final quality gate run resolved
- [ ] All five quality gates pass on `develop`

**Dependencies:**
Depends on: `[Testing] Final quality gate run`

**Testing Requirements:**

- [ ] All quality gates pass
- [ ] Build passes
- [ ] Lint passes
- [ ] Type check passes

---

## Summary

| Milestone            | Ticket Count |
| -------------------- | ------------ |
| 1 — Foundation       | 10           |
| 2 — Authentication   | 6            |
| 3 — Database         | 15           |
| 4 — Offline          | 7            |
| 5 — State Management | 10           |
| 6 — Core UI          | 15           |
| 7 — Synchronisation  | 10           |
| 8 — PWA              | 7            |
| 9 — Testing          | 5            |
| **Total**            | **85**       |

---

## Approval Checklist

- [ ] Tickets reviewed and understood
- [ ] Ticket format confirmed as correct
- [ ] **Explicit approval given to create GitHub Project board, milestones, and issues**
