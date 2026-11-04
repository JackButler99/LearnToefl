import { HttpError } from "./http";

const fields = ["examId", "section", "kind", "stimulus", "prompt", "options", "answer", "explanation", "skill", "scores"];
const required = ["examId", "section", "kind", "prompt", "options", "answer", "explanation", "skill"];
export function assertQuestionInput(value: unknown, editing = false): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new HttpError("Soal harus berupa objek JSON biasa.", 400);
  const input = value as Record<string, unknown>;
  const allowed = new Set(editing ? [...fields, "questionId", "expectedRevision", "action"] : fields);
  if (Object.keys(input).some(key => !allowed.has(key))) throw new HttpError("Soal memuat field yang tidak didukung.", 400);
  if (required.some(key => !Object.hasOwn(input, key))) throw new HttpError("Field wajib soal belum lengkap.", 400);
  if (typeof input.answer !== "number" || !Number.isSafeInteger(input.answer)) throw new HttpError("Kunci harus berupa angka bulat JSON, bukan teks, boolean, atau null.", 400);
  if (editing) {
    if (input.action !== undefined && input.action !== "saveQuestion") throw new HttpError("Aksi penyuntingan tidak valid.", 400);
    if (input.questionId !== undefined && (typeof input.questionId !== "string" || !input.questionId.trim() || input.questionId.length > 100)) throw new HttpError("ID soal tidak valid.", 400);
    if (input.questionId !== undefined && (typeof input.expectedRevision !== "number" || !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 1)) throw new HttpError("Nomor revisi wajib berupa angka bulat positif.", 400);
    if (input.questionId === undefined && input.expectedRevision !== undefined) throw new HttpError("Nomor revisi hanya untuk menyunting soal yang sudah ada.", 400);
  }
}

export function assertImportEnvelope(body: Record<string, unknown>) {
  if (Object.keys(body).some(key => !["action", "items"].includes(key)) || body.action !== "importQuestions" || !Object.hasOwn(body, "items")) throw new HttpError("Permintaan impor hanya boleh berisi action dan items.", 400);
}
