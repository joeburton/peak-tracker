import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFindByUserId, mockGetDb, mockCreateProgressRepository } = vi.hoisted(() => ({
  mockFindByUserId: vi.fn(),
  mockGetDb: vi.fn(),
  mockCreateProgressRepository: vi.fn(),
}));

vi.mock('@/lib/db/mongodb', () => ({ getDb: mockGetDb }));
vi.mock('@/lib/db/repositories/progress-repository', () => ({
  createProgressRepository: mockCreateProgressRepository,
}));

import { getProgress } from './progress.service';

const mockDb = {};
const mockProgress = {
  userId: 'user-123',
  completedPeakIds: ['peak-1', 'peak-2'],
  updatedAt: '2024-01-01T00:00:00.000Z',
  version: 1,
};

describe('getProgress()', () => {
  beforeEach(() => {
    mockFindByUserId.mockReset();
    mockGetDb.mockReset();
    mockCreateProgressRepository.mockReset();

    mockGetDb.mockResolvedValue(mockDb);
    mockCreateProgressRepository.mockReturnValue({ findByUserId: mockFindByUserId });
    mockFindByUserId.mockResolvedValue(mockProgress);
  });

  it('returns empty array immediately when userId is null', async () => {
    const result = await getProgress(null);
    expect(result).toEqual([]);
    expect(mockGetDb).not.toHaveBeenCalled();
  });

  it('calls findByUserId with the provided userId', async () => {
    await getProgress('user-123');
    expect(mockFindByUserId).toHaveBeenCalledWith('user-123');
  });

  it('returns the completedPeakIds from the progress record', async () => {
    const result = await getProgress('user-123');
    expect(result).toEqual(['peak-1', 'peak-2']);
  });

  it('returns empty array when no progress record exists for the user', async () => {
    mockFindByUserId.mockResolvedValue(null);
    const result = await getProgress('user-123');
    expect(result).toEqual([]);
  });

  it('propagates errors thrown by findByUserId', async () => {
    mockFindByUserId.mockRejectedValue(new Error('query failed'));
    await expect(getProgress('user-123')).rejects.toThrow('query failed');
  });
});
