'use client';

import { BarChart3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RegionalBreakdown } from './regional-breakdown';
import type { RegionalStatistics } from '@/lib/validation';

interface Props {
  regions: RegionalStatistics[];
}

export function RegionalBreakdownDialog({ regions }: Props) {
  if (regions.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-1.5 px-0 py-0 text-sm text-foreground/60 hover:bg-transparent hover:text-foreground hover:underline underline-offset-4"
        >
          <BarChart3 aria-hidden="true" />
          Regional breakdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Regional breakdown</DialogTitle>
          <DialogDescription className="sr-only">
            Progress by region — completed and remaining peaks for each area of the list.
          </DialogDescription>
        </DialogHeader>
        <RegionalBreakdown regions={regions} />
      </DialogContent>
    </Dialog>
  );
}
