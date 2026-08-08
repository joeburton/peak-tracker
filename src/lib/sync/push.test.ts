import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pushProgress } from './push';
import type { ILocalProgressRepository } from '@/db/repositories/local-progress-repository';
import type { LocalProgress } from '@/db/schema';

const DIRTY_PROGRESS: LocalProgress = {
  userId: 'user_123',
  completedPeakIds: ['peak-slug-a', 'peak-slug-b'],
  updatedAt: '2026-06-25T10:00:00.000Z',
  version: 3,
  dirty: true,
};

function makeLocalRepo(
  overrides: Partial<ILocalProgressRepository> = {}
): ILocalProgressRepository {
  return {
    get: vi.fn().mockResolvedValue(DIRTY_PROGRESS),
    upsert: vi.fn(),
    markDirty: vi.fn(),
    markClean: vi.fn(),
    ...overrides,
  };
}

function makeSyncActions() {
  return {
    setSyncing: vi.fn(),
    setSyncComplete: vi.fn(),
    setSyncError: vi.fn(),
  };
}

function makeQueryClient() {
  return { invalidateQueries: vi.fn().mockResolvedValue(undefined) } as unknown as import('@tanstack/react-query').QueryClient;
}

const SERVER_RESPONSE = {
  userId: 'user_123',
  completedPeakIds: DIRTY_PROGRESS.completedPeakIds,
  updatedAt: DIRTY_PROGRESS.updatedAt,
  version: DIRTY_PROGRESS.version,
};

function okResponse(body: unknown = SERVER_RESPONSE): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

function errorResponse(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('pushProgress', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when no local record exists', async () => {
    const localRepo = makeLocalRepo({ get: vi.fn().mockResolvedValue(undefined) });
    const syncActions = makeSyncActions();

    await pushProgress('user_123', localRepo, syncActions, makeQueryClient());

    expect(fetch).not.toHaveBeenCalled();
    expect(syncActions.setSyncing).not.toHaveBeenCalled();
  });

  it('does nothing when the local record is not dirty', async () => {
    const localRepo = makeLocalRepo({
      get: vi.fn().mockResolvedValue({ ...DIRTY_PROGRESS, dirty: false }),
    });
    const syncActions = makeSyncActions();

    await pushProgress('user_123', localRepo, syncActions, makeQueryClient());

    expect(fetch).not.toHaveBeenCalled();
    expect(syncActions.setSyncing).not.toHaveBeenCalled();
  });

  it('sets syncing true before the fetch', async () => {
    const localRepo = makeLocalRepo({ markClean: vi.fn() });
    const syncActions = makeSyncActions();

    await pushProgress('user_123', localRepo, syncActions, makeQueryClient());

    expect(syncActions.setSyncing).toHaveBeenCalledWith(true);
  });

  it('sends the correct body to PUT /api/progress', async () => {
    const mockFetch = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', mockFetch);
    const localRepo = makeLocalRepo({ markClean: vi.fn() });

    await pushProgress('user_123', localRepo, makeSyncActions(), makeQueryClient());

    expect(mockFetch).toHaveBeenCalledWith('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completedPeakIds: DIRTY_PROGRESS.completedPeakIds,
        updatedAt: DIRTY_PROGRESS.updatedAt,
        version: DIRTY_PROGRESS.version,
      }),
    });
  });

  it('marks the record clean using the server updatedAt and calls setSyncComplete', async () => {
    const mockMarkClean = vi.fn();
    const localRepo = makeLocalRepo({ markClean: mockMarkClean });
    const syncActions = makeSyncActions();

    await pushProgress('user_123', localRepo, syncActions, makeQueryClient());

    expect(mockMarkClean).toHaveBeenCalledWith('user_123', SERVER_RESPONSE.updatedAt);
    expect(syncActions.setSyncComplete).toHaveBeenCalledWith(SERVER_RESPONSE.updatedAt);
    expect(syncActions.setSyncError).not.toHaveBeenCalled();
  });

  it('invalidates progress and statistics queries on success', async () => {
    const queryClient = makeQueryClient();

    await pushProgress('user_123', makeLocalRepo({ markClean: vi.fn() }), makeSyncActions(), queryClient);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['progress'] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['statistics'] });
  });

  it('does not invalidate queries when push fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(500, { error: 'Server error' })));
    const queryClient = makeQueryClient();

    await pushProgress('user_123', makeLocalRepo(), makeSyncActions(), queryClient);

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it('does not invalidate queries on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));
    const queryClient = makeQueryClient();

    await pushProgress('user_123', makeLocalRepo(), makeSyncActions(), queryClient);

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it('falls back to a client timestamp when server response body is invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse({ invalid: true })));
    const mockMarkClean = vi.fn();
    const localRepo = makeLocalRepo({ markClean: mockMarkClean });
    const syncActions = makeSyncActions();

    await pushProgress('user_123', localRepo, syncActions, makeQueryClient());

    // markClean is still called — sync completes with a client-generated fallback timestamp
    expect(mockMarkClean).toHaveBeenCalledWith('user_123', expect.any(String));
    expect(syncActions.setSyncComplete).toHaveBeenCalledWith(expect.any(String));
  });

  it('does not mark clean and calls setSyncError on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(errorResponse(500, { error: 'Internal Server Error' }))
    );
    const mockMarkClean = vi.fn();
    const localRepo = makeLocalRepo({ markClean: mockMarkClean });
    const syncActions = makeSyncActions();

    await pushProgress('user_123', localRepo, syncActions, makeQueryClient());

    expect(mockMarkClean).not.toHaveBeenCalled();
    expect(syncActions.setSyncError).toHaveBeenCalledWith('Internal Server Error');
    expect(syncActions.setSyncComplete).not.toHaveBeenCalled();
  });

  it('uses a fallback error message when the response body has no error field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errorResponse(409, {})));
    const syncActions = makeSyncActions();

    await pushProgress('user_123', makeLocalRepo(), syncActions, makeQueryClient());

    expect(syncActions.setSyncError).toHaveBeenCalledWith('Push failed with status 409');
  });

  it('calls setSyncError on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));
    const syncActions = makeSyncActions();

    await pushProgress('user_123', makeLocalRepo(), syncActions, makeQueryClient());

    expect(syncActions.setSyncError).toHaveBeenCalledWith('Failed to fetch');
    expect(syncActions.setSyncComplete).not.toHaveBeenCalled();
  });

  it('uses a generic message for non-Error network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('connection refused'));
    const syncActions = makeSyncActions();

    await pushProgress('user_123', makeLocalRepo(), syncActions, makeQueryClient());

    expect(syncActions.setSyncError).toHaveBeenCalledWith('Network error');
  });
});
