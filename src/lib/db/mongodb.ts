import { MongoClient, type Db } from 'mongodb'

const DB_NAME = 'peakTracker'

declare global {
  // Preserved across hot-reloads in development; undefined in production.
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable is not defined')
  return new MongoClient(uri).connect()
}

const clientPromise: Promise<MongoClient> =
  process.env.NODE_ENV === 'development'
    ? (global._mongoClientPromise ??= createClientPromise())
    : createClientPromise()

export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db(DB_NAME)
}

export default clientPromise
