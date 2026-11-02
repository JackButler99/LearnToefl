import { NextResponse } from "next/server";
import { checkOrigin, requireUser, respondError, HttpError, readBody, rateLimit } from "@/lib/http";
import { createClassroom, joinClassroom, createAssignment, requestInstructor, reviewInstructor } from "@/lib/classrooms";
import { createExperiment, transitionExperiment, expose } from "@/lib/experiments";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await requireUser();
    rateLimit("platform:"+user.id,120,60_000);
    const body = await readBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError("Permintaan tidak valid.",400);
    let id: string | undefined;
    switch(body.action) {
      case "createClass": id=createClassroom(user,String(body.name??"")); break;
      case "joinClass": joinClassroom(user,String(body.code??"")); break;
      case "createAssignment": id=createAssignment(user,body); break;
      case "requestInstructor": requestInstructor(user,String(body.organization??"")); break;
      case "reviewInstructor":
        if (typeof body.approve !== "boolean") throw new HttpError("Keputusan tidak valid.",400);
        reviewInstructor(user,String(body.userId??""),body.approve); break;
      case "createExperiment": id=createExperiment(user,body); break;
      case "transitionExperiment": transitionExperiment(user,String(body.id??""),String(body.transition??"")); break;
      case "exposure": expose(user,String(body.id??"")); break;
      default: throw new HttpError("Aksi tidak dikenal.",400);
    }
    return NextResponse.json({ok:true,id});
  } catch(cause) { return respondError(cause); }
}
