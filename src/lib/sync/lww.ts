/**
 * Last Write Wins conflict resolution.
 *
 * Rule (per docs/api-routes.md and CLAUDE.md):
 *   1. updatedAt is compared first — the more recent timestamp wins.
 *   2. version is the tiebreaker when timestamps are equal — the higher
 *      version wins.
 *   3. Equal timestamp AND equal version → neither is newer (returns false
 *      for both directions).
 *
 * Both inputs must have valid ISO 8601 datetime strings — this is guaranteed
 * at call sites by Zod schema validation before the comparison is reached.
 */

export interface LwwRecord {
  updatedAt: string
  version: number
}

/**
 * Returns true if `a` is strictly newer than `b`.
 * Returns false when `a` is older than, or the same age as, `b`.
 */
export function isNewerThan(a: LwwRecord, b: LwwRecord): boolean {
  const aMs = new Date(a.updatedAt).getTime()
  const bMs = new Date(b.updatedAt).getTime()
  if (aMs !== bMs) return aMs > bMs
  return a.version > b.version
}
