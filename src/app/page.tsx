import Link from "next/link";
import { getUser } from "@/lib/auth";
import { recentAttempts } from "@/lib/attempts";
import { DashboardActions } from "@/components/dashboard-actions";
import { DemoApp } from "@/components/demo/demo-app";
import { isPortfolioDemo } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";
const labels = { listening: "Listening", structure: "Structure", reading: "Reading" };
export default async function Home() {
  if(isPortfolioDemo())return <DemoApp/>;
  const user = await getUser();
  const recent = user ? recentAttempts(user.id) : [];
  return <main className="shell">
    <header className="topbar"><Link href="/" className="brand"><span className="brand-mark">I.</span> ITP Practice Lab</Link>
      <nav>{user ? <><span className="account">Halo, {user.username}</span><Link className="nav-link" href={user.role === "admin" ? "/admin" : user.role === "instructor" ? "/instructor" : "/dashboard"}>Dashboard ↗</Link></> : <Link href="/login" className="nav-link">Masuk / Daftar</Link>}{user && <DashboardActions logout />}</nav>
    </header>
    <section className="hero"><div><span className="eyebrow">BELAJAR DENGAN ARAH YANG JELAS</span>
      <h1>Lebih siap menghadapi<br /><em>tes bahasa Inggris.</em></h1>
      <p>Latihan terarah dan simulasi berdurasi penuh mengikuti susunan TOEFL ITP Level 1. Kerjakan, simpan progres, dan pelajari alasan di balik tiap jawaban.</p>
      <div className="hero-actions">{user ? <a className="button primary" href="#mulai">Mulai belajar <span>↗</span></a> : <Link className="button primary" href="/login">Mulai gratis <span>↗</span></Link>}
      <Link className="button ghost" href="/demo">Coba demo tanpa login <span aria-hidden="true">↗</span></Link></div>
    </div><div className="hero-visual" aria-hidden="true"><div className="visual-ring ring-one"/><div className="visual-ring ring-two"/><div className="visual-center"><span>140</span><small>SOAL LATIHAN</small></div><div className="visual-note note-top">LISTENING · STRUCTURE · READING</div><div className="visual-note note-bottom">35 + 25 + 55 MENIT</div></div></section>
    <section id="format" className="overview"><div className="section-heading"><span className="eyebrow">FORMAT LEVEL 1</span><h2>Tiga bagian. Satu tujuan.</h2><p>Latihan singkat untuk fokus, simulasi penuh untuk membangun ritme.</p></div>
      <div className="format-grid"><article><span className="section-number">01 / AUDIO</span><h3>Listening<br />Comprehension</h3><p>Dialog dan paparan singkat dengan pertanyaan pemahaman.</p><strong>50 soal <i/> 35 menit</strong></article>
      <article><span className="section-number">02 / BAHASA</span><h3>Structure &amp;<br />Written Expression</h3><p>Lengkapi kalimat dan temukan bagian yang perlu diperbaiki.</p><strong>40 soal <i/> 25 menit</strong></article>
      <article><span className="section-number">03 / BACAAN</span><h3>Reading<br />Comprehension</h3><p>Pahami gagasan, detail, kosakata, dan inferensi dari teks.</p><strong>50 soal <i/> 55 menit</strong></article></div>
    </section>
    <section id="mulai" className="start-section"><div className="section-heading"><span className="eyebrow">RUANG BELAJARMU</span><h2>Pilih cara belajar hari ini.</h2></div>
      {user ? <DashboardActions /> : <div className="locked-card"><div><h3>Siap mulai?</h3><p>Buat akun untuk menyimpan jawaban dan melihat riwayat latihanmu.</p></div><Link href="/login" className="button dark">Buat akun ↗</Link></div>}
    </section>
    {user && <section className="history"><div className="section-heading"><span className="eyebrow">PROGRES</span><h2>Aktivitas terbaru</h2></div>
      {recent.length ? <div className="history-list">{recent.map(a => <Link className="history-row" href={a.status === "finished" ? `/result/${a.id}` : `/exam/${a.id}`} key={a.id}>
        <span className="history-icon">{a.mode === "full" ? "◎" : "↗"}</span><span className="history-title">{a.mode === "full" ? "Simulasi penuh" : `Latihan ${labels[a.section!]}`}<small>{new Date(a.startedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</small></span>
        <span className="history-progress">{a.answered}/{a.total} dijawab</span><span className={`pill ${a.status === "finished" ? "complete" : "ongoing"}`}>{a.status === "finished" ? "Selesai" : "Lanjutkan"}</span><span>→</span>
      </Link>)}</div> : <p className="empty">Belum ada aktivitas. Mulai dari latihan singkat atau simulasi penuh.</p>}</section>}
    <footer><span>ITP Practice Lab · Soal latihan orisinal</span><span>Latihan mandiri, bukan tes atau sertifikat resmi ETS.</span></footer>
  </main>;
}
