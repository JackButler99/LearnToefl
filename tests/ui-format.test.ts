import test from "node:test";
import assert from "node:assert/strict";
import { durationLabel,minutesToSeconds,safeSlug } from "../src/lib/ui-format";

test("minute-based editing preserves every supported server duration",()=>{
  for(let seconds=0;seconds<=14400;seconds++)assert.equal(minutesToSeconds(String(seconds/60)),seconds);
  for(const value of ["","NaN","-1","241","Infinity","0.001"])assert.throws(()=>minutesToSeconds(value));
  assert.equal(durationLabel(0),"Tanpa timer");assert.equal(durationLabel(90),"1 menit 30 detik");
});
test("human-readable profile titles produce backend-compatible keys",()=>{
  for(const value of ["2027 UTBK","Latihan Físika","  TPA / Numerik  ","日本語",""]){const slug=safeSlug(value);assert.match(slug,/^[a-z][a-z0-9-]*$/);assert.ok(slug.length<=40);}
});
