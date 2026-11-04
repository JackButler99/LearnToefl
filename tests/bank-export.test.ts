import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { db } from "../src/lib/db";
import { register, type User } from "../src/lib/auth";
import { saveQuestion, listBank, transitionQuestions } from "../src/lib/learning-bank";
import { exportBankAudit } from "../src/lib/bank-export";
import { HttpError } from "../src/lib/http";
const directory = mkdtempSync(join(tmpdir(), "itp-bank-export-"));process.env.DATA_DIR = directory;
test.after(() => { db().close(); rmSync(directory, { recursive: true, force: true }); });
function account(username: string, role: User["role"]): User { const user = register(username, "temporary-check-12345"); db().prepare("UPDATE users SET role=? WHERE id=?").run(role, user.id); return { ...user, role }; }
const admin = account("export_admin_account", "admin"), teacher = account("export_teacher_account", "instructor"), student = account("export_student_account", "student");
const question = { examId: "toefl-itp", section: "reading", kind: "text", skill: "Detail", stimulus: "Original passage", prompt: "Which option?", options: ["One", "Two"], answer: 1, explanation: "Second option is correct.", scores: [0, 1] };
test("bank audit denies instructors and students before accessing bank content", () => {
  for (const user of [teacher, student]) assert.throws(() => exportBankAudit(user), (e: unknown) => e instanceof HttpError && e.status === 403);
});
test("bank audit includes private/latest drafts, public/retired content and keys without account fields", () => {
  const initialId = saveQuestion(teacher, question);
  transitionQuestions(teacher, [initialId], "review", "");transitionQuestions(admin, [initialId], "publish", "Kunci dan pembahasan telah diperiksa.");
  const old = listBank(admin).find(q => q.id === initialId)!;
  const revisedId = saveQuestion(teacher, { ...question, questionId: old.questionId, expectedRevision: 1, prompt: "A revised question?", answer: 0, scores: [1, 0] });
  const publicId = saveQuestion(admin, { ...question, prompt: "<script>example text</script>" });
  transitionQuestions(admin, [publicId], "review", "");transitionQuestions(admin, [publicId], "publish", "Public item reviewed deliberately.");transitionQuestions(admin, [publicId], "retire", "Retired for audit check.");
  const before = listBank(admin).length;
  const exported = exportBankAudit(admin), doc = JSON.parse(exported.json);
  assert.equal(exported.count, before);assert.equal(doc.count, doc.items.length);assert.equal(doc.format, "learn-toefl.bank-audit");assert.equal(doc.schemaVersion, 1);
  assert.ok(!Number.isNaN(Date.parse(doc.exportedAt)));assert.equal(doc.scope.filters, "none");assert.equal(doc.scope.revisions, "latest-per-question");
  assert.ok(!doc.items.some((q: {revisionId: string}) => q.revisionId === initialId));
  const revised = doc.items.find((q: {revisionId: string}) => q.revisionId === revisedId);
  assert.equal(revised.revision, 2);assert.equal(revised.visibility, "private");assert.equal(revised.status, "draft");assert.equal(revised.answer, 0);assert.equal(revised.answerLabel, "A");assert.deepEqual(revised.scores, [1, 0]);
  const retired = doc.items.find((q: {revisionId: string}) => q.revisionId === publicId);
  assert.equal(retired.status, "retired");assert.equal(retired.prompt, "<script>example text</script>");assert.equal(retired.reviewNote, "Retired for audit check.");
  assert.equal(doc.summary.reduce((n: number, exam: {total: number}) => n + exam.total, 0), doc.count);
  for (const item of doc.items) for (const field of ["ownerId", "reviewedBy", "username", "password_hash", "sessions", "responses"]) assert.ok(!Object.hasOwn(item, field));
  for (const user of [admin, teacher, student]) { assert.ok(!exported.json.includes(user.id));assert.ok(!exported.json.includes(user.username)); }
  assert.equal(listBank(admin).length, before);
});
