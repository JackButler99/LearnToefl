import { dashboardUser } from "@/lib/access";
import { examProfiles } from "@/lib/learning-bank";
import { PlatformShell } from "@/components/platform-shell";
import { ExamProfileEditor } from "@/components/exam-profile-editor";
export const dynamic="force-dynamic";
export default async function Exams(){
  const user=await dashboardUser("admin");
  return <PlatformShell user={user} active="exams"><section className="workspace-heading"><span className="eyebrow">PENGELOLAAN / FORMAT UJIAN</span><h1>Atur format latihan.</h1><p>Kelola bagian dan waktu untuk setiap tujuan ujian melalui formulir yang mudah diperiksa.</p></section><ExamProfileEditor profiles={examProfiles()}/><aside className="research-note workspace-section"><strong>Format latihan independen</strong><p>Sesuaikan cakupan dengan penyelenggara dan tahun sasaran. IELTS di sini masih terbatas pada latihan pilihan ganda, belum penilaian Writing/Speaking atau band.</p></aside></PlatformShell>;
}
