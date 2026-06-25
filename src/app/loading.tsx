export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-8 w-32 animate-pulse rounded-md bg-muted" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <div className="rounded-xl border bg-card p-6 shadow">
              <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
