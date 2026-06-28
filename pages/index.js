import StudentCard from "../components/organisms/cards/StudentCard";
import AlumniCard from "../components/organisms/cards/AlumniCard";
import StatsCard from "../components/organisms/cards/StatsCards";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { publicGetStudents, publicGetAlumni } from "../lib/api";
import Pagination from "../components/molecules/Pagination";
import { HiUserGroup, HiAcademicCap, HiPresentationChartBar, HiMagnifyingGlass } from "react-icons/hi2";
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

  // Pagination states
  const [studentPage, setStudentPage] = useState(1);
  const [alumniPage, setAlumniPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalAlumni, setTotalAlumni] = useState(0);
  const [studentPages, setStudentPages] = useState(1);
  const [alumniPages, setAlumniPages] = useState(1);
  const itemsPerPage = 9;

  // Fetch data dari API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, studentPage, alumniPage]);

  async function loadData() {
    try {
      setDataLoading(true);
      setError(null);

      const [studentsRes, alumniRes] = await Promise.all([
        publicGetStudents({ search: query, page: studentPage, per_page: itemsPerPage }),
        publicGetAlumni({ search: query, page: alumniPage, per_page: itemsPerPage }),
      ]);

      const processResponse = (res, setList, setTotal, setPages) => {
        const responseData = res.data?.data ? res.data : res;
        let items = [];
        if (responseData?.data) {
          items = responseData.data;
          setPages(responseData.last_page || 1);
          setTotal(responseData.total || 0);
        } else {
          items = responseData || [];
          setPages(1);
          setTotal(items.length);
        }
        setList(items);
      };

      processResponse(studentsRes, setStudents, setTotalStudents, setStudentPages);
      processResponse(alumniRes, setAlumni, setTotalAlumni, setAlumniPages);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Gagal memuat data. Silakan refresh halaman.");
    } finally {
      setDataLoading(false);
    }
  }

  // Filter dihapus karena dihandle oleh backend
  const filteredStudents = students;
  const filteredAlumni = alumni;

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
              <img src="/jejakedu.png" alt="JejakEdu Logo" className="h-20 w-auto object-contain" />
            </div>

            {/* Login/User Button */}
            {loading ? (
              <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            ) : user ? (
              <Link
                href={
                  user.role === "admin"
                    ? "/admin"
                    : user.role === "guru"
                    ? "/guru"
                    : user.role === "wali_kelas"
                    ? "/walikelas"
                    : user.role === "alumni"
                    ? "/alumni/profile"
                    : "/login"
                }
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
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <img src="/jejakedu.png" alt="JejakEdu Logo" className="h-60 w-auto object-contain mb-6" />
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistem informasi terpusat untuk pengelolaan data siswa dan alumni
            sekolah
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setStudentPage(1);
                setAlumniPage(1);
              }}
              placeholder="Cari siswa atau alumni (Nama / NIS / NISN / NIM)..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-200 bg-white shadow-soft focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg"
            />
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
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
            icon={<HiUserGroup className="w-8 h-8 text-white" />}
            label="Total Siswa Aktif"
            value={totalStudents}
            color="bg-gradient-to-br from-primary to-accent text-white"
          />
          <StatsCard
            icon={<HiAcademicCap className="w-8 h-8 text-white" />}
            label="Total Alumni"
            value={totalAlumni}
            color="bg-gradient-to-br from-accent to-[#5a3680] text-white"
          />
          <StatsCard
            icon={<HiPresentationChartBar className="w-8 h-8 text-white" />}
            label="Total Data"
            value={totalStudents + totalAlumni}
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
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "students"
                    ? "bg-primary text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <HiUserGroup className="w-5 h-5" /> Siswa ({totalStudents})
              </button>
              <button
                onClick={() => setActiveTab("alumni")}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "alumni"
                    ? "bg-accent text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <HiAcademicCap className="w-5 h-5" /> Alumni ({totalAlumni})
              </button>
            </div>

            {/* Grid Siswa */}
            {activeTab === "students" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student, idx) => (
                  <StudentCard
                    key={student.nis || student.id || `student-${idx}`}
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
            
            {activeTab === "students" && filteredStudents.length > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={studentPage}
                  totalPages={studentPages}
                  totalItems={totalStudents}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setStudentPage}
                />
              </div>
            )}

            {/* Grid Alumni */}
            {activeTab === "alumni" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAlumni.map((a, idx) => (
                  <AlumniCard key={a.nim || a.id || `alumni-${idx}`} alumni={a} isPublic={true} />
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
            
            {activeTab === "alumni" && filteredAlumni.length > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={alumniPage}
                  totalPages={alumniPages}
                  totalItems={totalAlumni}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setAlumniPage}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
