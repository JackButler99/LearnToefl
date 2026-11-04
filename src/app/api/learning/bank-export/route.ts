import { requireUser, readBody, rateLimit, respondError, HttpError } from "@/lib/http";
import { assertRole } from "@/lib/access";
import { checkLearningRequest, checkJsonDepth } from "@/lib/learning-security";
import { exportBankAudit } from "@/lib/bank-export";
import { audit } from "@/lib/experiments";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkLearningRequest(request);
    const user = await requireUser();
    assertRole(user, "admin");
    rateLimit("bank-export:" + user.id, 3, 60_000);
    const body = await readBody(request, 1024, { timeoutMs: 10_000, strictUtf8: true, beforeParse: checkJsonDepth });
    if (Object.keys(body).length !== 1 || body.scope !== "all") throw new HttpError("Ekspor hanya menerima scope all.", 400);
    const result = exportBankAudit(user);
    audit(user.id, "questions.export", `latest:${result.count}`);
    return new Response(result.json, { headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bank-soal-audit.json"',
      "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff",
      "X-Question-Count": String(result.count),
    } });
  } catch (error) { return respondError(error); }
}
