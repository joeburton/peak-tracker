import { getDb } from '@/lib/db/mongodb';
import { createPeakListRepository } from '@/lib/db/repositories/peak-list-repository';
import type { PeakList } from '@/lib/types/domain';

/**
 * Server-side service for peak list data. Owns the DB wiring so pages
 * never import from mongodb.ts directly (CLAUDE.md non-negotiable rule).
 *
 * TanStack Query owns client-side caching for this data. On the server,
 * async Server Components call this service directly — TanStack Query
 * hooks cannot run in a Server Component context.
 */
export async function getPeakLists(): Promise<PeakList[]> {
  const db = await getDb();
  const repo = createPeakListRepository(db);
  return repo.findAll();
}
