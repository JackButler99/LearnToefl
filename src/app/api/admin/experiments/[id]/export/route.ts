import { requireUser, respondError, HttpError } from "@/lib/http";
import { assertRole } from "@/lib/access";
import { experimentReports } from "@/lib/experiments";

export const runtime="nodejs";
export async function GET(_request:Request,context:{params:Promise<{id:string}>}) {
  try {
    const user=await requireUser();assertRole(user,"admin");
    const {id}=await context.params, ex=experimentReports().find(e=>e.id===id);
    if(!ex)throw new HttpError("Eksperimen tidak ditemukan.",404);
    const rows=["variant,assigned,exposed,mature,started,completed,completion_rate",...(["A","B"] as const).map(v=>{const a=ex.arms[v];return [v,a.assigned,a.exposed,a.mature,a.starts,a.conversions,a.mature?a.conversions/a.mature:""].join(",");})];
    return new Response(rows.join("\r\n"),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="experiment-${ex.id}.csv"`,"Cache-Control":"no-store"}});
  } catch(cause) {return respondError(cause);}
}
