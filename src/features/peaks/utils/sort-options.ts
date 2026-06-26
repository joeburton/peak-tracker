import { SortFieldSchema, SortDirectionSchema } from '@/lib/validation';
import type { SortField, SortDirection } from '@/lib/validation';

// TypeScript enforces exhaustiveness — adding a new SortField causes a compile
// error here if its label is not provided.
const SORT_FIELD_LABELS: Record<SortField, Record<SortDirection, string>> = {
  name:         { asc: 'Name A → Z',          desc: 'Name Z → A'          },
  heightMetres: { asc: 'Height (low → high)',  desc: 'Height (high → low)' },
  heightFeet:   { asc: 'Height (low → high)',  desc: 'Height (high → low)' },
  region:       { asc: 'Region A → Z',         desc: 'Region Z → A'        },
  completion:   { asc: 'Incomplete first',     desc: 'Completed first'     },
};

// heightFeet sorts identically to heightMetres — exclude it from the UI
// dropdown to avoid duplicate options. It remains in SortFieldSchema so
// that ?sort=heightFeet URL params continue to resolve correctly.
const UI_SORT_FIELDS: SortField[] = SortFieldSchema.options.filter(
  (f) => f !== 'heightFeet',
);

export interface SortOption {
  value: string;
  label: string;
  field: SortField;
  dir: SortDirection;
}

export const COMBINED_SORT_OPTIONS: SortOption[] = UI_SORT_FIELDS.flatMap((field) =>
  SortDirectionSchema.options.map((dir) => ({
    value: `${field}-${dir}`,
    label: SORT_FIELD_LABELS[field][dir],
    field,
    dir,
  })),
);
