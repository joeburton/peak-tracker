export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 text-center">
              <div className="mx-auto mb-2 h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="mx-auto h-3 w-12 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-px bg-border" />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-40" />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3">
              <div className="space-y-1">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
