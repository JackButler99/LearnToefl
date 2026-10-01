import "server-only";
import { neon } from "@neondatabase/serverless";

type Sql = ReturnType<typeof neon>;

let client: Sql | undefined;
let schemaPromise: Promise<void> | undefined;

export function db(): Sql {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }
  client ??= neon(connectionString);
  return client;
}

async function initializeSchema() {
  const sql = db();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DOUBLE PRECISION NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at DOUBLE PRECISION NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mode TEXT NOT NULL CHECK (mode IN ('full', 'practice')),
      section TEXT,
      status TEXT NOT NULL CHECK (status IN ('active', 'finished')),
      section_index INTEGER NOT NULL,
      started_at DOUBLE PRECISION NOT NULL,
      deadline DOUBLE PRECISION,
      finished_at DOUBLE PRECISION,
      answers TEXT NOT NULL DEFAULT '{}'
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS attempts_user_idx
    ON attempts(user_id, started_at DESC)
  `;
}

export async function ensureSchema() {
  schemaPromise ??= initializeSchema().catch((cause) => {
    schemaPromise = undefined;
    throw cause;
  });
  await schemaPromise;
}
