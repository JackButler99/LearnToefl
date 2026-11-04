// Portfolio deployment check: no real database, mail or Google credentials are used.
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import assert from 'node:assert/strict';
const directory=mkdtempSync(join(tmpdir(),'itp-portfolio-demo-')),probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
const base=`http://127.0.0.1:${port}`,env={...process.env,PORTFOLIO_DEMO:'1',VERCEL:'1',DATABASE_URL:'postgresql://unused:unused@127.0.0.1:1/forbidden',MIGRATION_DATABASE_URL:'',APP_ORIGIN:'',AUTH_SECRET:'',CRON_SECRET:'',RESEND_API_KEY:'',AUTH_EMAIL_FROM:'',GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:'',DATA_DIR:directory,NEXT_TELEMETRY_DISABLED:'1'};
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(port)],{env,stdio:['ignore','pipe','pipe']});let logs='';for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>logs=(logs+chunk).slice(-12000));
try{
 let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base+'/demo')).ok){ready=true;break;}}catch{}await delay(250);}assert.ok(ready,'Demo did not start: '+logs);
 for(const path of ['/','/demo','/demo?role=student','/demo?role=instructor&view=classes','/demo?role=admin&view=bank','/demo?role=admin&view=experiments']){
  const response=await fetch(base+path);assert.equal(response.status,200,path);assert.equal(response.headers.get('set-cookie'),null);
  const html=await response.text();assert.ok(html.includes('Portfolio demo'),path);assert.ok(!html.includes('Application error'),path);assert.ok(html.includes('<html lang="en"'),path);assert.ok(html.includes('aria-label="Language"'),path);assert.ok(html.includes('Bahasa Indonesia'),path);
  if(path.includes('view=bank'))assert.ok(html.includes('A question bank with structure'));
  if(path.includes('view=experiments'))assert.ok(html.includes('Test ideas with clear measures'));
  if(path.includes('view=classes'))assert.ok(html.includes('Understand every learner'));
 }
 for(const path of ['/login','/admin','/dashboard','/account','/manage/questions','/result/fake']){
  const response=await fetch(base+path,{redirect:'manual'});assert.equal(response.status,307,path);assert.equal(new URL(response.headers.get('location')).pathname,'/demo');
 }
 for(const path of ['/api/auth','/api/auth/google','/api/auth/google/callback?code=fake','/api/auth/mail-jobs','/api/learning','/api/platform','/api/attempts','/api/assessments']){
  for(const method of ['GET','POST']){const response=await fetch(base+path,{method,redirect:'manual',headers:{'content-type':'application/json',origin:base},...(method==='POST'?{body:JSON.stringify({action:'register',role:'admin'})}:{})});assert.equal(response.status,403,path);assert.equal(response.headers.get('set-cookie'),null);}
 }
 assert.deepEqual(readdirSync(directory),[],'Demo must not create a local SQLite database.');
 const font=await fetch(base+'/demo/fonts/manrope-variable.ttf');assert.equal(font.status,200);assert.ok((await font.arrayBuffer()).byteLength>100000,'Self-hosted font must be served as a font asset, not a redirect to HTML.');
 console.log('Portfolio demo HTTP passed: role views, root without services, protected route redirects, blocked APIs, no sessions, and no SQLite file. Invalid PostgreSQL credentials were deliberately supplied to detect accidental database access.');
}finally{child.kill('SIGTERM');await new Promise(r=>child.exitCode!==null?r():child.once('exit',r));rmSync(directory,{recursive:true,force:true});}
