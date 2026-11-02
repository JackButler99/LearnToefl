// End-to-end HTTP check against a fresh, temporary local database only.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const directory=mkdtempSync(join(tmpdir(),'itp-http-smoke-'));
const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));
const port=probe.address().port;await new Promise(r=>probe.close(r));
const base=`http://127.0.0.1:${port}`,env={...process.env,DATA_DIR:directory,NEXT_TELEMETRY_DISABLED:'1'};
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(port)],{env,stdio:['ignore','pipe','pipe']});
let logs='';for(const stream of [server.stdout,server.stderr])stream.on('data',chunk=>{logs=(logs+String(chunk)).slice(-12000);});
let connection;
async function post(path,body,cookie='') {
  const response=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',origin:base,...(cookie?{cookie}:{})},body:JSON.stringify(body)});
  return {status:response.status,data:await response.json(),cookie:response.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ')};
}
async function account(username) {
  const result=await post('/api/auth',{action:'register',username,password:'local-smoke-password-123',role:'admin'});
  assert.equal(result.status,201);assert.equal(result.data.user.role,'student');return result;
}
try {
  let ready=false;
  for(let i=0;i<80;i++){try{if((await fetch(base+'/login')).ok){ready=true;break;}}catch{}await delay(250);}
  assert.ok(ready,'Production server did not become ready');
  assert.equal((await fetch(base+'/admin',{redirect:'manual'})).status,307);
  const admin=await account('smoke_admin'),teacher=await account('smoke_teacher'),student=await account('smoke_student'),outsider=await account('smoke_outsider');
  const operator=spawnSync(process.execPath,['--conditions=react-server','--import=tsx','scripts/grant-role.mjs','smoke_admin','admin'],{env,encoding:'utf8'});
  assert.equal(operator.status,0,operator.stderr);
  assert.equal((await post('/api/platform',{action:'createClass',name:'Denied class'},student.cookie)).status,403);
  assert.equal((await post('/api/platform',{action:'requestInstructor',organization:'Pilot School'},teacher.cookie)).status,200);
  assert.equal((await post('/api/platform',{action:'reviewInstructor',userId:teacher.data.user.id,approve:true},student.cookie)).status,403);
  assert.equal((await post('/api/platform',{action:'reviewInstructor',userId:teacher.data.user.id,approve:true},admin.cookie)).status,200);
  const classroom=await post('/api/platform',{action:'createClass',name:'HTTP Pilot'},teacher.cookie);assert.equal(classroom.status,200);
  connection=new DatabaseSync(join(directory,'app.sqlite'));
  const code=connection.prepare('SELECT join_code FROM classrooms WHERE id=?').get(classroom.data.id).join_code;
  assert.equal((await post('/api/platform',{action:'joinClass',code},student.cookie)).status,200);
  const assignment=await post('/api/platform',{action:'createAssignment',classroomId:classroom.data.id,title:'HTTP Structure',section:'structure'},teacher.cookie);assert.equal(assignment.status,200);
  assert.equal((await post('/api/attempts',{assignmentId:assignment.data.id},outsider.cookie)).status,404);
  const attempt=await post('/api/attempts',{assignmentId:assignment.data.id},student.cookie);assert.equal(attempt.status,201);
  assert.equal((await fetch(base+`/api/attempts/${attempt.data.id}`,{headers:{cookie:outsider.cookie}})).status,404);
  const questions=await (await fetch(base+`/api/attempts/${attempt.data.id}`,{headers:{cookie:student.cookie}})).json();
  assert.ok(questions.questions.every(q=>!('answer' in q)&&!('explanation' in q)));
  for(const q of questions.questions){const r=await fetch(base+`/api/attempts/${attempt.data.id}`,{method:'PATCH',headers:{cookie:student.cookie,origin:base,'Content-Type':'application/json'},body:JSON.stringify({questionId:q.id,choice:0})});assert.equal(r.status,200);}
  assert.equal((await post(`/api/attempts/${attempt.data.id}`,{},student.cookie)).data.status,'finished');
  const experiment=await post('/api/platform',{action:'createExperiment',name:'HTTP experiment',hypothesis:'Benefit wording increases completion',control:'Practice today',treatment:'Learn your mistakes',baseline:.2,mde:.1,minDays:7},admin.cookie);assert.equal(experiment.status,200);
  assert.equal((await post('/api/platform',{action:'transitionExperiment',id:experiment.data.id,transition:'start'},admin.cookie)).status,200);
  const html=await (await fetch(base+'/dashboard',{headers:{cookie:student.cookie}})).text();assert.ok(html.includes('HTTP Structure'));
  assert.equal((await post('/api/platform',{action:'exposure',id:experiment.data.id},student.cookie)).status,200);
  assert.equal((await fetch(base+`/api/admin/experiments/${experiment.data.id}/export`,{headers:{cookie:student.cookie}})).status,403);
  const csv=await fetch(base+`/api/admin/experiments/${experiment.data.id}/export`,{headers:{cookie:admin.cookie}});assert.equal(csv.status,200);assert.ok((await csv.text()).startsWith('variant,assigned'));
  for(const [path,cookie,content] of [['/admin',admin.cookie,'Pantau produk'],['/admin/experiments',admin.cookie,'HTTP experiment'],['/instructor',teacher.cookie,'HTTP Pilot']]){
    const response=await fetch(base+path,{headers:{cookie}});assert.equal(response.status,200);assert.ok((await response.text()).includes(content));
  }
  console.log('HTTP smoke passed: auth, role escalation denial, class isolation, assignment completion, three dashboards, experiment exposure, protected CSV.');
} catch(error) {console.error(logs);throw error;}
finally {connection?.close();server.kill('SIGTERM');await new Promise(r=>server.exitCode!==null?r():server.once('exit',r));rmSync(directory,{recursive:true,force:true});}
