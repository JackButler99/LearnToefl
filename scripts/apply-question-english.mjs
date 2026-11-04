// Copy to LearnToefl/scripts. Local admin operation; dry-run unless --apply.
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
const [username,filename,...flags]=process.argv.slice(2);
if(!username||!filename||flags.some(f=>f!=='--apply')){console.error('Usage: node --conditions=react-server --import=tsx scripts/apply-question-english.mjs USER PLAN.json [--apply]');process.exit(1);}
const {db}=(m=>m.default??m)(await import('../src/lib/db.ts'));
const api=(m=>m.default??m)(await import('../src/lib/learning-bank.ts'));
const {audit}=(m=>m.default??m)(await import('../src/lib/experiments.ts'));
const fields=['kind','stimulus','prompt','options','answer','explanation','skill','scores'];
const same=(a,b)=>fields.every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]));
let connection;
try{
 const plan=JSON.parse(readFileSync(filename,'utf8'));
 if(plan.format!=='learn-toefl.question-language-update'||plan.schemaVersion!==1||!Array.isArray(plan.updates)||plan.updates.length!==plan.updateCount||plan.updates.length>100||new Set(plan.updates.map(u=>u.questionId)).size!==plan.updates.length)throw Error('Invalid update manifest');
 connection=db();const user=connection.prepare('SELECT id,username,role FROM users WHERE username=?').get(username);
 if(!user||user.role!=='admin')throw Error('Existing admin account required');
 function inspect(){
  const bank=new Map(api.listBank(user).map(q=>[q.questionId,q]));
  return plan.updates.map(u=>{
   const q=bank.get(u.questionId);
   if(!q||q.examId!==u.examId||q.section!==u.section)return {u,status:'BLOCKED',reason:'Question/exam/section not found or changed'};
   if(same(q.content,u.after))return {u,q,status:'SKIP',reason:'English content already present'};
   if(q.id!==u.expectedRevisionId||q.revision!==u.expectedRevision||!same(q.content,u.before))return {u,q,status:'BLOCKED',reason:'Revision/content changed; export again instead of overwriting'};
   // The manifest is a proposal, not permission to change keys, sentences or scoring.
   if(u.after.answer!==u.before.answer||JSON.stringify(u.after.scores)!==JSON.stringify(u.before.scores)||u.after.explanation!==u.before.explanation||u.after.kind!==u.before.kind||u.after.skill!==u.before.skill||u.after.prompt!=='Which marked word or phrase must be changed for the sentence to be grammatically correct?'||u.before.prompt!=='Bagian mana yang perlu diperbaiki agar kalimat sesuai tata bahasa Inggris baku?')throw Error('Update scope mismatch');
   const prefix='Kalimat sumber; empat bagian bergaris bawah ditampilkan dengan penanda A–D:';
   if(!u.before.stimulus.startsWith(prefix+'\n\n')||u.after.stimulus!=='The four marked words or phrases are labelled A–D:'+u.before.stimulus.slice(prefix.length))throw Error('Sentence/instruction mismatch');
   if(u.before.options.length!==4||u.after.options.length!==4||u.before.options.some((v,i)=>!v.startsWith(`Bagian ${'ABCD'[i]} — `)||u.after.options[i]!==`Part ${'ABCD'[i]} — `+v.slice(`Bagian ${'ABCD'[i]} — `.length)))throw Error('Option mapping mismatch');
   return {u,q,status:'READY',reason:'Create a new draft revision'};
  });
 }
 const results=inspect();for(const r of results)console.log(`${r.status} ${r.u.questionId}: ${r.reason}`);
 if(!flags.includes('--apply'))console.log('Dry-run only. No question revisions changed.');
 else{
  if(results.some(r=>r.status==='BLOCKED'))throw Error('Preflight blocked; nothing changed. Upload a fresh bank export for reconciliation.');
  api.transaction(()=>{
   const fresh=inspect();if(fresh.some(r=>r.status==='BLOCKED'))throw Error('Bank changed; nothing updated');
   let created=0,skipped=0;
   for(const r of fresh){if(r.status==='SKIP'){skipped++;continue;}
    const content=Object.fromEntries(fields.map(k=>[k,r.u.after[k]]));
    const id=randomUUID();
    connection.prepare("UPDATE question_revisions SET state='retired' WHERE question_id=? AND state IN ('draft','review')").run(r.u.questionId);
    connection.prepare("INSERT INTO question_revisions(id,question_id,revision,exam_id,section_key,content_json,state,created_at) VALUES(?,?,?,?,?,?,'draft',?)").run(id,r.u.questionId,r.q.revision+1,r.u.examId,r.u.section,JSON.stringify(content),Date.now());
    audit(user.id,'question.draft',id);created++;
   }
   console.log(`Created ${created} new draft revisions; skipped ${skipped}; no new questions, no publication.`);
  });
 }
}catch(error){console.error(error instanceof Error?error.message:'Operation failed');process.exitCode=1;}
finally{connection?.close();}
