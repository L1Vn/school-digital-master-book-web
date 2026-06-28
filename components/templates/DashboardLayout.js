import { useState } from "react";
import Sidebar from "../organisms/layout/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../lib/constants";
import { 
  HiPresentationChartBar, 
  HiAcademicCap, 
  HiDocumentText, 
  HiBookOpen, 
  HiUsers, 
  HiBell,
  HiUserGroup
} from "react-icons/hi2";

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
        { href: "/admin", label: "Dashboard", icon: <HiPresentationChartBar className="w-5 h-5" /> },
        { href: "/admin/students", label: "Siswa", icon: <HiUserGroup className="w-5 h-5" /> },
        { href: "/admin/alumni", label: "Alumni", icon: <HiAcademicCap className="w-5 h-5" /> },
        { href: "/admin/grades", label: "Raport", icon: <HiDocumentText className="w-5 h-5" /> },
        { href: "/admin/subjects", label: "Mata Pelajaran", icon: <HiBookOpen className="w-5 h-5" /> },
        { href: "/admin/users", label: "Pengguna", icon: <HiUsers className="w-5 h-5" /> },
        { href: "/admin/notifications", label: "Notifikasi", icon: <HiBell className="w-5 h-5" /> },
      ];
    }

    // Guru Items
    if (role === ROLES.GURU) {
      return [
        { href: "/guru", label: "Dashboard", icon: <HiPresentationChartBar className="w-5 h-5" /> },
        { href: "/guru/grades", label: "Input Nilai", icon: <HiDocumentText className="w-5 h-5" /> },
      ];
    }

    // Wali Kelas Items
    if (role === ROLES.WALI_KELAS) {
      return [
        { href: "/walikelas", label: "Dashboard", icon: <HiPresentationChartBar className="w-5 h-5" /> },
        { href: "/walikelas/siswa", label: "Siswa", icon: <HiUserGroup className="w-5 h-5" /> },
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
          <div className="font-bold text-lg text-primary flex items-center gap-2">
            <img src="/jejakedu.png" alt="JejakEdu Logo" className="w-6 h-6 object-contain" />
            JejakEdu
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
