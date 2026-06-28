import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../../hooks/useAuth";
import { useState } from "react";
import { HiArrowLeftOnRectangle } from "react-icons/hi2";

export default function Sidebar({ items, isOpen, onClose }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

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
              <img src="/jejakedu.png" alt="JejakEdu Logo" className="h-30 w-auto object-contain" />
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
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? (
                <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <HiArrowLeftOnRectangle className="w-5 h-5 text-red-600" />
              )}
              <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
