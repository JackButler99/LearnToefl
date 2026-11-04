import test from "node:test";
import assert from "node:assert/strict";
import {NextRequest} from "next/server";
import {demoQuestions,demoPackages,demoPackageQuestions,scoreDemo} from "../src/lib/demo-data";
import {db} from "../src/lib/db";
import {middleware} from "../src/middleware";
test("demo packages contain only published, original fixtures with valid keys",()=>{
 assert.equal(demoQuestions.length,12);assert.equal(new Set(demoQuestions.map(q=>q.id)).size,12);
 for(const q of demoQuestions){assert.equal(q.options.length,4);assert.ok(q.answer>=0&&q.answer<4);assert.ok(q.explanation.length>20);}
 for(const pack of demoPackages){const questions=demoPackageQuestions(pack.id);assert.equal(questions.length,pack.ids.length);assert.ok(questions.every(q=>q.status==="published"));}
 assert.deepEqual(demoPackageQuestions("missing"),[]);
});
test("demo grading distinguishes unanswered, wrong and correct choices without TOEFL score conversion",()=>{
 assert.deepEqual(scoreDemo(["S01","S02","S03"],{}),{correct:0,total:3,answered:0,percentage:0});
 assert.deepEqual(scoreDemo(["S01","S02","S03"],{S01:1,S02:0,S03:2}),{correct:2,total:3,answered:3,percentage:67});
 assert.deepEqual(scoreDemo([],{}),{correct:0,total:0,answered:0,percentage:0});
 assert.equal(scoreDemo(["S01"],{S01:99}).answered,0);
});
test("portfolio mode blocks application APIs and real pages without granting a guest role",async()=>{
 const previous=process.env.PORTFOLIO_DEMO;process.env.PORTFOLIO_DEMO="1";
 try{
  for(const method of ["GET","POST","PATCH","DELETE","OPTIONS"]){const response=middleware(new NextRequest("https://demo.example/api/auth",{method}));assert.equal(response.status,403);}
  assert.equal(middleware(new NextRequest("https://demo.example/api/learning")).status,403);
  const redirect=middleware(new NextRequest("https://demo.example/admin"));assert.equal(redirect.status,307);assert.equal(new URL(redirect.headers.get("location")!).pathname,"/demo");
  assert.equal(middleware(new NextRequest("https://demo.example/demo",{method:"POST"})).status,405);
  assert.equal(middleware(new NextRequest("https://demo.example/demo?role=admin")).headers.get("x-middleware-next"),"1");
  assert.throws(()=>db(),/disabled in portfolio demo/);
 }finally{if(previous===undefined)delete process.env.PORTFOLIO_DEMO;else process.env.PORTFOLIO_DEMO=previous;}
});
test("portfolio mode defaults off and never turns a production request into an authenticated session",()=>{
 const previous=process.env.PORTFOLIO_DEMO;delete process.env.PORTFOLIO_DEMO;
 try{const result=middleware(new NextRequest("https://production.example/admin?PORTFOLIO_DEMO=1"));assert.equal(result.headers.get("x-middleware-next"),"1");assert.equal(result.headers.get("set-cookie"),null);}
 finally{if(previous!==undefined)process.env.PORTFOLIO_DEMO=previous;}
});
