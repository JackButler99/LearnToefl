"use client";
import { useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function PlatformForm({action,values={},children,button="Simpan"}:{action:string;values?:Record<string,unknown>;children?:ReactNode;button?:string}) {
  const router=useRouter(), [busy,setBusy]=useState(false), [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form=event.currentTarget;
    try {
      const fields=Object.fromEntries(new FormData(form).entries());
      const response=await fetch("/api/platform",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...fields,...values,action})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Permintaan gagal.");
      form.reset(); router.refresh();
    } catch(cause) {setError(cause instanceof Error?cause.message:"Permintaan gagal.");}
    finally {setBusy(false);}
  }
  return <form className="platform-form" onSubmit={submit}>{children}<button className="button dark" disabled={busy}>{busy?"Menyimpan…":button}</button>{error&&<p role="alert" className="error-banner">{error}</p>}</form>;
}
export function AssignmentStart({id}:{id:string}) {
  const router=useRouter(),[busy,setBusy]=useState(false),[error,setError]=useState("");
  return <><button disabled={busy} className="button dark" onClick={async()=>{
    setBusy(true);setError("");
    try {const r=await fetch("/api/attempts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assignmentId:id})});const data=await r.json();if(!r.ok)throw Error(data.error);router.push(`/exam/${data.id}`);}
    catch(e){setError(e instanceof Error?e.message:"Gagal membuka tugas.");setBusy(false);}
  }}>{busy?"Membuka…":"Kerjakan tugas →"}</button>{error&&<p role="alert" className="error-banner">{error}</p>}</>;
}
export function PracticePrompt({text,experimentId}:{text:string;experimentId:string|null}) {
  const element=useRef<HTMLDivElement>(null),exposed=useRef(false),pending=useRef<Promise<void>|null>(null);
  const router=useRouter(),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function exposure() {
    if(!experimentId||exposed.current)return;
    if(pending.current)return pending.current;
    pending.current=(async()=>{const r=await fetch("/api/platform",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"exposure",id:experimentId})});if(!r.ok&&r.status!==409)throw Error("Gagal memuat sesi. Muat ulang halaman lalu coba lagi.");exposed.current=true;})().finally(()=>{pending.current=null;});
    return pending.current;
  }
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))void exposure().catch(()=>{});},{threshold:.5});
    if(element.current)observer.observe(element.current);
    return()=>observer.disconnect();
    // Component is keyed by experiment ID, so assignment remains stable during a visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  return <div className="practice-prompt" ref={element}><div><span className="eyebrow">LANGKAH KECIL HARI INI</span><h2>{text}</h2><p>10 soal Structure, tanpa batas waktu. Pelajari pembahasan setelah selesai.</p></div><button className="button primary" disabled={busy} onClick={async()=>{
    setBusy(true);setError("");
    try {await exposure();const r=await fetch("/api/attempts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"practice",section:"structure"})});const data=await r.json();if(!r.ok)throw Error(data.error);router.push(`/exam/${data.id}`);}
    catch(e){setError(e instanceof Error?e.message:"Gagal memulai.");setBusy(false);}
  }}>{busy?"Menyiapkan…":"Mulai latihan →"}</button>{error&&<p role="alert" className="error-banner">{error}</p>}</div>;
}
