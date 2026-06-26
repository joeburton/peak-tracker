import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFindByListSlug, mockGetDb, mockCreatePeakRepository } = vi.hoisted(() => ({
  mockFindByListSlug: vi.fn(),
  mockGetDb: vi.fn(),
  mockCreatePeakRepository: vi.fn(),
}));

vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn }));
vi.mock('@/lib/db/mongodb', () => ({ getDb: mockGetDb }));
vi.mock('@/lib/db/repositories/peak-repository', () => ({
  createPeakRepository: mockCreatePeakRepository,
}));

import { getPeaks } from './peak.service';

const mockDb = {};
const mockPeaks = [
  { id: '1', peakListSlug: 'wainwrights', slug: 'skiddaw', name: 'Skiddaw', region: 'Northern Fells', heightMetres: 931, heightFeet: 3054, latitude: 54.65, longitude: -3.14, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
];

describe('getPeaks()', () => {
  beforeEach(() => {
    mockFindByListSlug.mockReset();
    mockGetDb.mockReset();
    mockCreatePeakRepository.mockReset();

    mockGetDb.mockResolvedValue(mockDb);
    mockCreatePeakRepository.mockReturnValue({ findByListSlug: mockFindByListSlug });
    mockFindByListSlug.mockResolvedValue(mockPeaks);
  });

  it('passes the resolved db to createPeakRepository', async () => {
    await getPeaks('wainwrights');
    expect(mockCreatePeakRepository).toHaveBeenCalledWith(mockDb);
  });

  it('calls findByListSlug with the provided slug', async () => {
    await getPeaks('wainwrights');
    expect(mockFindByListSlug).toHaveBeenCalledWith('wainwrights');
  });

  it('returns the peaks from the repository', async () => {
    const result = await getPeaks('wainwrights');
    expect(result).toEqual(mockPeaks);
  });

  it('propagates errors thrown by findByListSlug', async () => {
    mockFindByListSlug.mockRejectedValue(new Error('query failed'));
    await expect(getPeaks('wainwrights')).rejects.toThrow('query failed');
  });
});
