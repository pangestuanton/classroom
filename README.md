# Antugas — Academic Productivity Dashboard

**Antugas** adalah aplikasi asisten akademik modern berbasis **Next.js (App Router)** dan **TypeScript** yang dirancang sebagai pusat manajemen produktivitas mahasiswa. Aplikasi ini membantu mengelola tugas perkuliahan melalui integrasi langsung dengan **Google Classroom API** serta melacak jadwal kuliah mingguan.

Desain visual, tata letak, skema warna, dan mikro-interaksi aplikasi ini mengikuti panduan visual **`DESIGN.md`** terinspirasi dari estetika premium Apple (bersih, minimalis, dan berfokus pada konten).

---

## Fitur Utama

1. **Dashboard Utama**:
   * Ringkasan indikator akademik (jumlah tugas aktif, selesai, tenggat waktu dekat, dan kelas hari ini).
   * Daftar tugas terdekat yang mendesak.
   * Jadwal kuliah hari ini secara real-time.
2. **Integrasi Google Classroom**:
   * Login aman menggunakan Google Identity Services (OAuth 2.0).
   * Sinkronisasi data kelas dan tugas secara real-time.
   * Pengelompokan tugas berdasarkan kelas perkuliahan.
   * Penanganan kegagalan (*graceful fallback*) menggunakan data demo jika API belum terkonfigurasi.
3. **Task & Deadline Tracker**:
   * Status tugas lengkap (Belum dikerjakan, Sedang dikerjakan, Selesai).
   * Fitur menandai tugas selesai lokal yang tersimpan secara persisten di peramban (`localStorage`).
   * Pintasan langsung untuk membuka lembar tugas di Google Classroom.
4. **Jadwal Kuliah Mingguan**:
   * Agenda mingguan lengkap dengan detail mata kuliah, kode MK, SKS, nama kelas, ruang, dan nama dosen pengampu.
   * Penyaringan (*filter*) hari aktif, dengan otomatisasi penyembunyian hari kosong dan *empty states* yang rapi.

---

## Tech Stack

* **Framework**: [Next.js v15 (App Router)](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & CSS Variables (Design Tokens dari `DESIGN.md`)
* **APIs & SDKs**: Google Identity Services SDK, Google API Client (GAPI)

---

## Struktur Folder Proyek

```
Antugas/
├── app/                      # Next.js App Router Pages & Layouts
│   ├── dashboard/            # Halaman Dashboard utama
│   ├── tasks/                # Halaman Manajemen Tugas
│   ├── schedule/             # Halaman Jadwal Kuliah
│   ├── settings/             # Halaman Pengaturan & Akun
│   ├── layout.tsx            # Root Layout (Script Loading & Google Inter Font)
│   ├── page.tsx              # Root Route (Redirect ke /dashboard)
│   └── globals.css           # CSS Global & Desain Token DESIGN.md
├── components/               # Komponen UI Reusable
│   ├── AppLayout.tsx         # Shell Layout utama (Navbar, Sidebar, Footer)
│   ├── Navbar.tsx            # Navigasi atas (global-nav 44px)
│   ├── Sidebar.tsx           # Navigasi samping (desktop)
│   ├── MobileMenu.tsx        # Drawer Menu samping (mobile)
│   ├── DashboardCard.tsx     # Kartu indikator metrik/stats
│   ├── TaskCard.tsx          # Kartu informasi tugas & tenggat waktu
│   ├── ScheduleCard.tsx      # Kartu informasi kelas mingguan
│   ├── ScheduleFilter.tsx    # Filter pill hari kuliah
│   └── LoadingState.tsx      # Spinner & Skeleton loader premium
├── context/                  # State Management
│   └── AppContext.tsx        # React Context untuk Otentikasi & Data Sync
├── data/                     # Dummy / Fallback Data
│   ├── dummyTasks.ts         # Data tugas tiruan dinamis
│   └── dummySchedule.ts      # Data jadwal kuliah dinamis
├── lib/                      # Core Libraries & Helpers
│   ├── classroom.ts          # Layanan Google Classroom & OAuth
│   ├── constants.ts          # Konfigurasi aplikasi & Kumpulan Ikon SVG
│   └── utils.ts              # Fungsi utilitas penanggalan & greeting
├── types/                    # Strict TypeScript Interfaces
│   ├── classroom.ts          # Tipe data otentikasi Google
│   ├── task.ts               # Tipe data tugas akademik
│   └── schedule.ts           # Tipe data jadwal perkuliahan
├── public/                   # Static Assets
├── .env.local.example        # Contoh berkas konfigurasi Credentials
├── next.config.ts            # Konfigurasi Next.js
├── tsconfig.json             # Konfigurasi TypeScript
├── package.json              # Daftar modul dan dependensi proyek
└── DESIGN.md                 # Acuan utama desain visual
```

---

## Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan) dan npm.

### 2. Kloning dan Instalasi
Masuk ke direktori proyek dan instal dependensinya:
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas contoh `.env.local.example` menjadi `.env.local` di direktori utama:
```bash
cp .env.local.example .env.local
```
Secara default, berkas `.env.local` Anda telah terisi dengan konfigurasi siap pakai dari Google Cloud Platform:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=460364343692-e4jtpob6vgsvuq4legvhioa5r6s3ckl0.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyAqt6x_MAJPyQqV1yaEp7xU57I7pkhpYxU
```

### 4. Menjalankan Server Pengembangan
Jalankan perintah berikut untuk menyalakan Next.js lokal:
```bash
npm run dev
```
Buka peramban dan akses alamat **[http://localhost:3000](http://localhost:3000)**.

### 5. Membangun Bundle Produksi
Untuk memastikan kode bebas dari kesalahan TypeScript dan siap di-deploy:
```bash
npm run build
```

---

## Panduan Konfigurasi Google Cloud Platform (Mandiri)

Jika di kemudian hari Anda ingin menggunakan Google Credentials milik Anda pribadi:
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru atau pilih proyek yang sudah ada.
3. Aktifkan API berikut melalui menu **APIs & Services** -> **Library**:
   * **Google Classroom API**
4. Buka menu **APIs & Services** -> **Credentials**:
   * Klik **Create Credentials** -> **API Key** (Salin kunci berawalan `AIzaSy`).
   * Klik **Create Credentials** -> **OAuth client ID** -> pilih tipe **Web application**.
   * Di bawah **Authorized JavaScript origins**, tambahkan: `http://localhost:3000` dan url domain Vercel Anda kelak.
   * Salin Client ID yang dihasilkan.
5. Tempelkan Client ID dan API Key baru tersebut pada berkas `.env.local`.

---

## Catatan Fallback Data Demo
Jika Google API Key belum siap, kredensial tidak valid, atau pengguna belum menekan tombol **Login**, aplikasi secara otomatis akan berjalan dalam **Mode Demo** menggunakan data terstruktur dari `data/dummyTasks.ts` dan `data/dummySchedule.ts`. Ini memastikan aplikasi tetap dapat ditelusuri dan digunakan secara penuh untuk kebutuhan evaluasi tanpa konfigurasi tambahan!
