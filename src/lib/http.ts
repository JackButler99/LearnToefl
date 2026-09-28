import { NextResponse } from "next/server";
import { getUser } from "./auth";

export const error = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
export async function requireUser() {
  const user = await getUser();
  if (!user) throw new HttpError("Silakan masuk terlebih dahulu.", 401);
  return user;
}
export class HttpError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export function respondError(cause: unknown) {
  if (cause instanceof HttpError) return error(cause.message, cause.status);
  if (cause instanceof SyntaxError) return error("Format permintaan tidak valid.");
  if (cause instanceof Error && /^(Invalid|This question|Attempt)/.test(cause.message)) return error(cause.message);
  console.error(cause);
  return error("Terjadi kesalahan di server.", 500);
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    throw new HttpError("Asal permintaan tidak diizinkan.", 403);
  }
}
