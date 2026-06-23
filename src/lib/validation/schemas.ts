import { z } from 'zod'

export const PeakListSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1).optional(),
  peakCount: z.number().int().positive(),
})

export const PeakSchema = z.object({
  id: z.string().min(1),
  peakListSlug: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  region: z.string().min(1),
  heightMetres: z.number().positive(),
  heightFeet: z.number().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
})

// dirty is excluded — it is a client-only Dexie concern, never persisted to MongoDB
export const UserProgressSchema = z.object({
  userId: z.string().min(1),
  completedPeakIds: z.array(z.string().min(1)),
  updatedAt: z.string().datetime({ offset: true }),
  version: z.number().int().nonnegative(),
})

export type PeakList = z.infer<typeof PeakListSchema>
export type Peak = z.infer<typeof PeakSchema>
export type UserProgress = z.infer<typeof UserProgressSchema>

export interface RegionalStatistics {
  region: string
  total: number
  completed: number
  remaining: number
  percentageComplete: number
}

export interface PeakListStatistics {
  total: number
  completed: number
  remaining: number
  percentageComplete: number
  byRegion: RegionalStatistics[]
}
