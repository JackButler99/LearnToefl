import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { getQuestions, publicQuestion, type Section } from "./questions";

export const SECTIONS: Section[] = ["listening", "structure", "reading"];
export const DURATIONS = { listening: 35 * 60_000, structure: 25 * 60_000, reading: 55 * 60_000 };
export type Mode = "full" | "practice";
type AttemptRow = {
  id: string; user_id: string; mode: Mode; section: Section | null;
  status: "active" | "finished"; section_index: number;
  started_at: number; deadline: number | null; finished_at: number | null; answers: string;
};

export function createAttempt(userId: string, mode: Mode, section?: Section) {
  if (mode === "practice" && (!section || !SECTIONS.includes(section))) throw new Error("Invalid practice section");
  const id = randomUUID();
  const now = Date.now();
  db().prepare(`INSERT INTO attempts(id, user_id, mode, section, status, section_index, started_at, deadline)
    VALUES (?, ?, ?, ?, 'active', 0, ?, ?)`).run(id, userId, mode, mode === "practice" ? section! : null,
    now, mode === "full" ? now + DURATIONS.listening : null);
  return id;
}

function finish(row: AttemptRow, when: number) {
  db().prepare("UPDATE attempts SET status = 'finished', finished_at = ?, deadline = NULL WHERE id = ?")
    .run(when, row.id);
  row.status = "finished";
  row.finished_at = when;
  row.deadline = null;
}

function nextSection(row: AttemptRow, when: number) {
  if (row.section_index >= 2) return finish(row, when);
  row.section_index += 1;
  row.deadline = when + DURATIONS[SECTIONS[row.section_index]];
  db().prepare("UPDATE attempts SET section_index = ?, deadline = ? WHERE id = ?")
    .run(row.section_index, row.deadline, row.id);
}

export function loadAttempt(id: string, userId: string): AttemptRow | null {
  const row = db().prepare("SELECT * FROM attempts WHERE id = ? AND user_id = ?")
    .get(id, userId) as AttemptRow | undefined;
  if (!row) return null;
  while (row.status === "active" && row.mode === "full" && row.deadline !== null && Date.now() >= row.deadline) {
    nextSection(row, row.deadline);
  }
  return row;
}

export function serializeAttempt(row: AttemptRow) {
  const questions = getQuestions(row.mode, row.section || undefined);
  const answers = JSON.parse(row.answers) as Record<string, number>;
  const base = {
    id: row.id, mode: row.mode, section: row.section, status: row.status,
    sectionIndex: row.section_index, startedAt: row.started_at,
    deadline: row.deadline, finishedAt: row.finished_at, answers,
    questions: questions.map(publicQuestion),
  };
  if (row.status !== "finished") return base;
  const details = questions.map(q => ({ id: q.id, selected: answers[q.id] ?? null, correct: q.answer,
    explanation: q.explanation, section: q.section }));
  const summary = SECTIONS.filter(s => row.mode === "full" || s === row.section).map(section => {
    const subset = details.filter(d => d.section === section);
    return { section, correct: subset.filter(d => d.selected === d.correct).length, total: subset.length,
      answered: subset.filter(d => d.selected !== null).length };
  });
  return { ...base, details, summary, totalCorrect: summary.reduce((sum, s) => sum + s.correct, 0) };
}

export function saveAnswer(row: AttemptRow, questionId: string, choice: number | null) {
  if (row.status !== "active") throw new Error("Attempt is already finished");
  const question = getQuestions(row.mode, row.section || undefined).find(q => q.id === questionId);
  if (!question || (row.mode === "full" && question.section !== SECTIONS[row.section_index])) {
    throw new Error("This question is unavailable in the current section");
  }
  if (choice !== null && (!Number.isInteger(choice) || choice < 0 || choice > 3)) throw new Error("Invalid answer");
  const answers = JSON.parse(row.answers) as Record<string, number>;
  if (choice === null) delete answers[questionId]; else answers[questionId] = choice;
  row.answers = JSON.stringify(answers);
  db().prepare("UPDATE attempts SET answers = ? WHERE id = ?").run(row.answers, row.id);
}

export function advanceAttempt(row: AttemptRow) {
  if (row.status !== "active") throw new Error("Attempt is already finished");
  if (row.mode === "practice") finish(row, Date.now()); else nextSection(row, Date.now());
}

export function recentAttempts(userId: string) {
  const rows = db().prepare("SELECT * FROM attempts WHERE user_id = ? ORDER BY started_at DESC LIMIT 8")
    .all(userId) as AttemptRow[];
  return rows.map(row => {
    const updated = loadAttempt(row.id, userId)!;
    const answers = JSON.parse(updated.answers) as Record<string, number>;
    return { id: row.id, mode: row.mode, section: row.section, status: updated.status,
      startedAt: row.started_at, answered: Object.keys(answers).length,
      total: row.mode === "full" ? 140 : 10 };
  });
}
