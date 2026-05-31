# Antugas — Academic Productivity Dashboard

Dashboard produktivitas akademik untuk manajemen tugas dan jadwal kuliah. Terintegrasi dengan Google Classroom API.

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Fitur

### Dashboard Utama
- Ringkasan tugas aktif, selesai, dan mendekati deadline
- Jadwal kuliah hari ini
- Statistik overview

### Integrasi Google Classroom
- Login dengan Google OAuth 2.0
- Ambil daftar kelas dan tugas otomatis
- Status dan deadline tugas real-time
- Fallback ke data demo jika API tidak tersedia

### Jadwal Kuliah
- Jadwal berdasarkan hari (Senin - Jumat)
- Informasi dosen, ruang/link kelas
- Filter berdasarkan hari
- Highlight hari ini

### Manajemen Tugas
- Filter berdasarkan status (aktif, deadline dekat, selesai)
- Filter berdasarkan mata kuliah
- Tandai tugas selesai (disimpan di localStorage)
- Highlight deadline otomatis

## Teknologi

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Flexbox, Grid, responsive design
- **JavaScript** (Vanilla) — Modular, clean code
- **Google Classroom API** — OAuth 2.0
- **Google Fonts** — Inter (SF Pro substitute)

## Struktur Project

```
Antugas/
├── index.html          # Halaman utama (SPA)
├── css/
│   └── style.css       # Design system & komponen
├── js/
│   └── script.js       # Logika aplikasi
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── README.md           # Dokumentasi
└── DESIGN.md           # Referensi desain
```

## Setup

### 1. Buka Langsung
Cukup buka `index.html` di browser. Aplikasi akan berjalan dengan data demo.

### 2. Integrasi Google Classroom (Opsional)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Aktifkan **Google Classroom API**
4. Buat credentials:
   - Tipe: **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: URL tempat Anda menjalankan aplikasi
5. Buat **API Key** dengan restriksi untuk Google Classroom API
6. Edit `js/script.js` dan ganti:
   ```javascript
   CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
   API_KEY: 'YOUR_API_KEY',
   ```
7. Buka `index.html` dan klik **Login dengan Google**

### 3. Konfigurasi Jadwal

Edit array `DEFAULT_SCHEDULE` di `js/script.js` untuk menyesuaikan jadwal kuliah:

```javascript
const DEFAULT_SCHEDULE = [
  {
    day: 'Senin',
    courses: [
      {
        name: 'Nama Mata Kuliah',
        time: '08:00 - 10:00',
        lecturer: 'Nama Dosen',
        room: 'Ruang/Lab',
        link: ''  // Kosongkan untuk kelas offline
      }
    ]
  },
  // ...
];
```

## Design System

Aplikasi menggunakan design system berdasarkan `DESIGN.md` (Apple-inspired):

| Token | Value | Usage |
|---|---|---|
| Primary Color | `#0066cc` | Semua elemen interaktif |
| Canvas | `#f5f5f7` | Background halaman |
| Card radius | `18px` | Border radius kartu |
| Button radius | `9999px` | Tombol pill-shaped |
| Body font size | `17px` | Ukuran teks default |
| Font family | Inter | Substitute SF Pro |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Lisensi

MIT License
