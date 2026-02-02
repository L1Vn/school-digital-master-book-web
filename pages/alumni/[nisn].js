import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../../components/organisms/layout/Header";

export default function AlumniDetail() {
  const router = useRouter();
  const { nisn } = router.query;

  const [students, setStudents] = useState([]);
  const [alumni, setAlumni] = useState(null);
  const [form, setForm] = useState(null);

  // Load data siswa
  useEffect(() => {
    const saved = localStorage.getItem("students_data");
    if (saved) setStudents(JSON.parse(saved));
  }, []);

  // Cari alumni berdasarkan NISN
  useEffect(() => {
    if (!nisn || students.length === 0) return;

    const found = students.find((s) => s.nisn === nisn);

    if (!found) {
      alert("Data alumni tidak ditemukan!");
      router.replace("/login");
      return;
    }

    setAlumni(found);
    setForm({ ...found });
  }, [nisn, students]);

  // Simpan perubahan
  function handleSave() {
    const updated = students.map((s) =>
      s.nisn === nisn ? form : s
    );

    localStorage.setItem("students_data", JSON.stringify(updated));
    alert("Data berhasil diperbarui!");
  }

  if (!form) return <p className="p-10 text-center">Memuat data...</p>;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />

      <div className="max-w-3xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          Edit Data Alumni
        </h2>

        <p className="text-center mb-6 text-gray-600">
          Anda melihat sebagai: <b>{alumni.name} [Alumni]</b>
        </p>

        <div className="grid grid-cols-2 gap-4">
          <input value={form.nis} disabled className="p-3 border rounded" />
          <input value={form.nisn} disabled className="p-3 border rounded" />

          <input
            className="p-3 border rounded"
            placeholder="Nama"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            className="p-3 border rounded"
            value={form.gender || ""}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          <input
            className="p-3 border rounded"
            placeholder="Kelas"
            value={form.kelas || ""}
            onChange={(e) => setForm({ ...form, kelas: e.target.value })}
          />

          <input
            className="p-3 border rounded"
            placeholder="Tempat Lahir"
            value={form.birth_place || ""}
            onChange={(e) =>
              setForm({ ...form, birth_place: e.target.value })
            }
          />

          <input
            type="date"
            className="p-3 border rounded"
            value={form.birth_date || ""}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
          />

          <input
            className="p-3 border rounded"
            placeholder="Nama Orang Tua"
            value={form.parent_name || ""}
            onChange={(e) =>
              setForm({ ...form, parent_name: e.target.value })
            }
          />

          <input
            className="p-3 border rounded"
            placeholder="No Telepon"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="p-3 border rounded"
            placeholder="Email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Simpan Perubahan
        </button>

        <button
          onClick={() => router.replace("/login")}
          className="mt-3 w-full bg-gray-300 py-3 rounded-lg hover:bg-gray-400 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
