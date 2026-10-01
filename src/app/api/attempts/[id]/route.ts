import { NextResponse } from "next/server";
import { advanceAttempt, loadAttempt, saveAnswer, serializeAttempt } from "@/lib/attempts";
import { checkOrigin, error, requireUser, respondError } from "@/lib/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const user = await requireUser();
    const row = await loadAttempt((await context.params).id, user.id);
    if (!row) return error("Sesi tidak ditemukan.", 404);
    return NextResponse.json(serializeAttempt(row), { headers: { "Cache-Control": "no-store" } });
  } catch (cause) { return respondError(cause); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const user = await requireUser();
    const row = await loadAttempt((await context.params).id, user.id);
    if (!row) return error("Sesi tidak ditemukan.", 404);
    const body = await request.json() as { questionId?: string; choice?: number | null };
    if (typeof body.questionId !== "string" || (body.choice !== null && typeof body.choice !== "number")) return error("Jawaban tidak valid.");
    await saveAnswer(row, body.questionId, body.choice ?? null);
    return NextResponse.json({ ok: true, deadline: row.deadline });
  } catch (cause) { return respondError(cause); }
}
export async function POST(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const user = await requireUser();
    const row = await loadAttempt((await context.params).id, user.id);
    if (!row) return error("Sesi tidak ditemukan.", 404);
    await advanceAttempt(row);
    return NextResponse.json(serializeAttempt(row));
  } catch (cause) { return respondError(cause); }
}
