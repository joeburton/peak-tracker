'use client';

import { useMemo } from 'react';
import { Circle, CheckCircle2 } from 'lucide-react';
import { useQueryState, useQueryStates } from 'nuqs';
import { useProgressStore } from '@/stores/progress';
import { useToggleProgress } from '@/features/peaks/hooks/use-toggle-progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { CompletionFilterSchema } from '@/lib/validation';
import type { CompletionFilter, SortField } from '@/lib/validation';
import { COMBINED_SORT_OPTIONS } from '@/features/peaks/utils/sort-options';

interface Props {
  peaks: Peak[];
  serverCompletedIds: string[];
  userId: string | null;
}

const COMPLETION_LABELS: Record<CompletionFilter, string> = {
  all: 'All peaks',
  complete: 'Completed',
  incomplete: 'Incomplete',
};

export function PeakListClient({ peaks, serverCompletedIds, userId }: Props) {
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

  const pendingCompletions = useProgressStore((s) => s.pendingCompletions);
  const pendingRemovals = useProgressStore((s) => s.pendingRemovals);
  const { toggle } = useToggleProgress(userId);

  const allCompletedIds = useMemo(() => {
    const all = new Set([...serverCompletedIds, ...Array.from(pendingCompletions)]);
    pendingRemovals.forEach((id) => all.delete(id));
    return all;
  }, [serverCompletedIds, pendingCompletions, pendingRemovals]);

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

  const combinedSortValue = `${sort}-${dir}`;

  function handleSortChange(value: string) {
    const option = COMBINED_SORT_OPTIONS.find((o) => o.value === value);
    if (option) {
      setSort({ [SORT_PARAM]: option.field, [DIR_PARAM]: option.dir });
    }
  }

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

          <Select value={combinedSortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Sort order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMBINED_SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
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
            const rowContent = (
              <>
                <span className="min-w-0">
                  <span className="block font-medium leading-snug truncate">{peak.name}</span>
                  <span className="block text-sm text-muted-foreground">{peak.region}</span>
                </span>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground tabular-nums text-right">
                    {peak.heightMetres}m&nbsp;/&nbsp;{peak.heightFeet}ft
                  </span>
                  {completed ? (
                    <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" aria-hidden="true" />
                  )}
                </span>
              </>
            );
            return (
              <li key={peak.id}>
                {userId ? (
                  <button
                    type="button"
                    onClick={() => toggle(peak.id, completed)}
                    aria-pressed={completed}
                    aria-label={
                      completed
                        ? `Mark ${peak.name} as incomplete`
                        : `Mark ${peak.name} as complete`
                    }
                    className="group flex w-full items-center justify-between gap-4 py-3 -mx-1 rounded px-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {rowContent}
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-4 py-3">
                    {rowContent}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
