import { describe, it, expect } from 'vitest';
import { SortFieldSchema, SortDirectionSchema } from '@/lib/validation';
import { COMBINED_SORT_OPTIONS } from './sort-options';

// heightFeet is excluded from the UI — it sorts identically to heightMetres.
const UI_FIELDS = SortFieldSchema.options.filter((f) => f !== 'heightFeet');
const expectedCount = UI_FIELDS.length * SortDirectionSchema.options.length;

describe('COMBINED_SORT_OPTIONS', () => {
  it('contains an entry for every UI SortField × SortDirection combination', () => {
    expect(COMBINED_SORT_OPTIONS).toHaveLength(expectedCount);
  });

  it('contains exactly one entry per field-dir pair', () => {
    const values = COMBINED_SORT_OPTIONS.map((o) => o.value);
    const unique = new Set(values);
    expect(unique.size).toBe(expectedCount);
  });

  it('covers every UI SortField (excluding heightFeet)', () => {
    const fields = new Set(COMBINED_SORT_OPTIONS.map((o) => o.field));
    UI_FIELDS.forEach((f) => expect(fields.has(f)).toBe(true));
  });

  it('excludes heightFeet — it sorts identically to heightMetres', () => {
    const fields = COMBINED_SORT_OPTIONS.map((o) => o.field);
    expect(fields).not.toContain('heightFeet');
  });

  it('covers both directions for every included field', () => {
    UI_FIELDS.forEach((field) => {
      SortDirectionSchema.options.forEach((dir) => {
        const match = COMBINED_SORT_OPTIONS.find((o) => o.field === field && o.dir === dir);
        expect(match).toBeDefined();
      });
    });
  });

  it('has a non-empty human-readable label for every entry', () => {
    COMBINED_SORT_OPTIONS.forEach((o) => {
      expect(o.label).toBeTruthy();
      expect(typeof o.label).toBe('string');
    });
  });

  it('value matches the field-dir pattern', () => {
    COMBINED_SORT_OPTIONS.forEach((o) => {
      expect(o.value).toBe(`${o.field}-${o.dir}`);
    });
  });
});
