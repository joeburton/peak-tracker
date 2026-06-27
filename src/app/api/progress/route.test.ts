import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/lib/auth')
vi.mock('@/lib/db/mongodb')
vi.mock('@/lib/db/repositories/progress-repository')

import { GET } from './route'
import { requireAuth } from '@/lib/auth'
import { getDb } from '@/lib/db/mongodb'
import { createProgressRepository } from '@/lib/db/repositories/progress-repository'

const mockRequireAuth = vi.mocked(requireAuth)
const mockGetDb = vi.mocked(getDb)
const mockCreateProgressRepository = vi.mocked(createProgressRepository)

const MOCK_PROGRESS = {
  userId: 'user_123',
  completedPeakIds: ['peak-slug-a', 'peak-slug-b'],
  updatedAt: '2026-06-25T10:00:00.000Z',
  version: 3,
}

describe('GET /api/progress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetDb.mockResolvedValue({} as never)
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await GET()

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 200 with the progress record when found', async () => {
    mockRequireAuth.mockResolvedValue({ userId: 'user_123', error: null })
    mockCreateProgressRepository.mockReturnValue({
      findByUserId: vi.fn().mockResolvedValue(MOCK_PROGRESS),
      upsert: vi.fn(),
      restore: vi.fn(),
    })

    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(MOCK_PROGRESS)
  })

  it('returns 404 when no progress record exists for this user', async () => {
    mockRequireAuth.mockResolvedValue({ userId: 'user_new', error: null })
    mockCreateProgressRepository.mockReturnValue({
      findByUserId: vi.fn().mockResolvedValue(null),
      upsert: vi.fn(),
      restore: vi.fn(),
    })

    const response = await GET()

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'No progress record found' })
  })

  it('passes the Clerk userId to the repository', async () => {
    const mockFindByUserId = vi.fn().mockResolvedValue(MOCK_PROGRESS)
    mockRequireAuth.mockResolvedValue({ userId: 'user_abc', error: null })
    mockCreateProgressRepository.mockReturnValue({
      findByUserId: mockFindByUserId,
      upsert: vi.fn(),
      restore: vi.fn(),
    })

    await GET()

    expect(mockFindByUserId).toHaveBeenCalledWith('user_abc')
  })
})
