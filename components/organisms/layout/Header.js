import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Role badge colors
  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: "bg-violet-100", text: "text-violet-700", label: "Admin" },
      guru: { bg: "bg-blue-100", text: "text-blue-700", label: "Guru" },
      wali_kelas: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Wali Kelas",
      },
      alumni: { bg: "bg-amber-100", text: "text-amber-700", label: "Alumni" },
    };
    return (
      badges[role] || { bg: "bg-gray-100", text: "text-gray-700", label: role }
    );
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "guru":
        return "/guru";
      case "wali_kelas":
        return "/wali";
      case "alumni":
        return "/alumni/profile";
      default:
        return "/";
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={getDashboardLink()}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg group-hover:shadow-glow transition-shadow">
              📘
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                Buku Induk Digital Sekolah
              </h1>
              <p className="text-xs text-gray-500">
                Sistem Manajemen Data Siswa
              </p>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse" />
            ) : isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {user?.name}
                    </p>
                    {user?.role && (
                      <span
                        className={`text-xs font-medium ${getRoleBadge(user.role).text}`}
                      >
                        {getRoleBadge(user.role).label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm hover:shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-glow"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
