import { describe, it, expect } from 'vitest'
import { CompletionFilterSchema, SortFieldSchema, SortDirectionSchema } from '@/lib/validation'
import {
  SEARCH_PARAM,
  COMPLETION_PARAM,
  REGION_PARAM,
  SORT_PARAM,
  DIR_PARAM,
  searchParser,
  completionParser,
  regionParser,
  sortParser,
  dirParser,
} from './parsers'

// ── URL parameter keys ─────────────────────────────────────────────────────────

describe('URL parameter key constants', () => {
  it('SEARCH_PARAM is "search"', () => expect(SEARCH_PARAM).toBe('search'))
  it('COMPLETION_PARAM is "completion"', () => expect(COMPLETION_PARAM).toBe('completion'))
  it('REGION_PARAM is "region"', () => expect(REGION_PARAM).toBe('region'))
  it('SORT_PARAM is "sort"', () => expect(SORT_PARAM).toBe('sort'))
  it('DIR_PARAM is "dir"', () => expect(DIR_PARAM).toBe('dir'))
})

// ── searchParser ───────────────────────────────────────────────────────────────

describe('searchParser', () => {
  it('defaults to empty string — used when ?search= is absent', () => {
    expect(searchParser.defaultValue).toBe('')
  })

  it('parses any string value', () => {
    expect(searchParser.parse('scafell')).toBe('scafell')
    expect(searchParser.parse('Ben Nevis')).toBe('Ben Nevis')
  })

  it('parses empty string', () => {
    expect(searchParser.parse('')).toBe('')
  })
})

// ── completionParser ───────────────────────────────────────────────────────────

describe('completionParser', () => {
  it('defaults to "all" — used when ?completion= is absent or invalid', () => {
    expect(completionParser.defaultValue).toBe('all')
  })

  it.each(CompletionFilterSchema.options)('parses valid value "%s"', (value) => {
    expect(completionParser.parse(value)).toBe(value)
  })

  it('returns null for an invalid value (hook falls back to defaultValue)', () => {
    expect(completionParser.parse('bogus')).toBeNull()
  })

  it('covers all values from CompletionFilterSchema — parser and schema stay in sync', () => {
    CompletionFilterSchema.options.forEach((v) => expect(completionParser.parse(v)).toBe(v))
  })
})

// ── regionParser ───────────────────────────────────────────────────────────────

describe('regionParser', () => {
  it('defaults to empty string — used when ?region= is absent', () => {
    expect(regionParser.defaultValue).toBe('')
  })

  it('parses any string value', () => {
    expect(regionParser.parse('Eastern Fells')).toBe('Eastern Fells')
    expect(regionParser.parse('Central Highlands')).toBe('Central Highlands')
  })
})

// ── sortParser ─────────────────────────────────────────────────────────────────

describe('sortParser', () => {
  it('defaults to "name" — used when ?sort= is absent or invalid', () => {
    expect(sortParser.defaultValue).toBe('name')
  })

  it.each(SortFieldSchema.options)(
    'parses valid value "%s"',
    (value) => {
      expect(sortParser.parse(value)).toBe(value)
    },
  )

  it('returns null for an invalid value (hook falls back to defaultValue)', () => {
    expect(sortParser.parse('bogus')).toBeNull()
  })

  it('covers all values from SortFieldSchema — parser and schema stay in sync', () => {
    SortFieldSchema.options.forEach((v) => expect(sortParser.parse(v)).toBe(v))
  })
})

// ── dirParser ──────────────────────────────────────────────────────────────────

describe('dirParser', () => {
  it('defaults to "asc" — used when ?dir= is absent or invalid', () => {
    expect(dirParser.defaultValue).toBe('asc')
  })

  it.each(SortDirectionSchema.options)('parses valid value "%s"', (value) => {
    expect(dirParser.parse(value)).toBe(value)
  })

  it('returns null for an invalid value (hook falls back to defaultValue)', () => {
    expect(dirParser.parse('up')).toBeNull()
  })
})
