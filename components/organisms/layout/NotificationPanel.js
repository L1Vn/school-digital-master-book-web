export default function NotificationPanel({ open, onClose, notifs = [], onDelete, onClear }) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">Notifikasi</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✖
          </button>
        </div>

        {/* Actions */}
        {notifs.length > 0 && (
          <div className="p-3 border-b bg-gray-50">
            <button
              onClick={onClear}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Hapus Semua
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4">
          {notifs.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Tidak ada notifikasi
            </div>
          ) : (
            <div className="space-y-3">
              {notifs.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 bg-gray-50 rounded-lg flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="text-sm">{notif.message}</p>
                    {notif.timestamp && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.timestamp).toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(notif.id)}
                    className="text-red-400 hover:text-red-600 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
