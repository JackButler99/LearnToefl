# LearnToefl MVP — panduan patch lokal

Patch ini dikembangkan dari `JackButler99/LearnToefl`, branch `main`, commit
`6261230014aa3cba394bdf9722092d5e6317c251` (sumber dibaca 24 Oktober 2026).
Tidak ada perubahan yang dipush ke GitHub. Tidak ada deployment atau akun
admin produksi yang dibuat. Patch tidak berisi database, rahasia, atau akun demo.

## 1. Backup sebelum menerapkan

Pastikan Node.js **24.15 atau lebih baru** tersedia. Hentikan server lokal
sebelum menyalin database SQLite, termasuk file WAL/SHM bila ada.

Periksa perubahan lokal. Simpan pekerjaan yang belum dicommit sebelum
melanjutkan; branch backup hanya melindungi versi yang sudah dicommit.

```sh
git status --short
git branch backup/pre-mvp-2026-10-24
git switch -c feature/learning-platform-mvp
```

Jika branch tersebut sudah ada, gunakan nama baru. Salin seluruh folder `data/`
ke lokasi backup terpisah. Jika memakai `DATA_DIR`, salin direktori tersebut.
Salinan kode lama yang disertakan dalam paket bukan backup database pengguna.

## 2. Terapkan patch

Jalankan dari root repositori. Ganti lokasi patch sesuai tempat unduhanmu:

```sh
git apply --check /lokasi/unduhan/learn-toefl-mvp.patch
git apply /lokasi/unduhan/learn-toefl-mvp.patch
npm ci
npm run typecheck
npm test
npm run build
npm run test:smoke
npm run dev
```

Jika `git apply --check` gagal, berhenti dan periksa perbedaan versi lokal;
jangan pakai pemaksaan atau menghapus perubahan lokal. Commit dasar dapat
diperiksa dengan `git log -1 --oneline`. Paket ini juga menyediakan salinan kode
asal untuk pembandingan, tanpa node_modules atau riwayat Git lengkap.

Migrasi berlangsung otomatis saat database pertama kali dibuka. Migrasi
menambahkan kolom dan tabel di dalam transaksi; akun lama mendapat peran
`student`, password dan jawaban lama dipertahankan. Tidak ada migrasi turun
otomatis. Coba dahulu pada salinan database sebelum memakai data penting.

## 3. Siapkan admin pertama

Daftarkan akunmu melalui `/login`. Pendaftaran publik selalu menghasilkan
peserta, walaupun seseorang menambahkan parameter `role` pada request.

Dengan `DATA_DIR` yang sama seperti aplikasi, jalankan:

```sh
npm run admin:grant -- username_kamu admin
```

Muat ulang `/admin`. Perintah ini membutuhkan akses lokal pengelola server;
tidak ada endpoint publik untuk membuat admin. Tidak ada password bawaan.
Peran dibaca ulang dari database pada setiap request. Jangan menjalankan
perintah tersebut pada database produksi tanpa sengaja.

## 4. Alur tiga peran

### Peserta / B2C: `/dashboard`

- Ringkasan sesi, akurasi jawaban sesi selesai, dan riwayat latihan.
- Latihan mandiri/simulasi lama tetap tersedia beserta timer dan penyimpanan.
- Gabung kelas menggunakan kode 16 karakter dari instruktur.
- Mengerjakan tugas, melanjutkan satu attempt per tugas, dan melihat hasil.
- Mengajukan akses instruktur dengan nama lembaga.
- Akurasi dashboard bukan skor TOEFL, kemampuan terkalibrasi, atau ukuran
  peningkatan belajar. Soal yang belum dijawab dalam sesi selesai masuk
  penyebut akurasi; sesi aktif tidak dihitung.

### Instruktur / B2B: `/instructor`

1. Peserta mengajukan akses dari dashboard.
2. Admin memeriksa dan menyetujui dari `/admin`.
3. Instruktur membuat kelas dan membagikan kode secara privat.
4. Instruktur memberikan latihan Listening, Structure, atau Reading (10 soal).
5. Peserta yang bergabung mendapatkan tugas di dashboard.
6. Instruktur melihat peserta, status, jumlah dijawab, dan hasil tugas selesai.

Satu kelas dimiliki satu instruktur pada MVP. Instruktur lain tidak bisa
membuat tugas di kelas tersebut atau membaca laporan kelasnya. Riwayat latihan
mandiri peserta tidak dimasukkan ke laporan kelas. Peserta diberi tahu bahwa
hasil tugas terlihat oleh instruktur. Kode gabung adalah undangan: siapa pun
yang mendapatkannya dan punya akun peserta dapat bergabung.

