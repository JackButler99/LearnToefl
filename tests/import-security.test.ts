import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { checkLearningRequest, checkJsonDepth } from "../src/lib/learning-security";
import { assertQuestionInput, assertImportEnvelope } from "../src/lib/question-input";
import { HttpError, readBody } from "../src/lib/http";
import { db } from "../src/lib/db";
import { register, type User } from "../src/lib/auth";
import { importQuestions, saveQuestion, listBank } from "../src/lib/learning-bank";

const dir = mkdtempSync(join(tmpdir(), "itp-import-security-")); process.env.DATA_DIR = dir;
test.after(() => { db().close(); rmSync(dir, { recursive: true, force: true }); });
function config(values: Record<string, string | undefined>, fn: () => void) {
  const old = Object.fromEntries(Object.keys(values).map(k => [k, process.env[k]]));
  try { for (const [k,v] of Object.entries(values)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } fn(); }
  finally { for (const [k,v] of Object.entries(old)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } }
}
const status = (code: number) => (e: unknown) => e instanceof HttpError && e.status === code;
const req = (origin?: string, extra: Record<string,string> = {}) => new Request("http://internal:3000/api/learning", { method: "POST", headers: { "content-type": "application/json", ...(origin ? { origin } : {}), ...extra } });
const question = { examId: "toefl-itp", section: "reading", kind: "text", stimulus: "Original passage", prompt: "A question?", options: ["One", "Two"], answer: 0, explanation: "A reason", skill: "Detail" };
let serial = 0;
function account(): User { const user = register(`security_${++serial}`, "temporary-test-12345"); db().prepare("UPDATE users SET role='instructor' WHERE id=?").run(user.id); return { ...user, role: "instructor" }; }

