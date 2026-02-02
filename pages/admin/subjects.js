import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import * as api from "../../lib/api";
import DeleteConfirmationModal from "../../components/organisms/modals/DeleteConfirmationModal";
import toast from "react-hot-toast";

export default function AdminSubjectsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      if (user) {
        toast.error("Anda tidak memiliki akses ke halaman ini");
      }
      router.replace("/");
    }
  }, [isLoading, isAdmin, user, router]);

  useEffect(() => {
    if (isAdmin) {
      loadSubjects();
    }
  }, [isAdmin]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getSubjects();
      setSubjects(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.error("Error loading subjects:", err);
      setError(err.message || "Gagal memuat data mata pelajaran");
      toast.error("Gagal memuat data mata pelajaran");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setFormData({ name: "", code: "" });
    setShowModal(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || "",
    });
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    setSubjectToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;

    try {
      await api.deleteSubject(subjectToDelete.id);
      toast.success("Mata pelajaran berhasil dihapus");
      loadSubjects();
      setShowDeleteModal(false);
      setSubjectToDelete(null);
    } catch (err) {
      console.error("Error deleting subject:", err);
      if (err.response?.status === 409 || err.message?.includes("in use")) {
        toast.error("Tidak dapat menghapus! Mata pelajaran masih digunakan dalam nilai siswa.");
      } else {
        toast.error(err.message || "Gagal menghapus mata pelajaran");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama mata pelajaran harus diisi");
      return;
    }

    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, formData);
        toast.success("Mata pelajaran berhasil diperbarui");
      } else {
        await api.createSubject(formData);
        toast.success("Mata pelajaran berhasil ditambahkan");
      }

      setShowModal(false);
      setFormData({ name: "", code: "" });
      loadSubjects();
    } catch (err) {
      console.error("Error saving subject:", err);
      toast.error(err.message || "Gagal menyimpan data");
    }
  };

  // Filter mata pelajaran
  const filteredSubjects = subjects.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)
    );
  });

  if (isLoading || !isAdmin) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mata Pelajaran
        </h1>
        <p className="text-gray-600">
          Kelola daftar mata pelajaran sekolah
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-xl">
              <p className="text-sm opacity-90">Total Mata Pelajaran</p>
              <p className="text-3xl font-bold">{subjects.length}</p>
            </div>
            {search && (
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <p className="text-sm text-green-600">Hasil Pencarian</p>
                <p className="text-xl font-bold text-green-700">
                  {filteredSubjects.length} Mapel
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Tambah Mata Pelajaran
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="🔍 Cari nama atau kode mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {search && (
          <div className="mt-2">
            <button
              onClick={() => setSearch("")}
              className="text-sm text-primary hover:text-primary-dark font-semibold"
            >
              🔄 Reset Pencarian
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Memuat mata pelajaran..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadSubjects} />
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {search ? "Tidak Ada Hasil" : "Belum Ada Mata Pelajaran"}
          </h3>
          <p className="text-gray-600 mb-6">
            {search
              ? "Coba gunakan kata kunci lain"
              : "Mulai tambahkan mata pelajaran dengan klik tombol di atas"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="px-4 py-2 text-primary font-semibold hover:bg-primary/10 rounded-lg transition"
            >
              Tampilkan Semua
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Kode
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Nama Mata Pelajaran
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Dibuat Oleh
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubjects.map((subject, index) => (
                  <tr
                    key={subject.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      {subject.code && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                          {subject.code}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {subject.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {subject.created_by?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id, subject.name)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition text-sm"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSubject
                    ? "Edit Mata Pelajaran"
                    : "Tambah Mata Pelajaran Baru"}
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
              <div className="space-y-4">
                {/* Nama Mata Pelajaran */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Contoh: Matematika"
                  />
                </div>

                {/* Kode Mata Pelajaran */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kode (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Contoh: MTK"
                    maxLength="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kode singkat untuk mata pelajaran (maksimal 10 karakter)
                  </p>
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
                  {editingSubject ? "Simpan Perubahan" : "Tambah Mata Pelajaran"}
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
          setSubjectToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Mata Pelajaran"
        message={`Apakah Anda yakin ingin menghapus mata pelajaran "${subjectToDelete?.name}"? Pastikan tidak ada nilai yang menggunakan mata pelajaran ini.`}
      />
    </DashboardLayout>
  );
}
