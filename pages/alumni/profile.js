import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import Badge from "../../components/atoms/Badge";
import { getMyProfile, updateMyProfile, logout } from "../../lib/api";
import toast from "react-hot-toast";

export default function AlumniProfilePage() {
  const { user, isAlumni, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
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
  });

  // Cek otorisasi
  useEffect(() => {
    if (!authLoading && !isAlumni) {
      if (user) {
        toast.error("Anda tidak memiliki akses ke halaman ini");
      }
      router.replace("/");
    }
  }, [authLoading, isAlumni, router]);

  // Load profil
  useEffect(() => {
    if (isAlumni) {
      loadProfile();
    }
  }, [isAlumni]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProfile();
      setProfile(data);

      // Set form data
      setFormData({
        university: data.university || "",
        job_title: data.job_title || "",
        job_start: data.job_start ? data.job_start.split("T")[0] : "",
        job_end: data.job_end ? data.job_end.split("T")[0] : "",
        phone: data.phone || "",
        email: data.email || "",
        linkedin: data.linkedin || "",
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        website: data.website || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      await updateMyProfile(formData);
      toast.success("Profil berhasil diperbarui");
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Gagal memperbarui profil";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Remove cookie implies backend handles it, but frontend ref might need cleanup if specific logic exists
      // But useAuth hook likely handles user state. We just force reload or redirect.
      // Actually useAuth listens to user, but let's ensure we redirect.
      // window.location.href = "/login"; // Force full reload to clear states
      // Or just router push if useAuth handles state clear.
      // Let's stick to simple router push after API call
      toast.success("Berhasil keluar");
      router.replace("/");
      // Force reload to ensure auth state is cleared from memory if SWR/Context retains it heavily
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Gagal logout");
    }
  };

  if (authLoading || loading) {
    return <Loading fullScreen />;
  }

  if (!isAlumni) {
    return null;
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 py-10 px-6">
          <ErrorMessage message={error} onRetry={loadProfile} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 relative">
        {/* Hero Background */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 h-64 w-full absolute top-0 left-0 z-0">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/20"></div>

          {/* Top Right Logout Button */}
          <div className="absolute top-6 right-6 z-50">
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/20 text-sm font-medium transition-all flex items-center gap-2 group"
            >
              <span>Keluar</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Content */}
          <div className="mb-10 text-white pt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Dashboard Alumni
                </h1>
                <p className="text-blue-100 text-lg">
                  Selamat datang kembali,{" "}
                  <span className="font-semibold text-white">{user?.name}</span>
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-sm">
                📅{" "}
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar (Profile Summary) */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="sticky top-24 border-0 shadow-xl ring-1 ring-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-6 flex flex-col items-center border-b border-gray-100">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 ring-4 ring-white">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 text-center">
                    {profile?.name || user?.name}
                  </h2>
                  <p className="text-gray-500 text-sm">{profile?.nim || "-"}</p>

                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    <Badge variant="success" size="md" className="shadow-sm">
                      🎓 Alumni
                    </Badge>
                    {profile?.graduation_year && (
                      <Badge variant="primary" size="md" className="shadow-sm">
                        Angkatan {profile.graduation_year}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Status Saat Ini
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profile?.employed ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                          💼 Bekerja
                        </span>
                      ) : null}
                      {profile?.in_university ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                          📚 Kuliah
                        </span>
                      ) : null}
                      {!profile?.employed && !profile?.in_university && (
                        <span className="text-gray-500 text-sm italic">
                          Belum mengisi status
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Kontak Cepat
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                        <span className="text-lg">📧</span>
                        <span className="text-sm truncate">{user?.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="text-lg">📱</span>
                          <span className="text-sm">{profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        className="w-full text-xs"
                        onClick={() => router.push("/")}
                      >
                        🏠 Home
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full text-xs"
                        onClick={() => router.push("/")}
                      >
                        🔍 Cari
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Content (Details) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Basic Information */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    <span>Informasi Dasar</span>
                  </div>
                }
                className="border-0 shadow-lg ring-1 ring-gray-100"
                actions={
                  !isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                    >
                      ✏️ Edit Data
                    </Button>
                  )
                }
              >
                {!isEditing && profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Nama Lengkap
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {profile.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Nomor Induk Mahasiswa (NIM)
                      </label>
                      <p className="text-lg font-semibold text-gray-900 font-mono">
                        {profile.nim}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Tahun Lulus
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {profile.graduation_year || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Tempat, Tanggal Lahir
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {profile.birth_place ? `${profile.birth_place}, ` : ""}
                        {profile.birth_date
                          ? new Date(profile.birth_date).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-start gap-3">
                    <span className="text-xl">ℹ️</span>
                    <div className="text-sm">
                      <p className="font-semibold">Data Terkunci</p>
                      <p>
                        Informasi dasar (Nama, NIM, Tanggal Lahir) dikelola oleh
                        administrator sekolah. Hubungi admin jika terdapat
                        kesalahan data.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Education & Career */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    <span>Pendidikan & Karir</span>
                  </div>
                }
                className="border-0 shadow-lg ring-1 ring-gray-100"
              >
                {!isEditing && profile && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">
                            🎓
                          </div>
                          <div>
                            <label className="text-xs font-bold text-blue-600 uppercase">
                              Universitas
                            </label>
                            <p className="text-gray-900 font-semibold">
                              {profile.university || "Belum diisi"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">
                            💼
                          </div>
                          <div>
                            <label className="text-xs font-bold text-emerald-600 uppercase">
                              Pekerjaan
                            </label>
                            <p className="text-gray-900 font-semibold">
                              {profile.job_title || "Belum diisi"}
                            </p>
                          </div>
                        </div>
                        {(profile.job_start || profile.job_end) && (
                          <p className="text-xs text-gray-500 mt-2 ml-14">
                            {profile.job_start
                              ? new Date(profile.job_start).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )
                              : "?"}{" "}
                            —{" "}
                            {profile.job_end
                              ? new Date(profile.job_end).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )
                              : "Sekarang"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Universitas / Perguruan Tinggi"
                        name="university"
                        placeholder="Contoh: Universitas Indonesia"
                        value={formData.university}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Pekerjaan / Jabatan"
                        name="job_title"
                        placeholder="Contoh: Software Engineer"
                        value={formData.job_title}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100">
                      <h4 className="font-semibold text-gray-700 text-sm">
                        Periode Bekerja
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Mulai"
                          name="job_start"
                          type="date"
                          value={formData.job_start}
                          onChange={handleInputChange}
                        />
                        <Input
                          label="Selesai"
                          name="job_end"
                          type="date"
                          value={formData.job_end}
                          onChange={handleInputChange}
                          helperText="Kosongkan jika masih bekerja saat ini"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </Card>

              {/* Contact & Social */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌐</span>
                    <span>Kontak & Media Sosial</span>
                  </div>
                }
                className="border-0 shadow-lg ring-1 ring-gray-100"
              >
                {!isEditing && profile && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Social Grid items */}
                      {profile.linkedin && (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 hover:border-blue-200 group"
                        >
                          <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">
                            🔗
                          </span>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-500 mb-1">
                              LinkedIn
                            </p>
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {profile.linkedin}
                            </p>
                          </div>
                        </a>
                      )}
                      {/* Add other social logic similarly for viewing - simplified for brevity in logic but maintained for visual */}
                      {["instagram", "facebook", "website"].map((social) => {
                        if (!profile[social]) return null;
                        const icons = {
                          instagram: "📷",
                          facebook: "👤",
                          website: "🌐",
                        };
                        return (
                          <a
                            key={social}
                            href={profile[social]}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors border border-gray-100 hover:border-indigo-200 group"
                          >
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">
                              {icons[social]}
                            </span>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-gray-500 mb-1 capitalize">
                                {social}
                              </p>
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {profile[social]}
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </div>

                    {!profile.linkedin &&
                      !profile.instagram &&
                      !profile.facebook &&
                      !profile.website && (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                          <p className="text-gray-500 mb-3">
                            Belum ada informasi media sosial yang ditambahkan.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            + Tambah Media Sosial
                          </Button>
                        </div>
                      )}
                  </div>
                )}

                {isEditing && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Email Pribadi"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Nomor Telepon / WhatsApp"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <hr className="border-gray-100" />
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="LinkedIn URL"
                        name="linkedin"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.linkedin}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Instagram Username"
                        name="instagram"
                        placeholder="@username"
                        value={formData.instagram}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Facebook URL"
                        name="facebook"
                        placeholder="https://facebook.com/..."
                        value={formData.facebook}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Website / Portfolio URL"
                        name="website"
                        placeholder="https://..."
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Action Footer (Only in Edit Mode) */}
              {isEditing && (
                <div className="sticky bottom-6 z-20">
                  <div className="bg-white/90 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-gray-200 flex justify-between items-center w-full">
                    <span className="text-gray-600 font-medium ml-2">
                      Simpan perubahan profil?
                    </span>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            university: profile.university || "",
                            job_title: profile.job_title || "",
                            job_start: profile.job_start || "",
                            job_end: profile.job_end || "",
                            phone: profile.phone || "",
                            email: profile.email || "",
                            linkedin: profile.linkedin || "",
                            instagram: profile.instagram || "",
                            facebook: profile.facebook || "",
                            website: profile.website || "",
                          });
                        }}
                        disabled={saving}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        loading={saving}
                        className="shadow-lg shadow-blue-500/30 min-w-[120px]"
                      >
                        💾 Simpan
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
