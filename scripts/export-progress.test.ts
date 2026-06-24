// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── fs mock ───────────────────────────────────────────────────────────────────

const mockWriteFile = vi.fn().mockResolvedValue(undefined)
vi.mock('node:fs/promises', () => ({ writeFile: mockWriteFile }))

// ── MongoDB mock ──────────────────────────────────────────────────────────────

const mockFindOne = vi.fn()
const mockCollection = vi.fn().mockReturnValue({ findOne: mockFindOne })
const mockDb = { collection: mockCollection }

vi.mock('../src/lib/db/mongodb', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  disconnect: vi.fn().mockResolvedValue(undefined),
}))

const { exportProgress } = await import('./export-progress')

// ── Fixtures ──────────────────────────────────────────────────────────────────

const progressDoc = {
  userId: 'user-123',
  completedPeakIds: ['peak-1', 'peak-2'],
  updatedAt: new Date('2024-06-01T12:00:00.000Z'),
  version: 3,
}

const progressModel = {
  userId: 'user-123',
  completedPeakIds: ['peak-1', 'peak-2'],
  updatedAt: '2024-06-01T12:00:00.000Z',
  version: 3,
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('exportProgress()', () => {
  beforeEach(() => {
    mockFindOne.mockReset()
    mockWriteFile.mockReset()
    mockWriteFile.mockResolvedValue(undefined)
    mockFindOne.mockResolvedValue(progressDoc)
  })

  it('throws when userId is empty', async () => {
    await expect(exportProgress('')).rejects.toThrow('userId argument is required')
  })

  it('throws when no progress record exists for the user', async () => {
    mockFindOne.mockResolvedValue(null)
    await expect(exportProgress('user-123')).rejects.toThrow(
      'No progress record found for userId: user-123',
    )
  })

  it('writes valid JSON to scripts/data/progress-<userId>.json', async () => {
    await exportProgress('user-123')
    expect(mockWriteFile).toHaveBeenCalledTimes(1)
    const [path, content] = mockWriteFile.mock.calls[0] as [string, string, string]
    expect(path).toMatch(/scripts[/\\]data[/\\]progress-user-123\.json$/)
    expect(JSON.parse(content)).toEqual(progressModel)
  })

  it('writes the file with utf-8 encoding', async () => {
    await exportProgress('user-123')
    const [, , encoding] = mockWriteFile.mock.calls[0] as [string, string, string]
    expect(encoding).toBe('utf-8')
  })

  it('returns the output file path', async () => {
    const result = await exportProgress('user-123')
    expect(result).toMatch(/progress-user-123\.json$/)
  })

  it('resolves without throwing on success', async () => {
    await expect(exportProgress('user-123')).resolves.toBeDefined()
  })
})
