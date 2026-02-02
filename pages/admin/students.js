import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import AddStudentModal from "../../components/organisms/modals/AddStudentModal";
import EditStudentModal from "../../components/organisms/modals/EditStudentModal";
import DeleteConfirmationModal from "../../components/organisms/modals/DeleteConfirmationModal";
import { getStudents, deleteStudent } from "../../lib/api";
import toast from "react-hot-toast";

export default function AdminStudentsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // State modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Cek otorisasi
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      if (user) {
        toast.error("Anda tidak memiliki akses ke halaman ini");
      }
      router.replace("/");
    }
  }, [authLoading, isAdmin, user, router]);

  // Load data siswa
  useEffect(() => {
    if (isAdmin) {
      loadStudents();
    }
  }, [isAdmin]);

  async function loadStudents() {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudents({ per_page: 1000 });
      setStudents(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(student) {
    setCurrentStudent(student);
    setShowEditModal(true);
  }

  function handleStudentAdded(newStudent) {
    loadStudents();
    setShowAddModal(false);
  }

  function handleStudentUpdated(updatedStudent) {
    loadStudents();
    setShowEditModal(false);
    setCurrentStudent(null);
  }

  function handleDelete(student) {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!studentToDelete) return;

    try {
      await deleteStudent(studentToDelete.nis);
      toast.success("Siswa berhasil dihapus");
      loadStudents();
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus siswa");
    }
  }

  // Dapatkan kelas unik untuk filter
  const classes = [
    ...new Set(
      students
        .map((s) => s.rombel_absen?.split("-")[0])
        .filter(Boolean)
        .sort()
    ),
  ];

  // Filter siswa
  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.nis?.toLowerCase().includes(q) ||
      s.nisn?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.rombel_absen?.toLowerCase().includes(q);

    const matchGender = !genderFilter || s.gender === genderFilter;

    const matchClass =
      !classFilter || s.rombel_absen?.startsWith(classFilter + "-");

    return matchSearch && matchGender && matchClass;
  });

  if (authLoading || !isAdmin) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Siswa</h1>
        <p className="text-gray-600">
          Kelola data siswa dan informasi akademik
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl">
              <p className="text-sm opacity-90">Total Siswa</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            {(search || genderFilter || classFilter) && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-600">Hasil Filter</p>
                <p className="text-xl font-bold text-blue-700">
                  {filteredStudents.length} Siswa
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Tambah Siswa
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Cari NIS, NISN, nama, kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">👥 Semua Jenis Kelamin</option>
            <option value="Laki-laki">🚹 Laki-laki</option>
            <option value="Perempuan">🚺 Perempuan</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">🏫 Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {(search || genderFilter || classFilter) && (
          <div className="mt-3">
            <button
              onClick={() => {
                setSearch("");
                setGenderFilter("");
                setClassFilter("");
              }}
              className="text-sm text-primary hover:text-primary-dark font-semibold"
            >
              🔄 Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Memuat data siswa..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadStudents} />
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-4">👨‍🎓</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {search || genderFilter || classFilter
              ? "Tidak Ada Hasil"
              : "Belum Ada Data Siswa"}
          </h3>
          <p className="text-gray-600 mb-6">
            {search || genderFilter || classFilter
              ? "Coba ubah filter atau kata kunci pencarian"
              : "Mulai tambahkan data siswa dengan klik tombol di atas"}
          </p>
          {(search || genderFilter || classFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setGenderFilter("");
                setClassFilter("");
              }}
              className="px-4 py-2 text-primary font-semibold hover:bg-primary/10 rounded-lg transition"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.nis}
              className="bg-white rounded-xl shadow-soft overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                <div className="flex justify-between items-start">
                  <div className="text-white">
                    <p className="text-sm opacity-90">NIS</p>
                    <p className="text-lg font-bold">{student.nis}</p>
                  </div>
                  <div className="flex gap-1">
                    {student.gender === "Laki-laki" && (
                      <span className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-sm">
                        🚹
                      </span>
                    )}
                    {student.gender === "Perempuan" && (
                      <span className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-sm">
                        🚺
                      </span>
                    )}
                    {student.rombel_absen && (
                      <span className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs font-semibold">
                        {student.rombel_absen}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  {student.name}
                </h3>

                <div className="space-y-2 text-sm">
                  {student.nisn && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">NISN:</span>
                      <span className="font-semibold text-gray-900">
                        {student.nisn}
                      </span>
                    </div>
                  )}

                  {student.birth_place && student.birth_date && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 w-24">TTL:</span>
                      <span className="text-gray-900 flex-1">
                        {student.birth_place},{" "}
                        {new Date(student.birth_date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}

                  {student.religion && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Agama:</span>
                      <span className="text-gray-900">{student.religion}</span>
                    </div>
                  )}

                  {student.father_name && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 w-24">Nama Ayah:</span>
                      <span className="text-gray-900 flex-1">
                        {student.father_name}
                      </span>
                    </div>
                  )}

                  {student.address && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 w-24">Alamat:</span>
                      <span className="text-gray-900 flex-1 break-words">
                        {student.address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(student)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(student)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddStudentModal
          open={true}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleStudentAdded}
        />
      )}

      {showEditModal && currentStudent && (
        <EditStudentModal
          open={true}
          student={currentStudent}
          onClose={() => {
            setShowEditModal(false);
            setCurrentStudent(null);
          }}
          onSuccess={handleStudentUpdated}
        />
      )}

      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStudentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Siswa"
        message={`Apakah Anda yakin ingin menghapus siswa ${studentToDelete?.name}? Data yang dihapus tidak dapat dikembalikan.`}
      />
    </DashboardLayout>
  );
}
