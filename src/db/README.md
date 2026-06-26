# Dexie (IndexedDB) — Schema and Migration Strategy

## Overview

The client-side database uses [Dexie 4](https://dexie.org/) as an IndexedDB wrapper. All access goes through repository functions — no component or hook imports from `dexie.ts` directly.

The database is named `peakTracker` (matching the MongoDB database name).

---

## Schema version history

| Version | Change | Tables after |
|---------|--------|--------------|
| 1 | Initial schema — progress tracking | `progress` |
| 2 | Add user preferences | `progress`, `userPreferences` |
| 3 | Add sync metadata | `progress`, `userPreferences`, `syncMetadata` |

### Table purposes

| Table | Primary key | Purpose |
|-------|-------------|---------|
| `progress` | `userId` | Per-user peak completion records. Mirrors the MongoDB `progress` collection, plus client-only `dirty` and `lastSyncedAt` fields. |
| `userPreferences` | `userId` | Syncable user preferences (e.g. units). Follows the user across devices via the sync engine. Device-local UI state (theme, viewMode, sidebar) lives in Zustand `persist`, not here. |
| `syncMetadata` | `id` (`'singleton'`) | Device-level sync state. One record per device. Records the last time a full sync completed so the sync engine knows what to push or pull. |

---

## Migration rules

1. **Always increment the version number** when changing any table's stores definition.
2. **Every new version must have a `.stores()` definition** describing the change.
3. **Every new version must have an `.upgrade()` block** — even if it is a no-op — to document that the migration has been considered.
4. **Migrations must be non-destructive.** Do not drop tables or remove indexes that contain user data.
5. **Dexie applies upgrades in sequence.** A user at v1 upgrading to v3 will have v1→v2 and v2→v3 both run automatically.

---

## How to add a new migration

1. Add the new interface to `src/db/schema.ts`.
2. Add the new `EntityTable` property to `PeakTrackerDb` in `src/db/dexie.ts`.
3. Add a new `this.version(N).stores({...}).upgrade(tx => {...})` block. If no data transformation is needed, leave the upgrade callback empty with a comment explaining why.
4. Create a repository in `src/db/repositories/`.
5. Add a migration test to `src/db/dexie.test.ts` verifying the new version preserves existing data.

### Example — adding a `notes` table at version 4

```ts
// src/db/schema.ts
export interface LocalNote {
  id: string       // primary key (UUID)
  userId: string   // indexed
  peakId: string
  body: string
  updatedAt: string
}

// src/db/dexie.ts — inside PeakTrackerDb constructor
this.version(4)
  .stores({ notes: 'id, userId' })
  .upgrade(() => {
    // Additive migration — no existing records need to be transformed.
  })
```

---

## `dirty` flag

The `dirty` field on `progress` records is **client-only**. It must never be sent to or stored in MongoDB. It signals that the local record has changes that have not yet been pushed to the server.

- Set to `true` by `LocalProgressRepository.markDirty()` — called immediately after any user action.
- Set to `false` by `LocalProgressRepository.markClean()` — called after the sync engine confirms the server has accepted the record.

---

## Testing

Migration tests live in `src/db/dexie.test.ts`. Each test:

1. Creates a `PeakTrackerDbVN` class (defined inline) that mirrors the schema at version N.
2. Opens the database at version N and inserts fixture data.
3. Closes the database.
4. Opens the same database with the current `PeakTrackerDb` (latest version).
5. Asserts that all prior data is intact and the new table exists.

Each Vitest file gets its own `fake-indexeddb` factory, so migration tests are fully isolated from repository tests.
