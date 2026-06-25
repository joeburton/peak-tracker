import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getPeakList } from '@/features/peaks/services/peak-list.service';
import { getPeaks } from '@/features/peaks/services/peak.service';
import { getProgress } from '@/features/peaks/services/progress.service';
import { computeStatistics } from '@/features/peaks/services/statistics.service';
import { PeakListClient } from '@/features/peaks/components/peak-list-client';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const peakList = await getPeakList(slug);
  if (!peakList) return {};
  return {
    title: `${peakList.name} — Peak Tracker UK`,
    description: `Track your progress across ${peakList.peakCount} ${peakList.name}.`,
  };
}

export default async function PeakListPage({ params }: Props) {
  const { slug } = await params;
  const { userId } = await auth();

  const [peakList, peaks, serverCompletedIds] = await Promise.all([
    getPeakList(slug),
    getPeaks(slug),
    getProgress(userId),
  ]);

  if (!peakList) notFound();

  const statistics = computeStatistics(peaks, serverCompletedIds);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{peakList.name}</h1>
      <Suspense fallback={<PeakListSkeleton />}>
        <PeakListClient
          peaks={peaks}
          peakList={peakList}
          statistics={statistics}
          serverCompletedIds={serverCompletedIds}
        />
      </Suspense>
    </div>
  );
}

function PeakListSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading peak list">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 text-center">
            <div className="mx-auto mb-2 h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mx-auto h-3 w-12 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="h-px bg-border" />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-40" />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-3">
            <div className="space-y-1">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
