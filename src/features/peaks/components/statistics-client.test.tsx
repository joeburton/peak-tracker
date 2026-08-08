import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { StatisticsClient } from './statistics-client';
import { useProgressStore } from '@/stores/progress';
import type { Peak } from '@/lib/types/domain';

const PEAKS: Peak[] = [
  {
    id: 'peak-1',
    peakListSlug: 'wainwrights',
    slug: 'helvellyn',
    name: 'Helvellyn',
    region: 'Eastern Fells',
    heightMetres: 950,
    heightFeet: 3117,
    latitude: 54.527,
    longitude: -3.016,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'peak-2',
    peakListSlug: 'wainwrights',
    slug: 'skiddaw',
    name: 'Skiddaw',
    region: 'Northern Fells',
    heightMetres: 931,
    heightFeet: 3054,
    latitude: 54.653,
    longitude: -3.148,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'peak-3',
    peakListSlug: 'wainwrights',
    slug: 'scafell-pike',
    name: 'Scafell Pike',
    region: 'Southern Fells',
    heightMetres: 978,
    heightFeet: 3209,
    latitude: 54.454,
    longitude: -3.211,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

beforeEach(() => {
  useProgressStore.setState({ pendingCompletions: new Set(), pendingRemovals: new Set() });
});

describe('StatisticsClient', () => {
  it('renders stats derived from serverCompletedIds when store is empty', () => {
    render(
      <StatisticsClient peaks={PEAKS} serverCompletedIds={['peak-1', 'peak-2']} />
    );

    expect(screen.getByText('3')).toBeInTheDocument(); // total
    expect(screen.getByText('2')).toBeInTheDocument(); // completed
    expect(screen.getByText('1')).toBeInTheDocument(); // remaining
    expect(screen.getByText('66.7%')).toBeInTheDocument();
  });

  it('reflects pendingCompletions added to the store', () => {
    useProgressStore.setState({ pendingCompletions: new Set(['peak-3']), pendingRemovals: new Set() });

    render(
      <StatisticsClient peaks={PEAKS} serverCompletedIds={['peak-1']} />
    );

    // peak-1 (server) + peak-3 (pending) = 2 completed
    expect(screen.getByText('2')).toBeInTheDocument(); // completed
    expect(screen.getByText('1')).toBeInTheDocument(); // remaining
  });

  it('reflects pendingRemovals from the store', () => {
    useProgressStore.setState({ pendingCompletions: new Set(), pendingRemovals: new Set(['peak-1']) });

    render(
      <StatisticsClient peaks={PEAKS} serverCompletedIds={['peak-1', 'peak-2']} />
    );

    // peak-1 removed → 1 completed
    expect(screen.getByText('1')).toBeInTheDocument(); // completed
    expect(screen.getByText('2')).toBeInTheDocument(); // remaining
  });

  it('shows 0 completed and full remaining when no peaks are done', () => {
    render(
      <StatisticsClient peaks={PEAKS} serverCompletedIds={[]} />
    );

    const totalRow = screen.getByText('total').closest('div') as HTMLElement;
    expect(within(totalRow).getByText('3')).toBeInTheDocument(); // total
    expect(screen.getByText('0')).toBeInTheDocument(); // completed
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows 100% when all peaks are completed', () => {
    render(
      <StatisticsClient peaks={PEAKS} serverCompletedIds={['peak-1', 'peak-2', 'peak-3']} />
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('pending completions do not double-count peaks already in serverCompletedIds', () => {
    useProgressStore.setState({ pendingCompletions: new Set(['peak-1']), pendingRemovals: new Set() });

    render(
      <StatisticsClient peaks={PEAKS} serverCompletedIds={['peak-1']} />
    );

    // peak-1 is in both — Set deduplicates, so still 1 completed
    expect(screen.getByText('1')).toBeInTheDocument(); // completed
    expect(screen.getByText('2')).toBeInTheDocument(); // remaining
  });

  it('renders with a custom label', () => {
    render(
      <StatisticsClient peaks={PEAKS} serverCompletedIds={[]} label="Wainwrights progress statistics" />
    );

    expect(screen.getByRole('region', { name: 'Wainwrights progress statistics' })).toBeInTheDocument();
  });
});
