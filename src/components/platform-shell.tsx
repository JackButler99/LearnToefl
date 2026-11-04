import Link from "next/link";
import type { ReactNode } from "react";
import type { User } from "@/lib/auth";
import { DashboardActions } from "./dashboard-actions";
import { WorkspaceNav,type NavGroup } from "./workspace-nav";

export function PlatformShell({user,active,children}:{user:User;active:string;children:ReactNode}) {
  const groups:NavGroup[]=[{title:"Belajar",links:[{href:"/dashboard",label:"Ruang belajar",key:"student"},{href:"/catalog",label:"Paket latihan",key:"catalog"}]}];
  if(user.role==="instructor")groups.push({title:"Mengajar",links:[{href:"/instructor",label:"Kelas & peserta",key:"instructor"}]});
  if(["admin","instructor"].includes(user.role))groups.push({title:"Materi & evaluasi",links:[{href:"/manage/questions",label:"Bank soal",key:"bank"},{href:"/manage/packages",label:"Paket & tugas",key:"packages"},{href:"/manage/analytics",label:"Analitik soal",key:"analytics"}]});
  if(user.role==="admin")groups.push({title:"Pengelolaan",links:[{href:"/admin",label:"Ringkasan admin",key:"admin"},{href:"/admin/exams",label:"Format ujian",key:"exams"},{href:"/admin/experiments",label:"Eksperimen A/B",key:"experiments"}]});
  const current=groups.flatMap(g=>g.links).find(l=>l.key===active)?.label??"Workspace";
  return <div className="platform"><a className="skip-link" href="#workspace-content">Lewati navigasi</a><aside className="platform-sidebar"><Link className="brand" href="/dashboard"><span className="brand-mark">I.</span><span>ITP Practice Lab<small>Belajar dengan arah.</small></span></Link><WorkspaceNav groups={groups} active={active}/><div className="sidebar-bottom"><div className="account-avatar" aria-hidden="true">{user.username.slice(0,2).toUpperCase()}</div><div><strong>{user.username}</strong><span className="role-label">{user.role==="student"?"Peserta":user.role==="instructor"?"Instruktur":"Administrator"}</span></div><DashboardActions logout/></div></aside><main id="workspace-content" tabIndex={-1} className="platform-main"><header className="workspace-top"><span><span className="breadcrumb-root">Workspace</span><span aria-hidden="true"> / </span><strong>{current}</strong></span><Link href="/">Halaman utama <span aria-hidden="true">↗</span></Link></header>{children}<footer><span>ITP Practice Lab</span><span>Latihan independen. Hasil bukan skor atau sertifikat resmi.</span></footer></main></div>;
}
