import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import * as api from "../../lib/api";
import DeleteConfirmationModal from "../../components/organisms/modals/DeleteConfirmationModal";
import toast from "react-hot-toast";

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
      loadAlumni();
    }
  }, [isAdmin]);

  async function loadAlumni() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAlumni();
      setAlumni(response.data || []);
    } catch (err) {
      console.error("Error loading alumni:", err);
      setError(err.message || "Gagal memuat data alumni");
      toast.error("Gagal memuat data alumni");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setModalMode("add");
    setFormData({
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
    setShowModal(true);
  }

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
      if (modalMode === "add") {
        await api.createAlumni(formData);
        toast.success("Alumni berhasil ditambahkan");
      } else {
        await api.updateAlumni(currentAlumni.nim, formData);
        toast.success("Data alumni berhasil diperbarui");
      }
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

  // Dapatkan tahun lulus unik untuk filter
  const graduationYears = [...new Set(alumni.map((a) => a.graduation_year))].sort(
    (a, b) => b - a
  );

  // Filter alumni
  const filteredAlumni = alumni.filter((a) => {
    const searchLower = search.toLowerCase().trim();
    const matchSearch =
      !searchLower ||
      a.nim?.toLowerCase().includes(searchLower) ||
      a.name?.toLowerCase().includes(searchLower) ||
      a.university?.toLowerCase().includes(searchLower) ||
      a.job_title?.toLowerCase().includes(searchLower);

    const matchYear = !yearFilter || a.graduation_year == yearFilter;

    return matchSearch && matchYear;
  });

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
              <p className="text-3xl font-bold">{alumni.length}</p>
            </div>
            {yearFilter && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-600">Tahun {yearFilter}</p>
                <p className="text-xl font-bold text-blue-700">
                  {filteredAlumni.length} Alumni
                </p>
              </div>
            )}
          </div>

          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Tambah Alumni
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Cari NIM, nama, universitas, pekerjaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
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
              : "Mulai tambahkan data alumni dengan klik tombol di atas"}
          </p>
          {(search || yearFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setYearFilter("");
              }}
              className="px-4 py-2 text-primary font-semibold hover:bg-primary/10 rounded-lg transition"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumniData) => (
            <div
              key={alumniData.nim}
              className="bg-white rounded-xl shadow-soft overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                <div className="flex justify-between items-start">
                  <div className="text-white">
                    <p className="text-sm opacity-90">NIM</p>
                    <p className="text-lg font-bold">{alumniData.nim}</p>
                  </div>
                  <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-sm font-semibold">
                    {alumniData.graduation_year}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  {alumniData.name}
                </h3>

                {alumniData.university && (
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">🎓</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">Universitas</p>
                      <p className="font-semibold text-gray-900 break-words">
                        {alumniData.university}
                      </p>
                    </div>
                  </div>
                )}

                {alumniData.job_title && (
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">💼</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">Pekerjaan</p>
                      <p className="font-semibold text-gray-900 break-words">
                        {alumniData.job_title}
                      </p>
                    </div>
                  </div>
                )}

                {alumniData.phone && (
                  <div className="flex items-center gap-2 mb-2">
                    <span>📱</span>
                    <span className="text-sm text-gray-700">{alumniData.phone}</span>
                  </div>
                )}

                {alumniData.email && (
                  <div className="flex items-center gap-2 mb-3">
                    <span>📧</span>
                    <span className="text-sm text-gray-700 break-all">
                      {alumniData.email}
                    </span>
                  </div>
                )}

                {/* Social Media Links */}
                {(alumniData.linkedin ||
                  alumniData.instagram ||
                  alumniData.facebook ||
                  alumniData.website) && (
                  <div className="flex gap-2 mb-4 pt-3 border-t border-gray-100">
                    {alumniData.linkedin && (
                      <a
                        href={alumniData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        title="LinkedIn"
                      >
                        💼
                      </a>
                    )}
                    {alumniData.instagram && (
                      <a
                        href={alumniData.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition"
                        title="Instagram"
                      >
                        📷
                      </a>
                    )}
                    {alumniData.facebook && (
                      <a
                        href={alumniData.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                        title="Facebook"
                      >
                        👥
                      </a>
                    )}
                    {alumniData.website && (
                      <a
                        href={alumniData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        title="Website"
                      >
                        🌐
                      </a>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(alumniData)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(alumniData)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === "add" ? "Tambah Alumni Baru" : "Edit Data Alumni"}
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
                  {modalMode === "add" ? "Tambah Alumni" : "Simpan Perubahan"}
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