Tenggat membatasi **pembuatan attempt baru**; attempt yang sudah dibuat dapat
diteruskan setelah tenggat. Satu attempt per peserta/tugas. Semua peserta
mengerjakan bank latihan awal yang sama; belum ada paket soal unik per tugas.
Untuk tenggat, masukkan ISO 8601 dengan zona waktu, misalnya
`2026-12-01T17:00:00+07:00`. Tampilan laporan menggunakan WIB.

### Admin: `/admin`, `/admin/experiments`

- Ringkasan akun, kelas, sesi selesai, dan eksperimen berjalan.
- Persetujuan/penolakan akses instruktur.
- Inventaris bank soal awal, daftar 50 akun terbaru, dan 20 jejak tindakan.
- Perencanaan, peluncuran, jeda, penutupan, analisis, dan ekspor agregat A/B.

Bank soal masih disunting melalui `src/lib/questions.ts` dan review kode.
Belum ada editor soal/CMS, alur reviewer materi, atau kalibrasi psikometrik.

## 5. Kontrak eksperimen A/B

**Area MVP:** teks judul kartu latihan Structure di `/dashboard`.
Kedua varian memakai tombol, materi, dan alur latihan yang sama.
Eksperimen ini menguji teks ajakan, bukan algoritma pembelajaran adaptif.

- Peserta terautentikasi mendapat A/B 50:50 secara deterministik dari hash
  ID eksperimen dan ID akun. Assignment disimpan; reload tidak mengundi ulang.
- Instruktur dan admin tidak masuk eksperimen.
- Satu eksperimen berjalan atau dijeda per area; tidak ada tumpang tindih aktif.
- Eksperimen berikutnya juga menunggu seluruh jendela observasi eksperimen
  sebelumnya selesai, untuk mengurangi kontaminasi paparan antarpercobaan.
- Paparan dicatat ketika minimal 50% kartu terlihat melalui IntersectionObserver.
  Pencatatan idempotent. Klik tombol menunggu upaya pencatatan paparan.
  Gangguan pengiriman dapat membuat paparan tidak tercatat; alokasi vs paparan
  ditampilkan terpisah untuk membantu diagnosis.
- Hanya server yang mencatat start dan completion; klien tidak mengirim
  status konversi atau varian pilihannya sendiri.
- **Metrik primer:** proporsi peserta terpapar yang menyelesaikan satu latihan
  mandiri (seluruh 10 soal dijawab) dalam 7 x 24 jam setelah paparan pertama.
  Latihan tersebut harus dimulai setelah paparan. Tidak perlu semua jawaban
  benar. Satu pengguna dihitung maksimal sekali. Tugas kelas, simulasi penuh,
  dan latihan yang dimulai sebelum paparan tidak dihitung.
- **Metrik sekunder:** proporsi mulai latihan, deskriptif pada kohort matang.
- Pengguna yang tidak kembali tetap berada di penyebut setelah 7 hari;
  mereka tidak dikeluarkan karena tidak memulai atau tidak menyelesaikan.
- Baseline dan MDE absolut dimasukkan sebelum mulai. `0.20` = baseline 20%;
  `0.10` = kenaikan yang ingin dideteksi sebesar 10 poin persentase.
- Target sampel memakai pendekatan dua proporsi independen: alpha 5% dua sisi,
  power 80%, alokasi seimbang. Pada baseline 20% dan MDE 10 pp: 294 per varian.
- Nama, hipotesis, varian, baseline, MDE, dan durasi dikunci saat draft dibuat.
  Jika salah, buat draft baru; jangan mengedit rencana langsung di database.
- Aturan penutupan: target paparan **kedua varian** terpenuhi dan durasi
  minimum tercapai. Sistem menutup otomatis pada request dashboard/paparan/
  laporan berikutnya; ini pemeriksaan berbasis traffic, bukan job terjadwal.
  Keputusan penutupan tidak melihat perbedaan hasil.
- Setelah ditutup, hasil tetap menunggu seluruh paparan menyelesaikan
  observasi 7 hari dan target kohort matang terpenuhi. Outcome yang terjadi
  selama jendela tetap diterima meskipun eksperimen sudah ditutup.
- Jeda mengembalikan kartu default dan menahan paparan baru. Penutupan manual
  permanen atau eksperimen yang pernah dijeda selalu diberi label eksploratif.
  Sistem tidak menetapkan pemenang untuk eksperimen tersebut.
- Interval perbedaan absolut B-A menggunakan metode Newcombe dengan interval
  Wilson 95%. SRM memakai chi-square alokasi A/B (df=1), ambang p<0.01 setelah
  setidaknya 20 assignment. SRM menahan keputusan, bukan memperbaiki data.
