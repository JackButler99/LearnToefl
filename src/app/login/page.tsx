import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage() {
  if (await getUser()) redirect("/");
  return <main className="auth-layout"><div className="auth-aside"><Link href="/" className="brand white"><span className="brand-mark">I.</span> ITP Practice Lab</Link><div><span className="eyebrow">BUAT KEMAJUAN TERLIHAT</span><h1>Small steps.<br /><em>Stronger English.</em></h1><p>Satu latihan pada satu waktu, sampai kamu siap menghadapi simulasi penuh.</p></div><span>Latihan mandiri dengan soal orisinal.</span></div><div className="auth-main"><AuthForm /></div></main>;
}
