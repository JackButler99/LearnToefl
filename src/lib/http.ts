import { NextResponse } from "next/server";
import { getUser } from "./auth";
import { db } from "./db";

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

export async function readBody(request: Request): Promise<Record<string,unknown>> {
  if (Number(request.headers.get("content-length")||0)>24_000) throw new HttpError("Permintaan terlalu besar.",413);
  const reader=request.body?.getReader();
  if (!reader) throw new HttpError("Isi permintaan diperlukan.",400);
  const decoder=new TextDecoder();let text="",bytes=0;
  try {for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>24_000){await reader.cancel();throw new HttpError("Permintaan terlalu besar.",413);}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}
  finally{reader.releaseLock();}
  const body=JSON.parse(text);
  if(!body||typeof body!=="object"||Array.isArray(body))throw new HttpError("Format permintaan tidak valid.",400);
  return body;
}
export function rateLimit(key:string,limit:number,windowMs:number,now=Date.now()) {
  db().prepare("DELETE FROM rate_limits WHERE reset_at<=?").run(now);
  const row=db().prepare(`INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?)
    ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count`).get(key,now+windowMs) as {count:number};
  if(row.count>limit)throw new HttpError("Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.",429);
}
