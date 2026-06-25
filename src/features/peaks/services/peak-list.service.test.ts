import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFindAll, mockGetDb, mockCreatePeakListRepository } = vi.hoisted(() => ({
  mockFindAll: vi.fn(),
  mockGetDb: vi.fn(),
  mockCreatePeakListRepository: vi.fn(),
}));

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
}));
vi.mock('@/lib/db/mongodb', () => ({ getDb: mockGetDb }));
vi.mock('@/lib/db/repositories/peak-list-repository', () => ({
  createPeakListRepository: mockCreatePeakListRepository,
}));

import { getPeakLists } from './peak-list.service';

const mockDb = {};
const mockPeakLists = [
  { id: '1', slug: 'wainwrights', name: 'Wainwrights', peakCount: 214 },
  { id: '2', slug: 'munros', name: 'Munros', peakCount: 282 },
];

describe('getPeakLists()', () => {
  beforeEach(() => {
    mockFindAll.mockReset();
    mockGetDb.mockReset();
    mockCreatePeakListRepository.mockReset();

    mockGetDb.mockResolvedValue(mockDb);
    mockCreatePeakListRepository.mockReturnValue({ findAll: mockFindAll });
    mockFindAll.mockResolvedValue(mockPeakLists);
  });

  it('calls getDb to obtain the database connection', async () => {
    await getPeakLists();
    expect(mockGetDb).toHaveBeenCalledOnce();
  });

  it('passes the resolved db to createPeakListRepository', async () => {
    await getPeakLists();
    expect(mockCreatePeakListRepository).toHaveBeenCalledWith(mockDb);
  });

  it('calls findAll on the repository', async () => {
    await getPeakLists();
    expect(mockFindAll).toHaveBeenCalledOnce();
  });

  it('returns the peak lists from the repository', async () => {
    const result = await getPeakLists();
    expect(result).toEqual(mockPeakLists);
  });

  it('propagates errors thrown by getDb', async () => {
    mockGetDb.mockRejectedValue(new Error('connection refused'));
    await expect(getPeakLists()).rejects.toThrow('connection refused');
  });

  it('propagates errors thrown by findAll', async () => {
    mockFindAll.mockRejectedValue(new Error('query failed'));
    await expect(getPeakLists()).rejects.toThrow('query failed');
  });
});
