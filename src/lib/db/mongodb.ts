import { MongoClient, type Db } from 'mongodb'

const DB_NAME = 'peakTracker'

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

// Module-level cache for production (one per module lifetime)
let _clientPromise: Promise<MongoClient> | undefined

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable is not defined')

  const promise = new MongoClient(uri, { maxPoolSize: 1 }).connect()

  // Clear on failure so the next getDb() call retries rather than
  // awaiting a permanently rejected promise.
  promise.catch(() => {
    if (process.env.NODE_ENV === 'development') {
      global._mongoClientPromise = undefined
    } else {
      _clientPromise = undefined
    }
  })

  return promise
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    return (global._mongoClientPromise ??= createClientPromise())
  }
  return (_clientPromise ??= createClientPromise())
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db(DB_NAME)
}

// For seed scripts and CLI tools — closes the connection and clears the cache.
export async function disconnect(): Promise<void> {
  const promise =
    process.env.NODE_ENV === 'development' ? global._mongoClientPromise : _clientPromise
  if (!promise) return
  try {
    const client = await promise
    await client.close()
  } finally {
    if (process.env.NODE_ENV === 'development') {
      global._mongoClientPromise = undefined
    } else {
      _clientPromise = undefined
    }
  }
}
