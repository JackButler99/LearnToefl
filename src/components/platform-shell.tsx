import Link from "next/link";
import type { ReactNode } from "react";
import type { User } from "@/lib/auth";
import { DashboardActions } from "./dashboard-actions";

export function PlatformShell({user,active,children}:{user:User;active:string;children:ReactNode}) {
  const links=[{href:"/dashboard",label:"Ruang belajar",key:"student"},...(user.role==="instructor"?[{href:"/instructor",label:"Kelas & peserta",key:"instructor"}]:[]),...(user.role==="admin"?[{href:"/admin",label:"Ringkasan admin",key:"admin"},{href:"/admin/experiments",label:"Eksperimen A/B",key:"experiments"}]:[])];
  return <div className="platform"><aside className="platform-sidebar"><Link className="brand" href="/"><span className="brand-mark">I.</span> ITP Practice Lab</Link><span className="platform-caption">WORKSPACE</span><nav aria-label="Dashboard">{links.map(l=><Link aria-current={active===l.key?"page":undefined} className={active===l.key?"active":""} key={l.href} href={l.href}>{l.label}<span>↗</span></Link>)}</nav><div className="sidebar-bottom"><span className="pill complete">{user.role==="student"?"Peserta":user.role==="instructor"?"Instruktur":"Admin"}</span><strong>{user.username}</strong><DashboardActions logout/></div></aside><main className="platform-main"><header className="workspace-top"><span>ITP Practice Lab / Workspace</span><Link href="/">Beranda ↗</Link></header>{children}<footer>Materi latihan independen. Hasil latihan bukan skor atau sertifikat resmi ETS.</footer></main></div>;
}
