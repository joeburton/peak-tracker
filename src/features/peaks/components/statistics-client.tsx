'use client';

import { useMemo } from 'react';
import { useProgressStore } from '@/stores/progress';
import { computeStatistics } from '@/features/peaks/services/statistics.service';
import { Statistics } from './statistics';
import type { Peak } from '@/lib/types/domain';

interface Props {
  peaks: Peak[];
  serverCompletedIds: string[];
  label?: string;
}

export function StatisticsClient({ peaks, serverCompletedIds, label }: Props) {
  const pendingCompletions = useProgressStore((s) => s.pendingCompletions);
  const pendingRemovals = useProgressStore((s) => s.pendingRemovals);

  const statistics = useMemo(() => {
    const all = new Set([...serverCompletedIds, ...Array.from(pendingCompletions)]);
    pendingRemovals.forEach((id) => all.delete(id));
    return computeStatistics(peaks, Array.from(all));
  }, [peaks, serverCompletedIds, pendingCompletions, pendingRemovals]);

  return <Statistics statistics={statistics} label={label} />;
}
