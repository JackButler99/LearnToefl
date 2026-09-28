import "server-only";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE = "itp_session";
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
export type User = { id: string; username: string };
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db().prepare(`SELECT users.id, users.username FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?`).get(digest(token), Date.now()) as User | undefined;
  return row || null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  db().prepare("INSERT INTO sessions(token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(digest(token), userId, Date.now() + TWO_WEEKS);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: TWO_WEEKS / 1000,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(digest(token));
  store.delete(COOKIE);
}

export function register(username: string, password: string): User {
  const salt = randomBytes(16).toString("hex");
  const user = { id: randomUUID(), username };
  const hash = scryptSync(password, salt, 64).toString("hex");
  db().prepare("INSERT INTO users(id, username, salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(user.id, user.username, salt, hash, Date.now());
  return user;
}

export function authenticate(username: string, password: string): User | null {
  const row = db().prepare("SELECT id, username, salt, password_hash FROM users WHERE username = ?")
    .get(username) as (User & { salt: string; password_hash: string }) | undefined;
  // Perform the same expensive operation even if the account does not exist.
  const candidate = scryptSync(password, row?.salt || "0".repeat(32), 64);
  const expected = Buffer.from(row?.password_hash || "0".repeat(128), "hex");
  if (!row || !timingSafeEqual(candidate, expected)) return null;
  return { id: row.id, username: row.username };
}
