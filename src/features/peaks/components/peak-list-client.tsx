'use client';

import { useMemo } from 'react';
import { useQueryState, useQueryStates } from 'nuqs';
import { useProgressStore } from '@/stores/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Peak } from '@/lib/types/domain';
import {
  SEARCH_PARAM,
  searchParser,
  COMPLETION_PARAM,
  completionParser,
  REGION_PARAM,
  regionParser,
  SORT_PARAM,
  sortParser,
  DIR_PARAM,
  dirParser,
} from '@/lib/nuqs/parsers';
import {
  CompletionFilterSchema,
  SortFieldSchema,
  SortDirectionSchema,
} from '@/lib/validation';
import type { CompletionFilter, SortField, SortDirection } from '@/lib/validation';

interface Props {
  peaks: Peak[];
  serverCompletedIds: string[];
}

const COMPLETION_LABELS: Record<CompletionFilter, string> = {
  all: 'All peaks',
  complete: 'Completed',
  incomplete: 'Incomplete',
};

const SORT_FIELD_LABELS: Record<SortField, string> = {
  name: 'Name',
  heightMetres: 'Height (m)',
  heightFeet: 'Height (ft)',
  region: 'Region',
  completion: 'Completion',
};

const SORT_DIR_LABELS: Record<SortDirection, string> = {
  asc: 'Ascending',
  desc: 'Descending',
};

export function PeakListClient({ peaks, serverCompletedIds }: Props) {
  const [search, setSearch] = useQueryState(
    SEARCH_PARAM,
    searchParser.withOptions({ throttleMs: 300 }),
  );

  const [{ completion, region }, setFilters] = useQueryStates({
    [COMPLETION_PARAM]: completionParser,
    [REGION_PARAM]: regionParser,
  });

  const [{ sort, dir }, setSort] = useQueryStates({
    [SORT_PARAM]: sortParser,
    [DIR_PARAM]: dirParser,
  });

  const pendingCompletions = useProgressStore((state) => state.pendingCompletions);

  const allCompletedIds = useMemo(
    () => new Set([...serverCompletedIds, ...Array.from(pendingCompletions)]),
    [serverCompletedIds, pendingCompletions],
  );

  const regions = useMemo(
    () =>
      [...new Set(peaks.map((p) => p.region))].sort((a, b) => a.localeCompare(b, 'en-GB')),
    [peaks],
  );

  const lowerSearch = search ? search.toLowerCase() : '';

  const filtered = peaks.filter((peak) => {
    if (lowerSearch && !peak.name.toLowerCase().includes(lowerSearch)) return false;
    if (region && peak.region !== region) return false;
    if (completion === 'complete' && !allCompletedIds.has(peak.id)) return false;
    if (completion === 'incomplete' && allCompletedIds.has(peak.id)) return false;
    return true;
  });

  const sorted = filtered.sort((a, b) => {
    const mult = dir === 'asc' ? 1 : -1;
    switch (sort as SortField) {
      case 'name':
        return mult * a.name.localeCompare(b.name, 'en-GB');
      case 'heightMetres':
        return mult * (a.heightMetres - b.heightMetres);
      case 'heightFeet':
        return mult * (a.heightFeet - b.heightFeet);
      case 'region':
        return mult * a.region.localeCompare(b.region, 'en-GB');
      case 'completion': {
        const aVal = allCompletedIds.has(a.id) ? 1 : 0;
        const bVal = allCompletedIds.has(b.id) ? 1 : 0;
        return mult * (aVal - bVal);
      }
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <section aria-label="Search and filter controls">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="peak-search" className="sr-only">
              Search peaks by name
            </label>
            <Input
              id="peak-search"
              type="search"
              placeholder="Search peaks…"
              value={search ?? ''}
              onChange={(e) => setSearch(e.target.value || null)}
            />
          </div>

          <Select
            value={completion as CompletionFilter}
            onValueChange={(v) => setFilters({ [COMPLETION_PARAM]: v as CompletionFilter })}
          >
            <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by completion">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CompletionFilterSchema.options.map((v) => (
                <SelectItem key={v} value={v}>
                  {COMPLETION_LABELS[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={region || '__all__'}
            onValueChange={(v) =>
              setFilters({ [REGION_PARAM]: v === '__all__' ? null : v })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by region">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort as SortField}
            onValueChange={(v) => setSort({ [SORT_PARAM]: v as SortField })}
          >
            <SelectTrigger className="w-full sm:w-[160px]" aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SortFieldSchema.options.map((v) => (
                <SelectItem key={v} value={v}>
                  {SORT_FIELD_LABELS[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={dir as SortDirection}
            onValueChange={(v) => setSort({ [DIR_PARAM]: v as SortDirection })}
          >
            <SelectTrigger className="w-full sm:w-[130px]" aria-label="Sort direction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SortDirectionSchema.options.map((v) => (
                <SelectItem key={v} value={v}>
                  {SORT_DIR_LABELS[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Showing {sorted.length} of {peaks.length} peaks
      </p>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          No peaks match your current filters.
        </p>
      ) : (
        <ul className="divide-y" role="list" aria-label="Peak list">
          {sorted.map((peak) => {
            const completed = allCompletedIds.has(peak.id);
            return (
              <li
                key={peak.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium leading-snug truncate">{peak.name}</p>
                  <p className="text-sm text-muted-foreground">{peak.region}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground tabular-nums text-right">
                    {peak.heightMetres}m&nbsp;/&nbsp;{peak.heightFeet}ft
                  </span>
                  {completed && <Badge variant="default">Done</Badge>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
