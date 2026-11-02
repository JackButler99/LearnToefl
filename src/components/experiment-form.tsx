"use client";
import { useState } from "react";
import { samplePerArm } from "@/lib/statistics";
import { PlatformForm } from "./platform-controls";

export function ExperimentForm() {
  const [baseline,setBaseline]=useState(.2),[mde,setMde]=useState(.1);
  let size:number|null=null;
  try { size=samplePerArm(baseline,mde); } catch {}
  return <PlatformForm action="createExperiment" button="Simpan rencana eksperimen"><label>Nama eksperimen<input name="name" required maxLength={100} placeholder="Ajakan latihan: manfaat vs rutinitas"/></label><label>Hipotesis<textarea name="hypothesis" required minLength={10} maxLength={1000} placeholder="Menjelaskan manfaat latihan akan meningkatkan penyelesaian dibanding ajakan membangun rutinitas."/></label><div className="form-columns"><label>Varian A — kontrol<input name="control" required maxLength={160} defaultValue="Mulai latihan singkat, 10 soal hari ini."/></label><label>Varian B — perlakuan<input name="treatment" required maxLength={160} defaultValue="Temukan pola kesalahanmu lewat 10 soal Structure."/></label></div><div className="form-columns three"><label>Baseline (0–1)<input type="number" name="baseline" min="0.001" max="0.999" step="0.001" required value={baseline} onChange={e=>setBaseline(Number(e.target.value))}/><small>0,20 berarti 20% menyelesaikan latihan.</small></label><label>MDE absolut (0–1)<input type="number" name="mde" min="0.001" max="0.999" step="0.001" required value={mde} onChange={e=>setMde(Number(e.target.value))}/><small>0,10 berarti kenaikan 10 poin persentase.</small></label><label>Durasi minimum (hari)<input name="minDays" type="number" min={7} max={90} defaultValue={14} required/></label></div><div className="plan-preview"><strong>{size?`${size.toLocaleString("id-ID")} peserta matang per varian`:"Periksa baseline dan MDE"}</strong><p>Alokasi 50:50 · alpha 5% dua sisi · power 80% · observasi 7 hari. Target adalah jumlah pengguna yang benar-benar melihat ajakan dan melewati jendela observasi, bukan jumlah kunjungan.</p></div></PlatformForm>;
}
