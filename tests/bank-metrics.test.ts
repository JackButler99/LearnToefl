import test from "node:test";
import assert from "node:assert/strict";
import { bankExamMetrics } from "../src/lib/bank-metrics";
import type { BankRow, ExamProfile } from "../src/lib/learning-types";
const profile = (id: string, sections: string[]): ExamProfile => ({ id, title: id, active: true, description: "", sections: sections.map(key => ({ key, title: key, durationSeconds: 0 })) });
const question = (examId: string, section: string, state: string): BankRow => ({ examId, section, state } as BankRow);
test("section metrics separate exams with the same section key and include all statuses", () => {
  const profiles = [profile("toefl", ["reading", "listening"]), profile("ielts", ["reading"])];
  const bank = [question("toefl", "reading", "draft"), question("toefl", "reading", "retired"), question("ielts", "reading", "published")];
  const metrics = bankExamMetrics(bank, profiles);
  assert.equal(metrics[0].total, 2);
  assert.deepEqual(metrics[0].sections.map(s => s.count), [2, 0]);
  assert.equal(metrics[1].sections[0].count, 1);
  assert.equal(profiles[0].sections.length, 2);
});
test("empty profiles and content outside the current profile remain visible and totals reconcile", () => {
  const bank = [question("toefl", "legacy-section", "review"), question("missing-exam", "reading", "draft")];
  const metrics = bankExamMetrics(bank, [profile("toefl", ["listening"]), profile("empty", ["numerik"])]);
  assert.equal(metrics.find(m => m.id === "empty")?.total, 0);
  assert.equal(metrics.find(m => m.id === "toefl")?.sections.find(s => s.key === "legacy-section")?.count, 1);
  assert.equal(metrics.find(m => m.id === "missing-exam")?.total, 1);
  assert.equal(metrics.reduce((n, m) => n + m.total, 0), bank.length);
  for (const exam of metrics) assert.equal(exam.sections.reduce((n, s) => n + s.count, 0), exam.total);
});
