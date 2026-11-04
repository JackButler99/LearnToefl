import React from 'react';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {renderToStaticMarkup} from 'react-dom/server';
import {demoPackages,demoQuestions,type DemoView} from '../src/lib/demo-data';
import {demoMessages,translateDemo,type DemoLocale} from '../src/lib/demo-i18n';

async function main(){
(globalThis as typeof globalThis & {React:typeof React}).React=React;
const {DemoApp}=await import('../src/components/demo/demo-app');
const {DemoLocaleProvider}=await import('../src/components/demo/demo-locale');
const {DemoPractice}=await import('../src/components/demo/demo-practice');
const {DemoListening}=await import('../src/components/demo/demo-listening');
const views:DemoView[]=['overview','catalog','bank','classes','analytics','experiments'];
for(const locale of ['en','id'] as const){
 for(const view of views){
  const html=renderToStaticMarkup(<DemoApp initialRole="admin" initialView={view} initialLocale={locale}/>);
  assert.ok(html.includes(`lang="${locale}"`));
  assert.ok(html.includes(`aria-label="${locale==='en'?'Language':'Bahasa'}"`));
  assert.ok(html.includes(`<option value="${locale}" lang="${locale}" selected="">`));
  assert.ok(html.includes(locale==='en'?'Question bank':'Bank soal'));
  assert.ok(html.includes(locale==='en'?'View source':'Lihat kode'));
  assert.equal(html.includes(locale==='en'?'Ganti peran untuk menjelajahi':'Switch roles to explore'),false,view);
 }
 for(const pack of demoPackages){
  const html=renderToStaticMarkup(<DemoLocaleProvider initialLocale={locale}><DemoPractice pack={pack} onExit={()=>{}} onFinish={()=>{}}/></DemoLocaleProvider>);
  assert.ok(html.includes(locale==='en'?'Question 1 of':'Soal 1 dari'));
  assert.ok(html.includes(locale==='en'?'Question navigator':'Navigasi soal'));
  assert.ok(html.includes('lang="en"'));
 }
 const audio=renderToStaticMarkup(<DemoLocaleProvider initialLocale={locale}><DemoListening script={demoQuestions[0].script!}/></DemoLocaleProvider>);
 assert.ok(audio.includes(locale==='en'?'Voice settings':'Pengaturan suara'));
 assert.ok(audio.includes(locale==='en'?'Female voice':'Suara perempuan'));
 assert.ok(audio.includes(locale==='en'?'Male voice':'Suara laki-laki'));
}
const defaultHtml=renderToStaticMarkup(<DemoApp/>);
assert.ok(defaultHtml.includes('Make room for progress.'));
assert.ok(defaultHtml.includes('Small practice.'));
assert.ok(defaultHtml.includes('Sample data · No sign-in'));
// Guard against accidentally adding untranslated UI literals; exam content lives in demo-data.ts.
const allowed=new Set(['I.','ITP Practice Lab','Foundation A','Foundation B','A','B','pp','Aa']);
const translations=new Set(demoMessages.flatMap(message=>[message.id,message.en]));
for(const component of ['demo-app','demo-overview','demo-practice','demo-listening','demo-ui']){
 const path=`src/components/demo/${component}.tsx`,source=readFileSync(path,'utf8');
 const file=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(node:ts.Node){
  if(ts.isJsxText(node)&&/[A-Za-z]/.test(node.text))assert.ok(allowed.has(node.text.trim()),`Untranslated JSX: ${node.text}`);
  if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='t'&&ts.isStringLiteral(node.arguments[0])){
   const copy=node.arguments[0].text.trim();assert.ok(translations.has(copy),`Missing translation: ${copy}`);
  }
  ts.forEachChild(node,visit);
 }visit(file);
}
console.log('Bilingual demo rendering passed');

}
main().catch(error=>{console.error(error);process.exitCode=1;});
