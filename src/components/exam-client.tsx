"use client";
import { ReadingPassage } from "./reading-passage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AttemptData } from "@/lib/client-types";
import { SECTION_NAMES } from "@/lib/client-types";
import { availableVoices, selectSpeechVoices, splitSpeechLines } from "@/lib/listening-speech";

const letters = ["A", "B", "C", "D"];
export function ExamClient({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<AttemptData | null>(null);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [speaking, setSpeaking] = useState(false);
  const speechRun = useRef(0);
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const refresh = useCallback(async () => {
    const response = await fetch(`/api/attempts/${id}`, { cache: "no-store" });
    if (response.status === 401) { router.push("/login"); return; }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Gagal memuat sesi.");
    if (result.status === "finished") { router.replace(`/result/${id}`); return; }
    setData(result); setIndex(0);
  }, [id, router]);
  useEffect(() => { refresh().catch(cause => setError(String(cause))); }, [refresh]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (data?.deadline && now >= data.deadline) refresh().catch(cause => setError(String(cause)));
  }, [data?.deadline, now, refresh]);
  useEffect(() => () => {
    speechRun.current += 1;
    window.speechSynthesis?.cancel();
  }, []);

  const section = data?.mode === "full" ? (["listening", "structure", "reading"] as const)[data.sectionIndex] : data?.section;
  const questions = useMemo(() => data?.questions.filter(q => q.section === section) || [], [data, section]);
  const current = questions[index];
  useEffect(() => {
    speechRun.current += 1;
    window.speechSynthesis?.cancel();
    activeUtterance.current = null;
    setSpeaking(false);
  }, [current?.id]);
  const answered = questions.filter(q => data?.answers[q.id] !== undefined).length;
  const remaining = Math.max(0, (data?.deadline || 0) - now);
  const clock = `${Math.floor(remaining / 60000).toString().padStart(2, "0")}:${Math.floor((remaining % 60000) / 1000).toString().padStart(2, "0")}`;
  async function choose(choice: number) {
    if (!data || !current || busy || (data.deadline && Date.now() >= data.deadline)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/attempts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: current.id, choice }) });
      const result = await response.json();
      if (!response.ok) { if (response.status === 400) await refresh(); throw new Error(result.error); }
      setData(previous => previous ? { ...previous, answers: { ...previous.answers, [current.id]: choice } } : previous);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Gagal menyimpan jawaban."); }
    finally { setBusy(false); }
  }
  function stopSpeech() {
    speechRun.current += 1;
    window.speechSynthesis?.cancel();
    activeUtterance.current = null;
    setSpeaking(false);
  }
  async function advance() {
    if (!data || busy) return;
    const message = data.mode === "practice" || data.sectionIndex === 2
      ? "Kumpulkan jawaban sekarang? Hasil akan langsung ditampilkan."
      : "Akhiri bagian ini? Kamu tidak bisa kembali ke bagian sebelumnya.";
    if (!window.confirm(message)) return;
    stopSpeech(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/attempts/${id}`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal berpindah bagian.");
      if (result.status === "finished") router.replace(`/result/${id}`);
      else { setData(result); setIndex(0); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Gagal berpindah bagian."); }
    finally { setBusy(false); }
  }
  async function play() {
    if (!current || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      setError("Browser ini tidak mendukung pembacaan audio. Coba browser lain."); return;
    }
    stopSpeech();
    const run = speechRun.current;
    const synthesis = window.speechSynthesis;
    const lines = splitSpeechLines(current.stimulus);
    setError(""); setSpeaking(true);
    try {
      const voices = selectSpeechVoices(await availableVoices(synthesis));
      if (run !== speechRun.current) return;

      function speakLine(index: number) {
        if (run !== speechRun.current) return;
        if (index === lines.length) { activeUtterance.current = null; setSpeaking(false); return; }
        const line = lines[index];
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.lang = "en-US";
        utterance.voice = voices[line.speaker] ?? null;
        utterance.rate = 0.9;
        utterance.pitch = line.speaker === "man" ? 0.85 : line.speaker === "woman" ? 1.15 : 1;
        utterance.onend = () => speakLine(index + 1);
        utterance.onerror = () => {
          if (run !== speechRun.current) return;
          stopSpeech();
          setError("Gagal memutar audio dengan suara browser ini. Coba browser lain.");
        };
        activeUtterance.current = utterance;
        synthesis.speak(utterance);
      }
      speakLine(0);
    } catch {
      if (run !== speechRun.current) return;
      stopSpeech();
      setError("Gagal memulai audio dengan suara browser ini. Coba browser lain.");
    }
  }
  if (!data) return <main className="state-screen"><Link href="/" className="brand"><span className="brand-mark">I.</span> ITP Practice Lab</Link><div className="state-box">{error ? <><h2>Belum bisa membuka sesi.</h2><p>{error}</p><button className="button dark" onClick={() => refresh().catch(cause => setError(String(cause)))}>Coba lagi</button></> : <p>Memuat sesi latihan...</p>}</div></main>;
  if (!current || !section) return <main className="state-screen">Tidak ada soal di bagian ini. <Link href="/">Kembali</Link></main>;
  return <main className="exam-layout"><header className="exam-topbar"><Link href="/" className="brand"><span className="brand-mark">I.</span> ITP Practice Lab</Link><span className="exam-mode">{data.mode === "full" ? "SIMULASI PENUH" : "LATIHAN SINGKAT"}</span><div className="exam-clock" aria-live="off">{data.deadline ? <><span>WAKTU TERSISA</span><strong className={remaining < 60_000 ? "urgent" : ""}>{clock}</strong></> : <strong>Tanpa batas waktu</strong>}</div></header>
    <div className="exam-body"><aside className="exam-sidebar"><span className="eyebrow">BAGIAN {data.mode === "full" ? `${data.sectionIndex + 1} / 3` : "LATIHAN"}</span><h2>{SECTION_NAMES[section]}</h2><p>{data.mode === "full" ? "Waktu terus berjalan selama bagian ini aktif. Jawaban disimpan saat kamu memilih opsi." : "Kerjakan dengan ritmemu sendiri. Pembahasan muncul setelah dikumpulkan."}</p>
      <div className="progress-label"><strong>Soal terjawab</strong><span>{answered} / {questions.length}</span></div><div className="progress-track"><span style={{ width: `${answered / questions.length * 100}%` }} /></div>
      <div className="question-grid" aria-label="Navigasi soal">{questions.map((q, i) => <button aria-label={`Soal ${i + 1}${data.answers[q.id] !== undefined ? ", terjawab" : ""}`} aria-current={index === i ? "step" : undefined} className={`${index === i ? "current" : ""} ${data.answers[q.id] !== undefined ? "answered" : ""}`} key={q.id} onClick={() => { stopSpeech(); setIndex(i); }}>{i + 1}</button>)}</div>
      <button className="finish-button" onClick={advance} disabled={busy}>{data.mode === "full" && data.sectionIndex < 2 ? "Selesaikan bagian →" : "Kumpulkan jawaban →"}</button><Link className="leave-link" href="/">Simpan &amp; kembali nanti</Link>
    </aside><section className="question-area"><div className="question-meta"><span>SOAL {index + 1} DARI {questions.length}</span><span>{current.kind === "audio" ? "PEMAHAMAN AUDIO" : current.kind === "passage" ? "PEMAHAMAN BACAAN" : current.kind === "error" ? "IDENTIFIKASI KESALAHAN" : "LENGKAPI KALIMAT"}</span></div>
      {current.kind === "audio" ? <div className="audio-card"><span className="audio-icon">♫</span><div><strong>{current.group ? "Dengarkan paparan" : "Dengarkan dialog"}</strong><p>Suara pria dan wanita dibedakan sesuai suara yang tersedia di browser. Kamu dapat memutarnya ulang.</p></div><button className="audio-button" onClick={play}>{speaking ? "Putar ulang" : "Putar audio"} ▶</button></div> : current.kind === "passage" ? <ReadingPassage text={current.stimulus} prompt={current.prompt}/> : <div className="stimulus">{current.stimulus}</div>}
      <h1>{current.prompt}</h1><div className="options">{current.options.map((option, choice) => <button key={choice} disabled={busy} className={`option ${data.answers[current.id] === choice ? "chosen" : ""}`} onClick={() => choose(choice)}><span className="option-letter">{letters[choice]}</span><span>{option}</span><span className="option-check">{data.answers[current.id] === choice ? "✓" : ""}</span></button>)}</div>
      {error && <p className="error-banner" role="alert">{error}</p>}
      <div className="question-footer"><button onClick={() => { stopSpeech(); setIndex(Math.max(0, index - 1)); }} disabled={index === 0}>← Sebelumnya</button><span>Jawaban dapat diubah selama bagian ini masih aktif.</span><button onClick={() => { stopSpeech(); setIndex(Math.min(questions.length - 1, index + 1)); }} disabled={index === questions.length - 1}>Berikutnya →</button></div>
      <div className="mobile-actions"><button className="finish-button" onClick={advance} disabled={busy}>{data.mode === "full" && data.sectionIndex < 2 ? "Selesaikan bagian →" : "Kumpulkan jawaban →"}</button><Link className="leave-link" href="/">Simpan &amp; kembali nanti</Link></div>
    </section></div></main>;
}
