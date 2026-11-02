import { NextResponse } from "next/server";
import { authenticate, createSession, destroySession, register } from "@/lib/auth";
import { checkOrigin, error, respondError, readBody, rateLimit } from "@/lib/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const body = await readBody(request);
    if (body.action === "logout") {
      await destroySession();
      return NextResponse.json({ ok: true });
    }
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!/^[a-z0-9_]{3,30}$/.test(username) || password.length < 1 || password.length > 200) return error("Username atau kata sandi tidak valid.");
    rateLimit("auth:global",120,60_000);
    rateLimit("auth:"+username,12,15*60_000);
    if (body.action === "register") {
      if (!/^[a-z0-9_]{3,30}$/.test(username) || password.length < 10 || password.length > 200) {
        return error("Username 3–30 karakter (huruf, angka, _) dan kata sandi minimal 10 karakter.");
      }
      let user;
      try { user = register(username, password); }
      catch (cause) {
        if (cause instanceof Error && cause.message.includes("UNIQUE")) return error("Username sudah dipakai.", 409);
        throw cause;
      }
      await createSession(user.id);
      return NextResponse.json({ user }, { status: 201 });
    }
    if (body.action === "login") {
      const user = authenticate(username, password);
      if (!user) return error("Username atau kata sandi salah.", 401);
      await createSession(user.id);
      return NextResponse.json({ user });
    }
    return error("Aksi tidak dikenal.");
  } catch (cause) { return respondError(cause); }
}
