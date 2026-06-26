import type { RegionalStatistics } from '@/lib/validation';

interface Props {
  regions: RegionalStatistics[];
}

export function RegionalBreakdown({ regions }: Props) {
  if (regions.length === 0) return null;

  return (
    <section aria-label="Regional breakdown">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        By Region
      </h2>
      <ul className="space-y-3" role="list">
        {regions.map((r) => (
          <li key={r.region}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium">{r.region}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {r.completed}&thinsp;/&thinsp;{r.total}&ensp;·&ensp;{r.percentageComplete}%
              </span>
            </div>
            <div
              className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={r.percentageComplete}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${r.region}: ${r.percentageComplete}% complete`}
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${r.percentageComplete}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
