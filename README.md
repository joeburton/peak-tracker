# Peak Tracker UK

An offline-first Progressive Web Application for tracking progress across UK hill and mountain lists — Wainwrights, Munros, and beyond.

## Tech Stack

- **Next.js 16** (App Router, Server Components, Turbopack)
- **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui**
- **Clerk** — authentication (Google, Apple, GitHub)
- **MongoDB** — server-side persistence
- **Dexie** (IndexedDB) — offline-first local persistence
- **TanStack Query** — server state
- **Zustand** — client state
- **Zod** — runtime validation
- **Vitest** + **React Testing Library** + **Playwright** — testing

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- A [Clerk](https://clerk.com) account

### Setup

```bash
# Clone the repo
git clone https://github.com/joeburton/peak-tracker.git
cd peak-tracker

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Fill in your values in .env.local

# Seed the database
npx tsx scripts/seed-peak-lists.ts
npx tsx scripts/seed-wainwrights.ts
npx tsx scripts/seed-munros.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values. See `.env.example` for all required keys and inline documentation.

Never commit `.env.local` to the repository.

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the development server (Turbopack)     |
| `npm run build`     | Production build                             |
| `npm run start`     | Start the production server                  |
| `npm run typecheck` | TypeScript type check (zero errors required) |
| `npm run lint`      | ESLint (zero errors required)                |
| `npm run test`      | Run Vitest unit tests                        |
| `npm run test:e2e`  | Run Playwright E2E tests                     |

All five quality gates (`typecheck`, `lint`, `test`, `test:e2e`, `build`) must pass before any milestone is considered done.

## Database Scripts

```bash
# Seed all data (peak lists + Wainwrights + Munros)
npx tsx scripts/seed-peak-lists.ts
npx tsx scripts/seed-wainwrights.ts
npx tsx scripts/seed-munros.ts

# Verify seed integrity (exits non-zero on failure)
npx tsx scripts/verify-seed.ts

# Reset and re-seed (local only — refused on Atlas URIs)
npx tsx scripts/reset-db.ts

# Export a user's progress to JSON
npx tsx scripts/export-progress.ts <userId>

# Import progress from a JSON file
npx tsx scripts/import-progress.ts <userId> <path-to-file>
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and API routes
├── components/           # Shared UI components
├── features/peaks/       # Peak feature (components, hooks, services, types)
├── db/                   # Dexie / IndexedDB (offline storage)
├── lib/
│   ├── db/               # MongoDB connection and repositories
│   ├── constants/        # App-wide constants
│   ├── queryKeys.ts      # Centralised TanStack Query keys
│   ├── validation/       # Zod schemas and TypeScript interfaces
│   └── logger/           # Structured logger
├── proxy.ts              # Next.js 16 auth/routing (replaces middleware.ts)
scripts/                  # Database seed and utility scripts
docs/                     # Architecture review, roadmap, tickets
```

## Branching

| Branch                                 | Purpose                                      |
| -------------------------------------- | -------------------------------------------- |
| `main`                                 | Stable, production-ready code only           |
| `develop`                              | Integration branch — all features merge here |
| `feature/<issue-number>-<description>` | One branch per ticket                        |

- Branch from `develop`
- Open a PR to `develop` referencing the issue number
- Squash merge only
- Never commit directly to `main` or `develop`

## Contributing

See [`CLAUDE.md`](./CLAUDE.md) for the single source of truth on all implementation decisions, architectural constraints, branching rules, ticket format, and the definition of done.

## Datasets

Peak data is sourced from the [Database of British and Irish Hills (DoBIH)](http://www.hills-database.co.uk/).

| List        | Count |
| ----------- | ----- |
| Wainwrights | 214   |
| Munros      | 282   |
