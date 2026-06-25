import type { PeakListStatistics } from '@/lib/validation';

interface Props {
  statistics: PeakListStatistics;
  label?: string;
}

interface StatProps {
  term: string;
  value: number | string;
}

function Stat({ term, value }: StatProps) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
      <dt className="text-xs text-muted-foreground">{term}</dt>
    </div>
  );
}

export function Statistics({ statistics, label = 'Progress statistics' }: Props) {
  return (
    <section aria-label={label}>
      <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <Stat term="total" value={statistics.total} />
        <Stat term="completed" value={statistics.completed} />
        <Stat term="remaining" value={statistics.remaining} />
        <Stat term="complete" value={`${statistics.percentageComplete}%`} />
      </dl>
    </section>
  );
}
