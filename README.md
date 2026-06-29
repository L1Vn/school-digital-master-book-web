# 🏫 School Digital Master Book - Web Application

[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Aplikasi frontend (Web) untuk sistem **Buku Induk Digital Sekolah**. Dibangun dengan **Next.js 15**, **React 19**, dan **Tailwind CSS**, mengimplementasikan arsitektur *Atomic Design*. Aplikasi ini menyediakan antarmuka modern, responsif, dan *role-based* untuk Admin, Guru, Wali Kelas, Alumni, dan Publik.

---

## 🚀 Teknologi Utama

- **Framework:** Next.js 15.5 (Pages Router)
- **Library Utama:** React 19.2
- **Styling:** Tailwind CSS 3.4
- **State & HTTP:** Fetch API terintegrasi dengan backend Laravel
- **Auth Handling:** `js-cookie` untuk Token Management Sanctum
- **UI & UX:** `react-hot-toast` untuk notifikasi yang elegan, `react-icons` untuk iconography.

## 🛠 Instalasi & Setup

Pastikan **Node.js (LTS terbaru)** telah terinstal di sistem Anda.

1. **Clone Repository**
   ```bash
   git clone https://github.com/L1Vn/school-digital-master-book-web.git
   cd school-digital-master-book-web
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file `.env.local` di root folder project:
   ```bash
   cp .env.local.example .env.local # Jika ada
   ```
   Atau buat secara manual dan isi:
   ```env
   NEXT_LOCAL_API_URL=http://127.0.0.1:8000/api
   ```
   *(Sesuaikan URL API dengan alamat backend Laravel Anda).*

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Buka browser dan akses [http://127.0.0.1:3000](http://127.0.0.1:3000).

---

## 📱 Modul & Role Access

Sistem ini memiliki berbagai *dashboard* yang disesuaikan dengan *role* pengguna:

### 1. 🌐 Public Page (Landing - `/`)
- Halaman beranda interaktif yang dapat diakses siapa saja.
- Fitur **Pencarian Data (Siswa & Alumni)** berdasarkan Nomor Induk (NIS/NIM).

### 2. 🔐 Login System (`/login`)
- *Single Entry Point* untuk semua pengguna.
- Penanganan autentikasi JWT dan redireksi otomatis ke *dashboard* masing-masing role (Admin / Guru / Walikelas / Alumni).

### 3. 👑 Dashboard Admin (`/admin/*`)
- **Master Data:** Manajemen entitas utama seperti Siswa, Alumni, Pengguna (User), Mata Pelajaran (Subjects), Kelas, dan Tahun Ajaran.
- **Grades:** Manajemen nilai keseluruhan.
- **Notifications:** Kotak masuk (*inbox*) notifikasi pembaruan data dari Alumni.

### 4. 👨‍🏫 Dashboard Guru (`/guru/*`)
- **My Grades:** Guru hanya memiliki hak akses untuk menginput dan mengedit nilai pada mata pelajaran yang ditugaskan kepadanya.

### 5. 👔 Dashboard Wali Kelas (`/walikelas/*`)
- **Class Data:** Melihat detail dan daftar siswa di kelas binaannya.
- **Input Nilai:** Hak akses sekunder (backup) untuk input nilai bagi seluruh mata pelajaran di kelasnya.
- **Rekap Nilai:** Memantau rekapitulasi nilai total dan rata-rata siswa per semester.

### 6. 🎓 Dashboard Alumni (`/alumni/*`)
- **Profile Update:** Alumni dapat memperbarui data pendidikan lanjutan (Universitas), pekerjaan (Karir), dan kontak/sosial media.
- Perubahan yang dilakukan akan langsung memicu notifikasi ke Admin untuk dilakukan proses validasi.

---

## 📂 Struktur Proyek (Atomic Design)

Aplikasi ini menggunakan pola **Atomic Design** pada komponen UI-nya agar lebih terstruktur dan *reusable*.

```bash
school-digital-master-book-web/
├── components/          # Komponen UI menggunakan Atomic Design
│   ├── atoms/           # Komponen dasar (Button, Input, Badge, dll)
│   ├── molecules/       # Gabungan atoms (FormGroup, SearchBar, Card)
│   ├── organisms/       # Gabungan molecules (Navbar, Sidebar, Table)
│   └── templates/       # Struktur layout halaman (AdminLayout, dll)
├── pages/               # Routing Next.js (Pages Router)
│   ├── _app.js          # Main App Component (Global Styles, Toast config)
│   ├── index.js         # Landing Page
│   ├── login.js         # Halaman Login
│   ├── 404.js           # Custom Error Page
│   ├── admin/           # Folder routing khusus Admin
│   ├── alumni/          # Folder routing khusus Alumni
│   ├── guru/            # Folder routing khusus Guru
│   └── walikelas/       # Folder routing khusus Walikelas
├── public/              # Aset statis (Gambar, Icon, dll)
├── styles/              # Global CSS (Tailwind imports)
├── tailwind.config.js   # Konfigurasi Tailwind CSS
└── package.json         # Dependensi & Scripts
```

## 🎨 Design System & UX

- **Tailwind CSS:** Digunakan secara ekstensif untuk styling yang *utility-first* dan mudah disesuaikan.
- **Responsif:** Antarmuka disesuaikan untuk tampil sempurna baik di Desktop maupun Mobile.
- **Micro-interactions:** Efek *hover*, transisi *smooth*, dan status *loading* yang informatif untuk pengalaman pengguna premium.
- **Notifikasi:** `react-hot-toast` digunakan untuk memberikan *feedback* visual (Sukses/Error) pada setiap aksi pengguna secara *real-time*.

## 📜 Lisensi
Developed for internal use.
