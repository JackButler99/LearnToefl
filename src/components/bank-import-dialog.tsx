"use client";
import { useEffect, useRef, useState } from "react";
import { UiDialog, ConfirmDialog } from "./ui-dialog";
import { learningCommand } from "./learning-controls";
import { parseBankImport } from "@/lib/bank-view";
import type { ExamProfile } from "@/lib/learning-types";

export function BankImportDialog({ profiles, admin, onClose, onSuccess }: { profiles: ExamProfile[]; admin: boolean; onClose: () => void; onSuccess: (count: number) => void }) {
  const [raw, setRaw] = useState(""), [filename, setFilename] = useState("");
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState(""), [busy, setBusy] = useState(false), [reading, setReading] = useState(false), [discard, setDiscard] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!raw.trim()) return; const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; }; window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard); }, [raw]);
  const close = () => { if (!busy && !reading) { if (raw.trim()) setDiscard(true); else onClose(); } };
  async function read(file?: File) {
    if (!file) return;
    setPreview(null); setError(""); setFilename(file.name); setRaw("");
    if (file.size > 500_000) { setError("File melebihi 500 KB. Pisahkan menjadi batch yang lebih kecil."); return; }
    setReading(true);
    try { setRaw(await file.text()); } catch { setError("File tidak dapat dibaca. Coba pilih kembali atau tempel JSON."); }
    finally { setReading(false); }
  }
  async function submit() {
    if (!preview) return;
    setBusy(true); setError("");
    try { const result = await learningCommand({ action: "importQuestions", items: preview }); onSuccess(result.count ?? preview.length); }
    catch (e) { setError(e instanceof Error ? e.message : "Impor gagal. Isi JSON tetap tersedia."); }
    finally { setBusy(false); }
  }
  return <><UiDialog title="Impor soal" wide onClose={close}>
    <div className="bank-import-intro"><span className="status-badge neutral">1–50 soal per batch</span><p>Pilih file JSON hasil ekstraksi atau tempel isinya. Periksa ringkasan sebelum menyimpan ke bank soal.</p></div>
    <div className="bank-upload"><span className="bank-file-icon" aria-hidden="true">↥</span><div><strong>{filename || "Pilih file *-import-*.json"}</strong><p>JSON saja · maksimal 500 KB. File review, source map, dan ZIP perlu dipisahkan terlebih dahulu.</p></div><button type="button" className="button ghost" disabled={busy || reading} onClick={() => input.current?.click()}>{reading ? "Membaca…" : "Pilih file"}</button><input ref={input} className="sr-only" type="file" accept=".json,application/json" tabIndex={-1} disabled={busy || reading} onChange={e => { void read(e.target.files?.[0]); e.target.value = ""; }}/></div>
    <label className="bank-json-label" htmlFor="bank-import-json">Isi JSON<span>Kamu tetap dapat menempel atau menyunting isi sebelum pemeriksaan.</span></label>
    <textarea id="bank-import-json" className="bank-json-input" spellCheck={false} rows={8} value={raw} disabled={busy || reading} onChange={e => { setRaw(e.target.value); setFilename(""); setPreview(null); setError(""); }} placeholder='[{"examId":"toefl-itp","section":"reading","kind":"text", ...}]'/>
    {error && <p className="error-banner" role="alert">{error}</p>}
    {preview && <section className="bank-import-preview" aria-label="Ringkasan impor"><div><span className="status-badge success">Struktur awal terbaca</span><h3>{preview.length} soal akan disimpan sebagai draf</h3><p>{preview.filter(q => q.kind === "text").length} teks · {preview.filter(q => q.kind === "audio").length} listening dari naskah</p></div><ul>{[...new Set(preview.map(q => String(q.examId)))].map(id => <li key={id}>{profiles.find(p => p.id === id)?.title ?? `${id} — akan diperiksa server`}</li>)}</ul><p>Ini pemeriksaan bentuk file. Server tetap memvalidasi setiap soal, pilihan, kunci, dan pembahasan. Jika satu soal gagal, seluruh batch dibatalkan.</p></section>}
    <p className="bank-help">{admin ? "Materi admin memiliki visibilitas publik, tetapi tetap draf sampai direview dan diterbitkan." : "Materi yang kamu impor bersifat privat dan tetap draf sampai diajukan untuk review."} Mengimpor file yang sama kembali dapat membuat duplikat.</p>
    <div className="dialog-actions"><button type="button" className="button ghost" disabled={busy || reading} onClick={close}>Batal</button>{!preview ? <button type="button" className="button primary" disabled={!raw.trim() || reading} onClick={() => { setError(""); try { setPreview(parseBankImport(raw)); } catch (e) { setError((e as Error).message); } }}>Periksa isi JSON</button> : <button type="button" className="button primary" disabled={busy} onClick={() => void submit()}>{busy ? "Mengimpor…" : `Impor ${preview.length} soal sebagai draf`}</button>}</div>
  </UiDialog>{discard && <ConfirmDialog title="Tutup impor soal?" description="JSON yang belum diimpor akan dibuang dari formulir ini. File di perangkatmu tetap tersedia." confirmLabel="Tutup formulir" onClose={() => setDiscard(false)} onConfirm={onClose}/>}</>;
}
