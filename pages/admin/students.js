import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import AddStudentModal from "../../components/organisms/modals/AddStudentModal";
import EditStudentModal from "../../components/organisms/modals/EditStudentModal";
import DeleteConfirmationModal from "../../components/organisms/modals/DeleteConfirmationModal";
import { getStudents, deleteStudent, createStudent, updateStudent } from "../../lib/api";
import toast from "react-hot-toast";
import Pagination from "../../components/molecules/Pagination";
import { useClasses } from "../../hooks/useClasses";

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Classes hook for dropdown
  const { classes } = useClasses(isAdmin);

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
      const delayDebounceFn = setTimeout(() => {
        loadStudents();
      }, 500); // 500ms debounce for search

      return () => clearTimeout(delayDebounceFn);
    }
  }, [isAdmin, currentPage, search, genderFilter, classFilter]);

  async function loadStudents() {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudents({ 
        page: currentPage, 
        per_page: itemsPerPage,
        search,
        gender: genderFilter,
        class: classFilter
      });
      
      const responseData = data.data?.data ? data.data : data;
      setStudents(responseData.data || []);
      setTotalPages(responseData.last_page || 1);
      setTotalItems(responseData.total || 0);
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

  async function handleAddStudent(data) {
    try {
      await createStudent(data);
      toast.success("Siswa berhasil ditambahkan");
      loadStudents();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Gagal menambahkan siswa");
    }
  }

  async function handleEditStudent(data) {
    try {
      await updateStudent(data.nis, data);
      toast.success("Siswa berhasil diperbarui");
      loadStudents();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Gagal memperbarui siswa");
    }
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

  // Filter dihapus karena sudah di-handle oleh backend melalui getStudents()
  const filteredStudents = students;

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
              <p className="text-3xl font-bold">{totalItems}</p>
            </div>
            {/* Removed the local filtered result count since backend returns total items accurately */}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">👥 Semua Jenis Kelamin</option>
            <option value="Laki-laki">🚹 Laki-laki</option>
            <option value="Perempuan">🚺 Perempuan</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setCurrentPage(1);
            }}
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
                setCurrentPage(1);
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
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-primary font-semibold hover:bg-primary/10 rounded-lg transition"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600">NIS</th>
                  <th className="p-4 font-semibold text-gray-600">Nama Lengkap</th>
                  <th className="p-4 font-semibold text-gray-600">Kelas</th>
                  <th className="p-4 font-semibold text-gray-600">Jenis Kelamin</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.nis}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="p-4 text-gray-900 font-medium">
                      {student.nis}
                    </td>
                    <td className="p-4 text-gray-900 font-medium">
                      {student.name}
                    </td>
                    <td className="p-4">
                      {student.rombel_absen ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
                          {student.rombel_absen}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {student.gender === "L" || student.gender === "Laki-laki" ? (
                        <span className="text-blue-600">🚹 Laki-laki</span>
                      ) : student.gender === "P" || student.gender === "Perempuan" ? (
                        <span className="text-pink-600">🚺 Perempuan</span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {student.status === "alumni" ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium flex inline-flex items-center gap-1">
                          🎓 Alumni
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium flex inline-flex items-center gap-1">
                          📚 Siswa Aktif
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 rounded-lg font-semibold transition text-sm flex items-center gap-1"
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-lg font-semibold transition text-sm flex items-center gap-1"
                          title="Hapus"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Component */}
      {!loading && !error && filteredStudents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddStudentModal
          open={true}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddStudent}
          students={students}
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
          onSave={handleEditStudent}
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
