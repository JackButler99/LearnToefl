import test from "node:test";
import assert from "node:assert/strict";
import { samplePerArm, wilson, differenceInterval, sampleRatioP, analyzeExperiment, type Arm } from "../src/lib/statistics";

test("sample planning uses absolute MDE and rejects invalid probabilities",()=>{
  assert.equal(samplePerArm(.2,.1),294);
  assert.ok(samplePerArm(.2,.05)>samplePerArm(.2,.1));
  for(const p of [[0,.1],[.9,.2],[NaN,.1],[.2,-.1]])assert.throws(()=>samplePerArm(p[0],p[1]));
});
test("Wilson/Newcombe handles no events and preserves symmetric treatment difference",()=>{
  assert.deepEqual(wilson(0,0),[0,1]);
  assert.ok(wilson(0,100)[1]>0);
  const interval=differenceInterval(20,100,40,100), reversed=differenceInterval(40,100,20,100);
  assert.ok(interval[0]>0);
  assert.ok(Math.abs(interval[0]+reversed[1])<1e-10);
  const zeros=differenceInterval(0,100,0,100);assert.ok(zeros[0]<0&&zeros[1]>0);
});
test("SRM flags severely imbalanced assignment",()=>{
  assert.ok(sampleRatioP(100,100)>.99);
  assert.ok(sampleRatioP(190,10)<.01);
});
test("no winner during running, manual stopping, pauses, maturation, or SRM",()=>{
  const a:Arm={assigned:1000,exposed:1000,mature:1000,starts:500,conversions:200};
  const b:Arm={...a,conversions:400};
  const now=Date.now(),plan={status:"ended",required_per_arm:294,min_days:7,started_at:now-20*86400000,ended_at:now-8*86400000,stopped_by_plan:1,interrupted:0};
  assert.match(analyzeExperiment(a,b,plan,now).decision,/B meningkatkan/);
  assert.match(analyzeExperiment(a,b,{...plan,status:"running"},now).decision,/deskriptif/);
  assert.match(analyzeExperiment(a,b,{...plan,stopped_by_plan:0},now).decision,/Eksploratif/);
  assert.match(analyzeExperiment(a,b,{...plan,interrupted:1},now).decision,/Eksploratif/);
  assert.match(analyzeExperiment(a,{...b,exposed:1001},plan,now).decision,/Belum konklusif/);
  assert.match(analyzeExperiment(a,{...b,assigned:2000},plan,now).decision,/SRM/);
});
