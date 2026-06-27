import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import * as api from "../../lib/api";
import DeleteConfirmationModal from "../../components/organisms/modals/DeleteConfirmationModal";
import toast from "react-hot-toast";
import Pagination from "../../components/molecules/Pagination";

const sanitizeUrl = (url) => {
  if (!url) return "#";
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.startsWith("javascript:") || lowerUrl.startsWith("data:")) return "#";
  if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

export default function AdminAlumniPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // State modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAlumni, setCurrentAlumni] = useState(null);
  const [alumniToDelete, setAlumniToDelete] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // State form
  const [formData, setFormData] = useState({
    nim: "",
    name: "",
    graduation_year: new Date().getFullYear(),
    university: "",
    job_title: "",
    job_start: "",
    job_end: "",
    phone: "",
    email: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    website: "",
    nis: "",
  });

  // Cek otorisasi
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      if (user) {
        toast.error("Anda tidak memiliki akses ke halaman ini");
      }
      router.replace("/");
    }
  }, [authLoading, isAdmin, user, router]);

  // Load data alumni
  useEffect(() => {
    if (isAdmin) {
      const delayDebounceFn = setTimeout(() => {
        loadAlumni();
      }, 500); // 500ms debounce for search

      return () => clearTimeout(delayDebounceFn);
    }
  }, [isAdmin, currentPage, search, yearFilter]);

  async function loadAlumni() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAlumni({ 
        page: currentPage, 
        per_page: itemsPerPage,
        search,
        graduation_year: yearFilter 
      });
      const responseData = response.data?.data ? response.data : response;
      setAlumni(responseData.data || []);
      setTotalPages(responseData.last_page || 1);
      setTotalItems(responseData.total || 0);
    } catch (err) {
      console.error("Error loading alumni:", err);
      setError(err.message || "Gagal memuat data alumni");
      toast.error("Gagal memuat data alumni");
    } finally {
      setLoading(false);
    }
  }

  // openAddModal removed as alumni are only added via student status change

  function openEditModal(alumniData) {
    setModalMode("edit");
    setCurrentAlumni(alumniData);
    setFormData({
      nim: alumniData.nim || "",
      name: alumniData.name || "",
      graduation_year: alumniData.graduation_year || new Date().getFullYear(),
      university: alumniData.university || "",
      job_title: alumniData.job_title || "",
      job_start: alumniData.job_start || "",
      job_end: alumniData.job_end || "",
      phone: alumniData.phone || "",
      email: alumniData.email || "",
      linkedin: alumniData.linkedin || "",
      instagram: alumniData.instagram || "",
      facebook: alumniData.facebook || "",
      website: alumniData.website || "",
      nis: alumniData.nis || "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.updateAlumni(currentAlumni.nim, formData);
      toast.success("Data alumni berhasil diperbarui");
      setShowModal(false);
      loadAlumni();
    } catch (err) {
      console.error("Error saving alumni:", err);
      toast.error(err.response?.data?.message || "Gagal menyimpan data");
    }
  }

  function handleDelete(alumniData) {
    setAlumniToDelete(alumniData);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!alumniToDelete) return;

    try {
      await api.deleteAlumni(alumniToDelete.nim);
      toast.success("Alumni berhasil dihapus");
      loadAlumni();
      setShowDeleteModal(false);
      setAlumniToDelete(null);
    } catch (err) {
      console.error("Error deleting alumni:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus alumni");
    }
  }

  // Dapatkan tahun lulus unik untuk filter (2000 - Current Year)
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from(new Array(currentYear - 1999), (val, index) => currentYear - index);

  // Filter dihapus karena sudah di-handle oleh backend
  const filteredAlumni = alumni;

  if (authLoading || !isAdmin) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Alumni</h1>
        <p className="text-gray-600">
          Kelola dan pantau data alumni sekolah
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl">
              <p className="text-sm opacity-90">Total Alumni</p>
              <p className="text-3xl font-bold">{totalItems}</p>
            </div>
            {/* Removed the local filtered result count since backend returns total items accurately */}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Cari NIM, nama, universitas, pekerjaan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">📅 Semua Tahun Lulus</option>
            {graduationYears.map((year) => (
              <option key={year} value={year}>
                Tahun {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Memuat data alumni..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadAlumni} />
      ) : filteredAlumni.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {search || yearFilter ? "Tidak Ada Hasil" : "Belum Ada Data Alumni"}
          </h3>
          <p className="text-gray-600 mb-6">
            {search || yearFilter
              ? "Coba ubah filter atau kata kunci pencarian"
              : "Belum ada data alumni yang lulus dari sekolah ini"}
          </p>
          {(search || yearFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setYearFilter("");
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
                  <th className="p-4 font-semibold text-gray-600">NIM</th>
                  <th className="p-4 font-semibold text-gray-600">Nama Lengkap</th>
                  <th className="p-4 font-semibold text-gray-600">Tahun Lulus</th>
                  <th className="p-4 font-semibold text-gray-600">Universitas/Kerja</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.map((alumniData, index) => (
                  <tr
                    key={alumniData.nim}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="p-4 text-gray-900 font-medium">
                      {alumniData.nim}
                    </td>
                    <td className="p-4 text-gray-900 font-medium">
                      {alumniData.name}
                    </td>
                    <td className="p-4 text-gray-900">
                      {alumniData.graduation_year}
                    </td>
                    <td className="p-4">
                      {alumniData.university && (
                        <div className="text-sm text-gray-600">
                          🎓 {alumniData.university}
                        </div>
                      )}
                      {alumniData.job_title && (
                        <div className="text-sm text-gray-600">
                          💼 {alumniData.job_title}
                        </div>
                      )}
                      {!alumniData.university && !alumniData.job_title && (
                        <span className="text-gray-400 italic text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(alumniData)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 rounded-lg font-semibold transition text-sm flex items-center gap-1"
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(alumniData)}
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
      {!loading && !error && filteredAlumni.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Data Alumni
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NIM */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIM <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Masukkan NIM"
                    disabled={modalMode === "edit"}
                  />
                </div>

                {/* Nama */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nama lengkap"
                  />
                </div>

                {/* Tahun Lulus */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tahun Lulus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.graduation_year}
                    onChange={(e) =>
                      setFormData({ ...formData, graduation_year: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1900"
                    max="2100"
                  />
                </div>

                {/* NIS (optional link to student) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NIS (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="NIS saat sekolah"
                  />
                </div>

                {/* Universitas */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Universitas
                  </label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) =>
                      setFormData({ ...formData, university: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nama universitas"
                  />
                </div>

                {/* Job Details */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pekerjaan/Jabatan
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) =>
                      setFormData({ ...formData, job_title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Misal: Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tahun Mulai Kerja
                  </label>
                  <input
                    type="number"
                    value={formData.job_start}
                    onChange={(e) =>
                      setFormData({ ...formData, job_start: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="2020"
                    min="1900"
                    max="2100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tahun Selesai (Opsional)
                  </label>
                  <input
                    type="number"
                    value={formData.job_end}
                    onChange={(e) =>
                      setFormData({ ...formData, job_end: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Kosongkan jika masih bekerja"
                    min="1900"
                    max="2100"
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+62xxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Social Media */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-3 mt-2">
                    Sosial Media (Opsional)
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.facebook}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAlumniToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Alumni"
        message={`Apakah Anda yakin ingin menghapus data alumni ${alumniToDelete?.name}? Data yang dihapus tidak dapat dikembalikan.`}
      />
    </DashboardLayout>
  );
}
