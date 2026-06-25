import type { Peak } from '@/lib/types/domain'
import type { PeakListStatistics, RegionalStatistics } from '@/lib/validation'

/**
 * Computes per-region statistics keyed by region name.
 * Used internally by computeStatistics to populate byRegion, and
 * available directly when a region-keyed lookup is needed.
 */
export function computeRegionalStatistics(
  peaks: Peak[],
  completedPeakIds: string[],
): Record<string, RegionalStatistics> {
  const completedSet = new Set(completedPeakIds)
  const regionMap: Record<string, Peak[]> = {}

  for (const peak of peaks) {
    const bucket = regionMap[peak.region] ?? []
    regionMap[peak.region] = bucket
    bucket.push(peak)
  }

  const result: Record<string, RegionalStatistics> = {}
  for (const [region, regionPeaks] of Object.entries(regionMap)) {
    const total = regionPeaks.length
    const completed = regionPeaks.filter((p) => completedSet.has(p.id)).length
    const remaining = total - completed
    const percentageComplete = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10
    result[region] = { region, total, completed, remaining, percentageComplete }
  }

  return result
}

/**
 * Computes overall statistics for a peak list plus a regional breakdown.
 * Pure function — no database access, safe to call server-side.
 */
export function computeStatistics(
  peaks: Peak[],
  completedPeakIds: string[],
): PeakListStatistics {
  const completedSet = new Set(completedPeakIds)
  const total = peaks.length
  const completed = peaks.filter((p) => completedSet.has(p.id)).length
  const remaining = total - completed
  const percentageComplete = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10

  const byRegion = Object.values(computeRegionalStatistics(peaks, completedPeakIds)).sort((a, b) =>
    a.region.localeCompare(b.region),
  )

  return { total, completed, remaining, percentageComplete, byRegion }
}
