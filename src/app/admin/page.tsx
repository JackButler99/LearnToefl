import Link from "next/link";
import { dashboardUser } from "@/lib/access";
import { db } from "@/lib/db";
import { getQuestions } from "@/lib/questions";
import { PlatformShell } from "@/components/platform-shell";
import { PlatformForm } from "@/components/platform-controls";

export const dynamic="force-dynamic";
export default async function Admin() {
  const user=await dashboardUser("admin");
  const counts=db().prepare(`SELECT (SELECT COUNT(*) FROM users) AS users,(SELECT COUNT(*) FROM classrooms) AS classes,
    (SELECT COUNT(*) FROM attempts WHERE status='finished') AS completed,(SELECT COUNT(*) FROM experiments WHERE status='running') AS experiments`).get() as {users:number;classes:number;completed:number;experiments:number};
  const requests=db().prepare("SELECT r.*,u.username FROM instructor_requests r JOIN users u ON u.id=r.user_id WHERE r.status='pending' ORDER BY r.created_at").all() as {user_id:string;username:string;organization:string}[];
  const users=db().prepare("SELECT username,role,created_at FROM users ORDER BY created_at DESC LIMIT 50").all() as {username:string;role:string;created_at:number}[];
  const logs=db().prepare("SELECT a.*,u.username FROM audit_log a JOIN users u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT 20").all() as {id:string;username:string;action:string;target_id:string;created_at:number}[];
  const questions=getQuestions("full");
  return <PlatformShell user={user} active="admin"><section className="workspace-heading"><span className="eyebrow">ADMIN / OPERASIONAL</span><h1>Pantau produk. Jaga kualitas.</h1><p>Data penggunaan nyata, pemeriksaan akses instruktur, dan eksperimen terukur.</p></section><div className="metric-grid four"><article><small>AKUN</small><strong>{counts.users}</strong></article><article><small>KELAS</small><strong>{counts.classes}</strong></article><article><small>SESI SELESAI</small><strong>{counts.completed}</strong></article><article><small>EKSPERIMEN BERJALAN</small><strong>{counts.experiments}</strong></article></div>
    <section className="workspace-section workspace-card"><h2>Permintaan instruktur</h2><p>Akses instruktur memberi hak membuat kelas dan melihat hasil tugas peserta yang bergabung.</p>{requests.length?requests.map(r=><div className="request-row" key={r.user_id}><div><strong>{r.username}</strong><p>{r.organization}</p></div><div className="inline-actions"><PlatformForm action="reviewInstructor" values={{userId:r.user_id,approve:true}} button="Setujui instruktur"/><PlatformForm action="reviewInstructor" values={{userId:r.user_id,approve:false}} button="Tolak"/></div></div>):<p className="workspace-empty">Tidak ada permintaan yang menunggu.</p>}</section>
    <section className="workspace-section workspace-card"><div className="task-row"><div><span className="eyebrow">EXPERIMENT LAB</span><h2>Uji hipotesis sebelum memperluas fitur.</h2><p>Rencanakan sampel, lacak paparan, dan periksa hasil A/B.</p></div><Link className="button primary" href="/admin/experiments">Buka eksperimen →</Link></div></section>
    <section className="workspace-section workspace-card"><h2>Inventaris bank soal</h2><p className="muted">Konten orisinal bawaan; belum dikalibrasi secara psikometrik. Listening masih memakai suara browser. Penambahan atau revisi materi dilakukan melalui kode dan review.</p><div className="table-scroll"><table><thead><tr><th>Bagian</th><th>Soal</th><th>Status</th></tr></thead><tbody>{["listening","structure","reading"].map(s=><tr key={s}><td>{s}</td><td>{questions.filter(q=>q.section===s).length}</td><td>Bank awal · perlu review pengajar</td></tr>)}</tbody></table></div></section>
    <section className="workspace-section workspace-card"><h2>Akun terbaru</h2><div className="table-scroll"><table><thead><tr><th>Username</th><th>Peran</th><th>Terdaftar (WIB)</th></tr></thead><tbody>{users.map(u=><tr key={u.username}><td>{u.username}</td><td>{u.role}</td><td>{new Date(u.created_at).toLocaleDateString("id-ID",{timeZone:"Asia/Jakarta"})}</td></tr>)}</tbody></table></div><p className="muted">Maksimal 50 akun terbaru. Akun baru selalu peserta; admin pertama disiapkan melalui perintah pengelola server.</p></section>
    <section className="workspace-section workspace-card"><h2>Jejak tindakan admin & instruktur</h2>{logs.length?<div className="table-scroll"><table><thead><tr><th>Pelaku</th><th>Tindakan</th><th>Waktu (WIB)</th></tr></thead><tbody>{logs.map(l=><tr key={l.id}><td>{l.username}</td><td>{l.action}<small className="block muted">{l.target_id}</small></td><td>{new Date(l.created_at).toLocaleString("id-ID",{timeZone:"Asia/Jakarta"})}</td></tr>)}</tbody></table></div>:<p className="workspace-empty">Tindakan pengelolaan akan tercatat di sini.</p>}</section>
  </PlatformShell>;
}
