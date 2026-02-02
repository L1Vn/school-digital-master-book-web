# School Digital Master Book Web

Web Application frontend untuk sistem Buku Induk Digital. Dibangun menggunakan **Next.js 15**, **React 19**, dan **Tailwind CSS**. Aplikasi ini menyediakan antarmuka responsif, modern, dan role-based untuk Admin, Guru, Wali Kelas, Alumni, dan Publik.

## 🚀 Teknologi utama

- **Framework:** Next.js 15
- **Library:** React 19
- **Styling:** Tailwind CSS 3.4
- **HTTP**: Fetch API
- **Auth Handling:** `js-cookie` (Token Management)
- **UI UX:** Design premium dengan transisi halus dan responsif.

## 🛠 Instalasi & Setup

Pastikan Node.js (versi LTS terbaru) telah terinstal di komputer Anda.

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd school-digital-master-book-web
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file `.env.local` di root folder project:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

   _Sesuaikan URL API dengan alamat backend Laravel Anda._

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Buka browser dan akses [http://localhost:3000](http://localhost:3000).

## 📱 Fitur & Modul

### 1. Public Page (Landing)

- Halaman depan yang dapat diakses siapa saja.
- Fitur **Pencarian Data** (Siswa & Alumni) berdasarkan Nomor Induk.

### 2. Login System

- Single Entry Point (`/login`) untuk semua role.
- Redireksi otomatis ke dashboard yang sesuai berdasarkan role user (Admin/Guru/Wali/Alumni).

### 3. Dashboard Admin (`/admin`)

- **Master Data:** Kelola data Siswa, Alumni, Mata Pelajaran, dan User.
- **Grades:** Manajemen nilai semua siswa.
- **Notifications:** Inbox notifikasi jika ada Alumni yang mengupdate data profilnya.

### 4. Dashboard Guru (`/guru`)

- **My Grades:** Guru hanya dapat menginput dan mengedit nilai untuk mata pelajaran yang ditugaskan kepadanya.

### 5. Dashboard Wali Kelas (`/walikelas`)

- **Class Data:** Melihat daftar siswa di kelas yang diampu.
- **Input Nilai:** Hak akses input nilai untuk **semua** mata pelajaran bagi siswa di kelasnya (backup jika guru berhalangan).
- **Rekap Nilai:** Melihat total nilai dan rata-rata siswa per semester.

### 6. Dashboard Alumni (`/alumni`)

- **Profile Update:** Alumni dapat memperbarui data pekerjaan, universitas, dan kontak sosial media. Perubahan ini akan memicu notifikasi ke Admin untuk ditinjau.

## 📂 Struktur Project

```bash
pages/
├── index.js          # Landing page (Search Publik)
├── login.js          # Halaman Login
├── admin/            # Route khusus Admin (Protected)
│   ├── alumni.js
│   ├── students.js
│   ├── subjects.js
│   ├── users.js
│   └── grades.js
├── guru/             # Route khusus Guru
│   └── index.js
├── walikelas/        # Route khusus Wali Kelas
│   ├── index.js
│   └── students.js
└── alumni/           # Route khusus Alumni
    └── profile.js
components/           # Komponen UI Reusable
├── Layout.js         # Layout utama (Sidebar/Navbar)
├── Sidebar.js        # Navigasi Menu
└── ...
```

## 🎨 Design System

Project ini menggunakan Tailwind CSS dengan pendekatan desain yang bersih dan _sophisticated_.

- **Warna:** Menggunakan palet warna modern yang nyaman di mata.
- **Interaksi:** Hover effects, modal animations, dan loading states yang informatif.

## 📜 Lisensi

Developed for internal use.
