import type { BankRow, ExamProfile } from "./learning-types";

export function bankExamMetrics(bank: BankRow[], profiles: ExamProfile[]) {
  const exams = new Map(profiles.map(profile => [profile.id, {
    id: profile.id, title: profile.title, active: profile.active, total: 0,
    sections: profile.sections.map(section => ({ key: section.key, title: section.title, count: 0 })),
  }]));
  for (const row of bank) {
    let exam = exams.get(row.examId);
    if (!exam) {
      exam = { id: row.examId, title: row.examId, active: false, total: 0, sections: [] };
      exams.set(row.examId, exam);
    }
    let section = exam.sections.find(section => section.key === row.section);
    if (!section) {
      section = { key: row.section, title: `${row.section} (di luar profil saat ini)`, count: 0 };
      exam.sections.push(section);
    }
    exam.total++;
    section.count++;
  }
  return [...exams.values()];
}
