import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const {
  mockGetPeakList,
  mockGetPeaks,
  mockGetProgress,
  mockComputeStatistics,
  mockNotFound,
  mockAuth,
  mockPeakListClient,
  mockStatisticsComponent,
  mockRegionalBreakdownAccordion,
} = vi.hoisted(() => ({
  mockGetPeakList: vi.fn(),
  mockGetPeaks: vi.fn(),
  mockGetProgress: vi.fn(),
  mockComputeStatistics: vi.fn(),
  mockNotFound: vi.fn(),
  mockAuth: vi.fn(),
  mockPeakListClient: vi.fn(),
  mockStatisticsComponent: vi.fn(),
  mockRegionalBreakdownAccordion: vi.fn(),
}));

vi.mock('@/features/peaks/services/peak-list.service', () => ({
  getPeakList: mockGetPeakList,
}));
vi.mock('@/features/peaks/services/peak.service', () => ({
  getPeaks: mockGetPeaks,
}));
vi.mock('@/features/peaks/services/progress.service', () => ({
  getProgress: mockGetProgress,
}));
vi.mock('@/features/peaks/services/statistics.service', () => ({
  computeStatistics: mockComputeStatistics,
}));
vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}));
vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}));
vi.mock('@/features/peaks/components/peak-list-client', () => ({
  PeakListClient: mockPeakListClient,
}));
vi.mock('@/features/peaks/components/statistics', () => ({
  Statistics: mockStatisticsComponent,
}));
vi.mock('@/features/peaks/components/regional-breakdown-accordion', () => ({
  RegionalBreakdownAccordion: mockRegionalBreakdownAccordion,
}));

import PeakListPage from './page';

const mockPeakList = {
  id: '1',
  slug: 'wainwrights',
  name: 'Wainwrights',
  peakCount: 214,
};

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
];

const mockStatistics = {
  total: 1,
  completed: 0,
  remaining: 1,
  percentageComplete: 0,
  byRegion: [],
};

describe('PeakListPage', () => {
  beforeEach(() => {
    mockGetPeakList.mockReset();
    mockGetPeaks.mockReset();
    mockGetProgress.mockReset();
    mockComputeStatistics.mockReset();
    mockNotFound.mockReset();
    mockAuth.mockReset();
    mockPeakListClient.mockReset();
    mockStatisticsComponent.mockReset();
    mockRegionalBreakdownAccordion.mockReset();

    mockGetPeakList.mockResolvedValue(mockPeakList);
    mockGetPeaks.mockResolvedValue(mockPeaks);
    mockGetProgress.mockResolvedValue([]);
    mockComputeStatistics.mockReturnValue(mockStatistics);
    mockAuth.mockResolvedValue({ userId: 'user-123' });
    mockNotFound.mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
    mockPeakListClient.mockReturnValue(<div data-testid="peak-list-client" />);
    mockStatisticsComponent.mockReturnValue(<div data-testid="statistics" />);
    mockRegionalBreakdownAccordion.mockReturnValue(<div data-testid="regional-breakdown-accordion" />);
  });

  it('renders the peak list name as the page heading', async () => {
    const Page = await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    render(Page);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Wainwrights');
  });

  it('calls notFound when getPeakList returns null', async () => {
    mockGetPeakList.mockResolvedValue(null);
    await expect(
      PeakListPage({ params: Promise.resolve({ slug: 'unknown' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it('computes statistics server-side with server-fetched completedIds', async () => {
    mockGetProgress.mockResolvedValue(['p1']);
    await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    expect(mockComputeStatistics).toHaveBeenCalledWith(mockPeaks, ['p1']);
  });

  it('renders the Statistics component with server-computed statistics', async () => {
    mockGetProgress.mockResolvedValue(['p1']);
    mockComputeStatistics.mockReturnValue(mockStatistics);
    const Page = await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    render(Page);
    const [calledProps] = mockStatisticsComponent.mock.calls[0] as [Record<string, unknown>];
    expect(calledProps).toMatchObject({ statistics: mockStatistics });
  });

  it('passes peaks and serverCompletedIds to PeakListClient', async () => {
    mockGetProgress.mockResolvedValue(['p1']);
    const Page = await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    render(Page);
    const [calledProps] = mockPeakListClient.mock.calls[0] as [Record<string, unknown>];
    expect(calledProps).toMatchObject({
      peaks: mockPeaks,
      serverCompletedIds: ['p1'],
    });
  });

  it('does not pass statistics to PeakListClient', async () => {
    const Page = await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    render(Page);
    const [calledProps] = mockPeakListClient.mock.calls[0] as [Record<string, unknown>];
    expect(calledProps).not.toHaveProperty('statistics');
  });

  it('passes empty serverCompletedIds when user is unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });
    const Page = await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    render(Page);
    const [calledProps] = mockPeakListClient.mock.calls[0] as [Record<string, unknown>];
    expect(calledProps).toMatchObject({ serverCompletedIds: [] });
  });

  it('fetches peak list, peaks, and progress concurrently', async () => {
    await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    expect(mockGetPeakList).toHaveBeenCalledWith('wainwrights');
    expect(mockGetPeaks).toHaveBeenCalledWith('wainwrights');
    expect(mockGetProgress).toHaveBeenCalledWith('user-123');
  });

  it('renders RegionalBreakdownAccordion with byRegion data when regions are present', async () => {
    const byRegion = [
      { region: 'Northern Fells', total: 18, completed: 3, remaining: 15, percentageComplete: 16.7 },
    ];
    mockComputeStatistics.mockReturnValue({ ...mockStatistics, byRegion });
    const Page = await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    render(Page);
    const [calledProps] = mockRegionalBreakdownAccordion.mock.calls[0] as [Record<string, unknown>];
    expect(calledProps).toMatchObject({ regions: byRegion });
  });

  it('does not render RegionalBreakdownAccordion when byRegion is empty', async () => {
    mockComputeStatistics.mockReturnValue({ ...mockStatistics, byRegion: [] });
    const Page = await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    render(Page);
    expect(mockRegionalBreakdownAccordion).not.toHaveBeenCalled();
  });
});
