import Link from 'next/link';
import { getDb } from '@/lib/db/mongodb';
import { createPeakListRepository } from '@/lib/db/repositories/peak-list-repository';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function Home() {
  const db = await getDb();
  const repo = createPeakListRepository(db);
  const peakLists = await repo.findAll();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Peak Lists</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {peakLists.map((list) => (
          <li key={list.id}>
            <Link href={`/peak-lists/${list.slug}`} className="block h-full">
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle>{list.name}</CardTitle>
                  <CardDescription>{list.peakCount} peaks</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
