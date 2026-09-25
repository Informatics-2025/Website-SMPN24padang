# Website Resmi SMP Negeri 24 Padang

> Cerdas, Terampil, dan Berbudaya Lingkungan.

Selamat datang di repositori resmi Website SMP Negeri 24 Padang. Proyek ini adalah representasi digital dari visi dan misi **SMPN 24 Padang** sebagai Sekolah Adiwiyata Mandiri Nasional, Sekolah Ramah Anak, dan Sekolah Siaga Kependudukan.

## 🚀 Tentang Proyek

Website ini dikembangkan sebagai media informasi digital yang menyajikan berita, pengumuman, dokumentasi kegiatan, serta layanan akademik bagi siswa, guru, dan masyarakat.

Proyek ini merupakan hasil kerja praktik mahasiswa **Universitas Putra Indonesia "YPTK" Padang**, Program Studi Teknik Informatika. Kami mempersembahkannya sebagai kontribusi nyata dalam mendukung digitalisasi pendidikan sekaligus sebagai **kenang-kenangan dan warisan digital** dari kami untuk SMPN 24 Padang.

## ✨ Visi Proyek

Proyek ini dirancang tidak hanya sebagai sumber informasi, tetapi sebagai sebuah **ekosistem digital** yang menghubungkan seluruh komunitas sekolah siswa, guru, orang tua, dan masyarakat luas. Dibangun dengan presisi arsitektural dan visi jangka panjang, website ini bertujuan untuk menjadi fondasi digital yang adaptif, aman, dan berkelanjutan.

## 📜 Lisensi & Arsitektur

- **Lisensi**: Proyek ini dilisensikan di bawah **[MIT License](LICENSE)**. Anda bebas menggunakan, memodifikasi, dan mendistribusikan kode ini dengan menyertakan pemberitahuan hak cipta asli.
- **Arsitektur**: Untuk pemahaman mendalam mengenai struktur teknis, dependensi, dan pola desain yang digunakan, silakan merujuk ke dokumen **[architecture.md](architecture.md)**.

---

## 🛠️ Fondasi Teknologi

Kualitas sebuah bangunan digital ditentukan oleh fondasinya. Proyek ini dibangun di atas tumpukan teknologi modern yang dipilih untuk performa, skalabilitas, dan keandalan.

| Kategori           | Teknologi                                                                                        | Deskripsi                                                                                  |
| :----------------- | :----------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **Core Framework** | [Next.js 14](https://nextjs.org/)                                                                | Framework React dengan App Router untuk rendering sisi server dan performa optimal.        |
| **Bahasa**         | [TypeScript](https://www.typescriptlang.org/)                                                    | Menjamin _type safety_ dan skalabilitas kode untuk pengembangan jangka panjang.            |
| **UI & Styling**   | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)                    | Desain modern dan konsisten dengan _utility-first CSS_ dan komponen UI yang _reusable_.    |
| **ORM & Database** | [Drizzle ORM](https://orm.drizzle.team/), [Vercel Postgres](https://vercel.com/storage/postgres) | Interaksi database yang aman dan efisien dengan skema yang terdefinisi secara eksplisit.   |
| **Otentikasi**     | [Auth.js (NextAuth.js)](https://authjs.dev/)                                                     | Sistem otentikasi yang aman dan fleksibel untuk melindungi rute dan data sensitif.         |
| **Deployment**     | [Vercel](https://vercel.com/)                                                                    | Platform _serverless_ untuk deployment yang cepat, andal, dan terintegrasi dengan Next.js. |

---

## 🌟 Tim Pengembang

Proyek ini merupakan hasil kolaborasi mahasiswa yang bekerja sama dengan penuh tanggung jawab untuk menghadirkan solusi digital bagi SMP Negeri 24 Padang.
Setiap anggota tim memiliki peran dan kontribusi yang saling melengkapi, sehingga proyek ini dapat terselesaikan dengan baik dan menjadi pengalaman berharga bagi semua yang terlibat.

| Nama                       | Peran                               | Tanggung Jawab                                                                                                                                                                    |
| :------------------------- | :---------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ikhwan Ramdhan**         | **Ketua Tim & Fullstack Developer** | Memimpin jalannya proyek, mendukung keseluruhan pengembangan, menjembatani komunikasi antara tim dengan pihak sekolah, serta menangani proses deploy agar website siap digunakan. |
| **Aldi Syaputra**          | **Backend & Keamanan Sistem**       | Mengembangkan logika sisi server dan memastikan keamanan sistem agar layanan tetap stabil dan terlindungi.                                                                        |
| **Aira Afriandi**          | **Frontend Developer**              | Membangun antarmuka pengguna yang responsif dan mudah digunakan, sekaligus menjaga konsistensi desain.                                                                            |
| **Muhammada Rafi Saputra** | **Database Administrator**          | Mendesain dan mengelola basis data agar tetap terstruktur, cepat, dan andal dalam mendukung aplikasi.                                                                             |
| **Muhammad Habib**         | **Backend Developer & Tester**      | Mengembangkan fitur sisi server, melakukan pengujian fungsionalitas sistem, serta membantu dokumentasi teknis.                                                                    |

---

## 📂 Struktur & Arsitektur Proyek

Arsitektur proyek ini dirancang agar modular, mudah dipahami, dan skalabel untuk pengembangan di masa depan.

```
.
├── drizzle/         # Skema dan migrasi database (Drizzle ORM)
├── public/          # Aset statis (gambar, ikon, font)
└── src/
    ├── app/         # Arsitektur utama Next.js 14 (App Router)
    │   ├── (pages)/ # Direktori untuk halaman publik (e.g., /berita, /profil)
    │   │   ├── page.tsx       # Komponen UI utama untuk sebuah rute
    │   │   └── actions.ts     # Server Actions untuk mutasi data
    │   ├── admin/   # Grup rute untuk dasbor admin yang dilindungi
    │   ├── api/     # API Routes untuk endpoint kustom
    │   ├── layout.tsx         # Layout utama aplikasi
    │   └── page.tsx           # Halaman utama (homepage)
    ├── components/  # Komponen React yang dapat digunakan kembali
    │   ├── ui/      # Komponen UI dasar dari shadcn/ui
    │   └── ...      # Komponen spesifik fitur
    ├── lib/         # Logika bisnis, utilitas, dan konfigurasi
    │   ├── auth.ts  # Konfigurasi Auth.js (NextAuth)
    │   ├── db/      # Inisialisasi dan koneksi Drizzle ORM
    │   └── utils.ts # Fungsi helper umum
    └── types/       # Definisi tipe TypeScript kustom
```

---

## 🙏 Ucapan Terima Kasih

Keberhasilan proyek ini tidak lepas dari dukungan, bimbingan, dan kepercayaan yang luar biasa dari berbagai pihak. Dengan tulus, kami mengucapkan terima kasih kepada:

- **Ibu Hasyuni Harti, M.Pd**, selaku Kepala Sekolah SMPN 24 Padang, atas kesempatan dan kepercayaan yang diberikan kepada kami.
- **Bapak Muhammad Rajab, MA**, selaku Wakil Kurikulum, atas arahan dan bimbingan yang sangat berharga selama proses pengembangan.
- Seluruh **staf Tata Usaha dan majelis guru** atas pengalaman yang diberikan selama masa PKL.
- Rekan-rekan **PLK guru muda Universitas Negeri Padang** periode Juli-Desember 2025, atas kolaborasi dan semangat kebersamaannya.

Kolaborasi ini adalah pengalaman yang tak ternilai bagi kami. Semoga website ini dapat menjadi jembatan digital yang bermanfaat bagi seluruh warga sekolah.
