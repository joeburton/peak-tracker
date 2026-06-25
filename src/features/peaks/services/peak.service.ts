import { unstable_cache } from 'next/cache';
import { getDb } from '@/lib/db/mongodb';
import { createPeakRepository } from '@/lib/db/repositories/peak-repository';
import type { Peak } from '@/lib/types/domain';

/**
 * Fetches all peaks for a given peak list slug.
 * Result is cached for 1 hour per slug and tagged 'peaks' for targeted
 * invalidation via revalidateTag('peaks') when peak data changes.
 */
export const getPeaks: (peakListSlug: string) => Promise<Peak[]> = unstable_cache(
  async (peakListSlug: string): Promise<Peak[]> => {
    const db = await getDb();
    const repo = createPeakRepository(db);
    return repo.findByListSlug(peakListSlug);
  },
  ['peaks-by-list'],
  { revalidate: 3600, tags: ['peaks'] },
);
