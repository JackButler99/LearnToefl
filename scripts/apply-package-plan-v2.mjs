// Access-compatible package installer. Dry-run by default; new packages remain private drafts.
// Existing public/private packages are skipped only when title, ordered revisions and durations match.
import { readFileSync } from 'node:fs';
const [username,filename,...flags]=process.argv.slice(2);
if(!username||!filename||flags.some(f=>f!=='--apply'&&!f.startsWith('--plans='))){console.error('Usage: node --conditions=react-server --import=tsx scripts/apply-package-plan-v2.mjs USER PLAN.json [--plans=P01,P02] [--apply]');process.exit(1);}
const {db}=(m=>m.default??m)(await import('../src/lib/db.ts'));
const api=(m=>m.default??m)(await import('../src/lib/learning-bank.ts'));
let connection;
try{
 const manifest=JSON.parse(readFileSync(filename,'utf8'));
 if(manifest.format!=='learn-toefl.package-plan'||manifest.schemaVersion!==1||!Array.isArray(manifest.packages))throw Error('Invalid package plan');
 connection=db();const user=connection.prepare('SELECT id,username,role FROM users WHERE username=?').get(username);
 if(!user||user.role!=='admin')throw Error('Existing admin account required');
 const requested=flags.find(f=>f.startsWith('--plans='))?.slice(8).split(',');
 if(requested?.some(id=>!manifest.packages.some(p=>p.planId===id)))throw Error('Unknown plan ID');
 const plans=manifest.packages.filter(p=>requested?requested.includes(p.planId):p.mode==='practice');
 if(!plans.length||plans.some(p=>p.mode!=='practice'))throw Error('Only practice plans are enabled. Timed/full simulation plans remain blocked pending system/content review.');
 const held=new Set(Object.keys(manifest.heldQuestionIds??{}));
 function inspect(){
  const bank=new Map(api.listBank(user).map(q=>[q.id,q])),existing=api.listPackages(user);
  return plans.map(p=>{
   const ids=p.orderedItems.map(q=>q.revisionId);const blockers=[];
   if(ids.length!==p.count||new Set(ids).size!==ids.length||ids.length>200)blockers.push('Invalid count/duplicate revision');
   for(const row of p.orderedItems){const actual=bank.get(row.revisionId);if(held.has(row.questionId)||!actual||actual.questionId!==row.questionId||actual.revision!==row.revision||actual.examId!=='toefl-itp'||actual.section!==row.section||actual.state!=='published')blockers.push(row.revisionId);}
   const matches=existing.filter(q=>q.ownerId===user.id&&q.title===p.title);
   if(matches.length>1)blockers.push('Multiple packages have this title; resolve ambiguity before applying');
   const prior=matches[0];
   if(prior&&(!['private','public'].includes(prior.visibility)||JSON.stringify(prior.snapshot.questions.map(q=>q.id))!==JSON.stringify(ids)||JSON.stringify(Object.fromEntries(prior.snapshot.sections.map(s=>[s.key,s.durationSeconds])))!==JSON.stringify(p.durationsSeconds)))blockers.push('Existing title has different content/settings; rename or re-audit');
   return {p,ids,blockers,prior};
  });
 }
 const checks=inspect();for(const x of checks)console.log(`${x.p.planId} ${x.prior?'EXISTS':x.blockers.length?'BLOCKED':'READY'} ${x.p.count} items; blockers=${x.blockers.length} — ${x.p.title}`);
 if(!flags.includes('--apply')){console.log('Dry-run only. Review/publish exact source revisions first; then choose --plans and --apply.');}
 else{
  if(checks.some(x=>x.blockers.length))throw Error('Preflight blocked; nothing created. Source revisions must be latest and published. Re-export/re-plan if revisions changed.');
  api.transaction(()=>{
   const fresh=inspect();if(fresh.some(x=>x.blockers.length))throw Error('Bank changed during preflight; nothing created');
   for(const x of fresh){if(x.prior){console.log(`SKIP ${x.p.planId}: ${x.prior.id}`);continue;}
    const id=api.createPackage(user,{examId:'toefl-itp',title:x.p.title,revisionIds:x.ids,durations:x.p.durationsSeconds,visibility:'private'});
    console.log(`CREATED PRIVATE DRAFT ${x.p.planId}: ${id}`);
   }
  });
 }
}catch(error){console.error(error instanceof Error?error.message:'Operation failed');process.exitCode=1;}
finally{connection?.close();}
