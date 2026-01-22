import { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import StatsCards from "../../components/StatsCards";
import SearchAddBar from "../../components/SearchAddBar";
import StudentCard from "../../components/StudentCard";
import AddStudentModal from "../../components/AddStudentModal";
import EditStudentModal from "../../components/EditStudentModal";
import NotificationPanel from "../../components/NotificationPanel";
import initialStudents from "../../data/students";

// Mini notifikasi
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

export default function AdminHome() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifLogs, setNotifLogs] = useState([]);

  const bgStyle = { backgroundImage: "url('/bg-gedung.jpeg')" };

  useEffect(() => {
    const saved = localStorage.getItem("students_data");
    if (saved) setStudents(JSON.parse(saved));
    else {
      const withStatus = initialStudents.map((s) => ({ ...s, status: "siswa" }));
      setStudents(withStatus);
      localStorage.setItem("students_data", JSON.stringify(withStatus));
    }

    const logs = localStorage.getItem("notif_logs");
    if (logs) setNotifLogs(JSON.parse(logs));
  }, []);

  // =================== FILTER ===================
  const filteredStudents = useMemo(() => {
    const q = query.toLowerCase().trim();
    return students.filter(
      (s) =>
        !q ||
        s.nis.toLowerCase().includes(q) ||
        s.nisn?.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.kelas && s.kelas.toLowerCase().includes(q))
    );
  }, [query, students]);

  const updateStudents = (list) => {
    setStudents(list);
    localStorage.setItem("students_data", JSON.stringify(list));
  };

  // =================== CRUD ===================
  const pushNotif = (message) => {
    const id = Date.now();
    const notif = { id, message };
    setNotifications((prev) => [...prev, notif]);
    const updatedLogs = [...notifLogs, notif];
    setNotifLogs(updatedLogs);
    localStorage.setItem("notif_logs", JSON.stringify(updatedLogs));
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 3500);
  };

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

  const makeAlumni = (s) => {
    if (!confirm(`Jadikan ${s.name} sebagai ALUMNI?`)) return;
    updateStudents(students.map((x) => (x.nis === s.nis ? { ...x, status: "alumni" } : x)));
    pushNotif(`${s.name} kini menjadi Alumni`);
  };

  const cancelAlumni = (s) => {
    if (!confirm(`Kembalikan ${s.name} menjadi SISWA AKTIF?`)) return;
    updateStudents(students.map((x) => (x.nis === s.nis ? { ...x, status: "siswa" } : x)));
    pushNotif(`${s.name} dikembalikan menjadi siswa aktif`);
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

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={bgStyle}>
      <div className="min-h-screen bg-white/70 backdrop-blur-sm w-full">
        <Header onNotifClick={() => setNotifPanelOpen(true)} notifications={notifLogs} />

        <NotificationBox notifs={notifications} />
        <NotificationPanel
          open={notifPanelOpen}
          onClose={() => setNotifPanelOpen(false)}
          notifs={notifLogs}
          onDelete={deleteNotif}
          onClear={clearNotifs}
        />

        <div className="w-full px-6 md:px-10 py-10">
          <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>

          <StatsCards students={students} />
          <SearchAddBar query={query} setQuery={setQuery} onAdd={() => setModalAddOpen(true)} />

          {/* Data Siswa Aktif */}
          <h2 className="text-2xl font-bold mt-10 mb-4">📘 Data Siswa Aktif</h2>
          <div className="grid gap-5 w-full">
            {filteredStudents.filter((s) => s.status !== "alumni").map((s) => (
              <StudentCard
                key={s.nis}
                s={s}
                onEdit={() => { setEditStudent(s); setModalEditOpen(true); }}
                onDelete={() => handleDelete(s)}
                onMakeAlumni={() => makeAlumni(s)}
              />
            ))}
          </div>

          {/* Alumni */}
          <h2 className="text-2xl font-bold mt-12 mb-4">🎓 Alumni</h2>
          <div className="grid gap-5 w-full">
            {filteredStudents.filter((s) => s.status === "alumni").map((s) => (
              <StudentCard
                key={s.nis}
                s={s}
                onEdit={() => { setEditStudent(s); setModalEditOpen(true); }}
                onDelete={() => handleDelete(s)}
                onUndoAlumni={() => cancelAlumni(s)}
              />
            ))}
          </div>
        </div>

        <AddStudentModal open={modalAddOpen} onClose={() => setModalAddOpen(false)} onSave={handleAdd} students={students} />
        <EditStudentModal open={modalEditOpen} student={editStudent} onClose={() => setModalEditOpen(false)} onSave={handleEdit} students={students} />
      </div>
    </div>
  );
}
