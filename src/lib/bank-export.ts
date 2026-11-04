import "server-only";
import type { User } from "./auth";
import type { BankRow, ExamProfile } from "./learning-types";
import { assertRole } from "./access";
import { HttpError } from "./http";
import { db } from "./db";
import { ensureLearningSeed, examProfiles, listBank } from "./learning-bank";
import { bankExamMetrics } from "./bank-metrics";

export function exportBankAudit(user: User) {
  assertRole(user, "admin");
  ensureLearningSeed();
  const connection = db();
  let profiles: ExamProfile[], bank: BankRow[];
  connection.exec("BEGIN");
  try {
    const count = (connection.prepare("SELECT COUNT(*) AS n FROM bank_questions q WHERE EXISTS (SELECT 1 FROM question_revisions r WHERE r.question_id=q.id)").get() as { n: number }).n;
    if (count > 10_000) throw new HttpError("Bank melebihi 10.000 soal. Ekspor penuh perlu dipecah sebelum dilanjutkan; tidak ada data yang dipotong.", 413);
    profiles = examProfiles(); bank = listBank(user);
    connection.exec("COMMIT");
  } catch (error) { connection.exec("ROLLBACK"); throw error; }
  const items = bank.map(q => {
    const exam = profiles.find(p => p.id === q.examId);
    return {
      questionId: q.questionId, revisionId: q.id, revision: q.revision,
      examId: q.examId, examTitle: exam?.title ?? q.examId,
      section: q.section, sectionTitle: exam?.sections.find(s => s.key === q.section)?.title ?? q.section,
      status: q.state, visibility: q.visibility,
      kind: q.content.kind, stimulus: q.content.stimulus, prompt: q.content.prompt,
      options: q.content.options, answer: q.content.answer,
      answerLabel: String.fromCharCode(65 + q.content.answer),
      scores: q.content.scores, explanation: q.content.explanation, skill: q.content.skill,
      reviewNote: q.reviewNote,
    };
  });
  const document = {
    format: "learn-toefl.bank-audit", schemaVersion: 1, exportedAt: new Date().toISOString(),
    scope: { revisions: "latest-per-question", statuses: "all", visibility: "all", filters: "none" },
    count: items.length,
    summary: bankExamMetrics(bank, profiles),
    limitations: ["Audit export, not an import file or full database backup.", "Only the latest revision of each question; older published revisions and history are excluded.", "Source-book metadata is unavailable unless already stored in question text/review notes. No source attribution is inferred."],
    items,
  };
  const json = JSON.stringify(document, null, 2) + "\n";
  if (new TextEncoder().encode(json).length > 16_000_000) throw new HttpError("Ekspor melebihi 16 MB. Ekspor penuh perlu dipecah; tidak ada data yang dipotong.", 413);
  return { json, count: items.length };
}
