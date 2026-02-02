import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../../hooks/useAuth";

export default function Sidebar({ items, isOpen, onClose }) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
                fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
            `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-primary"
            >
              <span>📚</span>
              <span>Buku Induk Digital Sekolah</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 md:hidden text-gray-500"
            >
              ✕
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {items.map((item) => {
              const isActive = router.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                                        ${
                                          isActive
                                            ? "bg-primary text-white shadow-md shadow-primary/30"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                                        }
                                    `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <span>🚪</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
