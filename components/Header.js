import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Header({ notifications = [], onNotifClick }) {
  const router = useRouter();
  const [role, setRole] = useState("guest");

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const logged = localStorage.getItem("logged_in");
    setRole(logged || "guest");
  }, []);

  function handleLogout() {
    localStorage.removeItem("logged_in");
    setRole("guest");
    router.replace("/");
    setTimeout(() => window.location.reload(), 50);
  }

  // AUTO HIDE NAVBAR
  useEffect(() => {
    function handleScroll() {
      const current = window.scrollY;

      setScrolled(current > 20);

      if (current > lastScroll && current > 80) setHidden(true);
      else setHidden(false);

      setLastScroll(current);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <header
      className={`
        w-full sticky top-0 z-40 transition-all duration-300
        ${hidden ? "-translate-y-full" : "translate-y-0"}
        ${scrolled
          ? "bg-white/40 backdrop-blur-xl shadow"
          : "bg-white/80 backdrop-blur-lg shadow-sm"
        }
      `}
    >
      <div className="w-full flex items-center justify-between py-4 px-4">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center text-2xl shadow">
            📘
          </div>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Buku Induk Siswa
            </h1>
            <p className="text-sm text-gray-500">
              Sistem Manajemen Data Siswa
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* ICON NOTIFIKASI */}
          {role !== "guest" && (
            <button
              onClick={onNotifClick}
              className="relative text-2xl"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
          )}

          {/* LOGIN / LOGOUT */}
          {role === "guest" ? (
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow text-sm font-medium hover:bg-blue-700 transition-all"
            >
              LOGIN
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500 text-white rounded-lg shadow text-sm font-medium hover:bg-red-600 transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
