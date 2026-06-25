import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { mockUseQueryState, mockUseQueryStates, mockUseProgressStore } = vi.hoisted(() => ({
  mockUseQueryState: vi.fn(),
  mockUseQueryStates: vi.fn(),
  mockUseProgressStore: vi.fn(),
}));

vi.mock('nuqs', () => ({
  useQueryState: mockUseQueryState,
  useQueryStates: mockUseQueryStates,
}));
vi.mock('@/stores/progress', () => ({
  useProgressStore: mockUseProgressStore,
}));

import { PeakListClient } from './peak-list-client';

const mockPeaks = [
  {
    id: 'p1',
    peakListSlug: 'wainwrights',
    slug: 'skiddaw',
    name: 'Skiddaw',
    region: 'Northern Fells',
    heightMetres: 931,
    heightFeet: 3054,
    latitude: 54.65,
    longitude: -3.14,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'p2',
    peakListSlug: 'wainwrights',
    slug: 'great-gable',
    name: 'Great Gable',
    region: 'Southern Fells',
    heightMetres: 899,
    heightFeet: 2949,
    latitude: 54.48,
    longitude: -3.22,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'p3',
    peakListSlug: 'wainwrights',
    slug: 'helvellyn',
    name: 'Helvellyn',
    region: 'Eastern Fells',
    heightMetres: 950,
    heightFeet: 3117,
    latitude: 54.52,
    longitude: -3.01,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

function setupDefaults(overrides: {
  search?: string | null;
  completion?: string;
  region?: string | null;
  sort?: string;
  dir?: string;
  pendingCompletions?: Set<string>;
} = {}) {
  const {
    search = null,
    completion = 'all',
    region = null,
    sort = 'name',
    dir = 'asc',
    pendingCompletions = new Set<string>(),
  } = overrides;

  mockUseQueryState.mockReturnValue([search, vi.fn()]);
  mockUseQueryStates.mockImplementation((parsers: Record<string, unknown>) => {
    if ('completion' in parsers) {
      return [{ completion, region }, vi.fn()];
    }
    return [{ sort, dir }, vi.fn()];
  });
  mockUseProgressStore.mockImplementation(
    (selector: (s: { pendingCompletions: Set<string> }) => unknown) =>
      selector({ pendingCompletions }),
  );
}

const defaultProps = {
  peaks: mockPeaks,
  serverCompletedIds: [] as string[],
};

describe('PeakListClient', () => {
  beforeEach(() => {
    mockUseQueryState.mockReset();
    mockUseQueryStates.mockReset();
    mockUseProgressStore.mockReset();
    setupDefaults();
  });

  it('renders all peaks when no filters are active', () => {
    render(<PeakListClient {...defaultProps} />);
    expect(screen.getByText('Skiddaw')).toBeInTheDocument();
    expect(screen.getByText('Great Gable')).toBeInTheDocument();
    expect(screen.getByText('Helvellyn')).toBeInTheDocument();
  });

  it('shows the correct peak count in the summary line', () => {
    render(<PeakListClient {...defaultProps} />);
    expect(screen.getByText(/Showing 3 of 3 peaks/)).toBeInTheDocument();
  });

  it('filters peaks by search term (case-insensitive)', () => {
    setupDefaults({ search: 'gable' });
    render(<PeakListClient {...defaultProps} />);
    expect(screen.getByText('Great Gable')).toBeInTheDocument();
    expect(screen.queryByText('Skiddaw')).not.toBeInTheDocument();
    expect(screen.queryByText('Helvellyn')).not.toBeInTheDocument();
  });

  it('filters peaks by region', () => {
    setupDefaults({ region: 'Northern Fells' });
    render(<PeakListClient {...defaultProps} />);
    expect(screen.getByText('Skiddaw')).toBeInTheDocument();
    expect(screen.queryByText('Great Gable')).not.toBeInTheDocument();
    expect(screen.queryByText('Helvellyn')).not.toBeInTheDocument();
  });

  it('filters to completed peaks using serverCompletedIds', () => {
    setupDefaults({ completion: 'complete' });
    render(<PeakListClient {...defaultProps} serverCompletedIds={['p1']} />);
    expect(screen.getByText('Skiddaw')).toBeInTheDocument();
    expect(screen.queryByText('Great Gable')).not.toBeInTheDocument();
    expect(screen.queryByText('Helvellyn')).not.toBeInTheDocument();
  });

  it('merges pendingCompletions with serverCompletedIds for completion filter', () => {
    setupDefaults({
      completion: 'complete',
      pendingCompletions: new Set(['p2']),
    });
    render(<PeakListClient {...defaultProps} serverCompletedIds={['p1']} />);
    // p1 (server) + p2 (pending) should both show as complete
    expect(screen.getByText('Skiddaw')).toBeInTheDocument();
    expect(screen.getByText('Great Gable')).toBeInTheDocument();
    expect(screen.queryByText('Helvellyn')).not.toBeInTheDocument();
  });

  it('filters to incomplete peaks only', () => {
    setupDefaults({ completion: 'incomplete' });
    render(<PeakListClient {...defaultProps} serverCompletedIds={['p1']} />);
    expect(screen.queryByText('Skiddaw')).not.toBeInTheDocument();
    expect(screen.getByText('Great Gable')).toBeInTheDocument();
    expect(screen.getByText('Helvellyn')).toBeInTheDocument();
  });

  it('shows an empty state message when no peaks match the filters', () => {
    setupDefaults({ search: 'zzznomatch' });
    render(<PeakListClient {...defaultProps} />);
    expect(screen.getByText(/No peaks match your current filters/)).toBeInTheDocument();
  });

  it('shows a Done badge for server-completed peaks', () => {
    render(<PeakListClient {...defaultProps} serverCompletedIds={['p2']} />);
    const badges = screen.getAllByText('Done');
    expect(badges).toHaveLength(1);
  });

  it('shows a Done badge for peaks completed via pendingCompletions', () => {
    setupDefaults({ pendingCompletions: new Set(['p3']) });
    render(<PeakListClient {...defaultProps} />);
    const badges = screen.getAllByText('Done');
    expect(badges).toHaveLength(1);
  });

  it('sorts peaks by height descending when dir=desc and sort=heightMetres', () => {
    setupDefaults({ sort: 'heightMetres', dir: 'desc' });
    render(<PeakListClient {...defaultProps} />);
    const items = screen.getAllByRole('listitem');
    // Helvellyn (950m) > Skiddaw (931m) > Great Gable (899m)
    expect(items[0]).toHaveTextContent('Helvellyn');
    expect(items[1]).toHaveTextContent('Skiddaw');
    expect(items[2]).toHaveTextContent('Great Gable');
  });

  it('renders search, completion, region, and combined sort controls', () => {
    render(<PeakListClient {...defaultProps} />);
    expect(screen.getByRole('searchbox', { name: /search peaks/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by completion/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by region/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /sort order/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /sort direction/i })).not.toBeInTheDocument();
  });
});
