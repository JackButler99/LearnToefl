import { dashboardUser } from "@/lib/access";
import { instructorClasses } from "@/lib/classrooms";
import { PlatformShell } from "@/components/platform-shell";
import { PlatformForm } from "@/components/platform-controls";

export const dynamic="force-dynamic";
export default async function Instructor() {
  const user=await dashboardUser("instructor"), classes=instructorClasses(user);
  return <PlatformShell user={user} active="instructor"><section className="workspace-heading"><span className="eyebrow">INSTRUKTUR / B2B</span><h1>Kelas yang kamu dampingi.</h1><p>Bagikan tugas dan lihat hasil peserta dalam kelasmu.</p></section><div className="metric-grid"><article><small>KELAS</small><strong>{classes.length}</strong></article><article><small>KEANGGOTAAN PESERTA</small><strong>{classes.reduce((n,c)=>n+c.students.length,0)}</strong></article><article><small>TUGAS DIBAGIKAN</small><strong>{classes.reduce((n,c)=>n+c.assignments.length,0)}</strong></article></div>
    <section className="workspace-card"><h2>Buat kelas</h2><PlatformForm action="createClass" button="Buat kelas"><label>Nama kelas<input name="name" required minLength={3} maxLength={100} placeholder="Persiapan ITP — Angkatan 01"/></label></PlatformForm></section>
    {!classes.length&&<p className="workspace-empty">Buat kelas pertama, lalu bagikan kode gabung kepada peserta.</p>}
    {classes.map(c=><section className="workspace-section workspace-card" key={c.id}><div className="task-row"><div><span className="eyebrow">{c.students.length} PESERTA</span><h2>{c.name}</h2></div><div className="join-code"><small>KODE GABUNG</small><code>{c.join_code}</code></div></div><p className="muted">Bagikan kode hanya kepada peserta kelas. Laporan di bawah hanya berisi tugas kelas, bukan latihan pribadi.</p>
      <details><summary>Peserta kelas ({c.students.length})</summary><p>{c.students.map(s=>s.username).join(", ")||"Belum ada peserta."}</p></details>
      <h3>Bagikan latihan</h3><PlatformForm action="createAssignment" values={{classroomId:c.id}} button="Bagikan tugas"><label>Judul tugas<input name="title" required minLength={3} maxLength={160} placeholder="Latihan Structure minggu pertama"/></label><label>Bagian<select name="section" defaultValue="structure"><option value="structure">Structure</option><option value="reading">Reading</option><option value="listening">Listening</option></select></label><label>Tenggat opsional (sertakan zona waktu)<input name="dueAt" type="text" placeholder="2026-12-01T17:00:00+07:00"/></label></PlatformForm>
      {c.assignments.map(a=><div className="assignment-report" key={a.id}><h3>{a.title}</h3><p>{a.section} · 10 soal · {a.due_at?new Date(a.due_at).toLocaleString("id-ID",{timeZone:"Asia/Jakarta"})+" WIB":"Tanpa tenggat"}</p><div className="table-scroll"><table><caption className="sr-only">Hasil peserta untuk {a.title}</caption><thead><tr><th>Peserta</th><th>Status</th><th>Dijawab</th><th>Benar</th></tr></thead><tbody>{c.students.map(s=>{const r=c.results.find(r=>r.assignment_id===a.id&&r.user_id===s.id);return <tr key={s.id}><td>{s.username}</td><td>{!r?"Belum mulai":r.status==="finished"?"Selesai":"Dikerjakan"}</td><td>{r?`${r.answered}/${r.total}`:"—"}</td><td>{r?.correct!==null&&r?.correct!==undefined?`${r.correct}/${r.total}`:"—"}</td></tr>;})}{!c.students.length&&<tr><td colSpan={4}>Belum ada peserta.</td></tr>}</tbody></table></div></div>)}
    </section>)}
  </PlatformShell>;
}
