import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { db } from "./db";
import type { User } from "./auth";
import { HttpError } from "./http";
import { samplePerArm, analyzeExperiment, type Arm } from "./statistics";

export type Experiment = {
  id: string; name: string; hypothesis: string; status: "draft" | "running" | "paused" | "ended";
  control_text: string; treatment_text: string; baseline: number; mde: number; required_per_arm: number;
  min_days: number; window_days: number; started_at: number | null; ended_at: number | null; created_at: number;
  stopped_by_plan: number; interrupted: number;
};
export function audit(actor: string, action: string, target: string) {
  db().prepare("INSERT INTO audit_log VALUES (?,?,?,?,?)").run(randomUUID(), actor, action, target, Date.now());
}
export function variantFor(experimentId: string, userId: string): "A" | "B" {
  return createHash("sha256").update(experimentId + ":" + userId).digest().readUInt32BE(0) / 0x100000000 < .5 ? "A" : "B";
}
export function createExperiment(user: User, input: Record<string, unknown>) {
  if (user.role !== "admin") throw new HttpError("Hanya admin.", 403);
  const name = String(input.name ?? "").trim(), hypothesis = String(input.hypothesis ?? "").trim();
  const control = String(input.control ?? "").trim(), treatment = String(input.treatment ?? "").trim();
  const baseline = Number(input.baseline), mde = Number(input.mde), minDays = Number(input.minDays);
  if (!name || name.length > 100 || hypothesis.length < 10 || hypothesis.length > 1000 || !control || !treatment || control.length > 160 || treatment.length > 160 || control === treatment || !Number.isInteger(minDays) || minDays < 7 || minDays > 90) throw new HttpError("Lengkapi rencana dan dua varian berbeda. Durasi 7–90 hari.",400);
  let required: number;
  try { required = samplePerArm(baseline, mde); } catch { throw new HttpError("Baseline dan MDE harus positif, totalnya di bawah 100%.",400); }
  if (required > 500000) throw new HttpError("Target sampel terlalu besar untuk MVP.",400);
  const id = randomUUID();
  db().prepare(`INSERT INTO experiments(id,name,hypothesis,control_text,treatment_text,baseline,mde,required_per_arm,min_days,created_at,created_by)
    VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(id,name,hypothesis,control,treatment,baseline,mde,required,minDays,Date.now(),user.id);
  audit(user.id,"experiment.created",id);
  return id;
}
export function transitionExperiment(user: User, id: string, action: string) {
  if (user.role !== "admin") throw new HttpError("Hanya admin.",403);
  const ex = db().prepare("SELECT * FROM experiments WHERE id=?").get(id) as Experiment | undefined;
  if (!ex) throw new HttpError("Eksperimen tidak ditemukan.",404);
  const allowed: Record<string, string[]> = { start:["draft"], pause:["running"], resume:["paused"], end:["running","paused"] };
  if (!allowed[action]?.includes(ex.status)) throw new HttpError("Transisi eksperimen tidak valid.",409);
  const status = action === "pause" ? "paused" : action === "end" ? "ended" : "running";
  const now = Date.now();
  if (status === "running") {
    const observing = db().prepare(`SELECT 1 FROM experiment_assignments a JOIN experiments e ON e.id=a.experiment_id
      WHERE e.id<>? AND e.surface='practice_prompt' AND a.exposed_at IS NOT NULL
      AND a.exposed_at+e.window_days*86400000>? LIMIT 1`).get(id,now);
    if (observing) throw new HttpError("Tunggu jendela observasi eksperimen sebelumnya selesai agar paparan tidak tumpang tindih.",409);
  }
  try {
    db().prepare("UPDATE experiments SET status=?, started_at=COALESCE(started_at,?), ended_at=?, interrupted=CASE WHEN ?='pause' THEN 1 ELSE interrupted END WHERE id=?")
      .run(status,now,action === "end" ? now : null,action,id);
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes("UNIQUE")) throw new HttpError("Satu eksperimen aktif atau dijeda sudah memakai area ini.",409);
    throw cause;
  }
  audit(user.id,"experiment."+action,id);
}
export function getPrompt(user: User) {
  const fallback = { text: "Mulai latihan singkat, 10 soal hari ini.", experimentId: null as string | null };
  if (user.role !== "student") return fallback;
  closePlannedExperiments();
  const ex = db().prepare("SELECT * FROM experiments WHERE status='running' AND surface='practice_prompt'").get() as Experiment | undefined;
  if (!ex) return fallback;
  const variant = variantFor(ex.id,user.id);
  db().prepare("INSERT OR IGNORE INTO experiment_assignments(experiment_id,user_id,variant,assigned_at) VALUES(?,?,?,?)").run(ex.id,user.id,variant,Date.now());
  return { text:variant === "A" ? ex.control_text : ex.treatment_text, experimentId:ex.id };
}
export function expose(user: User, experimentId: string) {
  if (user.role !== "student") throw new HttpError("Hanya peserta.",403);
  closePlannedExperiments();
  const changed = db().prepare(`UPDATE experiment_assignments SET exposed_at=COALESCE(exposed_at,?)
    WHERE experiment_id=? AND user_id=? AND EXISTS(SELECT 1 FROM experiments WHERE id=? AND status='running')`)
    .run(Date.now(),experimentId,user.id,experimentId);
  if (!changed.changes) throw new HttpError("Paparan tidak tersedia.",409);
  closePlannedExperiments();
}
/** Stop depends only on the predeclared sample and duration, never observed effects. */
function closePlannedExperiments(now = Date.now()) {
  const experiments = db().prepare("SELECT * FROM experiments WHERE status='running'").all() as Experiment[];
  for (const ex of experiments) {
    if (ex.started_at === null || now-ex.started_at < ex.min_days*86_400_000) continue;
    const counts=db().prepare("SELECT variant,COUNT(*) AS n FROM experiment_assignments WHERE experiment_id=? AND exposed_at IS NOT NULL GROUP BY variant").all(ex.id) as {variant:string;n:number}[];
    if (["A","B"].every(v=>(counts.find(c=>c.variant===v)?.n??0)>=ex.required_per_arm)) {
      db().prepare("UPDATE experiments SET status='ended',ended_at=?,stopped_by_plan=1 WHERE id=? AND status='running'").run(now,ex.id);
    }
  }
}
/** Server-owned outcomes: browsers cannot submit conversions. One conversion per user. */
export function recordPracticeEvent(userId: string, event: "start" | "complete", now = Date.now(), attemptStartedAt = now) {
  const field = event === "start" ? "started_at" : "converted_at";
  db().prepare(`UPDATE experiment_assignments SET ${field}=COALESCE(${field},?)
    WHERE user_id=? AND exposed_at IS NOT NULL AND exposed_at<=? AND ?<=exposed_at+604800000`)
    .run(now,userId,attemptStartedAt,now);
}
export function experimentReports() {
  const now = Date.now();
  closePlannedExperiments(now);
  const list = db().prepare("SELECT * FROM experiments ORDER BY created_at DESC").all() as Experiment[];
  return list.map(ex => {
    const rows = db().prepare("SELECT * FROM experiment_assignments WHERE experiment_id=?").all(ex.id) as { variant:"A"|"B"; exposed_at:number|null; started_at:number|null; converted_at:number|null }[];
    const arms: Record<"A"|"B",Arm> = { A:{assigned:0,exposed:0,mature:0,starts:0,conversions:0}, B:{assigned:0,exposed:0,mature:0,starts:0,conversions:0} };
    for (const row of rows) {
      const arm = arms[row.variant]; arm.assigned++;
      if (row.exposed_at === null) continue;
      arm.exposed++;
      if (row.exposed_at+ex.window_days*86_400_000>now) continue;
      arm.mature++;
      if (row.started_at !== null) arm.starts++;
      if (row.converted_at !== null) arm.conversions++;
    }
    return { ...ex, arms, analysis:analyzeExperiment(arms.A,arms.B,ex,now) };
  });
}
