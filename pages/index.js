import StudentCard from "../components/organisms/cards/StudentCard";
import AlumniCard from "../components/organisms/cards/AlumniCard";
import StatsCard from "../components/organisms/cards/StatsCards";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { publicGetStudents, publicGetAlumni } from "../lib/api";
// ========================
// MAIN COMPONENT
// ========================
export default function PublicHome() {
  const { user, loading } = useAuth();
  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("students");

  // Fetch data dari API
  useEffect(() => {
    async function loadData() {
      try {
        setDataLoading(true);
        setError(null);

        const [studentsRes, alumniRes] = await Promise.all([
          publicGetStudents(),
          publicGetAlumni(),
        ]);

        // Handle response paginated dari Laravel (data.data.data)
        // atau response langsung (data.data) atau array langsung
        const extractData = (res) => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data?.data)) return res.data.data; // Response Paginated
          if (Array.isArray(res?.data)) return res.data;
          return [];
        };

        setStudents(extractData(studentsRes));
        setAlumni(extractData(alumniRes));
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Gagal memuat data. Silakan refresh halaman.");
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter berdasarkan search query
  const filteredStudents = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.nis?.toLowerCase().includes(q) ||
        s.nisn?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.rombel_absen?.toLowerCase().includes(q),
    );
  }, [query, students]);

  const filteredAlumni = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return alumni;
    return alumni.filter(
      (a) =>
        a.nim?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q) ||
        a.university?.toLowerCase().includes(q) ||
        a.graduation_year?.toString().includes(q),
    );
  }, [query, alumni]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ======================== */}
      {/* HEADER */}
      {/* ======================== */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg">
                📘
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Buku Induk Digital Sekolah
                </h1>
                <p className="text-sm text-gray-500">
                  Sistem Manajemen Data Siswa
                </p>
              </div>
            </div>

            {/* Login/User Button */}
            {loading ? (
              <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            ) : user ? (
              <Link
                href="/login"
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300 flex items-center gap-3"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {user.role === "admin" && "Administrator"}
                    {user.role === "guru" && "Guru"}
                    {user.role === "wali_kelas" && "Wali Kelas"}
                    {user.role === "alumni" && "Alumni"}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                  {user.name?.charAt(0) || "U"}
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ======================== */}
      {/* BAGIAN HERO */}
      {/* ======================== */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Buku Induk Digital Sekolah
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistem informasi terpusat untuk pengelolaan data siswa dan alumni
            sekolah
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Cari siswa atau alumni (Nama / NIS / NISN / NIM)..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 bg-white shadow-soft focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg"
            />
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* KONTEN UTAMA */}
      {/* ======================== */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard
            icon="👨‍🎓"
            label="Total Siswa Aktif"
            value={students.length}
            color="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
          />
          <StatsCard
            icon="🎓"
            label="Total Alumni"
            value={alumni.length}
            color="bg-gradient-to-br from-amber-400 to-orange-500 text-white"
          />
          <StatsCard
            icon="📊"
            label="Total Data"
            value={students.length + alumni.length}
            color="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
          />
        </div>

        {/* Status Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        {/* Status Loading */}
        {dataLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        )}

        {/* Konten */}
        {!dataLoading && !error && (
          <>
            {/* Navigasi Tab */}
            <div className="flex gap-2 mb-8 p-2 bg-white rounded-2xl shadow-soft max-w-md">
              <button
                onClick={() => setActiveTab("students")}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "students"
                    ? "bg-primary text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                👨‍🎓 Siswa ({filteredStudents.length})
              </button>
              <button
                onClick={() => setActiveTab("alumni")}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "alumni"
                    ? "bg-amber-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                🎓 Alumni ({filteredAlumni.length})
              </button>
            </div>

            {/* Grid Siswa */}
            {activeTab === "students" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.nis}
                    student={student}
                    isPublic={true}
                  />
                ))}
                {filteredStudents.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    {query
                      ? "Tidak ada siswa yang sesuai dengan pencarian"
                      : "Belum ada data siswa"}
                  </div>
                )}
              </div>
            )}

            {/* Grid Alumni */}
            {activeTab === "alumni" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAlumni.map((a) => (
                  <AlumniCard key={a.nim} alumni={a} isPublic={true} />
                ))}
                {filteredAlumni.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    {query
                      ? "Tidak ada alumni yang sesuai dengan pencarian"
                      : "Belum ada data alumni"}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
