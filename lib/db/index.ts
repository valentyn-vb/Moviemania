import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — add it to .env.local (see .env.example).");
  }
  return url;
}

// postgres.js is lazy (it doesn't open a socket until the first query), so
// constructing the client at import time is safe during build/prerender.
// Reuse it across dev HMR reloads so we don't exhaust connections.
const globalForDb = globalThis as unknown as {
  __moviemaniaPg?: ReturnType<typeof postgres>;
};

const client = globalForDb.__moviemaniaPg ?? postgres(connectionString());
if (process.env.NODE_ENV !== "production") {
  globalForDb.__moviemaniaPg = client;
}

export const db = drizzle(client, { schema });
