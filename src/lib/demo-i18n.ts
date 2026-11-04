/** Demo UI copy only. Exam content and dialogue always stay in English. */
export type DemoLocale = "en" | "id";
export const defaultDemoLocale: DemoLocale = "en";
export const demoLocaleStorageKey = "itp-portfolio-language";
export function isDemoLocale(value: unknown): value is DemoLocale { return value === "en" || value === "id"; }
type Message = {id: string; en: string; one?: string};
export const demoMessages: readonly Message[] = [
  {
    "id": "Ringkasan",
    "en": "Overview"
  },
  {
    "id": "Paket latihan",
    "en": "Practice library"
  },
  {
    "id": "Ruang latihan",
    "en": "Practice room"
  },
  {
    "id": "Bank soal",
    "en": "Question bank"
  },
  {
    "id": "Kelas & peserta",
    "en": "Classes & learners"
  },
  {
    "id": "Analitik pembelajaran",
    "en": "Learning analytics"
  },
  {
    "id": "Eksperimen A/B",
    "en": "A/B experiments"
  },
  {
    "id": "Demo direset. Semua data kembali ke contoh awal.",
    "en": "Demo reset. All sample data has been restored."
  },
  {
    "id": "Lewati navigasi",
    "en": "Skip navigation"
  },
  {
    "id": "Belajar dengan arah.",
    "en": "Learn with direction."
  },
  {
    "id": "PORTFOLIO INTERAKTIF",
    "en": "INTERACTIVE PORTFOLIO"
  },
  {
    "id": "Menu demo",
    "en": "Demo menu"
  },
  {
    "id": "Navigasi demo",
    "en": "Demo navigation"
  },
  {
    "id": "RUANG KERJA",
    "en": "WORKSPACE"
  },
  {
    "id": "Satu produk, tiga perspektif.",
    "en": "One product, three perspectives."
  },
  {
    "id": "Ganti peran untuk menjelajahi alur belajar, pengajaran, dan pengelolaan.",
    "en": "Switch roles to explore learning, teaching, and administration."
  },
  {
    "id": "· Profil contoh",
    "en": "· Sample profile"
  },
  {
    "id": "Demo portfolio",
    "en": "Portfolio demo"
  },
  {
    "id": "Data contoh · Tanpa login",
    "en": "Sample data · No sign-in"
  },
  {
    "id": "Pilih peran demo",
    "en": "Choose demo role"
  },
  {
    "id": "Ruang kerja",
    "en": "Workspace"
  },
  {
    "id": "Reset demo",
    "en": "Reset demo"
  },
  {
    "id": "Lihat kode",
    "en": "View source"
  },
  {
    "id": "Dirancang & dikembangkan oleh Ridho Kurniawan",
    "en": "Designed & built by Ridho Kurniawan"
  },
  {
    "id": "Semua nama dan metrik adalah contoh. Latihan bukan tes resmi ETS.",
    "en": "All names and metrics are samples. Practice is not an official ETS test."
  },
  {
    "id": "LATIHAN INTERAKTIF",
    "en": "INTERACTIVE PRACTICE"
  },
  {
    "id": "Pilih satu fokus. Mulai dari sana.",
    "en": "Choose a focus. Start there."
  },
  {
    "id": "Semua paket berisi soal orisinal untuk demo. Jawaban dan hasil hanya diproses di browser.",
    "en": "Every set contains original demo questions. Answers and results are processed in your browser."
  },
  {
    "id": "Filter bagian ujian",
    "en": "Filter test sections"
  },
  {
    "id": "Semua bagian",
    "en": "All sections"
  },
  {
    "id": "Lintas bagian",
    "en": "Mixed sections"
  },
  {
    "id": "TANTANGAN",
    "en": "CHALLENGE"
  },
  {
    "id": "LATIHAN",
    "en": "PRACTICE"
  },
  {
    "id": "soal",
    "en": "questions"
  },
  {
    "id": "menit",
    "en": "min"
  },
  {
    "id": "Pembahasan",
    "en": "Explanations"
  },
  {
    "id": "Mulai latihan",
    "en": "Start practice"
  },
  {
    "id": "Estimasi waktu hanya panduan. Ini latihan singkat tanpa timer dan tanpa konversi skor TOEFL resmi.",
    "en": "Times are estimates. These short, untimed exercises do not produce official TOEFL scores."
  },
  {
    "id": "Draf",
    "en": "Draft"
  },
  {
    "id": "Tinjau",
    "en": "Review"
  },
  {
    "id": "Terbit",
    "en": "Published"
  },
  {
    "id": "MATERI & EVALUASI",
    "en": "CONTENT & ASSESSMENT"
  },
  {
    "id": "Bank soal yang terstruktur.",
    "en": "A question bank with structure."
  },
  {
    "id": "Tinjau status dan isi soal contoh. Materi ini dapat dijelajahi tanpa mengubah bank soal aplikasi.",
    "en": "Explore sample questions and their status without changing the application's question bank."
  },
  {
    "id": "Total soal contoh",
    "en": "Sample questions"
  },
  {
    "id": "Metrik tetap saat daftar difilter",
    "en": "Totals stay fixed when filtering"
  },
  {
    "id": "Jumlah seluruh status",
    "en": "Across all statuses"
  },
  {
    "id": "Filter status soal",
    "en": "Filter question status"
  },
  {
    "id": "Semua status",
    "en": "All statuses"
  },
  {
    "id": "Cari soal",
    "en": "Search questions"
  },
  {
    "id": "Cari ID, materi, atau isi soal…",
    "en": "Search by ID, skill, or question…"
  },
  {
    "id": "Bagian ujian",
    "en": "Test section"
  },
  {
    "id": "Menampilkan",
    "en": "Showing"
  },
  {
    "id": "dari",
    "en": "of"
  },
  {
    "id": "soal contoh",
    "en": "sample questions"
  },
  {
    "id": "Tidak ada soal yang cocok.",
    "en": "No matching questions."
  },
  {
    "id": "Coba kata kunci lain atau reset filter.",
    "en": "Try another search or reset the filters."
  },
  {
    "id": "Reset filter",
    "en": "Reset filters"
  },
  {
    "id": "WORKSPACE INSTRUKTUR",
    "en": "INSTRUCTOR WORKSPACE"
  },
  {
    "id": "Kenali progres setiap peserta.",
    "en": "Understand every learner's progress."
  },
  {
    "id": "Kelas contoh memperlihatkan bagaimana instruktur mendampingi latihan dan menentukan fokus berikutnya.",
    "en": "This sample class shows how instructors support practice and plan the next learning focus."
  },
  {
    "id": "Peserta ditampilkan",
    "en": "Learners shown"
  },
  {
    "id": "Data peserta sintetis",
    "en": "Synthetic learner data"
  },
  {
    "id": "Rata-rata akurasi",
    "en": "Average accuracy"
  },
  {
    "id": "Dihitung dari daftar yang tampil",
    "en": "Based on the visible learners"
  },
  {
    "id": "Latihan selesai",
    "en": "Completed exercises"
  },
  {
    "id": "Total pada kelompok terpilih",
    "en": "Total for the selected group"
  },
  {
    "id": "Kelompok contoh",
    "en": "Sample groups"
  },
  {
    "id": "Cari peserta",
    "en": "Search learners"
  },
  {
    "id": "Nama peserta contoh",
    "en": "Sample learner name"
  },
  {
    "id": "Kelompok",
    "en": "Group"
  },
  {
    "id": "Semua kelompok",
    "en": "All groups"
  },
  {
    "id": "Progres kelas",
    "en": "Class progress"
  },
  {
    "id": "Semua nama dan hasil berikut adalah data contoh",
    "en": "All names and results below are sample data"
  },
  {
    "id": "Peserta",
    "en": "Learner"
  },
  {
    "id": "Instruktur",
    "en": "Instructor"
  },
  {
    "id": "Akurasi",
    "en": "Accuracy"
  },
  {
    "id": "Fokus berikutnya",
    "en": "Next focus"
  },
  {
    "id": "latihan",
    "en": "exercises"
  },
  {
    "id": "Tidak ada peserta yang cocok.",
    "en": "No matching learners."
  },
  {
    "id": "Materi pekan ini",
    "en": "This week's lessons"
  },
  {
    "id": "Contoh rencana pengajaran",
    "en": "Sample teaching plan"
  },
  {
    "id": "Kesesuaian subjek–verba",
    "en": "Subject–verb agreement"
  },
  {
    "id": "Kenali inti subjek sebelum memilih verba.",
    "en": "Identify the core subject before choosing a verb."
  },
  {
    "id": "Membaca untuk detail",
    "en": "Reading for details"
  },
  {
    "id": "Cari bukti jawaban di dalam paragraf.",
    "en": "Find evidence for your answer in the paragraph."
  },
  {
    "id": "Mendengarkan maksud pembicara",
    "en": "Listening for intention"
  },
  {
    "id": "Bedakan makna literal dan maksud pembicara.",
    "en": "Distinguish literal meaning from the speaker's intention."
  },
  {
    "id": "Catatan instruktur",
    "en": "Instructor notes"
  },
  {
    "id": "Contoh insight dari data kelas",
    "en": "Sample insights from class data"
  },
  {
    "id": "Fokus: Structure",
    "en": "Focus: Structure"
  },
  {
    "id": "Mulai dari pola yang mendasar.",
    "en": "Start with the fundamentals."
  },
  {
    "id": "Dua peserta contoh memiliki fokus Structure. Latihan singkat dengan pembahasan dapat dipakai sebelum memberikan paket yang lebih panjang.",
    "en": "Two sample learners are focusing on Structure. Short exercises with explanations can prepare them for longer practice sets."
  },
  {
    "id": "ANALITIK PEMBELAJARAN",
    "en": "LEARNING ANALYTICS"
  },
  {
    "id": "Dari jawaban menjadi arah belajar.",
    "en": "Turn answers into a learning direction."
  },
  {
    "id": "Contoh visualisasi hasil untuk melihat pola, bukan sekadar nilai akhir.",
    "en": "Sample visualizations reveal patterns beyond the final score."
  },
  {
    "id": "Peserta contoh",
    "en": "Sample learners"
  },
  {
    "id": "Tidak mewakili pengguna nyata",
    "en": "Not real user activity"
  },
  {
    "id": "Total pada data kelas contoh",
    "en": "Total across the sample class"
  },
  {
    "id": "Dibulatkan dari lima peserta",
    "en": "Rounded across five learners"
  },
  {
    "id": "Fokus prioritas",
    "en": "Priority focus"
  },
  {
    "id": "Contoh interpretasi materi",
    "en": "Sample learning insight"
  },
  {
    "id": "Akurasi per bagian",
    "en": "Accuracy by section"
  },
  {
    "id": "Ilustrasi agregat, bukan hasil aktivitas nyata",
    "en": "Illustrative totals, not real activity"
  },
  {
    "id": "Pola materi",
    "en": "Skill patterns"
  },
  {
    "id": "Contoh peluang untuk latihan berikutnya",
    "en": "Sample opportunities for future practice"
  },
  {
    "id": "Perlu penguatan",
    "en": "Needs practice"
  },
  {
    "id": "Berkembang",
    "en": "Developing"
  },
  {
    "id": "Detail percakapan",
    "en": "Conversation details"
  },
  {
    "id": "Konsisten",
    "en": "Consistent"
  },
  {
    "id": "Inversi",
    "en": "Inversion"
  },
  {
    "id": "Gagasan utama",
    "en": "Main idea"
  },
  {
    "id": "Cara membaca analitik ini",
    "en": "How to read these analytics"
  },
  {
    "id": "Materi demo untuk memperlihatkan alur produk",
    "en": "Sample content illustrating the product workflow"
  },
  {
    "id": "Temukan pola",
    "en": "Find patterns"
  },
  {
    "id": "Bandingkan hasil per bagian dan keterampilan, lalu lihat materi yang paling membutuhkan perhatian.",
    "en": "Compare sections and skills to find the areas that need the most attention."
  },
  {
    "id": "Pilih tindakan",
    "en": "Choose an action"
  },
  {
    "id": "Gunakan temuan sebagai awal diskusi dan pilih latihan yang sesuai kebutuhan peserta.",
    "en": "Use the findings to start a discussion and choose practice that fits each learner's needs."
  },
  {
    "id": "Evaluasi kembali",
    "en": "Review progress"
  },
  {
    "id": "Amati hasil pada latihan berikutnya dengan mempertimbangkan konteks dan ukuran sampel.",
    "en": "Review future results while considering the context and sample size."
  },
  {
    "id": "WORKSPACE ADMIN · SIMULASI",
    "en": "ADMIN WORKSPACE · SIMULATION"
  },
  {
    "id": "Uji ide dengan ukuran yang jelas.",
    "en": "Test ideas with clear measures."
  },
  {
    "id": "Ubah jumlah sampel dan durasi untuk mengeksplorasi laporan A/B. Semua angka dihitung dari skenario buatan.",
    "en": "Adjust the sample size and duration to explore an A/B report. All figures use a synthetic scenario."
  },
  {
    "id": "Contoh eksperimen",
    "en": "Sample experiment"
  },
  {
    "id": "Apakah ajakan yang lebih jelas meningkatkan penyelesaian latihan?",
    "en": "Does a clearer call to action improve practice completion?"
  },
  {
    "id": "Metrik utama: peserta yang menyelesaikan latihan. Ilustrasi rencana: minimal 2.000 peserta per varian dan 14 hari, dengan pembagian 50:50.",
    "en": "Primary metric: practice completion. Example plan: at least 2,000 learners per variant over 14 days, split 50:50."
  },
  {
    "id": "Eksplorasi skenario",
    "en": "Explore the scenario"
  },
  {
    "id": "Kontrol ini hanya mengubah tampilan demo",
    "en": "These controls only change the demo"
  },
  {
    "id": "Peserta per varian",
    "en": "Learners per variant"
  },
  {
    "id": "Durasi pengamatan",
    "en": "Observation period"
  },
  {
    "id": "hari",
    "en": "days"
  },
  {
    "id": "1 hari",
    "en": "1 day"
  },
  {
    "id": "21 hari",
    "en": "21 days"
  },
  {
    "id": "Perbandingan varian",
    "en": "Compare variants"
  },
  {
    "id": "Asumsi skenario: kontrol 20%, treatment 25%",
    "en": "Scenario assumptions: control 20%, treatment 25%"
  },
  {
    "id": "Ajakan umum",
    "en": "General call to action"
  },
  {
    "id": "selesai",
    "en": "completed"
  },
  {
    "id": "Ajakan dengan manfaat",
    "en": "Benefit-led call to action"
  },
  {
    "id": "Selisih absolut yang diamati",
    "en": "Observed absolute difference"
  },
  {
    "id": "poin persentase",
    "en": "percentage points"
  },
  {
    "id": "Interval normal 95% ilustratif:",
    "en": "Illustrative 95% normal interval:"
  },
  {
    "id": "hingga",
    "en": "to"
  },
  {
    "id": "Skenario memenuhi ambang contoh.",
    "en": "The scenario meets the example thresholds."
  },
  {
    "id": "Skenario belum memenuhi rencana contoh.",
    "en": "The scenario does not yet meet the example plan."
  },
  {
    "id": "Jumlah peserta per varian masih di bawah rencana minimum.",
    "en": "The sample per variant is below the planned minimum."
  },
  {
    "id": "Ambang sampel contoh sudah terpenuhi.",
    "en": "The example sample threshold has been met."
  },
  {
    "id": "Durasi pengamatan belum mencapai 14 hari.",
    "en": "The observation period is shorter than 14 days."
  },
  {
    "id": "Durasi minimum contoh sudah terpenuhi.",
    "en": "The example minimum duration has been met."
  },
  {
    "id": "Ini ilustrasi dua proporsi, bukan mesin keputusan eksperimen production. Rencana berhenti, kualitas data, dan guardrail tetap diperlukan.",
    "en": "This illustrates two proportions; it is not a production experiment decision engine. Stopping rules, data quality, and guardrails still matter."
  },
  {
    "id": "Senin",
    "en": "Monday"
  },
  {
    "id": "Selasa",
    "en": "Tuesday"
  },
  {
    "id": "Rabu",
    "en": "Wednesday"
  },
  {
    "id": "Kamis",
    "en": "Thursday"
  },
  {
    "id": "Jumat",
    "en": "Friday"
  },
  {
    "id": "Sabtu",
    "en": "Saturday"
  },
  {
    "id": "Minggu",
    "en": "Sunday"
  },
  {
    "id": "Ritme belajarmu",
    "en": "Your learning rhythm"
  },
  {
    "id": "Minggu ini · data contoh",
    "en": "This week · sample data"
  },
  {
    "id": "7 HARI",
    "en": "7 DAYS"
  },
  {
    "id": "latihan singkat",
    "en": "short exercises"
  },
  {
    "id": "5 hari aktif",
    "en": "5 active days"
  },
  {
    "id": "Contoh aktivitas latihan selama satu minggu",
    "en": "Sample practice activity over one week"
  },
  {
    "id": "Hari istirahat",
    "en": "Rest day"
  },
  {
    "id": "Latihan harian",
    "en": "Daily practice"
  },
  {
    "id": "Langkah kecil, kemajuan berkelanjutan",
    "en": "Small steps, lasting progress"
  },
  {
    "id": "Bangun rasa percaya dirimu",
    "en": "Build your confidence"
  },
  {
    "id": "/ RUANG BELAJAR",
    "en": "/ LEARNING WORKSPACE"
  },
  {
    "id": "Beri ruang untuk kemajuan.",
    "en": "Make room for progress."
  },
  {
    "id": "Dampingi proses belajar yang bermakna.",
    "en": "Help great learning happen."
  },
  {
    "id": "Gambaran lebih jelas. Keputusan lebih baik.",
    "en": "A clearer view. Better decisions."
  },
  {
    "id": "Halo, Alya. Satu latihan kecil hari ini bisa membuatmu lebih siap besok.",
    "en": "Hi, Alya. A little practice today can help you feel more prepared tomorrow."
  },
  {
    "id": "Kenali kebutuhan peserta, pilih materi, dan dampingi setiap kemajuannya.",
    "en": "Understand learners' needs, choose materials, and support every step forward."
  },
  {
    "id": "Dari kualitas soal hingga pengalaman belajar—lihat bagaimana semuanya terhubung.",
    "en": "From question quality to the learning experience, see how everything connects."
  },
  {
    "id": "Sedikit lebih baik, setiap hari.",
    "en": "A little better, every day."
  },
  {
    "id": "LANGKAH BERIKUTNYA",
    "en": "YOUR NEXT CHAPTER"
  },
  {
    "id": "Latihan kecil.",
    "en": "Small practice."
  },
  {
    "id": "Percaya diri yang besar.",
    "en": "Greater confidence."
  },
  {
    "id": "Tiga soal, satu fokus. Kenali polanya, pilih jawabanmu, lalu pahami alasan di baliknya.",
    "en": "Three questions, one focus. Spot the patterns, choose your answers, and understand the reasoning."
  },
  {
    "id": "Mulai latihan singkat",
    "en": "Start a quick practice"
  },
  {
    "id": "3 soal orisinal",
    "en": "3 original questions"
  },
  {
    "id": "Pembahasan langsung",
    "en": "Instant explanations"
  },
  {
    "id": "Contoh progres belajarmu",
    "en": "Sample learning progress"
  },
  {
    "id": "Akurasi terakhir",
    "en": "Latest accuracy"
  },
  {
    "id": "Dari latihan yang baru selesai",
    "en": "From your latest completed practice"
  },
  {
    "id": "Contoh hasil latihan terakhir",
    "en": "Sample result from the last exercise"
  },
  {
    "id": "Ritme belajar",
    "en": "Learning streak"
  },
  {
    "id": "5 hari",
    "en": "5 days"
  },
  {
    "id": "Contoh konsistensi mingguan",
    "en": "Sample weekly consistency"
  },
  {
    "id": "Target mingguan",
    "en": "Weekly goal"
  },
  {
    "id": "Sedikit lagi menuju target",
    "en": "Getting closer to your goal"
  },
  {
    "id": "Soal dalam koleksi",
    "en": "Questions in collection"
  },
  {
    "id": "Tiga bagian pembelajaran",
    "en": "Three learning sections"
  },
  {
    "id": "Siap digunakan",
    "en": "Ready to use"
  },
  {
    "id": "Soal berstatus terbit",
    "en": "Published questions"
  },
  {
    "id": "Peserta kelas",
    "en": "Class learners"
  },
  {
    "id": "Dua kelompok contoh",
    "en": "Two sample groups"
  },
  {
    "id": "Paket interaktif",
    "en": "Interactive practice sets"
  },
  {
    "id": "Coba alur dari awal hingga akhir",
    "en": "Explore the complete practice flow"
  },
  {
    "id": "TEMUKAN FOKUSMU",
    "en": "FIND YOUR FOCUS"
  },
  {
    "id": "Satu bagian. Satu langkah maju.",
    "en": "One section. One step forward."
  },
  {
    "id": "Jelajahi semua paket",
    "en": "Explore all practice sets"
  },
  {
    "id": "DENGARKAN",
    "en": "TUNE IN"
  },
  {
    "id": "HUBUNGKAN POLANYA",
    "en": "MAKE CONNECTIONS"
  },
  {
    "id": "TELUSURI LEBIH DALAM",
    "en": "GO DEEPER"
  },
  {
    "id": "Dua suara, satu percakapan. Tangkap maksud di balik setiap respons.",
    "en": "Two voices, one conversation. Hear the intention behind each response."
  },
  {
    "id": "Dari susunan kata ke makna. Temukan pola yang membuat kalimat bekerja.",
    "en": "From word order to meaning. Find the patterns that make sentences work."
  },
  {
    "id": "Luangkan waktu untuk membaca. Temukan detail yang membuat jawaban jelas.",
    "en": "Take time to read. Find the details that make the answer clear."
  },
  {
    "id": "3 soal · Dengan pembahasan",
    "en": "3 questions · With explanations"
  },
  {
    "id": "Koleksi yang tertata",
    "en": "An organized collection"
  },
  {
    "id": "Tinjau draft, review, dan soal siap digunakan",
    "en": "Explore drafts, reviews, and published questions"
  },
  {
    "id": "Ruang untuk bereksperimen",
    "en": "Room to experiment"
  },
  {
    "id": "Setiap peserta punya cerita",
    "en": "Every learner has a story"
  },
  {
    "id": "Eksplorasi sampel, durasi, dan hasil A/B",
    "en": "Explore samples, duration, and A/B results"
  },
  {
    "id": "Lihat progres serta fokus latihan kelas",
    "en": "See class progress and learning priorities"
  },
  {
    "id": "Kemajuan kecil yang tercatat.",
    "en": "A little progress, recorded."
  },
  {
    "id": "Aktivitas contoh & hasil dari sesi demo ini",
    "en": "Sample activity & results from this demo session"
  },
  {
    "id": "PERJALANANMU",
    "en": "YOUR JOURNEY"
  },
  {
    "id": "Baru diselesaikan di browser ini",
    "en": "Just completed in this browser"
  },
  {
    "id": "Selesai",
    "en": "Completed"
  },
  {
    "id": "Contoh aktivitas sebelumnya",
    "en": "Sample previous activity"
  },
  {
    "id": "CATATAN UNTUK DIINGAT",
    "en": "A NOTE TO REMEMBER"
  },
  {
    "id": "“Kemajuan tidak harus besar.",
    "en": "“Progress doesn't have to be big."
  },
  {
    "id": "Cukup terus bergerak.”",
    "en": "Just keep moving.”"
  },
  {
    "id": "Mulai dari satu soal, pahami satu pola, lalu bawa pemahaman itu ke latihan berikutnya.",
    "en": "Start with one question, understand one pattern, and take that insight into your next practice."
  },
  {
    "id": "Coba mini challenge",
    "en": "Try the mini challenge"
  },
  {
    "id": "Dashboard ini memakai data contoh. Hasil latihanmu di sesi ini dihitung langsung dari jawaban yang dipilih.",
    "en": "This dashboard uses sample data. Results from this session are calculated from your answers."
  },
  {
    "id": "← Kembali ke paket latihan",
    "en": "← Back to practice sets"
  },
  {
    "id": "LATIHAN DEMO SELESAI",
    "en": "DEMO PRACTICE COMPLETE"
  },
  {
    "id": "Selesai satu langkah.",
    "en": "One step complete."
  },
  {
    "id": "Pahami langkah berikutnya.",
    "en": "Understand what comes next."
  },
  {
    "id": "soal dijawab",
    "en": "questions answered"
  },
  {
    "id": "Jawaban benar",
    "en": "Correct answers"
  },
  {
    "id": "% akurasi pada soal contoh ini.",
    "en": "% accuracy on these sample questions."
  },
  {
    "id": "Hasil latihan demo, bukan skor atau sertifikat TOEFL resmi.",
    "en": "Demo practice results, not an official TOEFL score or certificate."
  },
  {
    "id": "Pelajari setiap jawaban",
    "en": "Learn from every answer"
  },
  {
    "id": "Coba paket lain →",
    "en": "Try another set →"
  },
  {
    "id": "Benar",
    "en": "Correct"
  },
  {
    "id": "Belum dijawab",
    "en": "Unanswered"
  },
  {
    "id": "Perlu ditinjau",
    "en": "Needs review"
  },
  {
    "id": "Jawabanmu:",
    "en": "Your answer:"
  },
  {
    "id": "Tidak dijawab",
    "en": "Not answered"
  },
  {
    "id": "Jawaban benar:",
    "en": "Correct answer:"
  },
  {
    "id": "Mengapa jawaban ini tepat?",
    "en": "Why is this answer correct?"
  },
  {
    "id": "Jelajahi paket lain",
    "en": "Explore another set"
  },
  {
    "id": "LATIHAN ORISINAL · TANPA BATAS WAKTU",
    "en": "ORIGINAL PRACTICE · UNTIMED"
  },
  {
    "id": "Pilih jawaban yang paling tepat. Pembahasan tersedia setelah latihan selesai.",
    "en": "Choose the best answer. Explanations are available after you finish."
  },
  {
    "id": "Soal dijawab",
    "en": "Questions answered"
  },
  {
    "id": "Soal",
    "en": "Question"
  },
  {
    "id": "BACAAN",
    "en": "READING PASSAGE"
  },
  {
    "id": "← Sebelumnya",
    "en": "← Previous"
  },
  {
    "id": "Berikutnya →",
    "en": "Next →"
  },
  {
    "id": "Selesaikan latihan →",
    "en": "Finish practice →"
  },
  {
    "id": "soal belum dijawab.",
    "en": "questions are unanswered."
  },
  {
    "id": "Kamu bisa melengkapinya dahulu atau menyelesaikan latihan sekarang.",
    "en": "You can answer the remaining questions or finish now."
  },
  {
    "id": "Lanjut menjawab",
    "en": "Keep answering"
  },
  {
    "id": "Selesaikan sekarang",
    "en": "Finish now"
  },
  {
    "id": "Navigasi soal",
    "en": "Question navigator"
  },
  {
    "id": "Kamu bisa kembali ke soal sebelumnya sebelum menyelesaikan latihan.",
    "en": "You can revisit earlier questions before finishing."
  },
  {
    "id": ", sudah dijawab",
    "en": ", answered"
  },
  {
    "id": "Sudah dijawab",
    "en": "Answered"
  },
  {
    "id": "Jawaban hanya tersimpan selama sesi demo ini. Keluar dari paket atau refresh halaman akan mengulang latihan.",
    "en": "Answers are kept only for this demo session. Leaving the set or refreshing the page restarts the exercise."
  },
  {
    "id": "Sedang diputar",
    "en": "Playing"
  },
  {
    "id": "Dijeda",
    "en": "Paused"
  },
  {
    "id": "Percakapan selesai",
    "en": "Conversation finished"
  },
  {
    "id": "Siap didengarkan",
    "en": "Ready to listen"
  },
  {
    "id": "Pemutar percakapan dua pembicara",
    "en": "Two-speaker conversation player"
  },
  {
    "id": "DENGARKAN BAIK-BAIK",
    "en": "LISTEN CLOSELY"
  },
  {
    "id": "Percakapan · 2 pembicara",
    "en": "Conversation · 2 speakers"
  },
  {
    "id": "Pembicara 1",
    "en": "Speaker 1"
  },
  {
    "id": "Suara perempuan",
    "en": "Female voice"
  },
  {
    "id": "Pembicara 2",
    "en": "Speaker 2"
  },
  {
    "id": "Suara laki-laki",
    "en": "Male voice"
  },
  {
    "id": "Jeda percakapan",
    "en": "Pause conversation"
  },
  {
    "id": "Lanjutkan percakapan",
    "en": "Resume conversation"
  },
  {
    "id": "Putar percakapan",
    "en": "Play conversation"
  },
  {
    "id": "Memuat suara perangkat…",
    "en": "Loading device voices…"
  },
  {
    "id": "Suara Inggris belum tersedia",
    "en": "English voices are unavailable"
  },
  {
    "id": "Setiap pembicara memakai suara pilihannya.",
    "en": "Each speaker uses the selected voice."
  },
  {
    "id": "Dengarkan dahulu, kemudian pilih jawaban.",
    "en": "Listen first, then choose your answer."
  },
  {
    "id": "Ulangi percakapan",
    "en": "Replay conversation"
  },
  {
    "id": "Hentikan percakapan",
    "en": "Stop conversation"
  },
  {
    "id": "Browser ini belum mendukung speech. Transkrip tersedia di bawah.",
    "en": "This browser does not support speech. A transcript is available below."
  },
  {
    "id": "Perangkat hanya menyediakan satu suara Inggris. Tambahkan suara English lain di sistem untuk dialog dua suara.",
    "en": "Your device offers only one English voice. Add another English system voice for two-voice dialogue."
  },
  {
    "id": "Aktifkan suara English di browser/perangkat atau gunakan transkrip.",
    "en": "Enable an English voice on your device or use the transcript."
  },
  {
    "id": "Kedua pembicara memakai suara yang sama. Pilih suara berbeda di pengaturan.",
    "en": "Both speakers use the same voice. Choose different voices in settings."
  },
  {
    "id": "Dua suara berbeda sudah dipilih. Browser tidak memberi informasi gender; sesuaikan suara perempuan dan laki-laki lewat pengaturan.",
    "en": "Two different voices are selected. Browsers do not report gender; adjust the female and male voices in settings."
  },
  {
    "id": "Sembunyikan transkrip",
    "en": "Hide transcript"
  },
  {
    "id": "Tampilkan transkrip",
    "en": "Show transcript"
  },
  {
    "id": "Pengaturan suara",
    "en": "Voice settings"
  },
  {
    "id": "Perempuan",
    "en": "Female"
  },
  {
    "id": "Suara pembicara perempuan",
    "en": "Female speaker voice"
  },
  {
    "id": "Belum tersedia",
    "en": "Unavailable"
  },
  {
    "id": "Laki-laki",
    "en": "Male"
  },
  {
    "id": "Suara pembicara laki-laki",
    "en": "Male speaker voice"
  },
  {
    "id": "Kecepatan",
    "en": "Speed"
  },
  {
    "id": "Kecepatan percakapan",
    "en": "Conversation speed"
  },
  {
    "id": "0.8× · Lebih pelan",
    "en": "0.8× · Slower"
  },
  {
    "id": "0.92× · Santai",
    "en": "0.92× · Relaxed"
  },
  {
    "id": "1× · Normal",
    "en": "1× · Normal"
  },
  {
    "id": "Suara ditentukan oleh perangkat. Nama suara dipakai sebagai petunjuk awal; pilihan dapat disesuaikan.",
    "en": "Voices depend on your device. Names guide the initial choices; you can change them."
  },
  {
    "id": "Narator",
    "en": "Narrator"
  },
  {
    "id": "Browser speech · dialog orisinal untuk latihan demo",
    "en": "Browser speech · original dialogue for demo practice"
  },
  {
    "id": "DENGAR PERBEDAANNYA",
    "en": "HEAR THE DIFFERENCE"
  },
  {
    "id": "TEMUKAN POLANYA",
    "en": "FIND THE PATTERN"
  },
  {
    "id": "BACA MAKNA TERSIRATNYA",
    "en": "READ BETWEEN THE LINES"
  },
  {
    "id": "HUBUNGKAN SEMUANYA",
    "en": "CONNECT IT ALL"
  },
  {
    "id": "Tiga pola kalimat yang sering membuat ragu. Latih ketelitianmu, lalu pelajari alasannya.",
    "en": "Three sentence patterns that can cause hesitation. Practise carefully, then learn why each answer works."
  },
  {
    "id": "Baca dua paragraf singkat, kemudian cari gagasan utama, detail, dan makna kata.",
    "en": "Read two short paragraphs, then identify the main idea, details, and word meanings."
  },
  {
    "id": "Ikuti percakapan dua pembicara dengan pilihan suara, jeda, dan transkrip yang bisa dibuka saat dibutuhkan.",
    "en": "Follow a two-speaker conversation with voice selection, pause controls, and an optional transcript."
  },
  {
    "id": "Enam soal lintas bagian untuk mencoba alur latihan dari awal sampai pembahasan.",
    "en": "Six questions across sections to explore the full flow from practice to explanations."
  },
  {
    "id": "Maksud pembicara",
    "en": "Speaker intention"
  },
  {
    "id": "Rencana & saran",
    "en": "Plans & suggestions"
  },
  {
    "id": "Inferensi",
    "en": "Inference"
  },
  {
    "id": "Suara tidak dapat diputar. Coba suara lain di Pengaturan suara atau baca transkrip.",
    "en": "Audio could not play. Choose another voice in Voice settings or read the transcript."
  },
  {
    "id": "Bahasa",
    "en": "Language"
  },
  {
    "id": "{count} latihan selesai",
    "en": "{count} completed exercises",
    "one": "{count} completed exercise"
  },
  {
    "id": "{count} latihan",
    "en": "{count} exercises",
    "one": "{count} exercise"
  },
  {
    "id": "{count} baru di sesi ini",
    "en": "{count} new this session"
  },
  {
    "id": "{count} hari",
    "en": "{count} days",
    "one": "{count} day"
  },
  {
    "id": "Soal {number} dari {total}",
    "en": "Question {number} of {total}"
  },
  {
    "id": "{answered} dari {total} soal dijawab",
    "en": "{answered} of {total} questions answered"
  },
  {
    "id": "Menampilkan {shown} dari {total} soal contoh",
    "en": "Showing {shown} of {total} sample questions"
  },
  {
    "id": "{count} soal belum dijawab.",
    "en": "{count} questions are unanswered.",
    "one": "{count} question is unanswered."
  },
  {
    "id": "{count} soal",
    "en": "{count} questions",
    "one": "{count} question"
  },
  {
    "id": "{day}: {count} latihan",
    "en": "{day}: {count} exercises",
    "one": "{day}: {count} exercise"
  },
  {
    "id": "{done} dari {total} selesai",
    "en": "{done} of {total} completed"
  },
  {
    "id": "{value}% akurasi pada soal contoh ini.",
    "en": "{value}% accuracy on these sample questions."
  },
  {
    "id": "Structure dasar",
    "en": "Structure essentials"
  },
  {
    "id": "Reading: kebun kota",
    "en": "Reading: urban gardens"
  },
  {
    "id": "Percakapan sehari-hari",
    "en": "Everyday conversations"
  },
  {
    "id": "Tantangan mini",
    "en": "Mini challenge"
  },
  {
    "id": "Reading: mengenali detail",
    "en": "Reading: identifying details"
  },
  {
    "id": "Structure: kesesuaian subjek–verba",
    "en": "Structure: subject–verb agreement"
  },
  {
    "id": "Klausa adjektiva yang dipersingkat",
    "en": "Reduced adjective clause"
  },
  {
    "id": "Struktur paralel",
    "en": "Parallel structure"
  },
  {
    "id": "Kosakata dalam konteks",
    "en": "Vocabulary in context"
  }
];
const messages = new Map<string, Message>();
for (const message of demoMessages) {
  messages.set(message.id, message);
  messages.set(message.en, message);
  if (message.one) messages.set(message.one, message);
}
export type DemoValues = Record<string, string | number>;
export function translateDemo(source: string, locale: DemoLocale, values: DemoValues = {}): string {
  const key = source.trim(), message = messages.get(key);
  const copy = message ? (locale === "id" ? message.id : values.count === 1 && message.one ? message.one : message.en) : key;
  const translated = copy.replace(/\{(\w+)\}/g, (token, name: string) => Object.hasOwn(values, name) ? String(values[name]) : token);
  return source.slice(0, source.indexOf(key)) + translated + source.slice(source.indexOf(key) + key.length);
}
export function formatDemoNumber(value: number, locale: DemoLocale, digits = 0): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {minimumFractionDigits: digits, maximumFractionDigits: digits}).format(value);
}
