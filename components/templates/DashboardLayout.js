import { useState } from "react";
import Sidebar from "../organisms/layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../lib/constants";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Definisikan Nav Items berdasarkan Role
  // Idealnya ini ditaruh di config terpisah, tapi untuk kemudahan maintain ditaruh disini atau di constants
  const getNavItems = (role) => {
    if (!role) return [];

    const commonItems = [];

    // Admin Items
    if (role === ROLES.ADMIN) {
      return [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        { href: "/admin/students", label: "Siswa", icon: "👨‍🎓" },
        { href: "/admin/alumni", label: "Alumni", icon: "🎓" },
        { href: "/admin/grades", label: "Raport", icon: "📝" },
        { href: "/admin/subjects", label: "Mata Pelajaran", icon: "📚" },
        { href: "/admin/users", label: "Pengguna", icon: "👥" },
        { href: "/admin/notifications", label: "Notifikasi", icon: "🔔" },
      ];
    }

    // Guru Items
    if (role === ROLES.GURU) {
      return [
        { href: "/guru", label: "Dashboard", icon: "📊" },
        { href: "/guru/grades", label: "Input Nilai", icon: "📝" },
      ];
    }

    // Wali Kelas Items
    if (role === ROLES.WALI_KELAS) {
      return [
        { href: "/walikelas", label: "Dashboard", icon: "📊" },
        { href: "/walikelas/siswa", label: "Siswa", icon: "👨‍🎓" },
      ];
    }

    return [];
  };

  const navItems = getNavItems(user?.role);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        items={navItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Wrapper */}
      <div className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
        {/* Mobile Header Toggle */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 md:hidden px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-lg text-primary">
            Buku Induk Digital Sekolah
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            ☰
          </button>
        </header>

        <main className="p-4 md:p-8 flex-1">{children}</main>

        {/* Footer Dashboard */}
      </div>
    </div>
  );
}
