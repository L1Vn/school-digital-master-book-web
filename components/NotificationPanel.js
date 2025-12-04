// components/NotificationPanel.js
import { useEffect, useRef } from "react";

export default function NotificationPanel({ open, onClose, notifs, onDelete, onClear }) {
  const panelRef = useRef();

  // Klik di luar untuk menutup
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">

      <div
        ref={panelRef}
        className="bg-white w-80 h-full p-5 shadow-xl overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-4">Notifikasi</h2>

        <button
          onClick={onClear}
          className="bg-red-500 text-white w-full py-2 rounded-lg mb-4"
        >
          Hapus Semua
        </button>

        {notifs.length === 0 && (
          <p className="text-gray-600 text-center mt-10">Tidak ada notifikasi.</p>
        )}

        {/* LIST NOTIF */}
        <div className="flex flex-col gap-3">
          {notifs.map((n) => (
            <div
              key={n.id}
              className="bg-primary text-white p-3 rounded-xl shadow flex justify-between items-start"
            >
              <p className="text-sm">{n.message}</p>
              <button
                onClick={() => onDelete(n.id)}
                className="ml-2 text-white text-lg"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
