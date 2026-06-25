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
    <div className="flex flex-col-reverse rounded-lg border bg-card p-4 text-center">
      <dt className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{term}</dt>
      <dd className="m-0 text-2xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

export function Statistics({ statistics, label = 'Progress statistics' }: Props) {
  return (
    <section aria-label={label}>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat term="Total" value={statistics.total} />
        <Stat term="Completed" value={statistics.completed} />
        <Stat term="Remaining" value={statistics.remaining} />
        <Stat term="Progress" value={`${statistics.percentageComplete}%`} />
      </dl>
    </section>
  );
}
