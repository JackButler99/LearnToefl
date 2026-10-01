import "server-only";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db, ensureSchema } from "./db";

const COOKIE = "itp_session";
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

export type User = { id: string; username: string };

export class UsernameTakenError extends Error {
  constructor() {
    super("Username is already registered.");
  }
}

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

function isUniqueViolation(cause: unknown) {
  return typeof cause === "object" && cause !== null && "code" in cause && cause.code === "23505";
}

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  await ensureSchema();
  const [row] = await db()`
    SELECT users.id, users.username
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ${digest(token)}
      AND sessions.expires_at > ${Date.now()}
  ` as User[];
  return row || null;
}

export async function createSession(userId: string) {
  await ensureSchema();
  const token = randomBytes(32).toString("hex");
  await db()`
    INSERT INTO sessions(token_hash, user_id, expires_at)
    VALUES (${digest(token)}, ${userId}, ${Date.now() + TWO_WEEKS})
  `;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TWO_WEEKS / 1000,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    await ensureSchema();
    await db()`DELETE FROM sessions WHERE token_hash = ${digest(token)}`;
  }
  store.delete(COOKIE);
}

export async function register(username: string, password: string): Promise<User> {
  await ensureSchema();
  const salt = randomBytes(16).toString("hex");
  const user = { id: randomUUID(), username };
  const hash = scryptSync(password, salt, 64).toString("hex");
  try {
    await db()`
      INSERT INTO users(id, username, salt, password_hash, created_at)
      VALUES (${user.id}, ${user.username}, ${salt}, ${hash}, ${Date.now()})
    `;
  } catch (cause) {
    if (isUniqueViolation(cause)) throw new UsernameTakenError();
    throw cause;
  }
  return user;
}

export async function authenticate(username: string, password: string): Promise<User | null> {
  await ensureSchema();
  const [row] = await db()`
    SELECT id, username, salt, password_hash
    FROM users
    WHERE username = ${username}
  ` as (User & { salt: string; password_hash: string })[];
  // Perform the same expensive operation even if the account does not exist.
  const candidate = scryptSync(password, row?.salt || "0".repeat(32), 64);
  const expected = Buffer.from(row?.password_hash || "0".repeat(128), "hex");
  if (!row || !timingSafeEqual(candidate, expected)) return null;
  return { id: row.id, username: row.username };
}
