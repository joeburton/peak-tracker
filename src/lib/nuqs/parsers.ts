import { parseAsString, parseAsStringEnum } from 'nuqs/server'
import {
  CompletionFilterSchema,
  SortFieldSchema,
  SortDirectionSchema,
} from '@/lib/validation'
import type { CompletionFilter, SortField, SortDirection } from '@/lib/types/domain'

// ── URL parameter keys ─────────────────────────────────────────────────────────
// Single source of truth for all URL search param names used in the application.
// Import these constants everywhere a URL param key is needed — never use raw strings.

export const SEARCH_PARAM = 'search'
export const COMPLETION_PARAM = 'completion'
export const REGION_PARAM = 'region'
export const SORT_PARAM = 'sort'
export const DIR_PARAM = 'dir'

// ── Parsers ────────────────────────────────────────────────────────────────────
// Each parser defines:
//   - How to deserialise a raw URL string to a typed value (parse)
//   - How to serialise a typed value back to a URL string (serialize)
//   - The default value used by the hook when the param is absent or invalid
//
// Enum parsers derive their valid values directly from Zod schemas so the two
// are always in sync — adding a new sort field to SortFieldSchema automatically
// makes it a valid URL param value.
//
// Usage in components (with nuqs hooks):
//   const [search, setSearch] = useQueryState(SEARCH_PARAM, searchParser)
//   const [completion, setCompletion] = useQueryState(COMPLETION_PARAM, completionParser)
//
// For search, merge throttle into the parser with .withOptions() to debounce URL writes:
//   const [search, setSearch] = useQueryState(SEARCH_PARAM, searchParser.withOptions({ throttleMs: 300 }))

export const searchParser = parseAsString.withDefault('')

export const completionParser = parseAsStringEnum<CompletionFilter>(
  CompletionFilterSchema.options,
).withDefault('all')

export const regionParser = parseAsString.withDefault('')

export const sortParser = parseAsStringEnum<SortField>(
  SortFieldSchema.options,
).withDefault('name')

export const dirParser = parseAsStringEnum<SortDirection>(
  SortDirectionSchema.options,
).withDefault('asc')
