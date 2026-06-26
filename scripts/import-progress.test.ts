// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── fs mock ───────────────────────────────────────────────────────────────────

const mockReadFile = vi.fn()
vi.mock('node:fs/promises', () => ({ readFile: mockReadFile }))

// ── MongoDB mock ──────────────────────────────────────────────────────────────

const mockFindOneAndUpdate = vi.fn()
const mockCollection = vi.fn().mockReturnValue({ findOneAndUpdate: mockFindOneAndUpdate })
const mockDb = { collection: mockCollection }

vi.mock('../src/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  disconnect: vi.fn().mockResolvedValue(undefined),
}))

const { importProgress } = await import('./import-progress')

// ── Fixtures ──────────────────────────────────────────────────────────────────

const progressModel = {
  userId: 'user-123',
  completedPeakIds: ['peak-1', 'peak-2'],
  updatedAt: '2024-06-01T12:00:00.000Z',
  version: 3,
}

const progressDoc = {
  userId: 'user-123',
  completedPeakIds: ['peak-1', 'peak-2'],
  updatedAt: new Date('2024-06-01T12:00:00.000Z'),
  version: 3,
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('importProgress()', () => {
  beforeEach(() => {
    mockReadFile.mockReset()
    mockFindOneAndUpdate.mockReset()
    mockReadFile.mockResolvedValue(JSON.stringify(progressModel))
    mockFindOneAndUpdate.mockResolvedValue(progressDoc)
  })

  it('throws when userId is empty', async () => {
    await expect(importProgress('', 'some/file.json')).rejects.toThrow(
      'userId argument is required',
    )
  })

  it('throws when filePath is empty', async () => {
    await expect(importProgress('user-123', '')).rejects.toThrow('filePath argument is required')
  })

  it('reads the file at the given path', async () => {
    await importProgress('user-123', '/some/path/progress.json')
    expect(mockReadFile).toHaveBeenCalledWith('/some/path/progress.json', 'utf-8')
  })

  it('throws when file contents fail schema validation', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ invalid: true }))
    await expect(importProgress('user-123', 'progress.json')).rejects.toThrow()
  })

  it('uses the CLI userId, overriding any userId in the file', async () => {
    const fileWithDifferentUser = JSON.stringify({ ...progressModel, userId: 'other-user' })
    mockReadFile.mockResolvedValue(fileWithDifferentUser)

    await importProgress('user-123', 'progress.json')

    const [, updateArg] = mockFindOneAndUpdate.mock.calls[0] as [{ userId: string }, { $set: { version: number } }]
    expect(updateArg.$set.version).toBe(progressModel.version)
    const [filterArg] = mockFindOneAndUpdate.mock.calls[0] as [{ userId: string }]
    expect(filterArg.userId).toBe('user-123')
  })

  it('restores version from the file (uses $set not $inc)', async () => {
    await importProgress('user-123', 'progress.json')
    const [, updateArg] = mockFindOneAndUpdate.mock.calls[0] as [unknown, { $set: Record<string, unknown>; $inc?: unknown }]
    expect(updateArg.$set.version).toBe(progressModel.version)
    expect(updateArg).not.toHaveProperty('$inc')
  })

  it('resolves without throwing on success', async () => {
    await expect(importProgress('user-123', 'progress.json')).resolves.toBeUndefined()
  })
})
