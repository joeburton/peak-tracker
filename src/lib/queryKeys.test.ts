import { describe, it, expect } from 'vitest';
import { queryKeys } from './queryKeys';

describe('queryKeys', () => {
  it('builds peakLists keys', () => {
    expect(queryKeys.peakLists.all()).toEqual(['peakLists']);
    expect(queryKeys.peakLists.detail('wainwrights')).toEqual(['peakLists', 'wainwrights']);
  });

  it('builds peaks keys', () => {
    expect(queryKeys.peaks.all()).toEqual(['peaks']);
    expect(queryKeys.peaks.byList('wainwrights')).toEqual(['peaks', 'list', 'wainwrights']);
    expect(queryKeys.peaks.detail('skiddaw')).toEqual(['peaks', 'skiddaw']);
  });

  it('builds progress keys', () => {
    expect(queryKeys.progress.all()).toEqual(['progress']);
    expect(queryKeys.progress.byList('user_1', 'wainwrights')).toEqual([
      'progress',
      'user_1',
      'wainwrights',
    ]);
  });

  it('builds statistics keys', () => {
    expect(queryKeys.statistics.all()).toEqual(['statistics']);
    expect(queryKeys.statistics.byList('user_1', 'wainwrights')).toEqual([
      'statistics',
      'user_1',
      'wainwrights',
    ]);
  });

  it('statistics.all() is a prefix of statistics.byList() — supports partial invalidation', () => {
    const all = queryKeys.statistics.all();
    const byList = queryKeys.statistics.byList('user_1', 'wainwrights');
    expect(byList.slice(0, all.length)).toEqual(all);
  });
});
