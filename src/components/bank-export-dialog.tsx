"use client";
import { useState } from "react";
import { UiDialog } from "./ui-dialog";

export function BankExportDialog({ count, onClose, onSuccess }: { count: number; onClose: () => void; onSuccess: (count: number) => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function download() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/learning/bank-export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope: "all" }), cache: "no-store" });
      if (!response.ok) { const body = await response.json(); throw Error(body.error ?? "Ekspor belum berhasil. Coba kembali."); }
      const blob = await response.blob(), url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url; link.download = "bank-soal-audit.json"; document.body.appendChild(link); link.click(); link.remove();
      // Delay cleanup so browsers have time to start the download.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      onSuccess(Number(response.headers.get("X-Question-Count") ?? count));
    } catch (e) { setError(e instanceof Error ? e.message : "Ekspor belum berhasil. Coba kembali."); }
    finally { setBusy(false); }
  }
  return <UiDialog title="Ekspor bank soal untuk audit" onClose={() => { if (!busy) onClose(); }}>
    <p>Unduh seluruh bank yang tersedia bagi admin: sekitar <strong>{count} soal</strong>, menggunakan revisi terbaru setiap soal. Jumlah akhir mengikuti data server saat ekspor.</p>
    <ul className="bank-export-list"><li>Termasuk seluruh ujian, bagian, status, materi privat/publik, kunci, pembahasan, dan catatan review.</li><li>Filter, pencarian, pilihan baris, dan halaman daftar tidak membatasi ekspor.</li><li>Tidak menyertakan akun, pemilik/pemeriksa, sesi, atau respons peserta.</li></ul>
    <p className="bank-help">File memuat kunci jawaban dan materi privat. Bagikan hanya kepada pihak yang kamu izinkan untuk melakukan audit. Ini file audit, bukan file impor atau backup database lengkap.</p>
    {error && <p className="error-banner" role="alert">{error}</p>}
    <div className="dialog-actions"><button type="button" className="button ghost" disabled={busy} onClick={onClose}>Batal</button><button type="button" className="button primary" disabled={busy} onClick={() => void download()}>{busy ? "Menyiapkan file…" : "Unduh semua soal (JSON)"}</button></div>
  </UiDialog>;
}
