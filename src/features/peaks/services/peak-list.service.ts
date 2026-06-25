import { unstable_cache } from 'next/cache';
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
 *
 * Result is cached for 1 hour and tagged 'peak-lists' so it can be
 * surgically invalidated via revalidateTag('peak-lists') when a new
 * list is added.
 */
export const getPeakLists: () => Promise<PeakList[]> = unstable_cache(
  async (): Promise<PeakList[]> => {
    const db = await getDb();
    const repo = createPeakListRepository(db);
    return repo.findAll();
  },
  ['peak-lists'],
  { revalidate: 3600, tags: ['peak-lists'] },
);

export const getPeakList: (slug: string) => Promise<PeakList | null> = unstable_cache(
  async (slug: string): Promise<PeakList | null> => {
    const db = await getDb();
    const repo = createPeakListRepository(db);
    return repo.findBySlug(slug);
  },
  ['peak-list-by-slug'],
  { revalidate: 3600, tags: ['peak-lists'] },
);
