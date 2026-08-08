import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockDb = vi.fn();
const mockConnect = vi.fn();
const mockClose = vi.fn();

vi.mock('mongodb', () => ({
  MongoClient: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    db: mockDb,
    close: mockClose,
  })),
}));

beforeEach(() => {
  mockConnect.mockReset();
  mockDb.mockReset();
  mockClose.mockReset();
  vi.resetModules();
  global._mongoClientPromise = undefined;
});

afterEach(() => {
  delete process.env.MONGODB_URI;
  vi.unstubAllEnvs();
});

describe('getDb', () => {
  it('throws when MONGODB_URI is not defined', async () => {
    delete process.env.MONGODB_URI;
    const { getDb } = await import('./mongodb');

    await expect(getDb()).rejects.toThrow('MONGODB_URI environment variable is not defined');
  });

  it('returns a Db scoped to the peakTracker database', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    const mockDbInstance = { name: 'peakTracker' };
    mockConnect.mockResolvedValue({ db: mockDb, close: mockClose });
    mockDb.mockReturnValue(mockDbInstance);

    const { getDb } = await import('./mongodb');
    const db = await getDb();

    expect(mockDb).toHaveBeenCalledWith('peakTracker');
    expect(db).toBe(mockDbInstance);
  });

  it('reuses the same connection across multiple calls', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    mockConnect.mockResolvedValue({ db: mockDb, close: mockClose });
    mockDb.mockReturnValue({});

    const { getDb } = await import('./mongodb');
    await getDb();
    await getDb();

    // connect() called once — client promise is reused, not re-created
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('clears the cached promise on failure so the next call retries', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    mockConnect
      .mockRejectedValueOnce(new Error('Connection refused'))
      .mockResolvedValue({ db: mockDb, close: mockClose });
    mockDb.mockReturnValue({});

    const { getDb } = await import('./mongodb');

    await expect(getDb()).rejects.toThrow('Connection refused');
    const db = await getDb();

    expect(mockConnect).toHaveBeenCalledTimes(2);
    expect(db).toBeDefined();
  });
});

describe('disconnect', () => {
  it('closes the client and clears the cached promise', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    const mockClient = { db: mockDb, close: mockClose };
    mockConnect.mockResolvedValue(mockClient);
    mockClose.mockResolvedValue(undefined);
    mockDb.mockReturnValue({});

    const { getDb, disconnect } = await import('./mongodb');
    await getDb();
    await disconnect();

    expect(mockClose).toHaveBeenCalledTimes(1);

    // After disconnect, a new connection is opened on next getDb()
    await getDb();
    expect(mockConnect).toHaveBeenCalledTimes(2);
  });

  it('is a no-op when no connection has been established', async () => {
    const { disconnect } = await import('./mongodb');

    await expect(disconnect()).resolves.toBeUndefined();
    expect(mockClose).not.toHaveBeenCalled();
  });
});

describe('in development mode', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
  });

  it('caches the connection on globalThis and reuses it across module reloads', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    mockConnect.mockResolvedValue({ db: mockDb, close: mockClose });
    mockDb.mockReturnValue({});

    const { getDb } = await import('./mongodb');
    await getDb();
    await getDb();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(global._mongoClientPromise).toBeDefined();
  });

  it('clears the global cache on connection failure so the next call retries', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    mockConnect
      .mockRejectedValueOnce(new Error('Connection refused'))
      .mockResolvedValue({ db: mockDb, close: mockClose });
    mockDb.mockReturnValue({});

    const { getDb } = await import('./mongodb');

    await expect(getDb()).rejects.toThrow('Connection refused');
    await getDb();

    expect(mockConnect).toHaveBeenCalledTimes(2);
  });

  it('disconnect closes the client and clears the global cache', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    mockConnect.mockResolvedValue({ db: mockDb, close: mockClose });
    mockClose.mockResolvedValue(undefined);
    mockDb.mockReturnValue({});

    const { getDb, disconnect } = await import('./mongodb');
    await getDb();
    await disconnect();

    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(global._mongoClientPromise).toBeUndefined();

    await getDb();
    expect(mockConnect).toHaveBeenCalledTimes(2);
  });
});
