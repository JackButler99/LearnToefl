import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {defaultDemoLocale,demoLocaleStorageKey,demoMessages,formatDemoNumber,isDemoLocale,translateDemo} from '../src/lib/demo-i18n';

test('demo defaults to English and accepts only the two supported locales',()=>{
 assert.equal(defaultDemoLocale,'en');
 assert.match(demoLocaleStorageKey,/portfolio/);
 for(const value of ['en','id'])assert.ok(isDemoLocale(value));
 for(const value of ['EN','en-US','fr','',null,undefined,{},1])assert.equal(isDemoLocale(value),false);
});
test('every message translates in both directions, including whitespace and counts',()=>{
 const ids=new Set<string>(),english=new Set<string>();
 for(const message of demoMessages){
  assert.ok(message.id.trim());assert.ok(message.en.trim());
  assert.equal(ids.has(message.id),false,message.id);ids.add(message.id);
  assert.equal(english.has(message.en),false,message.en);english.add(message.en);
  assert.equal(translateDemo(message.id,'en'),message.en);
  assert.equal(translateDemo(message.en,'id'),message.id);
  if(message.one){assert.equal(translateDemo(message.id,'en',{count:1}),message.one.replace('{count}','1'));assert.equal(translateDemo(message.one,'id',{count:1}),message.id.replace('{count}','1'));}
  const placeholders=(s:string)=>s.match(/\{\w+\}/g)?.sort()??[];
  assert.deepEqual(placeholders(message.id),placeholders(message.en),message.id);
 }
 assert.equal(translateDemo(' Berikutnya → ','en'),' Next → ');
 assert.equal(translateDemo(' \n','en'),' \n');
 assert.equal(translateDemo('Unlisted content','id'),'Unlisted content');
});
test('count and number formatting follow the selected language without changing question content',()=>{
 assert.equal(translateDemo('Soal {number} dari {total}','en',{number:2,total:3}),'Question 2 of 3');
 assert.equal(translateDemo('{count} soal belum dijawab.','en',{count:1}),'1 question is unanswered.');
 assert.equal(translateDemo('{count} soal belum dijawab.','en',{count:2}),'2 questions are unanswered.');
 assert.equal(translateDemo('{count} soal belum dijawab.','id',{count:1}),'1 soal belum dijawab.');
 assert.equal(translateDemo('{day}: {count} latihan','en',{day:'Monday',count:1}),'Monday: 1 exercise');
 assert.equal(formatDemoNumber(2000,'en'),'2,000');assert.equal(formatDemoNumber(2000,'id'),'2.000');
 assert.equal(formatDemoNumber(5.2,'en',1),'5.2');assert.equal(formatDemoNumber(5.2,'id',1),'5,2');
 const source='The samples _____ in the laboratory must be stored at a low temperature.';
 assert.equal(translateDemo(source,'en'),source);assert.equal(translateDemo(source,'id'),source);
});
test('all demo views and practice controls render with complete English and Indonesian copy',()=>{
 // React server conditions used by database tests omit client hooks; render in a normal React child process.
 const result=spawnSync(process.execPath,['--import=tsx','tests/demo-locale-render.tsx'],{encoding:'utf8',timeout:30000});
 assert.equal(result.status,0,result.stderr||result.stdout);
 assert.match(result.stdout,/Bilingual demo rendering passed/);
});