- Saat berjalan semua hasil deskriptif. Kesimpulan perbedaan baru muncul untuk
  eksperimen yang berhenti sesuai rencana, matang, cukup durasi/sampel, lolos
  SRM, dan interval tidak melintasi nol. Tidak signifikan bukan bukti setara.
- Ekspor CSV hanya berisi agregat A/B, tanpa identitas peserta.

**Batas interpretasi:** pengukuran paparan bergantung browser; SRM tidak
mendeteksi semua bentuk bias paparan; belum ada consent workflow khusus,
holdout permanen, koreksi lintas banyak eksperimen, CUPED, sequential testing,
multivariate/bandit, segmentasi kausal, atau evaluasi psikometri. Tidak ada
metrik revenue karena billing belum dibuat. Jangan menggunakan hasil untuk
menjamin peningkatan kemampuan atau kelulusan. Pada traffic kecil, eksperimen
mungkin membutuhkan waktu lama dan tidak menghasilkan kesimpulan.

## 6. Operasional dan cakupan MVP

- Database tetap SQLite, cocok untuk uji lokal dan satu server Node persisten.
  Tidak ada kebutuhan object storage, upload file klien, atau API AI berbayar.
- Akun, enrollment, dan hasil tersimpan di disk; hosting dengan filesystem
  sementara/serverless memerlukan migrasi ke database persisten dahulu.
- Ada pemeriksaan role dan kepemilikan server-side, same-origin untuk mutasi,
  batas body JSON 24 KB, rate limit autentikasi dan pembuatan/pengelolaan sesi.
  Batas autentikasi global berbagi satu database: 120/menit; per username
  12/15 menit. Ini dasar MVP, bukan pengganti mitigasi abuse di reverse proxy.
- Gunakan HTTPS ketika dipublikasikan. Email verification, password recovery,
  billing/payment, multi-instructor organization, pengelolaan keluar kelas,
  rotasi kode undangan, ekspor data pribadi, dan dashboard finansial belum ada.
- Materi tetap TOEFL ITP awal: 140 soal. CASN, UTBK, TPA, IELTS belum ditambahkan.
  Audio listening masih speech synthesis browser dan perlu review sebelum
  klaim produk komersial yang lebih kuat.
- Dependensi diperbarui dalam seri Next 15 dan PostCSS override untuk perbaikan
  advisory yang ditemukan saat implementasi. Gunakan lockfile yang disertakan.

## 7. Verifikasi yang tersedia

`npm test` menjalankan pengujian Node/tsx dengan database sementara yang dibuang
setelah tes. Tes mencakup migrasi idempotent, role, akses antarkelas, tugas,
privasi hasil latihan pribadi, batas tenggat, alokasi eksperimen, paparan unik,
konversi server, jendela observasi, penutupan sesuai rencana, interval, SRM,
permintaan terlalu besar, origin, dan rate limit.

Periksa juga secara manual: daftar akun, grant admin, ajukan instruktur,
setujui, buat kelas, gabung sebagai peserta kedua, bagikan tugas, selesaikan,
dan lihat laporan. Buat eksperimen lalu buka dashboard peserta untuk melihat
assignment dan paparan pertama. Tidak ada seed metrik bisnis palsu.

`npm run test:smoke` menjalankan build produksi yang sudah dibuat pada port
lokal sementara dengan database baru di direktori temp. Tes ini membuat akun
uji, menguji dashboard dan endpoint HTTP, lalu mematikan server serta menghapus
database uji. Tidak menyentuh `DATA_DIR` aplikasi atau database pengguna.

Hasil verifikasi saat patch dibuat:

- 12 tes unit/integrasi domain lulus.
- Smoke HTTP produksi lulus untuk autentikasi, penolakan eskalasi peran,
  isolasi kelas, penyelesaian tugas, tiga dashboard, paparan, dan ekspor admin.
- TypeScript dan penerapan `git apply --check` pada salinan upstream asli lulus.
- Build produksi lulus. Sandbox pengembangan tidak menyediakan probe RSS
  Node (`uv_resident_set_memory`), sehingga build dan smoke di sini memakai
  shim sementara untuk telemetri memori saja. Shim tidak disertakan dalam patch
  dan tidak mengubah logika aplikasi. Jalankan build biasa di mesin lokalmu.
- Audit dependensi produksi melaporkan nol kerentanan saat pemeriksaan.
- Review visual melalui browser interaktif belum dilakukan.

## 8. Kembali ke versi lama

Hentikan aplikasi. Gunakan branch backup kode dan salinan folder database yang
dibuat sebelum migrasi. Jangan menghapus database aktif atau melakukan reset
paksa untuk mencoba membatalkan patch. Data aktivitas yang dibuat setelah
upgrade tidak otomatis tersedia dalam salinan database lama.
