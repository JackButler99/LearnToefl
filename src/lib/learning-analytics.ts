import "server-only";
import { db } from "./db";
import type { User } from "./auth";
import { assertRole } from "./access";
import type { PackageSnapshot, SnapshotQuestion } from "./learning-types";
import { settleExpiredForReport } from "./assessments";

export function analytics(user:User,filter:{examId?:string;packageId?:string;classroomId?:string}={}) {
  assertRole(user,"admin","instructor");
  settleExpiredForReport(user);
  const rows=db().prepare(`SELECT a.*,c.name AS classroom_name,t.title AS task_title,u.username FROM assessment_attempts a
    LEFT JOIN assessment_tasks t ON t.id=a.task_id LEFT JOIN classrooms c ON c.id=t.classroom_id
    JOIN users u ON u.id=a.user_id WHERE a.status='finished' AND (?='admin' OR c.owner_id=?)
    AND (?='' OR a.package_id=?) AND (?='' OR c.id=?) ORDER BY a.started_at DESC`)
    .all(user.role,user.id,filter.packageId??"",filter.packageId??"",filter.classroomId??"",filter.classroomId??"") as {id:string;user_id:string;username:string;snapshot_json:string;task_title:string|null;classroom_name:string|null;started_at:number;finished_at:number}[];
  const selected=rows.filter(r=>!filter.examId||(JSON.parse(r.snapshot_json) as PackageSnapshot).examId===filter.examId);
  const items=new Map<string,{question:SnapshotQuestion;examTitle:string;responses:number;correct:number;unanswered:number;choices:number[];timeMs:number;measured:number;users:Set<string>}>();
  const results=selected.map(row=>{
    const snapshot=JSON.parse(row.snapshot_json) as PackageSnapshot;
    const responses=db().prepare("SELECT * FROM assessment_responses WHERE attempt_id=?").all(row.id) as {revision_id:string;selected:number|null;correct:number;points:number;max_points:number;observed_ms:number}[];
    for(const response of responses){
      const question=snapshot.questions.find(q=>q.id===response.revision_id)!;
      const item=items.get(question.id)??{question,examTitle:snapshot.examTitle,responses:0,correct:0,unanswered:0,choices:question.options.map(()=>0),timeMs:0,measured:0,users:new Set<string>()};
      item.responses++;item.correct+=response.correct;item.users.add(row.user_id);
      if(response.selected===null)item.unanswered++;else item.choices[response.selected]++;
      if(response.observed_ms>0){item.measured++;item.timeMs+=response.observed_ms;}
      items.set(question.id,item);
    }
    return {attemptId:row.id,username:row.username,title:snapshot.title,exam:snapshot.examTitle,classroom:row.classroom_name??"Mandiri",task:row.task_title??"—",correct:responses.reduce((n,r)=>n+r.correct,0),total:responses.length,points:responses.reduce((n,r)=>n+r.points,0),maxPoints:responses.reduce((n,r)=>n+r.max_points,0),startedAt:row.started_at,finishedAt:row.finished_at};
  });
  return {attempts:results,participants:new Set(selected.map(r=>r.user_id)).size,items:[...items.values()].map(i=>({revisionId:i.question.id,questionId:i.question.questionId,revision:i.question.revision,prompt:i.question.prompt,skill:i.question.skill,section:i.question.section,exam:i.examTitle,options:i.question.options,answer:i.question.answer,responses:i.responses,participants:i.users.size,correct:i.correct,correctRate:i.correct/i.responses,unanswered:i.unanswered,choices:i.choices,measured:i.measured,meanObservedMs:i.measured?i.timeMs/i.measured:null}))};
}
export function csvCell(value:unknown) {
  let s=String(value??"");if(/^[\s]*[=+\-@]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
}
export function resultsCsv(user:User,filter:Parameters<typeof analytics>[1]={}) {
  const report=analytics(user,filter);
  const rows:unknown[][]=[["Peserta","Kelas","Tugas","Ujian","Paket","Benar","Soal","Poin","Maksimum","Mulai ISO","Selesai ISO"],...report.attempts.map(a=>[a.username,a.classroom,a.task,a.exam,a.title,a.correct,a.total,a.points,a.maxPoints,new Date(a.startedAt).toISOString(),new Date(a.finishedAt).toISOString()])];
  return "\uFEFF"+rows.map(row=>row.map(csvCell).join(",")).join("\r\n");
}
