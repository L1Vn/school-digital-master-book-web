import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import { ROLES } from "../../lib/constants";
import * as api from "../../lib/api";
import DeleteConfirmationModal from "../../components/organisms/modals/DeleteConfirmationModal";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLES.GURU,
    subject: "", // Untuk Guru
    class: "", // Untuk Wali Kelas
    alumni: "", // Untuk Alumni
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
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersRes, subjectsRes, alumniRes] = await Promise.all([
        api.getUsers(),
        api.getSubjects(),
        api.getAlumni(),
      ]);
      
      setUsers(usersRes.data || []);
      setSubjects(Array.isArray(subjectsRes) ? subjectsRes : subjectsRes.data || []);
      setAlumni(alumniRes.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Gagal memuat data users");
      toast.error("Gagal memuat data users");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: ROLES.GURU,
      subject: "",
      class: "",
      alumni: "",
    });
    setShowModal(true);
  };

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setFormData({
      name: userData.name,
      email: userData.email,
      password: "",
      role: userData.role,
      subject: userData.subject || "",
      class: userData.class || "",
      alumni: userData.alumni || "",
    });
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    setUserToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.deleteUser(userToDelete.id);
      toast.success("User berhasil dihapus");
      loadData();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.message || "Gagal menghapus user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Nama dan email harus diisi");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("Password harus diisi untuk user baru");
      return;
    }

    // Validasi role-specific
    if (formData.role === ROLES.GURU && !formData.subject) {
      toast.error("Mata pelajaran harus dipilih untuk role Guru");
      return;
    }

    if (formData.role === ROLES.WALI_KELAS && !formData.class) {
      toast.error("Kelas harus diisi untuk role Wali Kelas");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Tambahkan password jika ada
      if (formData.password) {
        payload.password = formData.password;
      }

      // Tambahkan field role-specific
      if (formData.role === ROLES.GURU && formData.subject) {
        payload.subject = formData.subject;
      }

      if (formData.role === ROLES.WALI_KELAS && formData.class) {
        payload.class = formData.class;
      }

      if (formData.role === ROLES.ALUMNI && formData.alumni) {
        payload.alumni = formData.alumni;
      }

      if (editingUser) {
        await api.updateUser(editingUser.id, payload);
        toast.success("User berhasil diperbarui");
      } else {
        await api.createUser(payload);
        toast.success("User berhasil ditambahkan");
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error(err.response?.data?.message || "Gagal menyimpan user");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return "bg-red-100 text-red-700";
      case ROLES.GURU:
        return "bg-blue-100 text-blue-700";
      case ROLES.WALI_KELAS:
        return "bg-purple-100 text-purple-700";
      case ROLES.ALUMNI:
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      [ROLES.ADMIN]: "Admin",
      [ROLES.GURU]: "Guru",
      [ROLES.WALI_KELAS]: "Wali Kelas",
      [ROLES.ALUMNI]: "Alumni",
    };
    return labels[role] || role;
  };

  // Hitung jumlah role
  const roleCounts = {
    total: users.length,
    admin: users.filter((u) => u.role === ROLES.ADMIN).length,
    guru: users.filter((u) => u.role === ROLES.GURU).length,
    wali_kelas: users.filter((u) => u.role === ROLES.WALI_KELAS).length,
    alumni: users.filter((u) => u.role === ROLES.ALUMNI).length,
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  if (isLoading || !isAdmin) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manajemen Pengguna
        </h1>
        <p className="text-gray-600">
          Kelola akun pengguna dan hak akses sistem
        </p>
      </div>

      {/* Stats & Action Bar */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl">
              <p className="text-xs opacity-90">Total</p>
              <p className="text-2xl font-bold">{roleCounts.total}</p>
            </div>
            <div className="bg-red-50 px-4 py-3 rounded-xl border border-red-200">
              <p className="text-xs text-red-600">Admin</p>
              <p className="text-2xl font-bold text-red-700">{roleCounts.admin}</p>
            </div>
            <div className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-600">Guru</p>
              <p className="text-2xl font-bold text-blue-700">{roleCounts.guru}</p>
            </div>
            <div className="bg-purple-50 px-4 py-3 rounded-xl border border-purple-200">
              <p className="text-xs text-purple-600">Wali Kelas</p>
              <p className="text-2xl font-bold text-purple-700">
                {roleCounts.wali_kelas}
              </p>
            </div>
            <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-200">
              <p className="text-xs text-green-600">Alumni</p>
              <p className="text-2xl font-bold text-green-700">{roleCounts.alumni}</p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-xl">+</span>
            Tambah User
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">👥 Semua Role</option>
            <option value={ROLES.ADMIN}>🔴 Admin</option>
            <option value={ROLES.GURU}>🔵 Guru</option>
            <option value={ROLES.WALI_KELAS}>🟣 Wali Kelas</option>
            <option value={ROLES.ALUMNI}>🟢 Alumni</option>
          </select>
        </div>

        {(search || roleFilter) && (
          <div className="mt-3">
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
              }}
              className="text-sm text-primary hover:text-primary-dark font-semibold"
            >
              🔄 Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Memuat data users..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {search || roleFilter ? "Tidak Ada Hasil" : "Belum Ada User"}
          </h3>
          <p className="text-gray-600">
            {search || roleFilter
              ? "Coba ubah filter atau kata kunci pencarian"
              : "Mulai tambahkan user baru"}
          </p>
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
                    Nama & Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Info Tambahan
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((userData, index) => {
                  const subject = subjects.find((s) => s.id == userData.subject);
                  const alumniData = alumni.find((a) => a.nim == userData.alumni);

                  return (
                    <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{userData.name}</p>
                          <p className="text-sm text-gray-600">{userData.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${getRoleBadgeColor(
                            userData.role
                          )}`}
                        >
                          {getRoleLabel(userData.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {userData.role === ROLES.GURU && subject && (
                            <div className="flex items-center gap-1">
                              <span>📚</span>
                              <span>{subject.name}</span>
                            </div>
                          )}
                          {userData.role === ROLES.WALI_KELAS && userData.class && (
                            <div className="flex items-center gap-1">
                              <span>🏫</span>
                              <span>Kelas {userData.class}</span>
                            </div>
                          )}
                          {userData.role === ROLES.ALUMNI && alumniData && (
                            <div className="flex items-center gap-1">
                              <span>🎓</span>
                              <span>{alumniData.name}</span>
                            </div>
                          )}
                          {userData.role === ROLES.ADMIN && (
                            <span className="text-gray-500 italic">
                              Full access
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(userData)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(userData.id, userData.name)}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingUser ? "Edit User" : "Tambah User Baru"}
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
                {/* Nama */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nama lengkap"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Password"}
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Kosongkan jika tidak ingin mengubah password
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        role: e.target.value,
                        // Reset role-specific fields
                        subject: "",
                        class: "",
                        alumni: "",
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value={ROLES.ADMIN}>Admin</option>
                    <option value={ROLES.GURU}>Guru</option>
                    <option value={ROLES.WALI_KELAS}>Wali Kelas</option>
                    <option value={ROLES.ALUMNI}>Alumni</option>
                  </select>
                </div>

                {/* Field Kondisional Berdasarkan Role */}
                
                {/* Mata Pelajaran (untuk Guru) */}
                {formData.role === ROLES.GURU && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-semibold text-blue-900 mb-2">
                      Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Mata Pelajaran</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-blue-700 mt-1">
                      📚 Mata pelajaran yang diampu oleh guru ini
                    </p>
                  </div>
                )}

                {/* Kelas (untuk Wali Kelas) */}
                {formData.role === ROLES.WALI_KELAS && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <label className="block text-sm font-semibold text-purple-900 mb-2">
                      Kelas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.class}
                      onChange={(e) =>
                        setFormData({ ...formData, class: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Contoh: X-1, XI-2, XII-3"
                    />
                    <p className="text-xs text-purple-700 mt-1">
                      🏫 Format: [Tingkat]-[Nomor Kelas], misal: X-1, XI-2, XII-3
                    </p>
                  </div>
                )}

                {/* Alumni (opsional) */}
                {formData.role === ROLES.ALUMNI && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="block text-sm font-semibold text-green-900 mb-2">
                      Data Alumni (Opsional)
                    </label>
                    <select
                      value={formData.alumni}
                      onChange={(e) =>
                        setFormData({ ...formData, alumni: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Pilih Alumni</option>
                      {alumni.map((a) => (
                        <option key={a.nim} value={a.nim}>
                          {a.name} ({a.nim}) - {a.graduation_year}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-green-700 mt-1">
                      🎓 Link user ini dengan data alumni yang ada
                    </p>
                  </div>
                )}
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
                  {editingUser ? "Simpan Perubahan" : "Tambah User"}
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
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus user "${userToDelete?.name}"? Aksi ini tidak dapat dibatalkan.`}
      />
    </DashboardLayout>
  );
}
