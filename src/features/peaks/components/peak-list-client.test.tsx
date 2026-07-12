import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const {
  mockUseQueryState,
  mockUseQueryStates,
  mockUseProgressStore,
  mockToggle,
  mockUseToggleProgress,
} = vi.hoisted(() => {
  const mockToggle = vi.fn();
  return {
    mockUseQueryState: vi.fn(),
    mockUseQueryStates: vi.fn(),
    mockUseProgressStore: vi.fn(),
    mockToggle,
    mockUseToggleProgress: vi.fn(() => ({ toggle: mockToggle })),
  };
});

vi.mock('nuqs', () => ({
  useQueryState: mockUseQueryState,
  useQueryStates: mockUseQueryStates,
}));
vi.mock('@/stores/progress', () => ({
  useProgressStore: mockUseProgressStore,
}));
vi.mock('@/features/peaks/hooks/use-toggle-progress', () => ({
  useToggleProgress: mockUseToggleProgress,
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

function setupDefaults(
  overrides: {
    search?: string | null;
    completion?: string;
    region?: string | null;
    sort?: string;
    dir?: string;
    pendingCompletions?: Set<string>;
    pendingRemovals?: Set<string>;
  } = {}
) {
  const {
    search = null,
    completion = 'all',
    region = null,
    sort = 'name',
    dir = 'asc',
    pendingCompletions = new Set<string>(),
    pendingRemovals = new Set<string>(),
  } = overrides;

  mockUseQueryState.mockReturnValue([search, vi.fn()]);
  mockUseQueryStates.mockImplementation((parsers: Record<string, unknown>) => {
    if ('completion' in parsers) {
      return [{ completion, region }, vi.fn()];
    }
    return [{ sort, dir }, vi.fn()];
  });
  mockUseProgressStore.mockImplementation(
    (selector: (s: { pendingCompletions: Set<string>; pendingRemovals: Set<string> }) => unknown) =>
      selector({ pendingCompletions, pendingRemovals })
  );
}

const defaultProps = {
  peaks: mockPeaks,
  serverCompletedIds: [] as string[],
  userId: null as string | null,
};

describe('PeakListClient', () => {
  beforeEach(() => {
    mockUseQueryState.mockReset();
    mockUseQueryStates.mockReset();
    mockUseProgressStore.mockReset();
    mockToggle.mockReset();
    mockUseToggleProgress.mockReset();
    mockUseToggleProgress.mockReturnValue({ toggle: mockToggle });
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
    setupDefaults({ completion: 'complete', pendingCompletions: new Set(['p2']) });
    render(<PeakListClient {...defaultProps} serverCompletedIds={['p1']} />);
    expect(screen.getByText('Skiddaw')).toBeInTheDocument();
    expect(screen.getByText('Great Gable')).toBeInTheDocument();
    expect(screen.queryByText('Helvellyn')).not.toBeInTheDocument();
  });

  it('excludes pendingRemovals from allCompletedIds for completion filter', () => {
    setupDefaults({ completion: 'incomplete', pendingRemovals: new Set(['p1']) });
    render(<PeakListClient {...defaultProps} serverCompletedIds={['p1']} />);
    // p1 was server-completed but is in pendingRemovals — should show as incomplete
    expect(screen.getByText('Skiddaw')).toBeInTheDocument();
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

  it('sorts peaks by height descending when dir=desc and sort=heightMetres', () => {
    setupDefaults({ sort: 'heightMetres', dir: 'desc' });
    render(<PeakListClient {...defaultProps} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Helvellyn');
    expect(items[1]).toHaveTextContent('Skiddaw');
    expect(items[2]).toHaveTextContent('Great Gable');
  });

  it('sorts peaks by heightFeet ascending', () => {
    setupDefaults({ sort: 'heightFeet', dir: 'asc' });
    render(<PeakListClient {...defaultProps} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Great Gable');
    expect(items[1]).toHaveTextContent('Skiddaw');
    expect(items[2]).toHaveTextContent('Helvellyn');
  });

  it('sorts peaks by region ascending', () => {
    setupDefaults({ sort: 'region', dir: 'asc' });
    render(<PeakListClient {...defaultProps} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Helvellyn'); // Eastern Fells
    expect(items[1]).toHaveTextContent('Skiddaw'); // Northern Fells
    expect(items[2]).toHaveTextContent('Great Gable'); // Southern Fells
  });

  it('sorts peaks by completion status ascending (incomplete first)', () => {
    setupDefaults({ sort: 'completion', dir: 'asc' });
    render(<PeakListClient {...defaultProps} serverCompletedIds={['p1']} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).not.toHaveTextContent('Skiddaw');
    expect(items[2]).toHaveTextContent('Skiddaw');
  });

  it('updates the search filter as the user types', async () => {
    const user = userEvent.setup();
    const setSearch = vi.fn();
    mockUseQueryState.mockReturnValue([null, setSearch]);
    render(<PeakListClient {...defaultProps} />);
    await user.type(screen.getByRole('searchbox', { name: /search peaks/i }), 'g');
    expect(setSearch).toHaveBeenCalledWith('g');
  });

  it('selecting a completion filter option calls setFilters', async () => {
    const user = userEvent.setup();
    const setFilters = vi.fn();
    mockUseQueryStates.mockImplementation((parsers: Record<string, unknown>) => {
      if ('completion' in parsers) return [{ completion: 'all', region: null }, setFilters];
      return [{ sort: 'name', dir: 'asc' }, vi.fn()];
    });
    render(<PeakListClient {...defaultProps} />);
    await user.click(screen.getByRole('combobox', { name: /filter by completion/i }));
    await user.click(await screen.findByRole('option', { name: 'Completed' }));
    expect(setFilters).toHaveBeenCalledWith({ completion: 'complete' });
  });

  it('selecting a region filter option calls setFilters', async () => {
    const user = userEvent.setup();
    const setFilters = vi.fn();
    mockUseQueryStates.mockImplementation((parsers: Record<string, unknown>) => {
      if ('completion' in parsers) return [{ completion: 'all', region: null }, setFilters];
      return [{ sort: 'name', dir: 'asc' }, vi.fn()];
    });
    render(<PeakListClient {...defaultProps} />);
    await user.click(screen.getByRole('combobox', { name: /filter by region/i }));
    await user.click(await screen.findByRole('option', { name: 'Northern Fells' }));
    expect(setFilters).toHaveBeenCalledWith({ region: 'Northern Fells' });
  });

  it('selecting a combined sort option calls setSort with field and direction', async () => {
    const user = userEvent.setup();
    const setSort = vi.fn();
    mockUseQueryStates.mockImplementation((parsers: Record<string, unknown>) => {
      if ('completion' in parsers) return [{ completion: 'all', region: null }, vi.fn()];
      return [{ sort: 'name', dir: 'asc' }, setSort];
    });
    render(<PeakListClient {...defaultProps} />);
    await user.click(screen.getByRole('combobox', { name: /sort order/i }));
    const option = await screen.findByRole('option', { name: 'Height (low → high)' });
    await user.click(option);
    expect(setSort).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'heightMetres', dir: 'asc' })
    );
  });

  it('renders search, completion, region, and combined sort controls', () => {
    render(<PeakListClient {...defaultProps} />);
    expect(screen.getByRole('searchbox', { name: /search peaks/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by completion/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by region/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /sort order/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /sort direction/i })).not.toBeInTheDocument();
  });

  describe('progress toggle', () => {
    it('renders a toggle button per peak when userId is provided', () => {
      render(<PeakListClient {...defaultProps} userId="user-123" />);
      const buttons = screen.getAllByRole('button', { name: /mark .* as complete/i });
      expect(buttons).toHaveLength(3);
    });

    it('does not render toggle buttons when userId is null', () => {
      render(<PeakListClient {...defaultProps} userId={null} />);
      expect(screen.queryByRole('button', { name: /mark .* as/i })).not.toBeInTheDocument();
    });

    it('toggle button is aria-pressed=false for incomplete peaks', () => {
      render(<PeakListClient {...defaultProps} userId="user-123" />);
      const btn = screen.getByRole('button', { name: /mark Skiddaw as complete/i });
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    it('toggle button is aria-pressed=true for completed peaks', () => {
      render(<PeakListClient {...defaultProps} userId="user-123" serverCompletedIds={['p1']} />);
      const btn = screen.getByRole('button', { name: /mark Skiddaw as incomplete/i });
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls toggle with peakId and completed state on click', async () => {
      const user = userEvent.setup();
      render(<PeakListClient {...defaultProps} userId="user-123" />);
      await user.click(screen.getByRole('button', { name: /mark Skiddaw as complete/i }));
      expect(mockToggle).toHaveBeenCalledWith('p1', false);
    });

    it('passes userId to useToggleProgress', () => {
      render(<PeakListClient {...defaultProps} userId="user-123" />);
      expect(mockUseToggleProgress).toHaveBeenCalledWith('user-123');
    });
  });
});
