import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/auth')
vi.mock('@/lib/db/mongodb')
vi.mock('@/lib/db/repositories/progress-repository')

import { GET, PUT } from './route'
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

const VALID_BODY = {
  completedPeakIds: ['peak-slug-a', 'peak-slug-b'],
  updatedAt: '2026-06-25T10:05:00.000Z',
  version: 4,
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/progress', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
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

  it('returns 404 when no progress record exists', async () => {
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

describe('PUT /api/progress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetDb.mockResolvedValue({} as never)
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockResolvedValue({
      userId: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })
    const response = await PUT(makeRequest(VALID_BODY))
    expect(response.status).toBe(401)
  })

  it('returns 422 when the request body is invalid', async () => {
    mockRequireAuth.mockResolvedValue({ userId: 'user_123', error: null })
    const response = await PUT(makeRequest({ completedPeakIds: 'not-an-array' }))
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('returns 422 when dirty is present in the request body', async () => {
    mockRequireAuth.mockResolvedValue({ userId: 'user_123', error: null })
    const response = await PUT(makeRequest({ ...VALID_BODY, dirty: true }))
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('returns 200 with the saved record when no existing record (new user)', async () => {
    mockRequireAuth.mockResolvedValue({ userId: 'user_123', error: null })
    const mockRestore = vi.fn().mockResolvedValue({ userId: 'user_123', ...VALID_BODY })
    mockCreateProgressRepository.mockReturnValue({
      findByUserId: vi.fn().mockResolvedValue(null),
      upsert: vi.fn(),
      restore: mockRestore,
    })
    const response = await PUT(makeRequest(VALID_BODY))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ userId: 'user_123', ...VALID_BODY })
    expect(mockRestore).toHaveBeenCalledWith({ userId: 'user_123', ...VALID_BODY })
  })

  it('returns 200 when client record is newer than server', async () => {
    mockRequireAuth.mockResolvedValue({ userId: 'user_123', error: null })
    const existingOlder = { ...MOCK_PROGRESS, updatedAt: '2026-06-25T09:00:00.000Z', version: 2 }
    mockCreateProgressRepository.mockReturnValue({
      findByUserId: vi.fn().mockResolvedValue(existingOlder),
      upsert: vi.fn(),
      restore: vi.fn().mockResolvedValue({ userId: 'user_123', ...VALID_BODY }),
    })
    const response = await PUT(makeRequest(VALID_BODY))
    expect(response.status).toBe(200)
  })

  it('returns 409 when server record has a later updatedAt', async () => {
    mockRequireAuth.mockResolvedValue({ userId: 'user_123', error: null })
    const existingNewer = { ...MOCK_PROGRESS, updatedAt: '2026-06-25T11:00:00.000Z', version: 5 }
    mockCreateProgressRepository.mockReturnValue({
      findByUserId: vi.fn().mockResolvedValue(existingNewer),
      upsert: vi.fn(),
      restore: vi.fn(),
    })
    const response = await PUT(makeRequest(VALID_BODY))
    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.error).toMatch(/conflict/i)
    expect(body.serverUpdatedAt).toBe(existingNewer.updatedAt)
    expect(body.serverVersion).toBe(existingNewer.version)
  })

  it('returns 409 when timestamps are equal and server version is not lower', async () => {
    mockRequireAuth.mockResolvedValue({ userId: 'user_123', error: null })
    const sameTimestamp = { ...MOCK_PROGRESS, updatedAt: VALID_BODY.updatedAt, version: 4 }
    mockCreateProgressRepository.mockReturnValue({
      findByUserId: vi.fn().mockResolvedValue(sameTimestamp),
      upsert: vi.fn(),
      restore: vi.fn(),
    })
    // client sends version 4, server has version 4 — tie → 409
    const response = await PUT(makeRequest(VALID_BODY))
    expect(response.status).toBe(409)
  })

  it('rejects a request body containing userId — strict validation prevents spoofing', async () => {
    mockRequireAuth.mockResolvedValue({ userId: 'user_from_clerk', error: null })
    // strict() treats userId as an unknown key and returns 422 rather than
    // silently stripping it — the attacker's value never reaches restore().
    const response = await PUT(makeRequest({ ...VALID_BODY, userId: 'attacker_id' }))
    expect(response.status).toBe(422)
  })
})
