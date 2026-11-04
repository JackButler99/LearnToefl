import { NextResponse } from "next/server";
import { checkOrigin,requireUser,readBody,rateLimit,respondError } from "@/lib/http";
import { loadAssessment,publicAssessment,mutateAssessment } from "@/lib/assessments";
export const runtime="nodejs";
type Context={params:Promise<{id:string}>};
export async function GET(_request:Request,context:Context){
  try{const user=await requireUser();return NextResponse.json(publicAssessment(loadAssessment((await context.params).id,user.id)),{headers:{"Cache-Control":"no-store"}});}catch(error){return respondError(error);}
}
export async function POST(request:Request,context:Context){
  try{
    checkOrigin(request);const user=await requireUser();rateLimit("assessment-actions:"+user.id,180,60_000);
    const body=await readBody(request);const row=mutateAssessment((await context.params).id,user.id,body);
    return NextResponse.json(publicAssessment(row),{headers:{"Cache-Control":"no-store"}});
  }catch(error){return respondError(error);}
}
