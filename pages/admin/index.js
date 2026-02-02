import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import * as api from "../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

// ========================
// STATS CARD COMPONENT
// ========================
function StatsCard({ icon, label, value, href, color, badge }) {
  return (
    <Link href={href} className="block group">
      <div
        className={`${color} rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] relative overflow-hidden`}
      >
        {badge && (
          <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold">
            {badge}
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="text-5xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div>
            <p className="text-4xl font-bold mb-1">{value}</p>
            <p className="text-sm opacity-90 font-semibold">{label}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ========================
// NOTIFICATION CARD
// ========================
function NotificationCard({ notification, onClick }) {
  function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
        !notification.is_read
          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
          : "bg-white border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex gap-3">
        <div className="text-2xl">{notification.is_read ? "📬" : "📭"}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500">
            {formatRelativeTime(notification.created_at)}
          </p>
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
        )}
      </div>
    </div>
  );
}

// ========================
// QUICK ACTION CARD
// ========================
function ActionCard({ icon, title, description, href }) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-xl p-5 shadow-soft hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary/30 group-hover:scale-[1.02] h-full">
        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">
          {icon}
        </div>
        <h3 className="font-bold text-base text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}

// ========================
// MAIN COMPONENT
// ========================
export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    students: 0,
    alumni: 0,
    subjects: 0,
    users: 0,
    unreadNotifications: 0,
  });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cek otorisasi
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      if (user) {
        toast.error("Anda tidak memiliki akses ke halaman ini");
      }
      router.replace("/");
    }
  }, [authLoading, isAdmin, user, router]);

  // Load data
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      // Load semua data secara paralel
      const [studentsRes, alumniRes, subjectsRes, usersRes, notifCountRes, notifRes] =
        await Promise.all([
          api.getStudents(),
          api.getAlumni(),
          api.getSubjects(),
          api.getUsers(),
          api.getUnreadNotificationsCount(),
          api.getNotifications({ per_page: 5, status: "all" }),
        ]);

      setStats({
        students: studentsRes.data?.length || 0,
        alumni: alumniRes.data?.length || 0,
        subjects: subjectsRes.data?.length || 0,
        users: usersRes.data?.length || 0,
        unreadNotifications: notifCountRes.data?.unread_count || 0,
      });

      setRecentNotifications(notifRes.data || []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError(err.message || "Gagal memuat data dashboard");
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }

  function handleNotificationClick(id) {
    router.push("/admin/notifications");
  }

  if (authLoading || !isAdmin) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Admin
        </h1>
        <p className="text-gray-600">
          Selamat datang kembali, {user?.name || "Admin"}! 👋
        </p>
      </div>

      {loading ? (
        <Loading text="Memuat dashboard..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadDashboardData} />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon="👨‍🎓"
              label="Total Siswa"
              value={stats.students}
              href="/admin/students"
              color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            />
            <StatsCard
              icon="🎓"
              label="Total Alumni"
              value={stats.alumni}
              href="/admin/alumni"
              color="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            />
            <StatsCard
              icon="📚"
              label="Mata Pelajaran"
              value={stats.subjects}
              href="/admin/subjects"
              color="bg-gradient-to-br from-green-500 to-green-600 text-white"
            />
            <StatsCard
              icon="🔔"
              label="Notifikasi"
              value={stats.unreadNotifications}
              href="/admin/notifications"
              color="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
              badge={stats.unreadNotifications > 0 ? "Baru" : null}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Notifications */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Notifikasi Terbaru
                  </h2>
                  <Link
                    href="/admin/notifications"
                    className="text-sm text-primary hover:text-primary-dark font-semibold"
                  >
                    Lihat Semua →
                  </Link>
                </div>

                {recentNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-gray-500">Belum ada notifikasi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentNotifications.map((notif) => (
                      <NotificationCard
                        key={notif.id}
                        notification={notif}
                        onClick={() => handleNotificationClick(notif.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  <ActionCard
                    icon="➕"
                    title="Tambah Siswa"
                    description="Input data siswa baru"
                    href="/admin/students"
                  />
                  <ActionCard
                    icon="📝"
                    title="Input Nilai"
                    description="Kelola raport siswa"
                    href="/admin/grades"
                  />
                  <ActionCard
                    icon="👥"
                    title="Kelola User"
                    description="Atur hak akses pengguna"
                    href="/admin/users"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-soft p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Sistem Buku Induk Digital
                </h3>
                <p className="text-indigo-100">
                  Platform terintegrasi untuk pengelolaan data siswa dan alumni
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-3xl font-bold">{stats.users}</p>
                  <p className="text-sm opacity-90">Total Pengguna</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-3xl font-bold">
                    {stats.students + stats.alumni}
                  </p>
                  <p className="text-sm opacity-90">Total Data</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
