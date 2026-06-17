/**
 * Centralised TanStack Query key registry.
 * All query keys must be defined here — never inline in components or hooks.
 *
 * Convention: keys are arrays to support partial invalidation.
 * e.g. invalidating ['peakLists'] will also invalidate ['peakLists', slug]
 */
export const queryKeys = {
  peakLists: {
    all: () => ['peakLists'] as const,
    detail: (slug: string) => ['peakLists', slug] as const,
  },
  peaks: {
    all: () => ['peaks'] as const,
    byList: (slug: string) => ['peaks', 'list', slug] as const,
    detail: (slug: string) => ['peaks', slug] as const,
  },
  progress: {
    all: () => ['progress'] as const,
    byList: (userId: string, peakListSlug: string) =>
      ['progress', userId, peakListSlug] as const,
  },
  statistics: {
    byList: (userId: string, peakListSlug: string) =>
      ['statistics', userId, peakListSlug] as const,
  },
} as const
