import { db } from "./db";
import { HttpError } from "./http";

function limit(name: string, fallback: number) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < 1 || value > 1_000_000) throw new HttpError(`Konfigurasi ${name} tidak valid.`, 503);
  return value;
}
// Called inside the same synchronous transaction as insertion; no quota reservations to leak.
export function assertQuestionCapacity(userId: string, additional: number) {
  const count = (db().prepare("SELECT COUNT(*) AS n FROM bank_questions WHERE owner_id=?").get(userId) as { n: number }).n;
  if (count + additional > limit("BANK_MAX_OWNED_QUESTIONS", 5000)) throw new HttpError("Kuota jumlah soal akun tercapai. Hubungi admin untuk meninjau kapasitas.", 429);
}
export function assertDailyImportCapacity(userId: string, additional: number, now = Date.now()) {
  const used = (db().prepare("SELECT COALESCE(SUM(item_count),0) AS n FROM bank_import_events WHERE user_id=? AND created_at>?").get(userId, now - 86_400_000) as { n: number }).n;
  if (used + additional > limit("BANK_IMPORT_DAILY_QUESTIONS", 500)) throw new HttpError("Kuota impor 24 jam tercapai. Tunggu hingga kuota tersedia kembali.", 429);
}
