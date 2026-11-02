import Link from "next/link";
import { dashboardUser } from "@/lib/access";
import { db } from "@/lib/db";
import { recentAttempts } from "@/lib/attempts";
import { getQuestions, type Section } from "@/lib/questions";
import { getPrompt } from "@/lib/experiments";
import { studentAssignments } from "@/lib/classrooms";
import { PlatformShell } from "@/components/platform-shell";
import { PlatformForm, PracticePrompt, AssignmentStart } from "@/components/platform-controls";
import { DashboardActions } from "@/components/dashboard-actions";

export const dynamic="force-dynamic";
export default async function Dashboard() {
  const user=await dashboardUser("student","instructor","admin");
  const recent=recentAttempts(user.id), tasks=user.role==="student"?studentAssignments(user.id):[];
  const rows=db().prepare("SELECT mode,section,answers,status FROM attempts WHERE user_id=?").all(user.id) as {mode:"full"|"practice";section:Section|null;answers:string;status:string}[];
  let correct=0,total=0;
  for(const r of rows.filter(r=>r.status==="finished")){const answers=JSON.parse(r.answers);for(const q of getQuestions(r.mode,r.section??undefined)){total++;if(answers[q.id]===q.answer)correct++;}}
  const prompt=getPrompt(user);
  const request=db().prepare("SELECT status FROM instructor_requests WHERE user_id=?").get(user.id) as {status:string}|undefined;
  return <PlatformShell user={user} active="student"><section className="workspace-heading"><span className="eyebrow">RUANG BELAJAR</span><h1>Selamat datang, {user.username}.</h1><p>Belajar sedikit, pahami kesalahannya, lalu coba lagi.</p></section>
    <div className="metric-grid"><article><small>LATIHAN SELESAI</small><strong>{rows.filter(r=>r.status==="finished").length}</strong><span>Dari {rows.length} sesi</span></article><article><small>AKURASI LATIHAN</small><strong>{total?Math.round(correct/total*100)+"%":"—"}</strong><span>Jawaban benar / seluruh soal sesi selesai</span></article><article><small>TUGAS KELAS</small><strong>{tasks.filter(t=>t.attempt_status!=="finished").length}</strong><span>Belum selesai</span></article></div>
    <PracticePrompt key={prompt.experimentId??"default"} {...prompt}/>
    <section className="workspace-section"><h2>Latihan mandiri</h2><DashboardActions/></section>
    {user.role==="student"&&<section className="workspace-section"><h2>Tugas dari instruktur</h2><p className="muted">Instruktur dapat melihat jawaban dan hasil tugas kelas ini. Riwayat latihan pribadimu tetap terpisah.</p>{tasks.length?tasks.map(task=><article className="workspace-card task-row" key={task.id}><div><small>{task.classroom_name} · {task.section}</small><h3>{task.title}</h3><p>{task.due_at?`Tenggat ${new Date(task.due_at).toLocaleString("id-ID",{timeZone:"Asia/Jakarta"})} WIB`:"Tanpa tenggat"}</p></div>{task.attempt_id?<Link className="button dark" href={task.attempt_status==="finished"?`/result/${task.attempt_id}`:`/exam/${task.attempt_id}`}>{task.attempt_status==="finished"?"Lihat hasil":"Lanjutkan"}</Link>:task.due_at&&task.due_at<Date.now()?<span className="pill">Tenggat lewat</span>:<AssignmentStart id={task.id}/>}</article>):<p className="workspace-empty">Belum ada tugas. Gabung kelas menggunakan kode dari instruktur.</p>}<div className="workspace-card"><h3>Gabung kelas</h3><PlatformForm action="joinClass" button="Gabung kelas"><label>Kode kelas<input name="code" required maxLength={16} minLength={16} placeholder="16 karakter dari instruktur"/></label></PlatformForm></div></section>}
    <section className="workspace-section"><h2>Aktivitas terbaru</h2>{recent.length?<div className="workspace-card">{recent.map(a=><Link className="activity-line" href={a.status==="finished"?`/result/${a.id}`:`/exam/${a.id}`} key={a.id}><span>{a.mode==="full"?"Simulasi penuh":`Latihan ${a.section}`}<small>{a.answered}/{a.total} dijawab</small></span><span className="pill">{a.status==="finished"?"Selesai":"Lanjutkan →"}</span></Link>)}</div>:<p className="workspace-empty">Latihan pertamamu dimulai dari sini.</p>}</section>
    {user.role==="student"&&<section className="workspace-section workspace-card"><h2>Mengajar dengan Practice Lab</h2><p>Ajukan akses instruktur untuk membuat kelas dan membagikan tugas. Akses diperiksa admin.</p>{request?.status==="pending"?<span className="pill">Menunggu pemeriksaan admin</span>:<PlatformForm action="requestInstructor" button="Ajukan akses instruktur"><label>Nama lembaga atau kelas<input name="organization" required minLength={3} maxLength={120}/></label>{request?.status==="rejected"&&<p>Permintaan sebelumnya belum disetujui. Kamu dapat mengajukan kembali.</p>}</PlatformForm>}</section>}
  </PlatformShell>;
}
