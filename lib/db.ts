// lib/db.ts
import mongoose, { Mongoose } from "mongoose";

/**
 * Make the cached connection available on Node's global to avoid
 * multiple connections during hot reloads / edge invocations.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | undefined;
}

// Read env and assert non-null for TS
const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI || MONGODB_URI.length === 0) {
  throw new Error("MONGODB_URI is not set in environment variables.");
}

// Reuse cached object across hot-reloads in Next.js dev
const cached = global._mongoose ?? { conn: null as Mongoose | null, promise: null as Promise<Mongoose> | null };
global._mongoose = cached;

// Optional: logs only in dev
const log = (...args: any[]) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[db]", ...args);
  }
};

export default async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    log("Connecting to MongoDB…");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 20000,
      })
      .then((m) => {
        log("MongoDB connected");
        return m;
      })
      .catch((err) => {
        // Reset so future calls can retry
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
