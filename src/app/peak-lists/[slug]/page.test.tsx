import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { mockGetPeakList, mockGetPeaks, mockNotFound, mockPeakListClient } = vi.hoisted(() => ({
  mockGetPeakList: vi.fn(),
  mockGetPeaks: vi.fn(),
  mockNotFound: vi.fn(),
  mockPeakListClient: vi.fn(),
}));

vi.mock('@/features/peaks/services/peak-list.service', () => ({
  getPeakList: mockGetPeakList,
}));
vi.mock('@/features/peaks/services/peak.service', () => ({
  getPeaks: mockGetPeaks,
}));
vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}));
vi.mock('@/features/peaks/components/peak-list-client', () => ({
  PeakListClient: mockPeakListClient,
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

describe('PeakListPage', () => {
  beforeEach(() => {
    mockGetPeakList.mockReset();
    mockGetPeaks.mockReset();
    mockNotFound.mockReset();
    mockPeakListClient.mockReset();

    mockGetPeakList.mockResolvedValue(mockPeakList);
    mockGetPeaks.mockResolvedValue(mockPeaks);
    // notFound throws internally in real Next.js — mirror that so the page bails out
    mockNotFound.mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
    mockPeakListClient.mockReturnValue(
      <div data-testid="peak-list-client" />,
    );
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

  it('passes the fetched peaks and peakList to PeakListClient', async () => {
    const Page = await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    render(Page);
    const [calledProps] = mockPeakListClient.mock.calls[0] as [{ peaks: unknown; peakList: unknown }];
    expect(calledProps).toMatchObject({ peaks: mockPeaks, peakList: mockPeakList });
  });

  it('fetches the peak list and peaks concurrently', async () => {
    await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    expect(mockGetPeakList).toHaveBeenCalledWith('wainwrights');
    expect(mockGetPeaks).toHaveBeenCalledWith('wainwrights');
  });

  it('renders a Suspense boundary wrapping PeakListClient', async () => {
    const Page = await PeakListPage({ params: Promise.resolve({ slug: 'wainwrights' }) });
    render(Page);
    expect(screen.getByTestId('peak-list-client')).toBeInTheDocument();
  });
});
