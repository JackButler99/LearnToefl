"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, username: form.get("username"), password: form.get("password") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Tidak dapat masuk.");
      router.push("/"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Tidak dapat masuk."); setBusy(false); }
  }
  return <div className="auth-card"><Link href="/" className="back-link">← Kembali ke beranda</Link><span className="eyebrow">AKUN BELAJAR</span><h2>{mode === "register" ? "Mulai dari sini." : "Selamat datang kembali."}</h2><p>{mode === "register" ? "Simpan progresmu dan pelajari setiap hasil latihan." : "Lanjutkan latihanmu dari titik terakhir."}</p>
    <div className="segmented"><button type="button" className={mode === "register" ? "selected" : ""} onClick={() => { setMode("register"); setError(""); }}>Daftar</button><button type="button" className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setError(""); }}>Masuk</button></div>
    <form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" placeholder="nama_pengguna" /></label><label>Kata sandi<input name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 10 : 1} placeholder="Minimal 10 karakter untuk akun baru" /></label>
      {error && <p className="error-banner" role="alert">{error}</p>}
      <button className="button primary full" disabled={busy}>{busy ? "Memproses..." : mode === "register" ? "Buat akun" : "Masuk"} <span>→</span></button></form>
    <small>Simulasi ini untuk latihan pribadi dan tidak menerbitkan skor resmi.</small></div>;
}
