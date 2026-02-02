import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../../components/templates/DashboardLayout";
import Loading from "../../components/atoms/Loading";
import ErrorMessage from "../../components/atoms/ErrorMessage";
import * as api from "../../lib/api";
import toast from "react-hot-toast";

export default function AdminNotificationsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | unread | read
  const [unreadCount, setUnreadCount] = useState(0);

  // Cek otorisasi
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      if (user) {
        toast.error("Anda tidak memiliki akses ke halaman ini");
      }
      router.replace("/");
    }
  }, [isLoading, isAdmin, user, router]);

  // Load notifikasi
  useEffect(() => {
    if (isAdmin) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isAdmin, filter]);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filter !== "all") {
        params.status = filter;
      }
      
      const response = await api.getNotifications(params);
      setNotifications(response.data || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError(err.message || "Gagal memuat notifikasi");
      toast.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  }

  async function loadUnreadCount() {
    try {
      const response = await api.getUnreadNotificationsCount();
      setUnreadCount(response.data?.unread_count || 0);
    } catch (err) {
      console.error("Error loading unread count:", err);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await api.markNotificationAsRead(id);
      toast.success("Notifikasi ditandai sebagai sudah dibaca");
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error("Error marking as read:", err);
      toast.error("Gagal menandai notifikasi");
    }
  }

  async function handleMarkAllAsRead() {
    if (!confirm("Tandai semua notifikasi sebagai sudah dibaca?")) return;

    try {
      await api.markAllNotificationsAsRead();
      toast.success("Semua notifikasi ditandai sebagai sudah dibaca");
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Gagal menandai semua notifikasi");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus notifikasi ini?")) return;

    try {
      await api.deleteNotification(id);
      toast.success("Notifikasi berhasil dihapus");
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("Gagal menghapus notifikasi");
    }
  }

  function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (isLoading || !isAdmin) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifikasi</h1>
        <p className="text-gray-600">
          Monitor perubahan data alumni dan aktivitas sistem
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Notifikasi</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.length}
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-600">Belum Dibaca</p>
                <p className="text-2xl font-bold text-blue-700">{unreadCount}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                ✓ Tandai Semua Sudah Dibaca
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 border-b border-gray-200">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              filter === "all"
                ? "text-primary border-primary"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              filter === "unread"
                ? "text-primary border-primary"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Belum Dibaca {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              filter === "read"
                ? "text-primary border-primary"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Sudah Dibaca
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Memuat notifikasi..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadNotifications} />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {filter === "all" ? "Belum Ada Notifikasi" : "Tidak Ada Notifikasi"}
          </h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "Notifikasi akan muncul di sini ketika ada perubahan data alumni"
              : filter === "unread"
              ? "Semua notifikasi sudah dibaca"
              : "Tidak ada notifikasi yang sudah dibaca"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-soft overflow-hidden transition-all hover:shadow-lg ${
                !notification.is_read ? "border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          notification.type === "alumni_updated"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {notification.type === "alumni_updated"
                          ? "Update Alumni"
                          : notification.type}
                      </span>
                      {!notification.is_read && (
                        <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">
                          Baru
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-gray-900 font-medium mb-2">
                      {notification.message}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {notification.triggered_by && (
                        <div className="flex items-center gap-1">
                          <span>👤</span>
                          <span>{notification.triggered_by.name}</span>
                        </div>
                      )}
                      {notification.triggered_ip && (
                        <div className="flex items-center gap-1">
                          <span>🌐</span>
                          <span>{notification.triggered_ip}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>🕐</span>
                        <span>{formatRelativeTime(notification.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-semibold"
                        title="Tandai sudah dibaca"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-semibold"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
