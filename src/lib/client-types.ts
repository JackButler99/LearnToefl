import type { PublicQuestion, Section } from "./questions";

export type AttemptData = {
  id: string;
  mode: "full" | "practice";
  section: Section | null;
  status: "active" | "finished";
  sectionIndex: number;
  startedAt: number;
  deadline: number | null;
  finishedAt: number | null;
  answers: Record<string, number>;
  questions: PublicQuestion[];
  details?: { id: string; selected: number | null; correct: number; explanation: string; section: Section }[];
  summary?: { section: Section; correct: number; total: number; answered: number }[];
  totalCorrect?: number;
};
export const SECTION_NAMES: Record<Section, string> = {
  listening: "Listening Comprehension", structure: "Structure & Written Expression", reading: "Reading Comprehension",
};
