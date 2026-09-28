import { NextResponse } from "next/server";
import { createAttempt } from "@/lib/attempts";
import { checkOrigin, error, requireUser, respondError } from "@/lib/http";
import { type Section } from "@/lib/questions";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await requireUser();
    const body = await request.json() as { mode?: string; section?: string };
    if (body.mode !== "full" && body.mode !== "practice") return error("Mode tidak valid.");
    if (body.mode === "practice" && !["listening", "structure", "reading"].includes(body.section || "")) return error("Bagian tidak valid.");
    const id = createAttempt(user.id, body.mode, body.section as Section | undefined);
    return NextResponse.json({ id }, { status: 201 });
  } catch (cause) { return respondError(cause); }
}
