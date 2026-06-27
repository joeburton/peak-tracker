# API Routes — Peak Tracker UK

> This document is the authoritative reference for all HTTP API routes.
> It must be approved before any Milestone 7 implementation begins.
> All routes live under `src/app/api/`.

---

## Principles

- `userId` is **always** sourced from the Clerk session server-side — never trusted from the request body or query string
- The `dirty` flag is a client-only Dexie concern and is **never** stored in or returned from MongoDB
- The sync model is **snapshot sync** — the entire progress record is replaced, not individual fields
- Conflict resolution is **Last Write Wins** based on `updatedAt` timestamp and `version` number
- All routes return `application/json`
- All routes require a valid Clerk session — unauthenticated requests receive `401`
- `proxy.ts` enforces `401` on all unauthenticated `/api/*` requests as a first line of defence; route handlers call `requireAuth()` (`src/lib/auth/index.ts`) as a second line

---

## Routes

### `GET /api/progress`

Fetch the authenticated user's current progress record from MongoDB.

Called by the sync engine during the **pull** phase to retrieve the latest server state.

#### Auth

Required. `userId` is extracted from the Clerk session via `auth()`.

#### Implementation

Uses `ProgressRepository.findByUserId(userId)` (`src/lib/db/repositories/progress-repository.ts`).

#### Request

No body. No query parameters.

#### Response — `200 OK`

```json
{
  "userId": "user_2abc123",
  "completedPeakIds": ["peak-slug-1", "peak-slug-2"],
  "updatedAt": "2026-06-27T10:00:00.000Z",
  "version": 4
}
```

#### Response — `404 Not Found`

Returned when no progress record exists for this user (new user, never synced).
The client treats `404` as an empty starting state.

```json
{
  "error": "No progress record found"
}
```

#### Error responses

| Status | Condition |
|--------|-----------|
| `401`  | No valid Clerk session |
| `404`  | No progress record exists for this user |
| `500`  | Unexpected server error |

---

### `PUT /api/progress`

Upsert the authenticated user's progress record in MongoDB.

Called by the sync engine during the **push** phase to persist local changes. Replaces the entire record — not a partial update.

#### Auth

Required. `userId` is extracted from the Clerk session via `auth()` and injected into the record server-side. Any `userId` in the request body is ignored.

#### Request body

```json
{
  "completedPeakIds": ["peak-slug-1", "peak-slug-2"],
  "updatedAt": "2026-06-27T10:05:00.000Z",
  "version": 5
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `completedPeakIds` | `string[]` | Yes | May be empty array |
| `updatedAt` | ISO 8601 string | Yes | Client timestamp of the local change |
| `version` | integer ≥ 1 | Yes | Monotonically increasing — client increments on each write |

Validated against `UserProgressSchema.omit({ userId: true })` — `userId` is sourced from the Clerk session, not the body. Invalid bodies receive `422`.

#### Implementation

Uses `ProgressRepository.restore(progress)` — **not** `upsert()`. `restore()` writes the client-supplied `version` as-is. `upsert()` uses `$inc: { version: 1 }` (server-side increment) which would double-increment because the client already increments version before each local write (see `useToggleProgress`).

#### Conflict resolution (server-side)

Before writing, the server compares the incoming record against the existing MongoDB record using **Last Write Wins**:

1. If no existing record → write unconditionally
2. If incoming `updatedAt` > existing `updatedAt` → write (client is newer)
3. If incoming `updatedAt` < existing `updatedAt` → reject with `409` (server is newer — client must pull first)
4. If `updatedAt` values are equal, use `version` as the tiebreaker → higher version wins; equal version returns `409`

#### Response — `200 OK`

Returns the record as written to MongoDB.

```json
{
  "userId": "user_2abc123",
  "completedPeakIds": ["peak-slug-1", "peak-slug-2"],
  "updatedAt": "2026-06-27T10:05:00.000Z",
  "version": 5
}
```

#### Response — `409 Conflict`

The server record is newer than the client record. The client must pull the latest server state before pushing again.

```json
{
  "error": "Conflict — server record is newer",
  "serverUpdatedAt": "2026-06-27T10:06:00.000Z",
  "serverVersion": 6
}
```

#### Error responses

| Status | Condition |
|--------|-----------|
| `401`  | No valid Clerk session |
| `409`  | Server record is newer — client must pull first |
| `422`  | Request body fails Zod validation |
| `500`  | Unexpected server error |

---

## Sync flow

The sync engine uses these two routes in sequence:

```
1. GET /api/progress        ← pull latest server state
2. Compare updatedAt + version (LWW)
   a. Server newer  → update local Dexie record, mark dirty: false
   b. Local newer   → PUT /api/progress with local record
      i.  200 OK    → mark dirty: false, update lastSyncedAt
      ii. 409       → pull again (step 1), then re-evaluate
3. Sync complete
```

---

## Not in scope

The following are served by **Next.js Server Components** and do not require API routes:

- Peak lists (`/peak-lists`)
- Individual peaks (`/peak-lists/[slug]`)
- Statistics (computed server-side in the service layer)

These are read-only, public (no auth required), and rendered at request time — there is no client-side fetch involved.