test("learning endpoint compares full canonical origin and ignores spoofed proxy headers", () => {
  config({ APP_ORIGIN: "https://app.example", NODE_ENV: "production" }, () => {
    checkLearningRequest(req("https://app.example", { host: "internal:3000" }));
    for (const origin of [undefined, "null", "not a url", "http://app.example", "https://app.example:444", "https://app.example.evil.test", "https://sibling.example", "https://app.example/path", "https://user@app.example"]) assert.throws(() => checkLearningRequest(req(origin, { host: "evil.test", "x-forwarded-host": "app.example" })), status(403));
    assert.throws(() => checkLearningRequest(req("https://app.example", { "sec-fetch-site": "cross-site" })), status(403));
    assert.throws(() => checkLearningRequest(req("https://app.example", { "content-type": "text/plain" })), status(415));
    checkLearningRequest(req("https://app.example", { "content-type": "application/json; charset=utf-8" }));
  });
});
test("production fails closed without valid configuration; only loopback development has fallback", () => {
  config({ APP_ORIGIN: undefined, NODE_ENV: "production" }, () => assert.throws(() => checkLearningRequest(req("http://internal:3000")), status(503)));
  for (const origin of ["", "https://app.example/path", "https://user:pass@app.example", "file:///tmp", "http://app.example"]) config({ APP_ORIGIN: origin, NODE_ENV: "production" }, () => assert.throws(() => checkLearningRequest(req("https://app.example")), status(503)));
  config({ APP_ORIGIN: undefined, NODE_ENV: "development" }, () => {
    checkLearningRequest(new Request("http://localhost:3000/api/learning", { headers: { origin: "http://localhost:3000", "content-type": "application/json" } }));
    assert.throws(() => checkLearningRequest(req("http://internal:3000")), status(503));
  });
});
test("question schema rejects coercion, prototype keys and import mass assignment", () => {
  assertQuestionInput(question);
  for (const answer of [null, false, true, "0", {}, [], 0.5, Infinity]) assert.throws(() => assertQuestionInput({ ...question, answer }), status(400));
  for (const extra of [{ questionId: "existing" }, { expectedRevision: 1 }, { visibility: "public" }, { state: "published" }, JSON.parse('{"__proto__":{"polluted":true}}'), { constructor: {} }]) assert.throws(() => assertQuestionInput({ ...question, ...extra }), status(400));
  assert.throws(() => assertQuestionInput(Object.assign(Object.create({ inherited: true }), question)), status(400));
  assert.throws(() => assertQuestionInput({ ...question, questionId: "existing", expectedRevision: "1" }, true), status(400));
  assertQuestionInput({ ...question, action: "saveQuestion", questionId: "existing", expectedRevision: 1 }, true);
  assertImportEnvelope({ action: "importQuestions", items: [question] });
  assert.throws(() => assertImportEnvelope({ action: "importQuestions", items: [question], role: "admin" }), status(400));
});
test("JSON depth check respects quoted delimiters and rejects nested structures before parsing", async () => {
  const safe = JSON.stringify({ text: 'escaped "quote" and \\ [ { } ]'.repeat(50) });
  checkJsonDepth(safe);
  const deep = '['.repeat(13) + '0' + ']'.repeat(13);
  assert.throws(() => checkJsonDepth(deep), status(400));
  await assert.rejects(readBody(new Request("http://localhost", { method: "POST", body: deep }), 512_000, { beforeParse: checkJsonDepth }), status(400));
  await assert.rejects(readBody(new Request("http://localhost", { method: "POST", body: new Uint8Array([0xff]) }), 512_000, { strictUtf8: true }), status(400));
});
test("stream byte limits do not trust content-length and stalled bodies time out", async () => {
  await assert.rejects(readBody(new Request("http://localhost", { method: "POST", headers: { "content-length": "1" }, body: JSON.stringify({ x: "x".repeat(600) }) }), 500), status(413));
  let cancelled = false;
  const stream = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('{"x":')); }, cancel() { cancelled = true; } });
  const request = new Request("http://localhost", { method: "POST", body: stream, duplex: "half" } as RequestInit);
  await assert.rejects(readBody(request, 512_000, { timeoutMs: 20 }), status(408));
  assert.ok(cancelled);
});
test("daily and total-owned quotas persist, include manual creation, and allow revisions", () => {
  const user = account();
  config({ BANK_IMPORT_DAILY_QUESTIONS: "2", BANK_MAX_OWNED_QUESTIONS: "3" }, () => {
    const ids = importQuestions(user, [question, { ...question, prompt: "Second?" }]);
    assert.throws(() => importQuestions(user, [question]), status(429));
    saveQuestion(user, question);
    assert.throws(() => saveQuestion(user, question), status(429));
    const row = listBank(user).find(q => q.id === ids[0])!;
    saveQuestion(user, { ...question, questionId: row.questionId, expectedRevision: row.revision, prompt: "Revised?" });
    assert.equal((db().prepare("SELECT COUNT(*) AS n FROM bank_questions WHERE owner_id=?").get(user.id) as {n:number}).n, 3);
    assert.equal((db().prepare("SELECT SUM(item_count) AS n FROM bank_import_events WHERE user_id=?").get(user.id) as {n:number}).n, 2);
  });
});
test("invalid batches roll back questions, audit and quota; unknown fields cannot set state", () => {
  const user = account();
  config({ BANK_IMPORT_DAILY_QUESTIONS: "3", BANK_MAX_OWNED_QUESTIONS: "3" }, () => {
    assert.throws(() => importQuestions(user, [question, { ...question, answer: null }]), status(400));
    assert.equal((db().prepare("SELECT COUNT(*) AS n FROM bank_questions WHERE owner_id=?").get(user.id) as {n:number}).n, 0);
    assert.equal((db().prepare("SELECT COUNT(*) AS n FROM bank_import_events WHERE user_id=?").get(user.id) as {n:number}).n, 0);
    assert.equal((db().prepare("SELECT COUNT(*) AS n FROM audit_log WHERE actor_id=?").get(user.id) as {n:number}).n, 0);
    const ids = importQuestions(user, [question, question, question]);
    assert.equal(ids.length, 3);
    assert.ok(listBank(user).filter(q => new Set<string>(ids).has(q.id)).every(q => q.state === "draft" && q.visibility === "private"));
  });
});
test("rolling quota expires, is isolated per account, and invalid quota config fails closed", () => {
  const user = account(), other = account();
  config({ BANK_IMPORT_DAILY_QUESTIONS: "1", BANK_MAX_OWNED_QUESTIONS: "5" }, () => {
    importQuestions(user, [question]);
    assert.throws(() => importQuestions(user, [question]), status(429));
    importQuestions(other, [question]);
    db().prepare("UPDATE bank_import_events SET created_at=? WHERE user_id=?").run(Date.now() - 86_400_001, user.id);
    assert.equal(importQuestions(user, [question]).length, 1);
  });
  config({ BANK_IMPORT_DAILY_QUESTIONS: "invalid" }, () => assert.throws(() => importQuestions(user, [question]), status(503)));
});
