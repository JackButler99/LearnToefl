"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AttemptData } from "@/lib/client-types";
import { SECTION_NAMES } from "@/lib/client-types";

export function ResultClient({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<AttemptData | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    fetch(`/api/attempts/${id}`, { cache: "no-store" }).then(async response => {
      if (response.status === 401) { router.replace("/login"); return; }
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Gagal memuat hasil.");
      if (payload.status !== "finished") { router.replace(`/exam/${id}`); return; }
      setData(payload);
    }).catch(cause => setError(String(cause)));
  }, [id, router]);
  if (!data) return <main className="state-screen"><Link href="/" className="brand"><span className="brand-mark">I.</span> ITP Practice Lab</Link><div className="state-box">{error || "Memuat hasil..."}</div></main>;
  const details = data.details || [];
  const shown = data.questions.filter(q => filter === "all" || q.section === filter);
  const total = data.questions.length;
  return <main className="shell result-page"><header className="topbar"><Link href="/" className="brand"><span className="brand-mark">I.</span> ITP Practice Lab</Link><Link href="/" className="nav-link">← Beranda</Link></header>
    <div className="result-hero"><span className="eyebrow">LATIHAN SELESAI</span><h1>Setiap jawaban<br /><em>adalah langkah maju.</em></h1><p>Ini adalah hasil latihan dari soal orisinal. Jumlah benar tidak dapat disamakan dengan skor resmi TOEFL ITP.</p></div>
    <div className="score-overview"><div className="score-main"><span>HASIL LATIHAN</span><div><strong>{data.totalCorrect}</strong><small>/{total}</small></div><p>jawaban benar · {Math.round((data.totalCorrect || 0) / total * 100)}%</p></div><div className="score-sections">{data.summary?.map(s => <div key={s.section}><span>{SECTION_NAMES[s.section]}</span><strong>{s.correct} <small>/ {s.total}</small></strong><div className="progress-track"><span style={{ width: `${s.correct / s.total * 100}%` }} /></div></div>)}</div></div>
    <section className="review"><div className="section-heading"><span className="eyebrow">PEMBAHASAN</span><h2>Telusuri jawabanmu.</h2><p>Lihat jawaban benar dan alasan singkat untuk tiap soal.</p></div><div className="review-filters"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Semua</button>{data.summary?.map(s => <button key={s.section} className={filter === s.section ? "active" : ""} onClick={() => setFilter(s.section)}>{SECTION_NAMES[s.section]}</button>)}</div>
      <div className="review-list">{shown.map(q => { const detail = details.find(d => d.id === q.id)!; const correct = detail.selected === detail.correct;
        return <details key={q.id} className={`review-item ${correct ? "is-correct" : "is-wrong"}`}><summary><span className="review-status">{correct ? "✓" : "×"}</span><span><small>{SECTION_NAMES[q.section]} · {q.id}</small><strong>{q.prompt}</strong></span><span className="expand">⌄</span></summary><div className="review-detail">{q.kind === "audio" ? <p className="transcript"><b>Transkrip:</b> {q.stimulus}</p> : <p className="transcript">{q.stimulus}</p>}
          <p>Jawabanmu: <strong>{detail.selected === null ? "Tidak dijawab" : `${"ABCD"[detail.selected]}. ${q.options[detail.selected]}`}</strong></p><p>Jawaban benar: <strong>{"ABCD"[detail.correct]}. {q.options[detail.correct]}</strong></p><p className="explanation">{detail.explanation}</p></div></details>;
      })}</div></section><div className="result-bottom"><Link className="button dark" href="/">Kembali ke beranda ↗</Link></div><footer><span>ITP Practice Lab</span><span>Bukan tes atau sertifikat resmi ETS.</span></footer></main>;
}
