import "server-only";
import { randomUUID } from "node:crypto";
import { db, ensureSchema } from "./db";
import { getQuestions, publicQuestion, type Section } from "./questions";

export const SECTIONS: Section[] = ["listening", "structure", "reading"];
export const DURATIONS = { listening: 35 * 60_000, structure: 25 * 60_000, reading: 55 * 60_000 };
export type Mode = "full" | "practice";

type AttemptRow = {
  id: string;
  user_id: string;
  mode: Mode;
  section: Section | null;
  status: "active" | "finished";
  section_index: number;
  started_at: number;
  deadline: number | null;
  finished_at: number | null;
  answers: string;
};

export async function createAttempt(userId: string, mode: Mode, section?: Section) {
  if (mode === "practice" && (!section || !SECTIONS.includes(section))) {
    throw new Error("Invalid practice section");
  }
  await ensureSchema();
  const id = randomUUID();
  const now = Date.now();
  await db()`
    INSERT INTO attempts(id, user_id, mode, section, status, section_index, started_at, deadline)
    VALUES (
      ${id}, ${userId}, ${mode}, ${mode === "practice" ? section! : null},
      'active', 0, ${now}, ${mode === "full" ? now + DURATIONS.listening : null}
    )
  `;
  return id;
}

async function finish(row: AttemptRow, when: number) {
  await db()`
    UPDATE attempts
    SET status = 'finished', finished_at = ${when}, deadline = NULL
    WHERE id = ${row.id}
  `;
  row.status = "finished";
  row.finished_at = when;
  row.deadline = null;
}

async function nextSection(row: AttemptRow, when: number) {
  if (row.section_index >= 2) return finish(row, when);
  const sectionIndex = row.section_index + 1;
  const deadline = when + DURATIONS[SECTIONS[sectionIndex]];
  await db()`
    UPDATE attempts
    SET section_index = ${sectionIndex}, deadline = ${deadline}
    WHERE id = ${row.id}
  `;
  row.section_index = sectionIndex;
  row.deadline = deadline;
}

export async function loadAttempt(id: string, userId: string): Promise<AttemptRow | null> {
  await ensureSchema();
  const [row] = await db()`
    SELECT * FROM attempts
    WHERE id = ${id} AND user_id = ${userId}
  ` as AttemptRow[];
  if (!row) return null;
  while (
    row.status === "active" &&
    row.mode === "full" &&
    row.deadline !== null &&
    Date.now() >= row.deadline
  ) {
    await nextSection(row, row.deadline);
  }
  return row;
}

export function serializeAttempt(row: AttemptRow) {
  const questions = getQuestions(row.mode, row.section || undefined);
  const answers = JSON.parse(row.answers) as Record<string, number>;
  const base = {
    id: row.id,
    mode: row.mode,
    section: row.section,
    status: row.status,
    sectionIndex: row.section_index,
    startedAt: row.started_at,
    deadline: row.deadline,
    finishedAt: row.finished_at,
    answers,
    questions: questions.map(publicQuestion),
  };
  if (row.status !== "finished") return base;
  const details = questions.map((question) => ({
    id: question.id,
    selected: answers[question.id] ?? null,
    correct: question.answer,
    explanation: question.explanation,
    section: question.section,
  }));
  const summary = SECTIONS.filter((section) => row.mode === "full" || section === row.section).map((section) => {
    const subset = details.filter((detail) => detail.section === section);
    return {
      section,
      correct: subset.filter((detail) => detail.selected === detail.correct).length,
      total: subset.length,
      answered: subset.filter((detail) => detail.selected !== null).length,
    };
  });
  return {
    ...base,
    details,
    summary,
    totalCorrect: summary.reduce((sum, section) => sum + section.correct, 0),
  };
}

export async function saveAnswer(row: AttemptRow, questionId: string, choice: number | null) {
  if (row.status !== "active") throw new Error("Attempt is already finished");
  const question = getQuestions(row.mode, row.section || undefined).find((item) => item.id === questionId);
  if (!question || (row.mode === "full" && question.section !== SECTIONS[row.section_index])) {
    throw new Error("This question is unavailable in the current section");
  }
  if (choice !== null && (!Number.isInteger(choice) || choice < 0 || choice > 3)) {
    throw new Error("Invalid answer");
  }
  const answers = JSON.parse(row.answers) as Record<string, number>;
  if (choice === null) delete answers[questionId];
  else answers[questionId] = choice;
  const serialized = JSON.stringify(answers);
  await db()`UPDATE attempts SET answers = ${serialized} WHERE id = ${row.id}`;
  row.answers = serialized;
}

export async function advanceAttempt(row: AttemptRow) {
  if (row.status !== "active") throw new Error("Attempt is already finished");
  if (row.mode === "practice") await finish(row, Date.now());
  else await nextSection(row, Date.now());
}

export async function recentAttempts(userId: string) {
  await ensureSchema();
  const rows = await db()`
    SELECT * FROM attempts
    WHERE user_id = ${userId}
    ORDER BY started_at DESC
    LIMIT 8
  ` as AttemptRow[];
  return Promise.all(rows.map(async (row) => {
    const updated = await loadAttempt(row.id, userId);
    if (!updated) throw new Error("Attempt disappeared while loading recent activity.");
    const answers = JSON.parse(updated.answers) as Record<string, number>;
    return {
      id: updated.id,
      mode: updated.mode,
      section: updated.section,
      status: updated.status,
      startedAt: updated.started_at,
      answered: Object.keys(answers).length,
      total: updated.mode === "full" ? 140 : 10,
    };
  }));
}
