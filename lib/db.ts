import mongoose from "mongoose";

/**
 * Next.js hot-reloads modules in development, which would open a new pool on
 * every reload and eventually exhaust MongoDB connections. Caching the promise
 * on `globalThis` keeps exactly one connection per process.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose._mongooseCache ?? {
  conn: null,
  promise: null,
};
globalForMongoose._mongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and add your connection string.",
    );
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        // Fail fast instead of hanging a request for 30s when the DB is down.
        serverSelectionTimeoutMS: 8000,
      })
      .catch((error) => {
        // Clear the cached promise so the next request can retry the connection.
        cache.promise = null;
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
