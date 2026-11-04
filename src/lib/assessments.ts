import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { assertRole } from "./access";
import type { User } from "./auth";
import { HttpError } from "./http";
import { audit } from "./experiments";
import { listPackages, transaction, ensureLearningSeed } from "./learning-bank";
import type { PackageSnapshot, PublicAssessment } from "./learning-types";

export type AssessmentRow={id:string;user_id:string;package_id:string;task_id:string|null;status:"active"|"finished";snapshot_json:string;answers_json:string;timing_json:string;section_index:number;deadline:number|null;started_at:number;finished_at:number|null;timing_question_id:string|null;last_tick_at:number|null};
export function createAssessmentTask(user:User,input:Record<string,unknown>) {
  assertRole(user,"instructor");ensureLearningSeed();
  const classId=String(input.classroomId??""),title=String(input.title??"").trim();
  const classroom=db().prepare("SELECT id FROM classrooms WHERE id=? AND owner_id=?").get(classId,user.id);
  if(!classroom)throw new HttpError("Kelas tidak ditemukan.",404);
  const pack=listPackages(user).find(p=>p.id===input.packageId&&p.state==="published");
  if(!pack)throw new HttpError("Paket terbit tidak ditemukan.",404);
  if(title.length<3||title.length>160)throw new HttpError("Judul tugas harus 3–160 karakter.",400);
  const due=input.dueAt?Date.parse(String(input.dueAt)):null;
  if(due!==null&&(!Number.isFinite(due)||due<=Date.now()))throw new HttpError("Tenggat tidak valid.",400);
  const id=randomUUID();db().prepare("INSERT INTO assessment_tasks VALUES(?,?,?,?,?,?)").run(id,classId,pack.id,title,due,Date.now());audit(user.id,"assessment-task.created",id);return id;
}
export function studentTasks(userId:string) {
  return db().prepare(`SELECT t.*,c.name AS classroom_name,p.title AS package_title,a.id AS attempt_id,a.status AS attempt_status
    FROM assessment_tasks t JOIN classrooms c ON c.id=t.classroom_id JOIN assessment_packages p ON p.id=t.package_id
    JOIN enrollments e ON e.classroom_id=t.classroom_id LEFT JOIN assessment_attempts a ON a.task_id=t.id AND a.user_id=e.user_id
    WHERE e.user_id=? ORDER BY t.created_at DESC`).all(userId) as {id:string;title:string;classroom_name:string;package_title:string;due_at:number|null;attempt_id:string|null;attempt_status:string|null}[];
}
export function startAssessment(user:User,input:{packageId?:string;taskId?:string}) {
  assertRole(user,"student");ensureLearningSeed();
  return transaction(()=>{
    let packageId=input.packageId;
    if(input.taskId){
      const task=db().prepare(`SELECT t.* FROM assessment_tasks t JOIN enrollments e ON e.classroom_id=t.classroom_id WHERE t.id=? AND e.user_id=?`).get(input.taskId,user.id) as {package_id:string;due_at:number|null}|undefined;
      if(!task)throw new HttpError("Tugas tidak ditemukan.",404);
      const existing=db().prepare("SELECT id FROM assessment_attempts WHERE user_id=? AND task_id=?").get(user.id,input.taskId) as {id:string}|undefined;
      if(existing)return existing.id;
      if(task.due_at!==null&&task.due_at<Date.now())throw new HttpError("Tenggat tugas sudah lewat.",409);
      packageId=task.package_id;
    }
    const pack=db().prepare("SELECT * FROM assessment_packages WHERE id=? AND state='published'").get(packageId??"") as {snapshot_json:string;visibility:string;id:string;exam_id:string}|undefined;
    if(!pack||(!input.taskId&&pack.visibility!=="public"))throw new HttpError("Paket tidak tersedia.",404);
    const profile=db().prepare("SELECT active FROM exam_profiles WHERE id=?").get(pack.exam_id) as {active:number};
    if(!profile.active)throw new HttpError("Ujian sedang dinonaktifkan.",409);
    const snapshot=JSON.parse(pack.snapshot_json) as PackageSnapshot;
    for(const q of snapshot.questions){const rev=db().prepare("SELECT state FROM question_revisions WHERE id=?").get(q.id) as {state:string}|undefined;if(rev?.state!=="published")throw new HttpError("Materi paket ditarik untuk review. Hubungi pengelola.",409);}
    const id=randomUUID(),now=Date.now(),duration=snapshot.sections[0].durationSeconds;
    db().prepare(`INSERT INTO assessment_attempts(id,user_id,package_id,task_id,status,snapshot_json,started_at,deadline)
      VALUES(?,?,?,?,'active',?,?,?)`).run(id,user.id,pack.id,input.taskId??null,JSON.stringify(snapshot),now,duration?now+duration*1000:null);
    return id;
  });
}
/** Counts only server-observed, recently heartbeated visible intervals, capped at 15 s. */
function flushTiming(row:AssessmentRow,now:number) {
  if(row.timing_question_id&&row.last_tick_at!==null){
    const timing=JSON.parse(row.timing_json) as Record<string,number>;
    const until=row.deadline===null?now:Math.min(now,row.deadline);
    timing[row.timing_question_id]=(timing[row.timing_question_id]??0)+Math.max(0,Math.min(15000,until-row.last_tick_at));
    row.timing_json=JSON.stringify(timing);
  }
  row.last_tick_at=now;
  db().prepare("UPDATE assessment_attempts SET timing_json=?,last_tick_at=? WHERE id=?").run(row.timing_json,now,row.id);
}
function finish(row:AssessmentRow,when:number) {
  flushTiming(row,when);
  const snapshot=JSON.parse(row.snapshot_json) as PackageSnapshot,answers=JSON.parse(row.answers_json) as Record<string,number>,timing=JSON.parse(row.timing_json) as Record<string,number>;
  for(const q of snapshot.questions){
    const selected=answers[q.id]??null;
    db().prepare("INSERT INTO assessment_responses VALUES(?,?,?,?,?,?,?)").run(row.id,q.id,selected,Number(selected===q.answer),selected===null?0:q.scores[selected],Math.max(...q.scores),timing[q.id]??0);
  }
  row.status="finished";row.finished_at=when;row.deadline=null;row.timing_question_id=null;
  db().prepare("UPDATE assessment_attempts SET status='finished',finished_at=?,deadline=NULL,timing_question_id=NULL WHERE id=?").run(when,row.id);
}
function advance(row:AssessmentRow,when:number) {
  const snapshot=JSON.parse(row.snapshot_json) as PackageSnapshot;
  if(row.section_index>=snapshot.sections.length-1){finish(row,when);return;}
  flushTiming(row,when);row.section_index++;
  const duration=snapshot.sections[row.section_index].durationSeconds;
  row.deadline=duration?when+duration*1000:null;row.timing_question_id=null;row.last_tick_at=null;
  db().prepare("UPDATE assessment_attempts SET section_index=?,deadline=?,timing_question_id=NULL,last_tick_at=NULL WHERE id=?").run(row.section_index,row.deadline,row.id);
}
function findAssessment(id:string,userId:string,now:number) {
  const row=db().prepare("SELECT * FROM assessment_attempts WHERE id=? AND user_id=?").get(id,userId) as AssessmentRow|undefined;
  if(!row)throw new HttpError("Sesi tidak ditemukan.",404);
  while(row.status==="active"&&row.deadline!==null&&now>=row.deadline)advance(row,row.deadline);
  return row;
}
export function loadAssessment(id:string,userId:string,now=Date.now()) {return transaction(()=>findAssessment(id,userId,now));}
export function mutateAssessment(id:string,userId:string,input:Record<string,unknown>,now=Date.now()) {
  return transaction(()=>{
    const row=findAssessment(id,userId,now);
    if(row.status!=="active")return row;
    const snapshot=JSON.parse(row.snapshot_json) as PackageSnapshot;
    if(input.action==="advance"){advance(row,now);return row;}
    const q=snapshot.questions.find(q=>q.id===input.questionId&&q.section===snapshot.sections[row.section_index].key);
    if(!q)throw new HttpError("Soal tidak tersedia pada bagian aktif.",400);
    if(input.action==="answer"){
      const choice=input.choice;
      if(choice!==null&&(typeof choice!=="number"||!Number.isInteger(choice)||choice<0||choice>=q.options.length))throw new HttpError("Pilihan jawaban tidak valid.",400);
      const answers=JSON.parse(row.answers_json) as Record<string,number>;
      if(choice===null)delete answers[q.id];else answers[q.id]=choice;
      row.answers_json=JSON.stringify(answers);db().prepare("UPDATE assessment_attempts SET answers_json=? WHERE id=?").run(row.answers_json,row.id);
    } else if(input.action==="view"){
      if(typeof input.visible!=="boolean")throw new HttpError("Status visibilitas tidak valid.",400);
      flushTiming(row,now);row.timing_question_id=input.visible?q.id:null;row.last_tick_at=input.visible?now:null;
      db().prepare("UPDATE assessment_attempts SET timing_question_id=?,last_tick_at=? WHERE id=?").run(row.timing_question_id,row.last_tick_at,row.id);
    } else throw new HttpError("Aksi sesi tidak valid.",400);
    return row;
  });
}
export function publicAssessment(row:AssessmentRow):PublicAssessment {
  const snap=JSON.parse(row.snapshot_json) as PackageSnapshot;
  const available=row.status==="finished"?snap.questions:snap.questions.filter(q=>q.section===snap.sections[row.section_index].key);
  const answers=JSON.parse(row.answers_json) as Record<string,number>;
  const safe:PublicAssessment={id:row.id,title:snap.title,examTitle:snap.examTitle,status:row.status,sections:snap.sections,sectionIndex:row.section_index,deadline:row.deadline,startedAt:row.started_at,finishedAt:row.finished_at,
    answers:Object.fromEntries(available.filter(q=>answers[q.id]!==undefined).map(q=>[q.id,answers[q.id]])),
    questions:available.map(({answer:_,explanation:__,scores:___,...q})=>q)};
  if(row.status==="finished"){
    const responses=db().prepare("SELECT * FROM assessment_responses WHERE attempt_id=?").all(row.id) as {revision_id:string;selected:number|null;points:number;max_points:number;correct:number;observed_ms:number}[];
    safe.result={points:responses.reduce((n,r)=>n+r.points,0),maxPoints:responses.reduce((n,r)=>n+r.max_points,0),correct:responses.reduce((n,r)=>n+r.correct,0),total:snap.questions.length,details:snap.questions.map(q=>{
      const r=responses.find(r=>r.revision_id===q.id)!;return {id:q.id,selected:r.selected,answer:q.answer,explanation:q.explanation,points:r.points,maxPoints:r.max_points,observedMs:r.observed_ms};
    })};
  }
  return safe;
}
export function assessmentHistory(userId:string) {
  const rows=db().prepare("SELECT id FROM assessment_attempts WHERE user_id=? ORDER BY started_at DESC LIMIT 30").all(userId) as {id:string}[];
  return rows.map(r=>{const a=loadAssessment(r.id,userId),s=JSON.parse(a.snapshot_json) as PackageSnapshot;return {id:a.id,title:s.title,examTitle:s.examTitle,status:a.status,startedAt:a.started_at};});
}

export function settleExpiredForReport(user:User,now=Date.now()) {
  assertRole(user,"admin","instructor");
  const rows=db().prepare(`SELECT a.id,a.user_id FROM assessment_attempts a
    LEFT JOIN assessment_tasks t ON t.id=a.task_id LEFT JOIN classrooms c ON c.id=t.classroom_id
    WHERE a.status='active' AND a.deadline IS NOT NULL AND a.deadline<=? AND (?='admin' OR c.owner_id=?)`)
    .all(now,user.role,user.id) as {id:string;user_id:string}[];
  for(const row of rows)loadAssessment(row.id,row.user_id,now);
}
