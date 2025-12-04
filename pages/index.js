import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import StatsCards from "../components/StatsCards";
import SearchAddBar from "../components/SearchAddBar";
import StudentCard from "../components/StudentCard";
import AddStudentModal from "../components/AddStudentModal";
import EditStudentModal from "../components/EditStudentModal";
import NotificationPanel from "../components/NotificationPanel";
import initialStudents from "../data/students";

// 🔔 MINI NOTIF TERBANG
function NotificationBox({ notifs }) {
  return (
    <div className="fixed top-20 right-5 flex flex-col gap-3 z-[9999] pointer-events-none">
      {notifs.map((n) => (
        <div
          key={n.id}
          className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg animate-fade pointer-events-auto"
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}

// 👀 Komponen khusus untuk guest, hanya menampilkan data publik
function PublicStudentCard({ s }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h3 className="font-semibold">{s.name}</h3>
      <p>NIS: {s.nis}</p>
      {s.nisn && <p>NISN: {s.nisn}</p>}
      {s.kelas && <p>Kelas: {s.kelas}</p>}
      <p>Status: {s.status}</p>
    </div>
  );
}

export default function Home() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [role, setRole] = useState("guest");

  const [notifications, setNotifications] = useState([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifLogs, setNotifLogs] = useState([]);

  // ========================= NOTIFICATION SYSTEM =========================
  const pushNotif = (message) => {
    const id = Date.now();
    const notif = { id, message };

    setNotifications((prev) => [...prev, notif]);
    const updatedLogs = [...notifLogs, notif];
    setNotifLogs(updatedLogs);
    localStorage.setItem("notif_logs", JSON.stringify(updatedLogs));

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  };

  const deleteNotif = (id) => {
    const updated = notifLogs.filter((n) => n.id !== id);
    setNotifLogs(updated);
    localStorage.setItem("notif_logs", JSON.stringify(updated));
  };

  const clearNotifs = () => {
    setNotifLogs([]);
    localStorage.removeItem("notif_logs");
  };

  // ========================= LOAD DATA SISWA =========================
  useEffect(() => {
    const saved = localStorage.getItem("students_data");
    if (saved) setStudents(JSON.parse(saved));
    else {
      const withStatus = initialStudents.map((s) => ({ ...s, status: "siswa" }));
      setStudents(withStatus);
      localStorage.setItem("students_data", JSON.stringify(withStatus));
    }
  }, []);

  useEffect(() => {
    const logs = localStorage.getItem("notif_logs");
    if (logs) setNotifLogs(JSON.parse(logs));
  }, []);

  useEffect(() => {
    const logged = localStorage.getItem("logged_in");
    setRole(logged || "guest");
  }, []);

  // ========================= FILTER DATA =========================
  const filteredStudents = useMemo(() => {
    const q = query.toLowerCase().trim();
    return students.filter((s) => {
      return (
        !q ||
        s.nis.toLowerCase().includes(q) ||
        s.nisn?.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.kelas && s.kelas.toLowerCase().includes(q))
      );
    });
  }, [query, students]);

  const updateStudents = (list) => {
    setStudents(list);
    localStorage.setItem("students_data", JSON.stringify(list));
  };

  // ========================= CRUD & STATUS =========================
  const handleAdd = (newData) => {
    updateStudents([{ ...newData, status: "siswa" }, ...students]);
    pushNotif(`Siswa ${newData.name} berhasil ditambahkan`);
  };

  const handleEdit = (updated) => {
    updateStudents(students.map((s) => (s.nis === updated.nis ? updated : s)));
    pushNotif(`Data ${updated.name} berhasil diperbarui`);
  };

  const handleDelete = (s) => {
    if (!confirm(`Hapus data ${s.name}?`)) return;
    updateStudents(students.filter((x) => x.nis !== s.nis));
    pushNotif(`Data ${s.name} berhasil dihapus`);
  };

  const makeAlumni = (student) => {
    if (!confirm(`Jadikan ${student.name} sebagai ALUMNI?`)) return;
    const updated = students.map((s) =>
      s.nis === student.nis ? { ...s, status: "alumni" } : s
    );
    updateStudents(updated);
    pushNotif(`${student.name} kini menjadi Alumni`);
  };

  const cancelAlumni = (student) => {
    if (!confirm(`Kembalikan ${student.name} menjadi SISWA AKTIF?`)) return;
    const updated = students.map((s) =>
      s.nis === student.nis ? { ...s, status: "siswa" } : s
    );
    updateStudents(updated);
    pushNotif(`${student.name} dikembalikan menjadi siswa aktif`);
  };

  const bgStyle = { backgroundImage: "url('/bg-gedung.jpeg')" };

 // ========================= VIEW GUEST =========================
  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed" style={bgStyle}>
        <div className="min-h-screen bg-white/70 backdrop-blur-sm w-full">
          <Header />

          <div className="w-full px-6 md:px-10 py-10">
            <h1 className="text-3xl font-semibold text-center mb-2">
              Buku Induk Siswa
            </h1>

            <p className="text-center text-gray-600 mb-8">
              Anda melihat sebagai: <b>{role.toUpperCase()}</b>
            </p>

            <div className="mb-6">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari siswa (Nama / NIS / NISN)..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300"
              />
            </div>

            <StatsCards students={students} />

            <h2 className="text-xl font-bold mt-10 mb-5">Siswa Aktif</h2>
            <div className="grid gap-4 w-full">
              {filteredStudents
                .filter((s) => s.status !== "alumni")
                .map((s) => (
                  <PublicStudentCard key={s.nis} s={s} />
                ))}
            </div>

            <h2 className="text-xl font-bold mt-10 mb-5">Alumni</h2>
            <div className="grid gap-4 w-full">
              {filteredStudents
                .filter((s) => s.status === "alumni")
                .map((s) => (
                  <PublicStudentCard key={s.nis} s={s} />
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

// ========================= VIEW ADMIN =========================
return (
  <div className="min-h-screen bg-cover bg-center bg-fixed" style={bgStyle}>
    <div className="min-h-screen bg-white/70 backdrop-blur-sm w-full">

      <Header
        onNotifClick={() => setNotifPanelOpen(true)}
        notifications={notifLogs}
      />

      <NotificationBox notifs={notifications} />

      <NotificationPanel
        open={notifPanelOpen}
        onClose={() => setNotifPanelOpen(false)}
        notifs={notifLogs}
        onDelete={deleteNotif}
        onClear={clearNotifs}
      />

      <div className="w-full px-6 md:px-10 py-10">

        {/* ======================= DASHBOARD SECTION ======================= */}
        <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>

        <StatsCards students={students} />

        <SearchAddBar
          query={query}
          setQuery={setQuery}
          onAdd={() => setModalAddOpen(true)}
        />

        {/* ======================= DATA SISWA ======================= */}
        <h2 className="text-2xl font-bold mt-10 mb-4">📘 Data Siswa Aktif</h2>
        <div className="grid gap-5 w-full">
          {filteredStudents
            .filter((s) => s.status !== "alumni")
            .map((s) => (
              <div
                key={s.nis}
                className="bg-white p-5 rounded-xl shadow-md border"
              >
                <StudentCard
                  s={s}
                  onEdit={() => {
                    setEditStudent(s);
                    setModalEditOpen(true);
                  }}
                  onDelete={() => handleDelete(s)}
                  onMakeAlumni={() => makeAlumni(s)}
                />

                {/* ======== RINGKASAN RAPORT ======== */}
                <div className="mt-4 p-4 bg-lightbg rounded-lg border">
                  <h3 className="font-semibold text-lg mb-2">
                    📄 Ringkasan Raport
                  </h3>

                  {s.nilai ? (
                    <>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Mapel</th>
                            <th className="py-2 text-left">Semester</th>
                            <th className="py-2 text-left">Nilai</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(s.nilai).map(([mapel, data]) => (
                            <tr key={mapel} className="border-b">
                              <td className="py-2">{mapel.toUpperCase()}</td>
                              <td className="py-2">
                                {data?.semester ?? "-"}
                              </td>
                              <td className="py-2">
                                <b>{data?.nilai ?? "-"}</b>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Hitung total & rata-rata */}
                      <div className="mt-3">
                        {(() => {
                          const listNilai = Object.values(s.nilai).map(
                            (x) => x.nilai
                          );
                          const total = listNilai.reduce((a, b) => a + b, 0);
                          const avg = (total / listNilai.length).toFixed(2);

                          return (
                            <div className="text-sm mt-3">
                              <p>
                                <b>Jumlah Nilai:</b> {total}
                              </p>
                              <p>
                                <b>Rata-rata Nilai:</b> {avg}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600">Belum ada nilai.</p>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* ======================= DATA ALUMNI ======================= */}
        <h2 className="text-2xl font-bold mt-12 mb-4">🎓 Alumni</h2>
        <div className="grid gap-5 w-full">
          {filteredStudents
            .filter((s) => s.status === "alumni")
            .map((s) => (
              <StudentCard
                key={s.nis}
                s={s}
                onEdit={() => {
                  setEditStudent(s);
                  setModalEditOpen(true);
                }}
                onDelete={() => handleDelete(s)}
                onUndoAlumni={() => cancelAlumni(s)}
              />
            ))}
        </div>
      </div>

      <AddStudentModal
        open={modalAddOpen}
        onClose={() => setModalAddOpen(false)}
        onSave={handleAdd}
        students={students}
      />

      <EditStudentModal
        open={modalEditOpen}
        student={editStudent}
        onClose={() => setModalEditOpen(false)}
        onSave={handleEdit}
        students={students}
      />
    </div>
  </div>
);
}
