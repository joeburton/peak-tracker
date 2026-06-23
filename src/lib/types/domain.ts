export interface PeakList {
  id: string
  slug: string
  name: string
  description?: string
  peakCount: number
}

export interface Peak {
  id: string
  peakListSlug: string
  slug: string
  name: string
  region: string
  heightMetres: number
  heightFeet: number
  latitude: number
  longitude: number
  createdAt: string
  updatedAt: string
}

export interface UserProgress {
  userId: string
  completedPeakIds: string[]
  updatedAt: string
  dirty: boolean
  version: number
}

export interface PeakListStatistics {
  total: number
  completed: number
  remaining: number
  percentageComplete: number
}
