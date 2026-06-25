'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RegionalBreakdown } from './regional-breakdown';
import type { RegionalStatistics } from '@/lib/validation';

interface Props {
  regions: RegionalStatistics[];
}

export function RegionalBreakdownAccordion({ regions }: Props) {
  if (regions.length === 0) return null;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="regional-breakdown" className="border-none">
        <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:no-underline">
          Regional breakdown
        </AccordionTrigger>
        <AccordionContent>
          <RegionalBreakdown regions={regions} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
